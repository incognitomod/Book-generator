import { User, Writing, Comment, Analytics } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

// In-memory database simulation (replace with MongoDB in production)
class Database {
  private users: Map<string, User> = new Map();
  private writings: Map<string, Writing> = new Map();
  private comments: Map<string, Comment> = new Map();
  private analytics: Map<string, Analytics> = new Map();
  private govIdToUserId: Map<string, string> = new Map();
  private emailToUserId: Map<string, string> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const user1: User = {
      id: uuidv4(),
      govId: 'GOV123456',
      email: 'writer@example.com',
      name: 'Jane Writer',
      verified: true,
      bio: 'Professional writer and storyteller',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };

    const user2: User = {
      id: uuidv4(),
      govId: 'GOV789012',
      email: 'author@example.com',
      name: 'John Author',
      verified: true,
      bio: 'Published author and blogger',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.govIdToUserId.set(user1.govId, user1.id);
    this.govIdToUserId.set(user2.govId, user2.id);
    this.emailToUserId.set(user1.email, user1.id);
    this.emailToUserId.set(user2.email, user2.id);

    // Create sample writings
    const writing1: Writing = {
      id: uuidv4(),
      authorId: user1.id,
      title: 'The Future of Human Writing',
      content: 'In an age where AI can generate text at lightning speed, human writing has become more precious than ever. This article explores why authentic human creativity matters...',
      template: 'article',
      isPublic: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      views: 1250,
      upvotes: [user2.id],
      downvotes: [],
      shares: 45,
      legalHash: this.generateHash('The Future of Human Writing'),
    };

    const writing2: Writing = {
      id: uuidv4(),
      authorId: user2.id,
      title: 'My Journey as a Writer',
      content: 'Writing has always been my passion. From the first story I wrote as a child to my published novels today, every word has been crafted with care and intention...',
      template: 'article',
      isPublic: true,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      lastModified: new Date(Date.now() - 172800000).toISOString(),
      views: 890,
      upvotes: [user1.id],
      downvotes: [],
      shares: 32,
      legalHash: this.generateHash('My Journey as a Writer'),
    };

    this.writings.set(writing1.id, writing1);
    this.writings.set(writing2.id, writing2);

    // Initialize analytics
    this.analytics.set(user1.id, {
      userId: user1.id,
      totalViews: 1250,
      totalUpvotes: 1,
      totalShares: 45,
      totalEarnings: 125.50,
      writingsCount: 1,
      followersCount: 0,
    });

    this.analytics.set(user2.id, {
      userId: user2.id,
      totalViews: 890,
      totalUpvotes: 1,
      totalShares: 32,
      totalEarnings: 89.00,
      writingsCount: 1,
      followersCount: 0,
    });
  }

  private generateHash(content: string): string {
    return crypto.createHash('sha256').update(content + Date.now()).digest('hex');
  }

  // User operations
  getUserByGovId(govId: string): User | undefined {
    const userId = this.govIdToUserId.get(govId);
    return userId ? this.users.get(userId) : undefined;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    const userId = this.emailToUserId.get(email);
    return userId ? this.users.get(userId) : undefined;
  }

  createUser(userData: Omit<User, 'id' | 'followers' | 'following' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: uuidv4(),
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);
    this.govIdToUserId.set(user.govId, user.id);
    this.emailToUserId.set(user.email, user.id);
    
    // Initialize analytics
    this.analytics.set(user.id, {
      userId: user.id,
      totalViews: 0,
      totalUpvotes: 0,
      totalShares: 0,
      totalEarnings: 0,
      writingsCount: 0,
      followersCount: 0,
    });
    
