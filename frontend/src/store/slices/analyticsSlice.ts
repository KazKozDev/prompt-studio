import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define interfaces for type safety
export interface AggregatedData {
  total_prompts: number;
  total_tests: number;
  total_runs: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface UsageData {
  date?: string;
  prompt_name?: string;
  runs: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens?: number;
  provider?: string;
}

interface AnalyticsState {
  promptUsage: UsageData[];
  providerUsage: UsageData[];
  aggregatedData: AggregatedData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  promptUsage: [],
  providerUsage: [],
  aggregatedData: null,
  loading: false,
  error: null
};

// Получаем базовый URL API и добавляем путь /api
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Проверяем, содержит ли BASE_URL уже /api
const API_URL = BASE_URL?.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export const fetchPromptUsage = createAsyncThunk(
  'analytics/fetchPromptUsage',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      console.log('Fetching prompt usage from:', `${API_URL}/analytics/usage/prompts`);
      const response = await axios.get(`${API_URL}/analytics/usage/prompts`, {
        params: { days }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching prompt usage:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch prompt usage');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchProviderUsage = createAsyncThunk(
  'analytics/fetchProviderUsage',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      console.log('Fetching provider usage from:', `${API_URL}/analytics/usage/providers`);
      const response = await axios.get(`${API_URL}/analytics/usage/providers`, {
        params: { days }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching provider usage:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch provider usage');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAggregatedAnalytics = createAsyncThunk(
  'analytics/fetchAggregated',
  async (period: string = 'month', { rejectWithValue }) => {
    try {
      console.log('Fetching aggregated analytics from:', `${API_URL}/analytics/aggregated`);
      const response = await axios.get(`${API_URL}/analytics/aggregated`, {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching aggregated analytics:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch aggregated analytics');
      return rejectWithValue(errorMessage);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch prompt usage
      .addCase(fetchPromptUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromptUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.promptUsage = action.payload;
      })
      .addCase(fetchPromptUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch provider usage
      .addCase(fetchProviderUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviderUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.providerUsage = action.payload;
      })
      .addCase(fetchProviderUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch aggregated analytics
      .addCase(fetchAggregatedAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAggregatedAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.aggregatedData = action.payload;
      })
      .addCase(fetchAggregatedAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
