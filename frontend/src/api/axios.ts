import axios from 'axios';

// Определение базового URL для API
// В production это будет относительный путь '/'
// В development это может быть полный URL, например 'http://localhost:8000'
let baseURL = '';

// В режиме разработки можно использовать proxy от React или прямой URL
if (process.env.NODE_ENV === 'development') {
  // Если прямой URL бэкенда не задан через переменную окружения,
  // используем proxy, настроенный в package.json
  if (process.env.REACT_APP_API_BASE_URL) {
    baseURL = process.env.REACT_APP_API_BASE_URL;
  }
}

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Обработка ошибок аутентификации (401)
    if (error.response && error.response.status === 401) {
      // Можно перенаправить на страницу логина
      // или выполнить другие действия по обновлению токена
      console.error('Unauthorized: Please login again');
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 