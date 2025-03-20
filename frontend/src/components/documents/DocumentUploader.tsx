import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { formatBytes } from '../../utils/formatting';
import axios from 'axios';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  response?: any;
}

interface DocumentUploaderProps {
  onUploadComplete: (documentId: number) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  maxFileSize = 50 * 1024 * 1024, // 50MB по умолчанию
  acceptedFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/html',
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [processingOptions, setProcessingOptions] = useState({
    extractMetadata: true,
    generateSummary: true,
    detectLanguage: true,
    extractKeywords: true
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize
  });

  const handleUpload = async (file: UploadFile) => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('chunkSize', chunkSize.toString());
    formData.append('chunkOverlap', chunkOverlap.toString());
    formData.append('processingOptions', JSON.stringify(processingOptions));

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total!) * 100;
          setFiles(prev =>
            prev.map(f =>
              f.file === file.file
                ? { ...f, progress, status: 'uploading' as const }
                : f
            )
          );
        }
      });

      setFiles(prev =>
        prev.map(f =>
          f.file === file.file
            ? { ...f, progress: 100, status: 'completed' as const, response: response.data }
            : f
        )
      );

      if (onUploadComplete) {
        onUploadComplete(response.data.id);
      }
    } catch (error: any) {
      setFiles(prev =>
        prev.map(f =>
          f.file === file.file
            ? {
                ...f,
                status: 'error' as const,
                error: error.response?.data?.message || 'Ошибка загрузки файла'
              }
            : f
        )
      );
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const handleSettingsSave = () => {
    setSettingsOpen(false);
    // Перезапускаем загрузку файлов с новыми настройками
    files.forEach(file => {
      if (file.status === 'pending') {
        handleUpload(file);
      }
    });
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Отпустите файл здесь'
            : 'Перетащите файл сюда или нажмите для выбора'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Поддерживаемые форматы: PDF, DOCX, MD, HTML, CSV, JSON, XLSX
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Максимальный размер: {formatBytes(maxFileSize)}
        </Typography>
      </Paper>

      {files.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Файлы для загрузки ({files.length})
            </Typography>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
              size="small"
            >
              Настройки обработки
            </Button>
          </Box>

          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveFile(file.file)}
                    disabled={file.status === 'uploading'}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  {file.status === 'completed' ? (
                    <CheckCircleIcon color="success" />
                  ) : file.status === 'error' ? (
                    <ErrorIcon color="error" />
                  ) : file.status === 'uploading' ? (
                    <CircularProgress size={24} />
                  ) : (
                    <DescriptionIcon />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={file.file.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {formatBytes(file.file.size)}
                      </Typography>
                      {file.status === 'error' && (
                        <Typography variant="body2" color="error" component="span" sx={{ ml: 1 }}>
                          {file.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                {file.status === 'uploading' && (
                  <LinearProgress
                    variant="determinate"
                    value={file.progress}
                    sx={{ width: 100, mx: 2 }}
                  />
                )}
                {file.status === 'pending' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleUpload(file)}
                  >
                    Загрузить
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Настройки обработки документа</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Размер чанка (токенов)"
              type="number"
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Перекрытие чанков (токенов)"
              type="number"
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Опции обработки</InputLabel>
              <Select
                multiple
                value={Object.entries(processingOptions)
                  .filter(([_, value]) => value)
                  .map(([key]) => key)}
                onChange={(e) => {
                  const selected = e.target.value as string[];
                  setProcessingOptions({
                    extractMetadata: selected.includes('extractMetadata'),
                    generateSummary: selected.includes('generateSummary'),
                    detectLanguage: selected.includes('detectLanguage'),
                    extractKeywords: selected.includes('extractKeywords')
                  });
                }}
              >
                <MenuItem value="extractMetadata">Извлечение метаданных</MenuItem>
                <MenuItem value="generateSummary">Генерация краткого содержания</MenuItem>
                <MenuItem value="detectLanguage">Определение языка</MenuItem>
                <MenuItem value="extractKeywords">Извлечение ключевых слов</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Отмена</Button>
          <Button onClick={handleSettingsSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentUploader; 