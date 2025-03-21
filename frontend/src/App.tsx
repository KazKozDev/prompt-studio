import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, Container, Typography, Button, Alert } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import axios from 'axios';

// Pages
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import PromptEditor from './pages/PromptEditor';
import TemplateList from './pages/TemplateList';
import TestList from './pages/TestList';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import Documents from './pages/Documents';
import TaxonomyPage from './pages/TaxonomyPage';
import Settings from './pages/Settings';

// Новые страницы
import AdvancedTestingFramework from './components/test/AdvancedTestingFramework';
import CollaborativeWorkflow from './components/collaborative/CollaborativeWorkflow';
import ComprehensiveLearningSystem from './components/learning/ComprehensiveLearningSystem';
import PromptOptimizationEngine from './components/optimization/PromptOptimizationEngine';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HelpButton from './components/welcome/HelpButton';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Проверка доступности API
  useEffect(() => {
    const checkApiAvailability = async () => {
      try {
        // Получаем URL API и исправляем его, если необходимо
        let API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';
        
        // Удаляем слэш в конце, если он есть
        if (API_URL.endsWith('/')) {
          API_URL = API_URL.slice(0, -1);
        }
        
        // Исправление ошибки с возможными дополнительными слэшами
        if (API_URL.includes('///')) {
          API_URL = API_URL.replace('///', '//');
        }
        
        console.log("Проверка доступности API:", API_URL);
        
        // Получаем корневой URL API (без /api)
        const baseURL = API_URL.includes('/api') 
          ? API_URL.substring(0, API_URL.indexOf('/api')) 
          : API_URL;
        
        console.log("Базовый URL сервера:", baseURL);
        
        // Проверяем доступность API
        try {
          // Сначала проверяем endpoint /health
          const healthResponse = await axios.get(`${baseURL}/health`, { timeout: 5000 });
          console.log("Эндпоинт /health доступен:", healthResponse.status);
          setApiAvailable(true);
        } catch (healthError: any) {
          console.log("Эндпоинт /health недоступен:", healthError.message);
          
          // Если получили ответ 404, проверяем корневой эндпоинт
          if (healthError.response && healthError.response.status === 404) {
            try {
              // Проверяем корневой URL
              const rootResponse = await axios.get(baseURL, { timeout: 5000 });
              console.log("Корневой URL доступен, статус:", rootResponse.status);
              setApiAvailable(true);
            } catch (rootError: any) {
              console.error("Ошибка при обращении к корневому URL:", rootError);
              setApiAvailable(false);
              setApiError(rootError.message || 'Не удалось подключиться к API');
              return;
            }
          } else {
            // Если не 404, пробуем запрос к API
            try {
              // Проверяем корневой URL API
              const apiResponse = await axios.get(API_URL, { timeout: 5000 });
              console.log("API URL доступен, статус:", apiResponse.status);
              setApiAvailable(true);
            } catch (apiError: any) {
              console.error("Ошибка при обращении к API URL:", apiError);
              setApiAvailable(false);
              setApiError(apiError.message || 'Не удалось подключиться к API');
              return;
            }
          }
        }
        
        setApiError(null);
      } catch (error: any) {
        console.error('API недоступен, общая ошибка:', error);
        setApiAvailable(false);
        setApiError(error.message || 'Не удалось подключиться к API');
      }
    };
    
    checkApiAvailability();
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, isAuthenticated]);
  
  // Если API недоступен, показываем сообщение
  if (!apiAvailable) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', p: 3 }}>
          <Alert severity="error" sx={{ mb: 3, width: '100%', maxWidth: 500 }}>
            Не удалось подключиться к серверу API
          </Alert>
          <Typography variant="h5" gutterBottom>
            Проблема соединения с сервером
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center', maxWidth: 500 }}>
            Приложение не может подключиться к серверу API. Убедитесь, что сервер запущен и доступен по адресу: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}
          </Typography>
          {apiError && (
            <Typography variant="body2" color="error" sx={{ mb: 3 }}>
              Ошибка: {apiError}
            </Typography>
          )}
          <Button 
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Повторить попытку
          </Button>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Navbar />
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              p: 3,
              pt: 10,
            }}
          >
            <Container maxWidth="xl">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/prompts" element={
                  <ProtectedRoute>
                    <Prompts />
                  </ProtectedRoute>
                } />
                <Route path="/prompts/new" element={
                  <ProtectedRoute>
                    <PromptEditor />
                  </ProtectedRoute>
                } />
                <Route path="/prompts/:id" element={
                  <ProtectedRoute>
                    <PromptEditor />
                  </ProtectedRoute>
                } />
                <Route path="/templates" element={
                  <ProtectedRoute>
                    <TemplateList />
                  </ProtectedRoute>
                } />
                <Route path="/tests" element={
                  <ProtectedRoute>
                    <TestList />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/documents" element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                } />
                <Route path="/taxonomy" element={<TaxonomyPage />} />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/collaborative" element={
                  <ProtectedRoute>
                    <CollaborativeWorkflow />
                  </ProtectedRoute>
                } />
                <Route path="/learning" element={
                  <ProtectedRoute>
                    <ComprehensiveLearningSystem />
                  </ProtectedRoute>
                } />
                <Route path="/optimization" element={
                  <ProtectedRoute>
                    <PromptOptimizationEngine />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
            
            <HelpButton />
          </Box>
        </Box>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </ThemeProvider>
  );
};

export default App;
