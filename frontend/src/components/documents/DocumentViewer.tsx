import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Card,
  CardContent,
  Grid,
  Button,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  FormatListBulleted as ChunkIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { formatBytes, formatDate } from '../../utils/formatting';
import axios from 'axios';

interface DocumentMetadata {
  title: string;
  author?: string;
  created?: string;
  modified?: string;
  pages?: number;
  words?: number;
  tokens?: number;
  chunks?: number;
  language?: string;
  keywords?: string[];
  summary?: string;
}

interface DocumentChunk {
  id: number;
  content: string;
  metadata: {
    page?: number;
    position?: number;
    tokens: number;
  };
}

interface DocumentViewerProps {
  documentId: number;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  processingStatus: string;
  processingError?: string;
}

// Компонент для отображения метаданных документа
const MetadataDisplay: React.FC<{ metadata: DocumentMetadata }> = ({ metadata }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Основная информация
            </Typography>
            <Typography variant="body2">
              <strong>Название:</strong> {metadata.title}
            </Typography>
            {metadata.author && (
              <Typography variant="body2">
                <strong>Автор:</strong> {metadata.author}
              </Typography>
            )}
            {metadata.created && (
              <Typography variant="body2">
                <strong>Создан:</strong> {formatDate(metadata.created)}
              </Typography>
            )}
            {metadata.modified && (
              <Typography variant="body2">
                <strong>Изменен:</strong> {formatDate(metadata.modified)}
              </Typography>
            )}
            {metadata.language && (
              <Typography variant="body2">
                <strong>Язык:</strong> {metadata.language}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Статистика
            </Typography>
            {metadata.pages !== undefined && (
              <Typography variant="body2">
                <strong>Страниц:</strong> {metadata.pages}
              </Typography>
            )}
            {metadata.words !== undefined && (
              <Typography variant="body2">
                <strong>Слов:</strong> {metadata.words.toLocaleString()}
              </Typography>
            )}
            {metadata.tokens !== undefined && (
              <Typography variant="body2">
                <strong>Токенов:</strong> {metadata.tokens.toLocaleString()}
              </Typography>
            )}
            {metadata.chunks !== undefined && (
              <Typography variant="body2">
                <strong>Чанков:</strong> {metadata.chunks}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
      {metadata.summary && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Краткое содержание
              </Typography>
              <Typography variant="body2">
                {metadata.summary}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      )}
      {metadata.keywords && metadata.keywords.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ключевые слова
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {metadata.keywords.map((keyword, index) => (
                  <Chip key={index} label={keyword} size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Компонент для отображения чанков документа
const ChunksDisplay: React.FC<{ chunks: DocumentChunk[] }> = ({ chunks }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Чанки документа ({chunks.length})
      </Typography>
      
      {chunks.map((chunk, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Чанк #{index + 1}
                {chunk.metadata.page !== undefined && ` | Страница: ${chunk.metadata.page}`}
                {' | '}Токенов: {chunk.metadata.tokens}
              </Typography>
              <Box>
                <Tooltip title="Копировать текст">
                  <IconButton 
                    size="small"
                    onClick={() => navigator.clipboard.writeText(chunk.content)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ 
              bgcolor: 'background.paper', 
              p: 1, 
              borderRadius: 1,
              maxHeight: '150px',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
              {chunk.content}
            </Box>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Компонент для отображения содержимого документа
const ContentDisplay: React.FC<{ content: string; fileType: string }> = ({ content, fileType }) => {
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="small"
          startIcon={<CopyIcon />}
          onClick={() => navigator.clipboard.writeText(content)}
        >
          Копировать всё
        </Button>
      </Box>
      
      <Paper 
        sx={{ 
          p: 2, 
          maxHeight: '600px', 
          overflow: 'auto',
          bgcolor: 'background.paper'
        }}
      >
        {fileType === 'md' ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{content}</pre>
        )}
      </Paper>
    </Box>
  );
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  filename,
  fileType,
  fileSize,
  uploadDate,
  processingStatus,
  processingError
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);

  // Загрузка данных документа
  useEffect(() => {
    const fetchDocumentData = async () => {
      if (processingStatus !== 'completed') return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Загрузка содержимого
        const contentResponse = await axios.get(`/api/documents/${documentId}/content`);
        setContent(contentResponse.data.content);
        
        // Загрузка метаданных
        const metadataResponse = await axios.get(`/api/documents/${documentId}/metadata`);
        setMetadata(metadataResponse.data);
        
        // Загрузка чанков
        const chunksResponse = await axios.get(`/api/documents/${documentId}/chunks`);
        setChunks(chunksResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки данных документа');
        console.error('Error fetching document data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentData();
  }, [documentId, processingStatus]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Если документ еще обрабатывается или возникла ошибка
  if (processingStatus !== 'completed') {
    return (
      <Paper sx={{ p: 3 }}>
        {processingStatus === 'processing' && (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={50} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Документ обрабатывается...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Пожалуйста, подождите. Это может занять некоторое время в зависимости от размера документа.
            </Typography>
          </Box>
        )}
        
        {processingStatus === 'failed' && (
          <Alert severity="error">
            <Typography variant="subtitle1">
              Ошибка при обработке документа
            </Typography>
            <Typography variant="body2">
              {processingError || 'Неизвестная ошибка при обработке документа.'}
            </Typography>
          </Alert>
        )}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          {filename}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <Chip 
            size="small" 
            label={fileType.toUpperCase()} 
            color="primary" 
          />
          <Chip 
            size="small" 
            label={formatBytes(fileSize)} 
            variant="outlined" 
          />
          <Chip 
            size="small" 
            label={`Загружен: ${formatDate(uploadDate)}`} 
            variant="outlined" 
          />
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Содержимое" icon={<DescriptionIcon />} iconPosition="start" />
            <Tab label="Метаданные" icon={<InfoIcon />} iconPosition="start" />
            <Tab label="Чанки" icon={<ChunkIcon />} iconPosition="start" />
          </Tabs>
          
          {activeTab === 0 && <ContentDisplay content={content} fileType={fileType} />}
          {activeTab === 1 && metadata && <MetadataDisplay metadata={metadata} />}
          {activeTab === 2 && <ChunksDisplay chunks={chunks} />}
        </>
      )}
    </Paper>
  );
};

export default DocumentViewer; 