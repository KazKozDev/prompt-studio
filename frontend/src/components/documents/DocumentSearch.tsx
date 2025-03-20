import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DescriptionIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { formatDate } from '../../utils/formatting';
import axios from 'axios';

interface SearchResult {
  id: number;
  documentId: number;
  documentTitle: string;
  documentType: string;
  content: string;
  metadata: {
    page?: number;
    position?: number;
    tokens: number;
    relevance: number;
  };
  documentMetadata: {
    uploadDate: string;
    author?: string;
    language?: string;
  };
}

interface SearchFilters {
  documentTypes: string[];
  dateRange: [Date | null, Date | null];
  minRelevance: number;
  maxTokens: number;
  languages: string[];
  includeMetadata: boolean;
}

const DocumentSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    documentTypes: [],
    dateRange: [null, null],
    minRelevance: 0.5,
    maxTokens: 2000,
    languages: [],
    includeMetadata: true
  });
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/documents/search', {
        query,
        filters: {
          ...filters,
          dateRange: filters.dateRange.map(date => date?.toISOString())
        }
      });

      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при выполнении поиска');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleViewDocument = (documentId: number) => {
    // Здесь можно добавить навигацию к просмотру документа
    console.log('View document:', documentId);
  };

  const handleFiltersSave = () => {
    setFiltersOpen(false);
    handleSearch();
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 0.8) return 'success';
    if (relevance >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Введите поисковый запрос..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading || !query.trim()}
          >
            Поиск
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFiltersOpen(true)}
          >
            Фильтры
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : results.length > 0 ? (
        <List>
          {results.map((result, index) => (
            <React.Fragment key={result.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Box>
                    <Tooltip title="Копировать текст">
                      <IconButton
                        edge="end"
                        onClick={() => handleCopyContent(result.content)}
                        sx={{ mr: 1 }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Просмотреть документ">
                      <IconButton
                        edge="end"
                        onClick={() => handleViewDocument(result.documentId)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {result.documentTitle}
                      </Typography>
                      <Chip
                        size="small"
                        label={result.documentType.toUpperCase()}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={`Релевантность: ${(result.metadata.relevance * 100).toFixed(1)}%`}
                        color={getRelevanceColor(result.metadata.relevance)}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {result.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(result.documentMetadata.uploadDate)}
                        </Typography>
                        {result.metadata.page && (
                          <Typography variant="caption" color="text.secondary">
                            Страница: {result.metadata.page}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Токенов: {result.metadata.tokens}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      ) : query ? (
        <Typography sx={{ p: 2, textAlign: 'center' }}>
          Ничего не найдено
        </Typography>
      ) : null}

      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Настройки поиска</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Типы документов</InputLabel>
              <Select
                multiple
                value={filters.documentTypes}
                onChange={(e) => setFilters({
                  ...filters,
                  documentTypes: e.target.value as string[]
                })}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="docx">DOCX</MenuItem>
                <MenuItem value="md">Markdown</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="xlsx">XLSX</MenuItem>
              </Select>
            </FormControl>

            <Typography gutterBottom>
              Минимальная релевантность
            </Typography>
            <Slider
              value={filters.minRelevance}
              onChange={(_, value) => setFilters({
                ...filters,
                minRelevance: value as number
              })}
              min={0}
              max={1}
              step={0.1}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />

            <Typography gutterBottom>
              Максимальное количество токенов
            </Typography>
            <Slider
              value={filters.maxTokens}
              onChange={(_, value) => setFilters({
                ...filters,
                maxTokens: value as number
              })}
              min={100}
              max={4000}
              step={100}
              marks
              valueLabelDisplay="auto"
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Языки</InputLabel>
              <Select
                multiple
                value={filters.languages}
                onChange={(e) => setFilters({
                  ...filters,
                  languages: e.target.value as string[]
                })}
              >
                <MenuItem value="ru">Русский</MenuItem>
                <MenuItem value="en">Английский</MenuItem>
                <MenuItem value="es">Испанский</MenuItem>
                <MenuItem value="fr">Французский</MenuItem>
                <MenuItem value="de">Немецкий</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={filters.includeMetadata}
                  onChange={(e) => setFilters({
                    ...filters,
                    includeMetadata: e.target.checked
                  })}
                />
              }
              label="Включать метаданные в поиск"
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Отмена</Button>
          <Button onClick={handleFiltersSave} variant="contained">
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentSearch; 