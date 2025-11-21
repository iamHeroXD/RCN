import { User, Post, PostType, UserRole } from "../types";
import { MOCK_USERS_DATA_KEY, MOCK_POSTS_DATA_KEY, CURRENT_USER_ID_KEY, INITIAL_COINS, ADMIN_ID } from "../constants";

// Helper to simulate delay for "network" feel
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const loadData = <T>(key: string, defaultData: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultData;
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Seed Data
const seedUsers: User[] = [
  {
    id: ADMIN_ID, // The Admin
    username: 'HeroXD',
    discriminator: '0001',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=HeroXD',
    bio: 'Founder of RCN. The Boss.',
    coins: 999999999, // Massive amount
    role: UserRole.ADMIN,
    inventory: ['frame_fire', 'frame_void', 'banner_space', 'effect_rainbow'],
    equipped: { avatarFrame: 'frame_void', banner: 'banner_space', nameEffect: 'effect_rainbow' },
    joinedAt: new Date().toISOString()
  },
  {
    id: 'u1',
    username: 'LuaMaster',
    discriminator: '1337',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lua',
    bio: 'Top tier scripter for Roblox front-page games.',
    coins: 1250,
    role: UserRole.USER,
    inventory: ['frame_neon_blue'],
    equipped: { avatarFrame: 'frame_neon_blue' },
    joinedAt: new Date().toISOString()
  },
  {
    id: 'u2',
    username: 'BuilderBob',
    discriminator: '9988',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bob',
    bio: 'Low poly map builder.',
    coins: 50,
    role: UserRole.USER,
    inventory: [],
    equipped: {},
    joinedAt: new Date().toISOString()
  }
];

const seedPosts: Post[] = [
  {
    id: 'p1',
    authorId: 'u2',
    authorName: 'BuilderBob',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bob',
    type: PostType.HIRING,
    title: 'Looking for a Scripter (Simulators)',
    content: 'Need a scripter to help with pet system and data stores. % of game revenue.',
    tags: ['roblox', 'lua', 'scripter'],
    budget: '20% Rev Share',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    likes: 5
  },
  {
    id: 'p123',
    authorId: 'u1',
    authorName: 'LuaMaster',
    authorAvatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lua',
    authorRole: UserRole.USER,
    type: PostType.FOR_HIRE,
    title: 'Advanced Scripter For Hire',
    content: 'I can script anything. Anti-cheat, combat systems, UI frameworks. 5+ years on Roblox.',
    tags: ['lua', 'roblox studio', 'security'],
    budget: '50k R$ / Project',
    createdAt: new Date().toISOString(),
    likes: 12
  }
];

// Initialize Storage if empty
if (!localStorage.getItem(MOCK_USERS_DATA_KEY)) saveData(MOCK_USERS_DATA_KEY, seedUsers);
if (!localStorage.getItem(MOCK_POSTS_DATA_KEY)) saveData(MOCK_POSTS_DATA_KEY, seedPosts);

export const authService = {
  login: async (username: string): Promise<User> => {
    await delay(500);
    const users = loadData<User[]>(MOCK_USERS_DATA_KEY, []);
    let user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    // Special Admin Login Check
    if (username.toLowerCase() === 'heroxd' && !user) {
         // If HeroXD doesn't exist for some reason (cleared cache), recreate admin
         user = seedUsers[0];
         users.unshift(user);
         saveData(MOCK_USERS_DATA_KEY, users);
    } else if (username.toLowerCase() === 'heroxd' && user) {
        // Ensure ID matches constant if username is correct (simulation security)
        if (user.id !== ADMIN_ID) {
            user.id = ADMIN_ID;
            user.role = UserRole.ADMIN;
            user.coins = 999999999; 
            saveData(MOCK_USERS_DATA_KEY, users);
        }
    }

    if (!user) {
      // Auto register normal user
      user = {
        id: `u_${Date.now()}`,
        username,
        discriminator: Math.floor(1000 + Math.random() * 9000).toString(),
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`,
        bio: 'New Creator ready to build!',
        coins: INITIAL_COINS,
        role: UserRole.USER,
        inventory: [],
        equipped: {},
        joinedAt: new Date().toISOString()
      };
      users.push(user);
      saveData(MOCK_USERS_DATA_KEY, users);
    }
    
    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
    return user;
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const id = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!id) return null;
    const users = loadData<User[]>(MOCK_USERS_DATA_KEY, []);
    return users.find(u => u.id === id) || null;
  },

  updateUser: async (updatedUser: User): Promise<User> => {
    await delay(300);
    const users = loadData<User[]>(MOCK_USERS_DATA_KEY, []);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      saveData(MOCK_USERS_DATA_KEY, users);
      return updatedUser;
    }
    throw new Error("User not found");
  },
  
  // Admin Function
  getAllUsers: async (): Promise<User[]> => {
      return loadData<User[]>(MOCK_USERS_DATA_KEY, []);
  },

  // Admin Function
  adminGiveCoins: async (targetUserId: string, amount: number): Promise<void> => {
      const users = loadData<User[]>(MOCK_USERS_DATA_KEY, []);
      const user = users.find(u => u.id === targetUserId);
      if (user) {
          user.coins += amount;
          saveData(MOCK_USERS_DATA_KEY, users);
      }
  }
};

export const postService = {
  getPosts: async (): Promise<Post[]> => {
    await delay(400);
    return loadData<Post[]>(MOCK_POSTS_DATA_KEY, []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  createPost: async (post: Omit<Post, 'id' | 'createdAt' | 'likes'>): Promise<Post> => {
    await delay(400);
    const posts = loadData<Post[]>(MOCK_POSTS_DATA_KEY, []);
    const newPost: Post = {
      ...post,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    posts.unshift(newPost);
    saveData(MOCK_POSTS_DATA_KEY, posts);
    return newPost;
  },
  
  deletePost: async (postId: string): Promise<void> => {
      const posts = loadData<Post[]>(MOCK_POSTS_DATA_KEY, []);
      const newPosts = posts.filter(p => p.id !== postId);
      saveData(MOCK_POSTS_DATA_KEY, newPosts);
  },

  likePost: async (postId: string): Promise<void> => {
    const posts = loadData<Post[]>(MOCK_POSTS_DATA_KEY, []);
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.likes += 1;
      saveData(MOCK_POSTS_DATA_KEY, posts);
    }
  }
};