    return user;
  }

  followUser(followerId: string, followingId: string): boolean {
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    
    if (!follower || !following || followerId === followingId) return false;
    
    if (!follower.following.includes(followingId)) {
      follower.following.push(followingId);
      following.followers.push(followerId);
      
      const analytics = this.analytics.get(followingId);
      if (analytics) {
        analytics.followersCount++;
      }
      return true;
    }
    return false;
  }

  unfollowUser(followerId: string, followingId: string): boolean {
    const follower = this.users.get(followerId);
    const following = this.users.get(followingId);
    
    if (!follower || !following) return false;
    
    follower.following = follower.following.filter(id => id !== followingId);
    following.followers = following.followers.filter(id => id !== followerId);
    
    const analytics = this.analytics.get(followingId);
    if (analytics) {
      analytics.followersCount = Math.max(0, analytics.followersCount - 1);
    }
    return true;
  }

  // Writing operations
  createWriting(writingData: Omit<Writing, 'id' | 'timestamp' | 'lastModified' | 'views' | 'upvotes' | 'downvotes' | 'shares' | 'legalHash'>): Writing {
    const writing: Writing = {
      ...writingData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      views: 0,
      upvotes: [],
      downvotes: [],
      shares: 0,
      legalHash: this.generateHash(writingData.content),
    };
    this.writings.set(writing.id, writing);
    
    // Update analytics
    const analytics = this.analytics.get(writing.authorId);
    if (analytics) {
      analytics.writingsCount++;
    }
    
    return writing;
  }

  getWritingById(id: string): Writing | undefined {
    return this.writings.get(id);
  }

  getWritingsByAuthor(authorId: string): Writing[] {
    return Array.from(this.writings.values()).filter(w => w.authorId === authorId);
  }

  getPublicWritings(): Writing[] {
    return Array.from(this.writings.values()).filter(w => w.isPublic);
  }

  updateWriting(id: string, updates: Partial<Writing>): Writing | undefined {
    const writing = this.writings.get(id);
    if (!writing) return undefined;
    
    const updated = {
      ...writing,
      ...updates,
      lastModified: new Date().toISOString(),
    };
    this.writings.set(id, updated);
    return updated;
  }

  deleteWriting(id: string): boolean {
    const writing = this.writings.get(id);
    if (!writing) return false;
    
    this.writings.delete(id);
    
    // Update analytics
    const analytics = this.analytics.get(writing.authorId);
    if (analytics) {
      analytics.writingsCount = Math.max(0, analytics.writingsCount - 1);
    }
    
    return true;
  }

  voteWriting(writingId: string, userId: string, voteType: 'up' | 'down'): boolean {
    const writing = this.writings.get(writingId);
    if (!writing) return false;
    
    // Remove previous votes
    writing.upvotes = writing.upvotes.filter(id => id !== userId);
    writing.downvotes = writing.downvotes.filter(id => id !== userId);
    
    // Add new vote
    if (voteType === 'up') {
      writing.upvotes.push(userId);
    } else {
      writing.downvotes.push(userId);
    }
    
    // Update analytics
    const analytics = this.analytics.get(writing.authorId);
    if (analytics && voteType === 'up') {
      analytics.totalUpvotes = Array.from(this.writings.values())
        .filter(w => w.authorId === writing.authorId)
        .reduce((sum, w) => sum + w.upvotes.length, 0);
    }
    
    return true;
  }

  incrementViews(writingId: string): void {
    const writing = this.writings.get(writingId);
    if (writing) {
      writing.views++;
      
      // Update analytics
      const analytics = this.analytics.get(writing.authorId);
      if (analytics) {
        analytics.totalViews++;
        analytics.totalEarnings = analytics.totalViews * 0.1; // $0.10 per view
      }
    }
  }

  incrementShares(writingId: string): void {
    const writing = this.writings.get(writingId);
    if (writing) {
      writing.shares++;
      
      // Update analytics
      const analytics = this.analytics.get(writing.authorId);
      if (analytics) {
        analytics.totalShares++;
      }
    }
  }

  // Comment operations
  createComment(commentData: Omit<Comment, 'id' | 'timestamp'>): Comment {
    const comment: Comment = {
      ...commentData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
    };
    this.comments.set(comment.id, comment);
    return comment;
  }

  getCommentsByWriting(writingId: string): Comment[] {
    return Array.from(this.comments.values()).filter(c => c.writingId === writingId);
  }

  // Analytics operations
  getAnalytics(userId: string): Analytics | undefined {
    return this.analytics.get(userId);
  }

  // Feed operations
  getTrendingWritings(limit: number = 10): Writing[] {
    return Array.from(this.writings.values())
      .filter(w => w.isPublic)
      .sort((a, b) => {
        const scoreA = a.views + (a.upvotes.length * 10) + (a.shares * 5);
        const scoreB = b.views + (b.upvotes.length * 10) + (b.shares * 5);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  getFollowingFeed(userId: string, limit: number = 20): Writing[] {
    const user = this.users.get(userId);
    if (!user) return [];
    
    return Array.from(this.writings.values())
      .filter(w => w.isPublic && user.following.includes(w.authorId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}

// Singleton instance
export const db = new Database();
