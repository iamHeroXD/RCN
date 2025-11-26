# RCN Prime - Advanced Discord Economy Bot

## Features
- 💰 RCredit cryptocurrency simulation
- 💼 Hiring/For-Hire posting system
- ⭐ Review and reputation system
- 🚨 Scam reporting and logging
- 📊 Real-time price fluctuations
- 🎯 Daily and weekly missions
- 🛍️ In-Discord store
- 👑 Premium membership tiers
- 🔒 Anti-abuse systems
- 📈 Complete logging

## Deployment on Render

1. **Fork this repository** to your GitHub account

2. **Go to Render.com** and create a new Web Service

3. **Connect your GitHub repository**

4. **Configure settings:**
   - **Name:** `rcn-prime`
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python bot.py`

5. **Add Environment Variables:**
   - `DISCORD_TOKEN` - Your bot token from Discord Developer Portal
   - `MONGO_URI` - MongoDB connection string (use MongoDB Atlas for cloud)
   - `APPLICATION_ID` - Your Discord application ID
   - Channel IDs (optional)

6. **Deploy!**

## Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your values
nano .env

# Run the bot
python bot.py
```

## Bot Commands Overview

### Economy
- `/wallet` - Check RC balance
- `/pay` - Send RC to users
- `/trade` - Trade RC
- `/price` - Check current price

### Posts
- `/post` - Create hiring/for-hire post
- `/approvepost` - Approve posts (admin)

### Founder
- `/founder_event` - Global airdrops
- `/set_global_price` - Set RC price
- `/rc_lore` - Origin story
- `/override` - Bypass all restrictions

### And many more...
