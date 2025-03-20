import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Получаем базовый URL API и добавляем путь /api
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Проверяем, содержит ли BASE_URL уже /api
const API_URL = BASE_URL?.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

// Определение интерфейса для типа Test
export interface Test {
  id: number;
  name: string;
  description?: string;
  prompt_id?: number;
  status?: string;
  provider?: string;
  model?: string;
  parameters?: any;
  results?: any[];
  variants?: any[];
  test_config?: {
    runs_per_variant: number;
    variants_count: number;
  };
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

// Интерфейс для состояния
interface TestState {
  tests: Test[];
  currentTest: Test | null;
  testResults: { [testId: string]: any };
  variantResults: any | null;
  loading: boolean;
  error: string | null;
}

export const fetchTests = createAsyncThunk(
  'tests/fetchAll',
  async (promptId: number | null = null, { rejectWithValue }) => {
    try {
      const params = promptId ? { prompt_id: promptId } : {};
      console.log('Fetching tests from:', `${API_URL}/tests/`, params);
      const response = await axios.get(`${API_URL}/tests/`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch tests');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchTestDetails = createAsyncThunk(
  'tests/fetchDetails',
  async (testId: number, { rejectWithValue }) => {
    try {
      console.log('Fetching test details from:', `${API_URL}/tests/${testId}`);
      const response = await axios.get(`${API_URL}/tests/${testId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching test details:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch test details');
      return rejectWithValue(errorMessage);
    }
  }
);

export const createTest = createAsyncThunk(
  'tests/create',
  async (testData: Partial<Test>, { rejectWithValue }) => {
    try {
      console.log('Creating test at:', `${API_URL}/tests/`);
      const response = await axios.post(`${API_URL}/tests/`, testData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating test:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to create test');
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTest = createAsyncThunk(
  'tests/update',
  async ({ id, data }: { id: number, data: Partial<Test> }, { rejectWithValue }) => {
    try {
      console.log('Updating test at:', `${API_URL}/tests/${id}`);
      const response = await axios.put(`${API_URL}/tests/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating test:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to update test');
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteTest = createAsyncThunk(
  'tests/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('Deleting test at:', `${API_URL}/tests/${id}`);
      const response = await axios.delete(`${API_URL}/tests/${id}`);
      return { id, ...response.data };
    } catch (error: any) {
      console.error('Error deleting test:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to delete test');
      return rejectWithValue(errorMessage);
    }
  }
);

export const startTest = createAsyncThunk(
  'tests/start',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('Starting test at:', `${API_URL}/tests/${id}/start`);
      const response = await axios.post(`${API_URL}/tests/${id}/start`);
      return response.data;
    } catch (error: any) {
      console.error('Error starting test:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to start test');
      return rejectWithValue(errorMessage);
    }
  }
);

export const stopTest = createAsyncThunk(
  'tests/stop',
  async (id: number, { rejectWithValue }) => {
    try {
      console.log('Stopping test at:', `${API_URL}/tests/${id}/stop`);
      const response = await axios.post(`${API_URL}/tests/${id}/stop`);
      return response.data;
    } catch (error: any) {
      console.error('Error stopping test:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to stop test');
      return rejectWithValue(errorMessage);
    }
  }
);

export const runTestVariant = createAsyncThunk(
  'tests/runVariant',
  async ({ testId, variantId, provider, model, parameters }: { 
    testId: number, 
    variantId: number, 
    provider: string, 
    model: string, 
    parameters: any 
  }, { rejectWithValue }) => {
    try {
      console.log('Running test variant at:', `${API_URL}/tests/${testId}/variants/${variantId}/run`);
      const response = await axios.post(
        `${API_URL}/tests/${testId}/variants/${variantId}/run`, 
        parameters,
        { params: { provider, model } }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error running test variant:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to run test variant');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchTestResults = createAsyncThunk(
  'tests/fetchResults',
  async (testId: number, { rejectWithValue }) => {
    try {
      console.log('Fetching test results from:', `${API_URL}/tests/${testId}/results`);
      const response = await axios.get(`${API_URL}/tests/${testId}/results`);
      return { testId, results: response.data };
    } catch (error: any) {
      console.error('Error fetching test results:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch test results');
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchVariantResults = createAsyncThunk(
  'tests/fetchVariantResults',
  async ({ testId, variantId, provider }: { testId: number, variantId: number, provider: string }, { rejectWithValue }) => {
    try {
      console.log('Fetching variant results from:', `${API_URL}/tests/${testId}/variants/${variantId}/results`);
      const response = await axios.get(`${API_URL}/tests/${testId}/variants/${variantId}/results`, {
        params: { provider }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching variant results:', error);
      const errorMessage = error.response?.data?.detail 
        ? (typeof error.response.data.detail === 'object' 
           ? JSON.stringify(error.response.data.detail) 
           : error.response.data.detail) 
        : (error.response?.data 
           ? (typeof error.response.data === 'object' 
              ? JSON.stringify(error.response.data) 
              : error.response.data) 
           : 'Failed to fetch variant results');
      return rejectWithValue(errorMessage);
    }
  }
);

const testSlice = createSlice({
  name: 'test',
  initialState: {
    tests: [],
    currentTest: null,
    testResults: {},
    variantResults: null,
    loading: false,
    error: null,
  } as TestState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTest: (state, action) => {
      state.currentTest = action.payload;
    },
    clearVariantResults: (state) => {
      state.variantResults = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch tests
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload.tests;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch test details
      .addCase(fetchTestDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTest = action.payload;
      })
      .addCase(fetchTestDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create test
      .addCase(createTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests.push(action.payload);
        state.currentTest = action.payload;
      })
      .addCase(createTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update test
      .addCase(updateTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(updateTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete test
      .addCase(deleteTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTest.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = state.tests.filter(t => t.id !== action.payload.id);
        if (state.currentTest && state.currentTest.id === action.payload.id) {
          state.currentTest = null;
        }
      })
      .addCase(deleteTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Start test
      .addCase(startTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(startTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Stop test
      .addCase(stopTest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopTest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tests.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tests[index] = action.payload;
        }
        state.currentTest = action.payload;
      })
      .addCase(stopTest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Run test variant
      .addCase(runTestVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runTestVariant.fulfilled, (state, action) => {
        state.loading = false;
        // Handle the response as needed
      })
      .addCase(runTestVariant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch test results
      .addCase(fetchTestResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTestResults.fulfilled, (state, action) => {
        state.loading = false;
        state.testResults[action.payload.testId] = action.payload.results;
      })
      .addCase(fetchTestResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch variant results
      .addCase(fetchVariantResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVariantResults.fulfilled, (state, action) => {
        state.loading = false;
        state.variantResults = action.payload;
      })
      .addCase(fetchVariantResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentTest, clearVariantResults } = testSlice.actions;
export default testSlice.reducer;
