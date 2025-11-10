export interface User {
  id: string;
  govId: string;
  email: string;
  name: string;
  verified: boolean;
  bio?: string;
  avatar?: string;
  followers: string[];
  following: string[];
  createdAt: string;
}

export interface Writing {
  id: string;
  authorId: string;
  title: string;
  content: string;
  template: 'blank' | 'report' | 'article' | 'note';
  isPublic: boolean;
  timestamp: string;
  lastModified: string;
  background?: string;
  fontFamily?: string;
  colorGrade?: string;
  images?: string[];
  links?: string[];
  views: number;
  upvotes: string[];
  downvotes: string[];
  shares: number;
  legalHash: string;
}

export interface Comment {
  id: string;
  writingId: string;
  authorId: string;
  content: string;
  timestamp: string;
}

export interface Analytics {
  userId: string;
  totalViews: number;
  totalUpvotes: number;
  totalShares: number;
  totalEarnings: number;
  writingsCount: number;
  followersCount: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
