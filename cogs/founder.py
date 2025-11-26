import discord
from discord import app_commands
from discord.ext import commands
from config import FOUNDER_ID

class FounderCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    async def is_founder(self, interaction: discord.Interaction):
        """Check if user is the founder"""
        if interaction.user.id != FOUNDER_ID:
            await interaction.response.send_message("❌ Founder-only command.", ephemeral=True)
            return False
        return True
    
    @app_commands.command(name="founder_event", description="Create a global airdrop event (Founder only)")
    @app_commands.describe(event_name="Name of the event", amount="RC amount to airdrop")
    async def founder_event(self, interaction: discord.Interaction, event_name: str, amount: app_commands.Range[int, 1]):
        if not await self.is_founder(interaction):
            return
        
        await interaction.response.defer()
        
        # Airdrop to all verified users
        verified_users = self.bot.users.find({"verification_status": "verified"})
        user_count = 0
        
        async for user in verified_users:
            await self.bot.users.update_one(
                {"_id": user["_id"]},
                {"$inc": {"rc_balance": amount}}
            )
            user_count += 1
        
        embed = discord.Embed(
            title="🎉 Global Airdrop Event",
            description=f"**{event_name}**",
            color=discord.Color.gold()
        )
        embed.add_field(name="Amount", value=f"{amount:,} RC", inline=True)
        embed.add_field(name="Recipients", value=f"{user_count} users", inline=True)
        embed.add_field(name="Distributed by", value="The Founder", inline=False)
        
        await interaction.followup.send(embed=embed)
    
    @app_commands.command(name="set_global_price", description="Set the global RC price (Founder only)")
    @app_commands.describe(new_price="New RC price")
    async def set_global_price(self, interaction: discord.Interaction, new_price: float):
        if not await self.is_founder(interaction):
            return
        
        old_price = self.bot.current_rc_price
        self.bot.current_rc_price = new_price
        
        embed = discord.Embed(
            title="💰 Global Price Update",
            color=discord.Color.green()
        )
        embed.add_field(name="Old Price", value=f"{old_price:.6f}", inline=True)
        embed.add_field(name="New Price", value=f"{new_price:.6f}", inline=True)
        embed.add_field(name="Changed by", value="The Founder", inline=False)
        
        await interaction.response.send_message(embed=embed)
    
    @app_commands.command(name="rc_lore", description="Learn about the origin of RCredits")
    async def rc_lore(self, interaction: discord.Interaction):
        lore_text = """
**The RCredits Network - Genesis Lore**

The RCredits network was created by an anonymous founder known only by the ID 1351116002380746865. 
This Origin Node deployed the first RC block, vanished from public view, and left behind a system that evolves without central control — except for the unseen architect who can rewrite the universe when necessary.

*Block #0 - Genesis Block*
Deployed by Origin Node (1351116002380746865)
Message: "RC Network Online — Let the builders rise."

*Founder Privileges:*
♾️ Infinite RC Reserve | ⚡ Zero Tax | 🔒 Bypass All Limits
        """
        
        embed = discord.Embed(
            title="📜 The Legend of RCredits",
            description=lore_text,
            color=discord.Color.purple()
        )
        
        await interaction.response.send_message(embed=embed)
    
    @app_commands.command(name="override", description="Override any command or restriction (Founder only)")
    async def override(self, interaction: discord.Interaction):
        if not await self.is_founder(interaction):
            return
        
        embed = discord.Embed(
            title="⚡ Founder Override Active",
            description="All system restrictions have been bypassed.\nThe architect has taken direct control.",
            color=discord.Color.red()
        )
        
        await interaction.response.send_message(embed=embed)

async def setup(bot):
    await bot.add_cog(FounderCog(bot))
