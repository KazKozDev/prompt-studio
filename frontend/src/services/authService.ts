import axios from 'axios';
import { User } from '../types/user';

// Исправляем и проверяем URL API
let API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Исправление ошибки с возможными дополнительными слэшами
if (API_URL.includes('///')) {
  API_URL = API_URL.replace('///', '//');
}

// Удаляем слэш в конце, если он есть
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}

// Путь к API
const API_PATH = '/api';

console.log("API URL используется:", API_URL); // Отладочная информация

class AuthService {
  async login(email: string, password: string): Promise<{ access_token: string }> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI OAuth expects 'username'
      formData.append('password', password);
      
      const response = await axios.post(`${API_URL}${API_PATH}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      }
      
      return response.data;
    } catch (error) {
      console.error("Ошибка при входе:", error);
      throw error;
    }
  }

  async register(email: string, password: string, fullName: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}${API_PATH}/auth/register`, {
        email,
        password,
        full_name: fullName,
      });
      
      return response.data;
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      throw error;
    }
  }

  async fetchCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axios.get(`${API_URL}${API_PATH}/auth/me`);
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
}

// Экспортируем экземпляр класса
const authService = new AuthService();
export default authService;
