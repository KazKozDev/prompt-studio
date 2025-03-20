import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import api from '../../api/axios';
import { RootState } from '../store';

// Функция-помощник для обработки ошибок и преобразования их в строки
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error('API Error:', error);
  console.error('Status:', error.response?.status);
  console.error('Error details:', error.response?.data);
  
  // Обработка различных форматов ошибок
  if (error.response?.status === 422 && error.response?.data?.detail) {
    // Обработка ошибок валидации
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail
        .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
        .join('; ');
    } else if (typeof error.response.data.detail === 'object') {
      // Если detail - объект, преобразуем его в строку
      return JSON.stringify(error.response.data.detail);
    } else {
      return String(error.response.data.detail);
    }
  } else if (error.response?.data?.detail) {
    return String(error.response.data.detail);
  } else if (error.response) {
    return `Ошибка ${error.response.status}: ${error.response.statusText}`;
  } else if (error.message) {
    return error.message;
  } else {
    return defaultMessage;
  }
};

// Типы данных
interface Document {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  title: string | null;
  author: string | null;
  processing_status: string;
  processing_error: string | null;
  created_at: string;
  updated_at: string;
  chunks_count?: number;
}

interface DocumentChunk {
  id: number;
  document_id: number;
  content: string;
  chunk_index: number;
  page_number: number | null;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface SearchResult {
  query: string;
  results: {
    document_id: number;
    document_title: string;
    content: string;
    similarity: number;
    metadata?: any;
  }[];
  count: number;
}

// Состояние
interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  searchResults: SearchResult | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  totalDocuments: number;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  searchResults: null,
  loading: false,
  error: null,
  uploadProgress: 0,
  totalDocuments: 0
};

// Асинхронные действия
export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Отправка запроса на получение документов...');
      const response = await api.get('/api/documents');
      console.log('Ответ получен успешно:', response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error, 'Не удалось получить документы'));
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (formData: FormData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          dispatch(setUploadProgress(percentCompleted));
        }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error, 'Не удалось загрузить документ'));
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'documents/search',
  async (params: {
    query: string;
    documentIds?: number[];
    maxChunks?: number;
    minSimilarity?: number;
  }, { rejectWithValue }) => {
    try {
      console.log('Отправка поискового запроса:', params);
      
      // Преобразуем documentIds в строку только если это массив с элементами
      const documentIdsParam = params.documentIds && params.documentIds.length > 0 
        ? params.documentIds.join(',') 
        : undefined;
      
      console.log('document_ids param:', documentIdsParam);
      
      const response = await api.get('/api/documents/search', {
        params: {
          query: params.query,
          document_ids: documentIdsParam,
          max_chunks: params.maxChunks,
          min_similarity: params.minSimilarity
        }
      });
      
      console.log('Ответ поиска получен:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка поиска:', error);
      return rejectWithValue(handleApiError(error, 'Не удалось выполнить поиск по документам'));
    }
  }
);

// Добавляем действие для удаления документа
export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/api/documents/${documentId}`);
      return documentId;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error, 'Не удалось удалить документ'));
    }
  }
);

// Slice
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = Array.isArray(action.payload) ? action.payload : [];
        state.totalDocuments = Array.isArray(action.payload) ? action.payload.length : 0;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // uploadDocument
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
        state.totalDocuments += 1;
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // searchDocuments
      .addCase(searchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action: PayloadAction<SearchResult>) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обработчики для удаления документа
      .addCase(deleteDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = state.documents.filter(doc => doc.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Экспорт действий и редьюсера
export const { 
  setUploadProgress, 
  resetUploadProgress, 
  setCurrentDocument,
  clearSearchResults
} = documentSlice.actions;

// Селекторы
export const selectDocuments = (state: RootState) => state.documents.documents;
export const selectCurrentDocument = (state: RootState) => state.documents.currentDocument;
export const selectSearchResults = (state: RootState) => state.documents.searchResults;
export const selectDocumentsLoading = (state: RootState) => state.documents.loading;
export const selectDocumentsError = (state: RootState) => state.documents.error;
export const selectUploadProgress = (state: RootState) => state.documents.uploadProgress;
export const selectTotalDocuments = (state: RootState) => state.documents.totalDocuments;

export default documentSlice.reducer; 