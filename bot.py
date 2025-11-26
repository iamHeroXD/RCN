import os
import discord
from discord.ext import commands
import motor.motor_asyncio
from datetime import datetime
import asyncio
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('RCN_Prime')

class RCNPrime(commands.Bot):
    def __init__(self):
        intents = discord.Intents.all()
        super().__init__(
            command_prefix='!',
            intents=intents,
            help_command=None
        )
        
        # Founder ID - The Satoshi of RCredits
        self.FOUNDER_ID = 1351116002380746865
        
        # Database setup
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
        self.client = motor.motor_asyncio.AsyncIOMotorClient(self.mongo_uri)
        self.db = self.client.rcn_prime
        
        # Collections
        self.users_col = self.db.users
        self.posts_col = self.db.posts
        self.reviews_col = self.db.reviews
        self.scam_reports_col = self.db.scam_reports
        self.transactions_col = self.db.transactions
        self.missions_col = self.db.missions
        self.store_col = self.db.store
        self.price_history_col = self.db.price_history
        self.treasury_col = self.db.treasury
        
        # Current RC price
        self.current_rc_price = 0.03  # 1000 RC = 30 Robux
        self.volatility = 0.02
        
    async def setup_hook(self):
        """Initialize bot and load cogs"""
        # Load all cogs
        cogs = [
            'cogs.economy',
            'cogs.posts', 
            'cogs.reviews',
            'cogs.scam',
            'cogs.missions',
            'cogs.store',
            'cogs.profiles',
            'cogs.admin',
            'cogs.founder'
        ]
        
        for cog in cogs:
            try:
                await self.load_extension(cog)
                logger.info(f'✅ Loaded cog: {cog}')
            except Exception as e:
                logger.error(f'❌ Failed to load {cog}: {e}')
        
        # Start background tasks
        self.loop.create_task(self.price_fluctuation_engine())
        self.loop.create_task(self.cleanup_expired_posts())
        
        # Initialize treasury
        await self.init_treasury()
        
    async def init_treasury(self):
        """Initialize treasury if not exists"""
        treasury = await self.treasury.find_one({"_id": "main"})
        if not treasury:
            await self.treasury.insert_one({
                "_id": "main",
                "balance": 0,
                "total_tax_collected": 0,
                "created_at": datetime.utcnow()
            })
    
    async def price_fluctuation_engine(self):
        """Hourly price fluctuation engine"""
        await self.wait_until_ready()
        
        while not self.is_closed():
            try:
                # Calculate metrics for price fluctuation
                user_activity = await self.calculate_user_activity()
                trade_volume = await self.calculate_trade_volume()
                coin_velocity = await self.calculate_coin_velocity()
                posts_count = await self.posts.count_documents({"status": "active"})
                reviews_count = await self.reviews.count_documents({})
                whale_movement = await self.detect_whale_movement()
                
                # Calculate demand metric
                demand = (user_activity * 0.3 + trade_volume * 0.4 + posts_count * 0.2 + reviews_count * 0.1)
                
                # Calculate supply (total minted RC)
                total_supply = await self.calculate_total_supply()
                
                # Whale factor
                whale_factor = 1 if whale_movement else 0
                
                # Random volatility (-1% to +1%)
                import random
                random_volatility = random.uniform(-0.01, 0.01)
                
                # Calculate new price
                old_price = self.current_rc_price
                new_price = old_price + (demand * 0.5) - (total_supply * 0.000001) + (whale_factor * 0.8) + random_volatility
                
                # Ensure price doesn't go below minimum
                new_price = max(0.01, new_price)
                
                # Update price
                self.current_rc_price = new_price
                
                # Log price change
                change_percent = ((new_price - old_price) / old_price) * 100
                
                # Send to price channel if configured
                price_channel_id = os.getenv('PRICE_CHANNEL_ID')
                if price_channel_id:
                    channel = self.get_channel(int(price_channel_id))
                    if channel:
                        embed = discord.Embed(
                            title="📈 RC Price Update",
                            color=discord.Color.green() if change_percent >= 0 else discord.Color.red()
                        )
                        embed.add_field(name="Old Price", value=f"{old_price:.4f}", inline=True)
                        embed.add_field(name="New Price", value=f"{new_price:.4f}", inline=True)
                        embed.add_field(name="Change", value=f"{change_percent:+.2f}%", inline=True)
                        embed.add_field(name="Demand", value=f"{demand:.2f}", inline=True)
                        embed.add_field(name="Whale Movement", value="Yes" if whale_movement else "No", inline=True)
                        
                        await channel.send(embed=embed)
                
                # Store in history
                await self.price_history.insert_one({
                    "timestamp": datetime.utcnow(),
                    "old_price": old_price,
                    "new_price": new_price,
                    "change_percent": change_percent,
                    "demand": demand,
                    "whale_movement": whale_movement
                })
                
                logger.info(f"💰 Price updated: {old_price:.4f} -> {new_price:.4f} ({change_percent:+.2f}%)")
                
            except Exception as e:
                logger.error(f"Error in price engine: {e}")
            
            # Wait 1 hour
            await asyncio.sleep(3600)
    
    async def calculate_user_activity(self):
        """Calculate user activity metric"""
        # Count active users in last 24 hours
        yesterday = datetime.utcnow().timestamp() - 86400
        active_users = await self.transactions.count_documents({
            "timestamp": {"$gte": yesterday}
        })
        return min(active_users / 100, 1.0)  # Normalize to 0-1
    
    async def calculate_trade_volume(self):
        """Calculate trade volume metric"""
        yesterday = datetime.utcnow().timestamp() - 86400
        pipeline = [
            {"$match": {"type": "trade", "timestamp": {"$gte": yesterday}}},
            {"$group": {"_id": None, "total_volume": {"$sum": "$amount"}}}
        ]
        result = await self.transactions.aggregate(pipeline).to_list(length=1)
        volume = result[0]['total_volume'] if result else 0
        return min(volume / 10000, 1.0)  # Normalize
    
    async def calculate_coin_velocity(self):
        """Calculate coin velocity"""
        yesterday = datetime.utcnow().timestamp() - 86400
        trades = await self.transactions.count_documents({
            "type": "trade", 
            "timestamp": {"$gte": yesterday}
        })
        return min(trades / 50, 1.0)
    
    async def detect_whale_movement(self):
        """Detect large trades (>500 RC)"""
        yesterday = datetime.utcnow().timestamp() - 86400
        whale_trades = await self.transactions.count_documents({
            "type": "trade",
            "amount": {"$gt": 500},
            "timestamp": {"$gte": yesterday}
        })
        return whale_trades > 0
    
    async def calculate_total_supply(self):
        """Calculate total RC supply"""
        pipeline = [
            {"$group": {"_id": None, "total_rc": {"$sum": "$rc_balance"}}}
        ]
        result = await self.users.aggregate(pipeline).to_list(length=1)
        return result[0]['total_rc'] if result else 0
    
    async def cleanup_expired_posts(self):
        """Clean up posts older than 7 days"""
        await self.wait_until_ready()
        
        while not self.is_closed():
            try:
                seven_days_ago = datetime.utcnow().timestamp() - (7 * 86400)
                
                expired_posts = await self.posts.update_many(
                    {"created_at": {"$lt": seven_days_ago}, "status": "active"},
                    {"$set": {"status": "expired"}}
                )
                
                if expired_posts.modified_count > 0:
                    logger.info(f"Cleaned up {expired_posts.modified_count} expired posts")
                    
            except Exception as e:
                logger.error(f"Error cleaning posts: {e}")
            
            await asyncio.sleep(3600)  # Check every hour
    
    async def get_or_create_user(self, user_id: int, username: str):
        """Get user or create if doesn't exist"""
        user = await self.users.find_one({"_id": user_id})
        
        if not user:
            user_data = {
                "_id": user_id,
                "username": username,
                "rc_balance": 0,
                "skills": [],
                "trust_score": 0,
                "total_reviews": 0,
                "mission_completions": {},
                "premium_tier": "none",
                "joined_at": datetime.utcnow(),
                "verification_status": "pending",
                "scam_status": "clean"
            }
            
            # Founder gets infinite RC
            if user_id == self.FOUNDER_ID:
                user_data["rc_balance"] = float('inf')
                user_data["is_founder"] = True
                user_data["verification_status"] = "verified"
            
            await self.users.insert_one(user_data)
            return user_data
        
        return user
    
    async def log_transaction(self, user_id: int, tx_type: str, amount: float, details: dict):
        """Log all transactions"""
        tx_data = {
            "user_id": user_id,
            "type": tx_type,
            "amount": amount,
            "details": details,
            "timestamp": datetime.utcnow()
        }
        await self.transactions.insert_one(tx_data)

# Run the bot
def main():
    token = os.getenv('DISCORD_TOKEN')
    if not token:
        # raise ValueError("DISCORD_TOKEN environment variable is required")
        logger.warning("DISCORD_TOKEN environment variable is missing")
    
    bot = RCNPrime()
    if token:
        bot.run(token)
    else:
        logger.info("Bot initialized but not running (no token)")

if __name__ == '__main__':
    main()
