import { Decoration, DecorationType } from "./types";

export const APP_NAME = "RCN";
export const FULL_APP_NAME = "Roblox Creator Network";
export const CURRENCY_NAME = "RC";
export const DISCORD_INVITE_LINK = "https://discord.gg/example"; // Replace with real link if provided

export const ADMIN_ID = '1351116002380746865';
export const INITIAL_COINS = 150;

export const SHOP_ITEMS: Decoration[] = [
  {
    id: 'frame_gold',
    name: 'Golden Halo',
    type: DecorationType.AVATAR_FRAME,
    price: 500,
    cssClass: 'ring-4 ring-yellow-400',
    previewUrl: 'https://via.placeholder.com/150/FFD700/000000?text=Gold'
  },
  {
    id: 'frame_neon_blue',
    name: 'Cyber Blue',
    type: DecorationType.AVATAR_FRAME,
    price: 300,
    cssClass: 'ring-4 ring-cyan-400 shadow-[0_0_10px_#22d3ee]',
    previewUrl: 'https://via.placeholder.com/150/06b6d4/ffffff?text=Neon'
  },
  {
    id: 'frame_fire',
    name: 'Inferno',
    type: DecorationType.AVATAR_FRAME,
    price: 750,
    cssClass: 'ring-4 ring-red-500 shadow-[0_0_15px_#ef4444]',
    previewUrl: 'https://via.placeholder.com/150/ef4444/ffffff?text=Fire'
  },
  {
    id: 'frame_void',
    name: 'The Void',
    type: DecorationType.AVATAR_FRAME,
    price: 2500,
    cssClass: 'ring-4 ring-black shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse',
  },
  {
    id: 'banner_space',
    name: 'Deep Space',
    type: DecorationType.PROFILE_BANNER,
    price: 1000,
    cssClass: 'bg-gradient-to-r from-indigo-900 via-purple-900 to-black',
  },
  {
    id: 'banner_forest',
    name: 'Mystic Forest',
    type: DecorationType.PROFILE_BANNER,
    price: 600,
    cssClass: 'bg-gradient-to-r from-emerald-800 to-green-900',
  },
  {
    id: 'banner_cyberpunk',
    name: 'Night City',
    type: DecorationType.PROFILE_BANNER,
    price: 1200,
    cssClass: 'bg-gradient-to-br from-pink-600 via-purple-700 to-blue-800',
  },
  {
    id: 'effect_glitch',
    name: 'Glitch Text',
    type: DecorationType.NAME_EFFECT,
    price: 1500,
    cssClass: 'animate-pulse text-green-400 font-mono tracking-widest',
  },
  {
    id: 'effect_rainbow',
    name: 'Rainbow Gamer',
    type: DecorationType.NAME_EFFECT,
    price: 5000,
    cssClass: 'bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-pulse font-extrabold',
  }
];

export const MOCK_USERS_DATA_KEY = 'rcn_users_v1';
export const MOCK_POSTS_DATA_KEY = 'rcn_posts_v1';
export const CURRENT_USER_ID_KEY = 'rcn_current_user_id';