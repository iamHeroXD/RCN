import os
from datetime import timedelta

# Founder ID - The Origin of RCredits
FOUNDER_ID = 1351116002380746865

# Mission rewards
DAILY_MISSIONS = {
    "post_activity": 20,
    "help_someone": 10,
    "react_announcement": 5,
    "invite_user": 30,
    "give_review": 15,
    "join_vc": 10,
    "complete_verification": 50
}

WEEKLY_MISSIONS = {
    "top_contributor": 100,
    "top_reviewer": 80,
    "most_helpful": 200
}

# Store items
STORE_ITEMS = {
    "highlight_post": {"price": 150, "description": "Feature your post for 24 hours"},
    "profile_badge": {"price": 200, "description": "Special profile badge for 30 days"},
    "custom_flair": {"price": 350, "description": "Custom flair in server"},
    "ad_promotion": {"price": 500, "description": "Promote in announcements"},
    "ping_role": {"price": 200, "description": "Ping role in job posts"},
    "premium_tools": {"price": 100, "description": "Access to premium tools for 7 days"}
}

# Premium tiers
PREMIUM_TIERS = {
    "prime_lite": {"robux_cost": 150, "rc_boost": 0.2, "tax_rate": 0.02},
    "prime_plus": {"robux_cost": 350, "rc_boost": 0.3, "tax_rate": 0.015},
    "prime_ultra": {"robux_cost": 650, "rc_boost": 0.4, "tax_rate": 0.01}
}

# Tax rates
TAX_RATES = {
    "normal": 0.05,
    "prime_lite": 0.02,
    "prime_plus": 0.015,
    "prime_ultra": 0.01,
    "founder": 0.00
}

# Skills categories
SKILLS = [
    "Scripter", "Modeler", "Animator", "Builder", 
    "UI Designer", "GFX/VFX", "Game Designer", "Musician",
    "Writer", "Tester", "Project Manager"
]

# Cooldowns (in seconds)
COOLDOWNS = {
    "trade": 300,  # 5 minutes
    "mission": 3600,  # 1 hour
    "review": 1800,  # 30 minutes
    "post": 3600  # 1 hour
}
