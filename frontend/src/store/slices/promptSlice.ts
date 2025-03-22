import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Получаем базовый URL API и добавляем путь /api
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Проверяем, содержит ли BASE_URL уже /api
const API_URL = BASE_URL?.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Определение интерфейса для типа Prompt
export interface Prompt {
  id: number;
  name: string;
  description?: string;
  content?: any[];
  template_id?: number | null;
  created_at?: string;
  updated_at?: string;
  versions?: any[];
  version?: number;
}

// Интерфейс для состояния
interface PromptState {
  prompts: Prompt[];
  currentPrompt: Prompt | null;
  testResults: any | null;
  loading: boolean;
  error: string | null;
}

// Интерфейс для параметров тестирования
interface TestPromptParams {
  promptId: number;
  provider: string;
  model: string;
  parameters: any;
}

export const fetchPrompts = createAsyncThunk(
  'prompts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching prompts from:', `${API_URL}/prompts/`);
      const response = await axios.get(`${API_URL}/prompts/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch prompts');
      return rejectWithValue(errorMessage);
    }
  }
);

export const createPrompt = createAsyncThunk(
  'prompts/create',
  async (promptData: Partial<Prompt>, { rejectWithValue }) => {
    try {
      console.log('Creating prompt at:', `${API_URL}/prompts/`);
      const response = await axios.post(`${API_URL}/prompts/`, promptData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to create prompt');
      return rejectWithValue(errorMessage);
    }
  }
);

export const updatePrompt = createAsyncThunk(
  'prompts/update',
  async ({ id, data }: { id: number, data: Partial<Prompt> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/prompts/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating prompt:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to update prompt');
      return rejectWithValue(errorMessage);
    }
  }
);

export const deletePrompt = createAsyncThunk(
  'prompts/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/prompts/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      console.error('Error deleting prompt:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to delete prompt');
      return rejectWithValue(errorMessage);
    }
  }
);

export const testPrompt = createAsyncThunk(
  'prompts/test',
  async ({ promptId, provider, model, parameters }: TestPromptParams, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/tests/${promptId}/test`, parameters, {
        params: { provider, model }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error testing prompt:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to test prompt');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchPromptVersions = createAsyncThunk(
  'prompts/fetchVersions',
  async (promptId: number, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/prompts/${promptId}/versions`);
      return { promptId, versions: response.data || [] };
    } catch (error: any) {
      console.error('Error fetching prompt versions:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch prompt versions');
      return rejectWithValue(errorMessage);
    }
  }
);

const promptSlice = createSlice({
  name: 'prompt',
  initialState: {
    prompts: [] as Prompt[],
    currentPrompt: null as Prompt | null,
    testResults: null,
    loading: false,
    error: null,
  } as PromptState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPrompt: (state, action) => {
      state.currentPrompt = action.payload;
      state.testResults = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch prompts
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = action.payload.prompts;
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create prompt
      .addCase(createPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts.push(action.payload);
        state.currentPrompt = action.payload;
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update prompt
      .addCase(updatePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrompt.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.prompts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.prompts[index] = action.payload;
        }
        state.currentPrompt = action.payload;
      })
      .addCase(updatePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete prompt
      .addCase(deletePrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = state.prompts.filter(p => p.id !== action.payload.id);
        if (state.currentPrompt && state.currentPrompt.id === action.payload.id) {
          state.currentPrompt = null;
        }
      })
      .addCase(deletePrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Test prompt
      .addCase(testPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.testResults = action.payload;
      })
      .addCase(testPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch prompt versions
      .addCase(fetchPromptVersions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromptVersions.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the response from fetchPromptVersions
        if (state.currentPrompt && state.currentPrompt.id === action.payload.promptId) {
          state.currentPrompt.versions = action.payload.versions;
        }
      })
      .addCase(fetchPromptVersions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPrompt } = promptSlice.actions;
export default promptSlice.reducer;
