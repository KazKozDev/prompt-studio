import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  AlertColor,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL?.endsWith('/api') 
  ? process.env.REACT_APP_API_BASE_URL 
  : `${process.env.REACT_APP_API_BASE_URL}/api`;

type Provider = 'openai' | 'anthropic' | 'mistral' | 'google';

const Settings = () => {
  const [apiKeys, setApiKeys] = useState<Record<Provider, string>>({
    openai: '',
    anthropic: '',
    mistral: '',
    google: ''
  });

  const [showKeys, setShowKeys] = useState<Record<Provider, boolean>>({
    openai: false,
    anthropic: false,
    mistral: false,
    google: false
  });

  const [status, setStatus] = useState<{
    message: string;
    type: AlertColor | '';
  }>({ message: '', type: '' });

  useEffect(() => {
    // Загрузка текущих API ключей
    const fetchApiKeys = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings/api-keys`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setApiKeys(response.data);
      } catch (error) {
        console.error('Error fetching API keys:', error);
      }
    };

    fetchApiKeys();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(`${API_URL}/settings/api-keys`, apiKeys, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStatus({ message: 'API ключи успешно сохранены', type: 'success' });
    } catch (error) {
      console.error('Error saving API keys:', error);
      setStatus({ message: 'Ошибка при сохранении API ключей', type: 'error' });
    }
  };

  const handleChange = (provider: Provider) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: event.target.value
    }));
  };

  const toggleShowKey = (provider: Provider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Настройки
      </Typography>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          API Ключи
        </Typography>
        
        {status.message && status.type && (
          <Alert severity={status.type} sx={{ mb: 2 }}>
            {status.message}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="OpenAI API Key"
              value={apiKeys.openai}
              onChange={handleChange('openai')}
              type={showKeys.openai ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => toggleShowKey('openai')}>
                      {showKeys.openai ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Anthropic API Key"
              value={apiKeys.anthropic}
              onChange={handleChange('anthropic')}
              type={showKeys.anthropic ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => toggleShowKey('anthropic')}>
                      {showKeys.anthropic ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mistral API Key"
              value={apiKeys.mistral}
              onChange={handleChange('mistral')}
              type={showKeys.mistral ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => toggleShowKey('mistral')}>
                      {showKeys.mistral ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Google AI API Key"
              value={apiKeys.google}
              onChange={handleChange('google')}
              type={showKeys.google ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => toggleShowKey('google')}>
                      {showKeys.google ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave}>
            Сохранить
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings; 