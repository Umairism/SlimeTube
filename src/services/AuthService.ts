import { AuthUser, LoginCredentials, RegisterCredentials } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AuthServiceClass {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      // In production, replace this with actual API call
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials),
      // });

      // For development, simulate API call
      await this.simulateApiDelay();
      
      // Mock authentication logic
      if (credentials.email === 'demo@streamflix.com' && credentials.password === 'demo123') {
        return {
          id: '1',
          name: 'Demo User',
          email: credentials.email,
          avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
          token: this.generateMockToken(),
        };
      }

      // For now, accept any email with password length > 6
      if (credentials.email.includes('@') && credentials.password.length >= 6) {
        return {
          id: Date.now().toString(),
          name: credentials.email.split('@')[0],
          email: credentials.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.email.split('@')[0])}&background=0891b2&color=fff`,
          token: this.generateMockToken(),
        };
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    try {
      // Validation
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!credentials.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // In production, replace this with actual API call
      // const response = await fetch(`${API_BASE_URL}/auth/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials),
      // });

      // For development, simulate API call
      await this.simulateApiDelay();

      return {
        id: Date.now().toString(),
        name: credentials.name,
        email: credentials.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name)}&background=0891b2&color=fff`,
        token: this.generateMockToken(),
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }

  async validateToken(token: string): Promise<AuthUser> {
    try {
      // In production, replace this with actual API call
      // const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      //   headers: { 'Authorization': `Bearer ${token}` },
      // });

      // For development, simulate validation
      await this.simulateApiDelay(200);

      if (!token || token === 'invalid') {
        throw new Error('Invalid token');
      }

      // Mock validation - in real app, server would validate and return user data
      const mockUser = this.decodeToken(token);
      return mockUser;
    } catch (error) {
      throw new Error('Token validation failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // In production, you might want to invalidate the token on the server
      // await fetch(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${token}` },
      // });

      // For development, just resolve
      await this.simulateApiDelay(100);
    } catch (error) {
      // Even if logout fails on server, we'll clear local storage
      console.warn('Logout request failed, but continuing with local logout');
    }
  }

  private async simulateApiDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockToken(): string {
    // In production, this would be a JWT from your server
    const payload = {
      userId: Date.now().toString(),
      timestamp: Date.now(),
    };
    return btoa(JSON.stringify(payload));
  }

  private decodeToken(token: string): AuthUser {
    try {
      const payload = JSON.parse(atob(token));
      return {
        id: payload.userId || '1',
        name: 'Demo User',
        email: 'demo@streamflix.com',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1',
        token,
      };
    } catch {
      throw new Error('Invalid token format');
    }
  }
}

export const AuthService = new AuthServiceClass();
