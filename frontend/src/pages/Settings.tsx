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

  // Load settings when component mounts
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/user/settings`);
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
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Please try again later.');
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
      await axios.put(`${API_BASE_URL}/api/user/settings`, settings);
      setSaveSuccess(true);
      setError(null);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again later.');
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            API Keys for Models
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter your personal API keys for various model providers. These keys will be used only for your account.
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
                  label="OpenAI API Key"
                  name="openai_key"
                  value={settings.openai_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="sk-..."
                  helperText="Used for ChatGPT and GPT-4"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Anthropic API Key"
                  name="anthropic_key"
                  value={settings.anthropic_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  placeholder="sk-ant-..."
                  helperText="Used for Claude models"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Mistral API Key"
                  name="mistral_key"
                  value={settings.mistral_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Used for Mistral models"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Google AI API Key"
                  name="google_key"
                  value={settings.google_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Used for Gemini models"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Cohere API Key"
                  name="cohere_key"
                  value={settings.cohere_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Used for Cohere models"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Groq API Key"
                  name="groq_key"
                  value={settings.groq_key}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  helperText="Used for Groq models"
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
                Save
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
          Settings saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings; 