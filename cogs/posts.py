import discord
from discord import app_commands
from discord.ext import commands
from datetime import datetime, timedelta
from config import SKILLS

class PostsCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
    
    @app_commands.command(name="post", description="Create a hiring or for-hire post")
    @app_commands.describe(post_type="Type of post", title="Post title", description="Detailed description", skills="Your skills", price_range="Price range (e.g., 100-500)")
    @app_commands.choices(post_type=[
        app_commands.Choice(name="hiring", value="hiring"),
        app_commands.Choice(name="forhire", value="forhire")
    ])
    async def post(self, interaction: discord.Interaction, post_type: str, title: str, description: str, skills: str, price_range: str = None):
        await interaction.response.defer()
        
        # Parse skills
        skill_list = [s.strip() for s in skills.split(',')]
        valid_skills = [s for s in skill_list if s in SKILLS]
        
        if not valid_skills:
            await interaction.followup.send("❌ No valid skills provided. Use /skills to see available skills.")
            return
        
        # Create post data
        post_data = {
            "author_id": interaction.user.id,
            "author_name": interaction.user.name,
            "type": post_type,
            "title": title,
            "description": description,
            "skills": valid_skills,
            "price_range": price_range,
            "status": "pending",
            "created_at": datetime.utcnow().timestamp(),
            "expires_at": (datetime.utcnow() + timedelta(days=7)).timestamp()
        }
        
        # Insert post
        result = await self.bot.posts.insert_one(post_data)
        
        # Send to approval queue
        embed = self.create_post_embed(post_data, interaction.user)
        embed.title = f"⏳ {embed.title} (Pending Approval)"
        embed.color = discord.Color.orange()
        
        await interaction.followup.send(
            content="✅ Your post has been submitted for approval!",
            embed=embed
        )
        
        # Log the post
        await self.bot.log_transaction(interaction.user.id, "post_created", 0, {
            "post_id": str(result.inserted_id),
            "type": post_type,
            "title": title
        })
    
    def create_post_embed(self, post_data, author):
        embed = discord.Embed(
            title=f"💼 {post_data['type'].title()}: {post_data['title']}",
            description=post_data['description'],
            color=discord.Color.blue(),
            timestamp=datetime.utcnow()
        )
        
        embed.set_author(name=author.display_name, icon_url=author.display_avatar.url)
        
        embed.add_field(name="Skills", value=', '.join(post_data['skills']), inline=True)
        
        if post_data.get('price_range'):
            embed.add_field(name="Price Range", value=post_data['price_range'], inline=True)
        
        embed.add_field(name="Status", value=post_data['status'].title(), inline=True)
        embed.add_field(name="Expires", value=f"<t:{int(post_data['expires_at'])}:R>", inline=False)
        
        embed.set_footer(text=f"Post ID: {str(post_data['_id'])}")
        
        return embed
    
    @app_commands.command(name="approvepost", description="Approve a post (Admin only)")
    @app_commands.default_permissions(administrator=True)
    async def approvepost(self, interaction: discord.Interaction, post_id: str):
        if not interaction.user.guild_permissions.administrator:
            await interaction.response.send_message("❌ Administrator permission required.", ephemeral=True)
            return
        
        await interaction.response.defer()
        
        try:
            from bson import ObjectId
            post = await self.bot.posts.find_one({"_id": ObjectId(post_id)})
            
            if not post:
                await interaction.followup.send("❌ Post not found.")
                return
            
            # Update post status
            await self.bot.posts.update_one(
                {"_id": ObjectId(post_id)},
                {"$set": {"status": "active"}}
            )
            
            # Get author user object
            author = self.bot.get_user(post['author_id'])
            if not author:
                try:
                    author = await self.bot.fetch_user(post['author_id'])
                except:
                    author = None
            
            # Create approved embed
            embed = self.create_post_embed(post, author or discord.Object(id=post['author_id']))
            embed.title = f"✅ {embed.title}"
            embed.color = discord.Color.green()
            
            # Send to posts channel
            posts_channel_id = self.bot.posts_channel_id  # Set this in your bot
            if posts_channel_id:
                channel = self.bot.get_channel(posts_channel_id)
                if channel:
                    await channel.send(embed=embed)
            
            await interaction.followup.send("✅ Post approved and published!")
            
            # Log approval
            await self.bot.log_transaction(interaction.user.id, "post_approved", 0, {
                "post_id": post_id,
                "author_id": post['author_id']
            })
            
        except Exception as e:
            await interaction.followup.send("❌ Error approving post.")

async def setup(bot):
    await bot.add_cog(PostsCog(bot))
