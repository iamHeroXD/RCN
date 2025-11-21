export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum PostType {
  HIRING = 'HIRING',
  FOR_HIRE = 'FOR_HIRE',
  SHOWCASE = 'SHOWCASE'
}

export enum DecorationType {
  AVATAR_FRAME = 'AVATAR_FRAME',
  PROFILE_BANNER = 'PROFILE_BANNER',
  NAME_EFFECT = 'NAME_EFFECT'
}

export interface Decoration {
  id: string;
  name: string;
  type: DecorationType;
  price: number;
  cssClass: string; // Tailwind classes or inline styles representation
  previewUrl?: string;
}

export interface User {
  id: string;
  username: string;
  discriminator: string; // The #1234 part
  avatarUrl: string;
  bio: string;
  coins: number;
  role: UserRole;
  inventory: string[]; // IDs of owned decorations
  equipped: {
    avatarFrame?: string;
    banner?: string;
    nameEffect?: string;
  };
  joinedAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string; // Cached for simplicity
  authorAvatar: string;
  authorRole?: UserRole;
  type: PostType;
  title: string;
  content: string;
  tags: string[];
  budget: string;
  createdAt: string;
  likes: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}