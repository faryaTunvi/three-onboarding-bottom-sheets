import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure your API base URL here
// For development: Use your computer's local IP address (not localhost)
// Example: const API_BASE_URL = 'http://192.168.1.100:8080';
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080'  // Change to your local IP for device testing
  : 'https://your-production-api.com';

const AUTH_TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';

interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
  is_new_user: boolean;
}

interface MagicLinkResponse {
  message: string;
  magic_link?: string;
  token?: string;
}

interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id: string;
}

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        if (!this.authToken) {
          this.authToken = await this.getAuthToken();
        }
        
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
          // Clear auth data
          await this.clearAuthData();
          // Optionally trigger a logout action
        }
        
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Auth Token Management
  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      this.authToken = token;
    } catch (error) {
      console.error('Error saving auth token:', error);
    }
  }

  async saveAuthData(data: AuthResponse): Promise<void> {
    try {
      await this.saveAuthToken(data.token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  async getAuthData(): Promise<AuthResponse | null> {
    try {
      const data = await AsyncStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  }

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY]);
      this.authToken = null;
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Authentication Endpoints

  async requestMagicLink(email: string): Promise<MagicLinkResponse> {
    const response = await this.api.post<MagicLinkResponse>('/api/auth/request-link', {
      email,
    });
    return response.data;
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const response = await this.api.get<AuthResponse>('/api/auth/verify', {
      params: { token },
    });
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/refresh');
    return response.data;
  }

  // Feedback Endpoints

  async submitFeedback(content: string, platform: string): Promise<FeedbackResponse> {
    const response = await this.api.post<FeedbackResponse>('/api/feedback/submit', {
      content,
      platform,
    });
    return response.data;
  }

  async getFeedbackList(): Promise<any> {
    const response = await this.api.get('/api/feedback/list');
    return response.data;
  }

  // Generic methods (kept for compatibility)
  
  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, { params });
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data);
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data);
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url);
  }
}

export default new ApiService();
