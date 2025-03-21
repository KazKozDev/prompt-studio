import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  Snackbar, Alert, Card, CardContent, Divider
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface UserSettings {
  openai_key: string;
  anthropic_key: string;
  mistral_key: string;
  google_key: string;
  cohere_key: string;
  groq_key: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    openai_key: '',
    anthropic_key: '',
    mistral_key: '',
    google_key: '',
    cohere_key: '',
    groq_key: ''
  });

  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/user/settings`);
      if (response.data) {
        setSettings({
          openai_key: response.data.openai_key || '',
          anthropic_key: response.data.anthropic_key || '',
          mistral_key: response.data.mistral_key || '',
          google_key: response.data.google_key || '',
          cohere_key: response.data.cohere_key || '',
          groq_key: response.data.groq_key || ''
        });
      }
      setError(null);
    } catch (err: any) {
      console.error('Ошибка при загрузке настроек:', err);
      setError('Не удалось загрузить настройки. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE_URL}/user/settings`, settings);
      setSaveSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Ошибка при сохранении настроек:', err);
      setError('Не удалось сохранить настройки. Пожалуйста, попробуйте позже.');
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Ключи для моделей
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Введите ваши личные API ключи для различных провайдеров моделей. Эти ключи будут использоваться только для вашей учетной записи.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="OpenAI API ключ"
                  name="openai_key"
                  value={settings.openai_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="sk-..."
                  helperText="Используется для ChatGPT и GPT-4"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Anthropic API ключ"
                  name="anthropic_key"
                  value={settings.anthropic_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="sk-ant-..."
                  helperText="Используется для Claude моделей"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mistral API ключ"
                  name="mistral_key"
                  value={settings.mistral_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Используется для Mistral моделей"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Google AI API ключ"
                  name="google_key"
                  value={settings.google_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Используется для Gemini моделей"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cohere API ключ"
                  name="cohere_key"
                  value={settings.cohere_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Используется для Cohere моделей"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Groq API ключ"
                  name="groq_key"
                  value={settings.groq_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Используется для Groq моделей"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={loading}
              >
                Сохранить
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <Snackbar 
        open={saveSuccess} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Настройки успешно сохранены!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 