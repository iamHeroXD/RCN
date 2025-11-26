import discord
from discord import app_commands
from discord.ext import commands
import asyncio
from datetime import datetime
from config import TAX_RATES, FOUNDER_ID

class EconomyCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @app_commands.command(name="wallet", description="Check your RC wallet balance")
    async def wallet(self, interaction: discord.Interaction, user: discord.User = None):
        target_user = user or interaction.user
        
        await interaction.response.defer()
        
        user_data = await self.bot.get_or_create_user(target_user.id, target_user.name)
        
        embed = discord.Embed(
            title=f"💰 {target_user.display_name}'s Wallet",
            color=discord.Color.gold()
        )
        
        # Founder has infinite RC
        if target_user.id == FOUNDER_ID:
            balance_text = "♾️ Infinite RC (Founder)"
        else:
            balance_text = f"**{user_data['rc_balance']:,}** RC"
        
        embed.add_field(name="RC Balance", value=balance_text, inline=True)
        
        # Add current market value
        robux_value = user_data['rc_balance'] * self.bot.current_rc_price * 33.33  # Convert to approximate Robux
        embed.add_field(name="Estimated Robux Value", value=f"~{robux_value:.0f} RBX", inline=True)
        
        # Add premium status
        premium_tier = user_data.get('premium_tier', 'none')
        if premium_tier != 'none':
            embed.add_field(name="Premium Tier", value=premium_tier.title(), inline=True)
        
        embed.set_footer(text=f"Current RC Rate: 1000 RC = {self.bot.current_rc_price * 33333:.0f} Robux")
        await interaction.followup.send(embed=embed)
    
    @app_commands.command(name="pay", description="Send RC to another user")
    @app_commands.describe(user="User to send RC to", amount="Amount of RC to send")
    async def pay(self, interaction: discord.Interaction, user: discord.User, amount: app_commands.Range[int, 1]):
        if user.bot:
            await interaction.response.send_message("❌ You cannot send RC to bots.", ephemeral=True)
            return
        
        if user.id == interaction.user.id:
            await interaction.response.send_message("❌ You cannot send RC to yourself.", ephemeral=True)
            return
        
        await interaction.response.defer()
        
        try:
            # Get sender data
            sender_data = await self.bot.get_or_create_user(interaction.user.id, interaction.user.name)
            
            # Founder can send unlimited RC
            if interaction.user.id != FOUNDER_ID:
                if sender_data['rc_balance'] < amount:
                    await interaction.followup.send("❌ Insufficient RC balance.")
                    return
            
            # Get receiver data
            receiver_data = await self.bot.get_or_create_user(user.id, user.name)
            
            # Calculate tax
            tax_rate = TAX_RATES[sender_data.get('premium_tier', 'normal')]
            if interaction.user.id == FOUNDER_ID:
                tax_rate = 0
            
            tax_amount = int(amount * tax_rate)
            net_amount = amount - tax_amount
            
            # Update balances (Founder doesn't deduct)
            if interaction.user.id != FOUNDER_ID:
                await self.bot.users.update_one(
                    {"_id": interaction.user.id},
                    {"$inc": {"rc_balance": -amount}}
                )
            
            await self.bot.users.update_one(
                {"_id": user.id},
                {"$inc": {"rc_balance": net_amount}}
            )
            
            # Add tax to treasury
            if tax_amount > 0:
                await self.bot.treasury.update_one(
                    {"_id": "main"},
                    {"$inc": {"balance": tax_amount, "total_tax_collected": tax_amount}}
                )
            
            # Log transaction
            await self.bot.log_transaction(interaction.user.id, "payment", -amount, {
                "to": user.id,
                "tax": tax_amount,
                "net_sent": net_amount
            })
            
            await self.bot.log_transaction(user.id, "payment_received", net_amount, {
                "from": interaction.user.id,
                "original_amount": amount,
                "tax": tax_amount
            })
            
            embed = discord.Embed(
                title="✅ Payment Successful",
                description=f"Sent **{amount:,} RC** to {user.mention}",
                color=discord.Color.green()
            )
            
            if tax_amount > 0:
                embed.add_field(name="Tax", value=f"{tax_amount:,} RC ({tax_rate*100}%)", inline=True)
                embed.add_field(name="Net Received", value=f"{net_amount:,} RC", inline=True)
            
            await interaction.followup.send(embed=embed)
            
        except Exception as e:
            await interaction.followup.send("❌ An error occurred during payment.")
    
    @app_commands.command(name="trade", description="Trade RC with another user")
    @app_commands.describe(user="User to trade with", amount="Amount of RC", reason="Reason for trade")
    async def trade(self, interaction: discord.Interaction, user: discord.User, amount: app_commands.Range[int, 1], reason: str = "Trade"):
        # Similar implementation to pay but with trade-specific logic
        await interaction.response.defer()
        
        # Check cooldown
        # Implement cooldown logic here
        
        try:
            # Similar to pay command but with trade logging
            sender_data = await self.bot.get_or_create_user(interaction.user.id, interaction.user.name)
            
            if interaction.user.id != FOUNDER_ID and sender_data['rc_balance'] < amount:
                await interaction.followup.send("❌ Insufficient RC balance.")
                return
            
            # Calculate tax and process trade
            # ... (similar to pay command)
            
            embed = discord.Embed(
                title="🤝 Trade Completed",
                description=f"Traded **{amount:,} RC** with {user.mention}",
                color=discord.Color.blue()
            )
            embed.add_field(name="Reason", value=reason, inline=False)
            
            await interaction.followup.send(embed=embed)
            
        except Exception as e:
            await interaction.followup.send("❌ An error occurred during trade.")
    
    @app_commands.command(name="price", description="Check current RC price")
    async def price(self, interaction: discord.Interaction):
        embed = discord.Embed(
            title="💰 RC Price Information",
            color=discord.Color.gold()
        )
        
        robux_per_1000 = self.bot.current_rc_price * 33333
        embed.add_field(name="Current Rate", value=f"1000 RC = {robux_per_1000:.0f} Robux", inline=False)
        embed.add_field(name="RC Price", value=f"{self.bot.current_rc_price:.6f}", inline=True)
        
        # Get 24h change
        yesterday = datetime.utcnow().timestamp() - 86400
        old_price_data = await self.bot.price_history.find_one(
            {"timestamp": {"$gte": yesterday}},
            sort=[("timestamp", -1)]
        )
        
        if old_price_data:
            change = ((self.bot.current_rc_price - old_price_data['old_price']) / old_price_data['old_price']) * 100
            embed.add_field(name="24h Change", value=f"{change:+.2f}%", inline=True)
        
        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(EconomyCog(bot))
