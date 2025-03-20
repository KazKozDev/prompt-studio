import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Grid, Chip, 
  FormControl, InputLabel, Select, MenuItem, Slider, 
  FormControlLabel, Switch, Divider, CircularProgress,
  List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  fetchDocuments,
  searchDocuments 
} from '../../store/slices/documentSlice';

// Определение типа для результатов поиска из документов
interface SearchResultItem {
  document_id: number;
  document_title: string;
  content: string;
  similarity: number;
  metadata?: any;
}

interface RagSelectorProps {
  onContextChange: (context: string) => void;
}

const RagSelector: React.FC<RagSelectorProps> = ({ onContextChange }) => {
  const dispatch = useAppDispatch();
  const documentState = useAppSelector(state => state?.documents);
  
  // Если документы не определены, используем значения по умолчанию
  const documents = documentState?.documents || [];
  const searchResults = documentState?.searchResults || null;
  const loading = documentState?.loading || false;
  const error = documentState?.error || null;

  // Состояния
  const [expanded, setExpanded] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<number[]>([]);
  const [maxChunks, setMaxChunks] = useState<number>(5);
  const [minSimilarity, setMinSimilarity] = useState<number>(0.7);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Загрузка документов при монтировании компонента
  useEffect(() => {
    if (dispatch) {
      try {
        dispatch(fetchDocuments());
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setFetchError('Не удалось загрузить данные. Проверьте работу сервера.');
      }
    }
  }, [dispatch]);

  // Отслеживание ошибки из Redux store
  useEffect(() => {
    if (error) {
      console.error('Ошибка из Redux store:', error);
      // Проверяем, является ли error объектом и преобразуем его в строку
      if (typeof error === 'object') {
        const errorObj = error as any; // Используем any для обхода проверки типов
        setFetchError(errorObj.message || JSON.stringify(error));
      } else {
        // Если error уже строка или другой примитив, просто используем его
        setFetchError(String(error));
      }
    } else {
      setFetchError(null);
    }
  }, [error]);
  
  // Обновление контекста при изменении результатов поиска
  useEffect(() => {
    if (searchResults && searchResults.results && searchResults.results.length > 0) {
      const context = searchResults.results
        .map((result: SearchResultItem) => `[Из документа "${result.document_title}"]: ${result.content}`)
        .join('\n\n');
      onContextChange(context);
    } else {
      onContextChange('');
    }
  }, [searchResults, onContextChange]);

  // Функция поиска
  const handleSearch = () => {
    if (!dispatch) return;
    
    dispatch(searchDocuments({
      query: searchQuery,
      documentIds: selectedDocumentIds.length > 0 ? selectedDocumentIds : undefined,
      maxChunks: maxChunks,
      minSimilarity: minSimilarity
    }));
  };

  // Обработчики изменения состояния
  const handleExpandChange = () => {
    setExpanded(!expanded);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDocumentSelect = (e: any) => {
    // Value может быть строкой или массивом строк, преобразуем в массив чисел
    const selectedValues = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
    
    // Преобразуем строки в числа, исключая пустые значения
    const numericIds = selectedValues
      .filter((val: string) => val !== '')
      .map((val: string) => parseInt(val, 10));
    
    console.log('Выбранные документы (преобразованные):', numericIds);
    setSelectedDocumentIds(numericIds);
  };

  const handleMaxChunksChange = (event: any, newValue: number | number[]) => {
    setMaxChunks(newValue as number);
  };

  const handleMinSimilarityChange = (event: any, newValue: number | number[]) => {
    setMinSimilarity(newValue as number);
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleExpandChange}
      sx={{ mb: 2, backgroundColor: '#f5f5f5' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" fontWeight="bold">
          Поиск в базе знаний (RAG)
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {fetchError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {fetchError}
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {/* Документы */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="documents-select-label">Документы</InputLabel>
              <Select
                labelId="documents-select-label"
                multiple
                value={selectedDocumentIds}
                onChange={handleDocumentSelect}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as number[]).map((id) => {
                      const doc = documents.find(d => d.id === id);
                      return (
                        <Chip key={id} label={doc?.filename || 'Документ'} size="small" />
                      );
                    })}
                  </Box>
                )}
              >
                {documents.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.filename}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Параметры поиска */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Поисковый запрос"
              variant="outlined"
              value={searchQuery}
              onChange={handleQueryChange}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Максимальное количество фрагментов: {maxChunks}
            </Typography>
            <Slider
              size="small"
              value={maxChunks}
              onChange={handleMaxChunksChange}
              min={1}
              max={20}
              step={1}
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Минимальное сходство: {minSimilarity.toFixed(2)}
            </Typography>
            <Slider
              size="small"
              value={minSimilarity}
              onChange={handleMinSimilarityChange}
              min={0.1}
              max={1}
              step={0.05}
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Кнопка поиска */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={loading || searchQuery.trim() === ''}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Искать'}
            </Button>
          </Grid>

          {/* Результаты поиска */}
          {searchResults && searchResults.results && searchResults.results.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Найдено {searchResults.count} фрагментов
              </Typography>
              <List>
                {searchResults.results.map((result: SearchResultItem, index: number) => (
                  <ListItem key={index} alignItems="flex-start" sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <Typography fontWeight="bold">
                          {result.document_title} ({(result.similarity * 100).toFixed(1)}% сходства)
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="body2"
                            color="text.primary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {result.content}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {/* Сообщение, если нет документов */}
          {documents.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                У вас нет загруженных документов. Пожалуйста, перейдите на страницу "Документы", чтобы загрузить документы для использования в RAG.
              </Alert>
            </Grid>
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default RagSelector; 