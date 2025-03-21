import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Получаем базовый URL API и добавляем путь /api
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Проверяем, содержит ли BASE_URL уже /api
const API_URL = BASE_URL?.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Определение интерфейса для типа Template
export interface Template {
  id: number;
  name: string;
  description?: string;
  structure?: any;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Интерфейс для состояния
interface TemplateState {
  templates: Template[];
  publicTemplates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
}

export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching templates from:', `${API_URL}/templates/`);
      const response = await axios.get(`${API_URL}/templates/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch templates');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPublicTemplates = createAsyncThunk(
  'templates/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching public templates from:', `${API_URL}/templates/public`);
      const response = await axios.get(`${API_URL}/templates/public`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching public templates:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch public templates');
      return rejectWithValue(errorMessage);
    }
  }
);

export const createTemplate = createAsyncThunk(
  'templates/create',
  async (templateData: Partial<Template>, { rejectWithValue }) => {
    try {
      console.log('Creating template at:', `${API_URL}/templates/`);
      const response = await axios.post(`${API_URL}/templates/`, templateData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating template:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to create template');
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  'templates/update',
  async ({ id, data }: { id: number, data: Partial<Template> }, { rejectWithValue }) => {
    try {
      console.log('Updating template at:', `${API_URL}/templates/${id}`);
      const response = await axios.put(`${API_URL}/templates/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating template:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to update template');
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteTemplate = createAsyncThunk(
  'templates/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('Deleting template at:', `${API_URL}/templates/${id}`);
      const response = await axios.delete(`${API_URL}/templates/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      console.error('Error deleting template:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to delete template');
      return rejectWithValue(errorMessage);
    }
  }
);

const templateSlice = createSlice({
  name: 'template',
  initialState: {
    templates: [] as Template[],
    publicTemplates: [] as Template[],
    currentTemplate: null as Template | null,
    loading: false,
    error: null,
  } as TemplateState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTemplate: (state, action) => {
      state.currentTemplate = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch templates
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch public templates
      .addCase(fetchPublicTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.publicTemplates = action.payload.templates;
      })
      .addCase(fetchPublicTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create template
      .addCase(createTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates.push(action.payload);
        state.currentTemplate = action.payload;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update template
      .addCase(updateTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        state.currentTemplate = action.payload;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete template
      .addCase(deleteTemplate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = state.templates.filter(t => t.id !== action.payload.id);
        if (state.currentTemplate && state.currentTemplate.id === action.payload.id) {
          state.currentTemplate = null;
        }
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTemplate } = templateSlice.actions;
export default templateSlice.reducer;
