import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Annotation {
  id: number;
  documentId: number;
  startOffset: number;
  endOffset: number;
  text: string;
  type: 'highlight' | 'comment' | 'category';
  color?: string;
  comment?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentAnnotationProps {
  documentId: number;
  content: string;
  onAnnotationChange?: (annotations: Annotation[]) => void;
}

interface NewAnnotation {
  type: 'highlight' | 'comment' | 'category';
  color: string;
  comment: string;
  category: string;
}

const DocumentAnnotation: React.FC<DocumentAnnotationProps> = ({
  documentId,
  content,
  onAnnotationChange
}) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [newAnnotation, setNewAnnotation] = useState<NewAnnotation>({
    type: 'highlight',
    color: '#ffeb3b',
    comment: '',
    category: ''
  });

  // Загрузка существующих аннотаций
  useEffect(() => {
    const fetchAnnotations = async () => {
      try {
        const response = await axios.get(`/api/documents/${documentId}/annotations`);
        setAnnotations(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка загрузки аннотаций');
        console.error('Error fetching annotations:', err);
      }
    };

    fetchAnnotations();
  }, [documentId]);

  // Обработка выделения текста
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText('');
      return;
    }

    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(document.getElementById('annotatable-content')!);
    preSelectionRange.setEnd(range.endContainer, range.endOffset);
    const startOffset = preSelectionRange.toString().length;

    setSelectedText(selection.toString());
    setSelectionStart(startOffset);
    setSelectionEnd(startOffset + selection.toString().length);
  };

  // Создание новой аннотации
  const handleCreateAnnotation = () => {
    if (!selectedText) return;

    setNewAnnotation({
      type: 'highlight',
      color: '#ffeb3b',
      comment: '',
      category: ''
    });
    setDialogOpen(true);
  };

  // Сохранение аннотации
  const handleSaveAnnotation = async () => {
    try {
      const annotation = {
        documentId,
        startOffset: selectionStart,
        endOffset: selectionEnd,
        text: selectedText,
        ...newAnnotation
      };

      const response = await axios.post(`/api/documents/${documentId}/annotations`, annotation);
      setAnnotations(prev => [...prev, response.data]);
      setDialogOpen(false);
      setSelectedText('');
      
      if (onAnnotationChange) {
        onAnnotationChange([...annotations, response.data]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения аннотации');
      console.error('Error saving annotation:', err);
    }
  };

  // Редактирование аннотации
  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setNewAnnotation({
      type: annotation.type,
      color: annotation.color || '#ffeb3b',
      comment: annotation.comment || '',
      category: annotation.category || ''
    });
    setDialogOpen(true);
  };

  // Обновление аннотации
  const handleUpdateAnnotation = async () => {
    if (!editingAnnotation) return;

    try {
      const response = await axios.put(
        `/api/documents/${documentId}/annotations/${editingAnnotation.id}`,
        {
          ...editingAnnotation,
          ...newAnnotation
        }
      );

      setAnnotations(prev =>
        prev.map(a => (a.id === editingAnnotation.id ? response.data : a))
      );
      setDialogOpen(false);
      setEditingAnnotation(null);
      
      if (onAnnotationChange) {
        onAnnotationChange(
          annotations.map(a => (a.id === editingAnnotation.id ? response.data : a))
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления аннотации');
      console.error('Error updating annotation:', err);
    }
  };

  // Удаление аннотации
  const handleDeleteAnnotation = async (annotationId: number) => {
    try {
      await axios.delete(`/api/documents/${documentId}/annotations/${annotationId}`);
      setAnnotations(prev => prev.filter(a => a.id !== annotationId));
      
      if (onAnnotationChange) {
        onAnnotationChange(annotations.filter(a => a.id !== annotationId));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка удаления аннотации');
      console.error('Error deleting annotation:', err);
    }
  };

  // Рендеринг аннотированного текста
  const renderAnnotatedContent = () => {
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    // Сортируем аннотации по начальному смещению
    const sortedAnnotations = [...annotations].sort((a, b) => a.startOffset - b.startOffset);

    sortedAnnotations.forEach((annotation, index) => {
      // Добавляем неаннотированный текст до аннотации
      if (annotation.startOffset > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {content.slice(lastIndex, annotation.startOffset)}
          </span>
        );
      }

      // Добавляем аннотированный текст
      elements.push(
        <span
          key={`annotation-${annotation.id}`}
          style={{
            backgroundColor: annotation.color,
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleEditAnnotation(annotation)}
        >
          {content.slice(annotation.startOffset, annotation.endOffset)}
          {annotation.type === 'comment' && (
            <Tooltip title={annotation.comment}>
              <CommentIcon
                sx={{
                  fontSize: 16,
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  color: 'primary.main'
                }}
              />
            </Tooltip>
          )}
          {annotation.type === 'category' && (
            <Tooltip title={annotation.category}>
              <CategoryIcon
                sx={{
                  fontSize: 16,
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  color: 'secondary.main'
                }}
              />
            </Tooltip>
          )}
        </span>
      );

      lastIndex = annotation.endOffset;
    });

    // Добавляем оставшийся текст
    if (lastIndex < content.length) {
      elements.push(
        <span key="text-end">
          {content.slice(lastIndex)}
        </span>
      );
    }

    return elements;
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Аннотации
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateAnnotation}
          disabled={!selectedText}
        >
          Добавить аннотацию
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        id="annotatable-content"
        sx={{
          p: 2,
          minHeight: 200,
          position: 'relative',
          userSelect: 'text'
        }}
        onMouseUp={handleTextSelection}
      >
        {renderAnnotatedContent()}
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Список аннотаций
        </Typography>
        <List>
          {annotations.map((annotation, index) => (
            <React.Fragment key={annotation.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ backgroundColor: annotation.color, padding: '2px 8px', borderRadius: 4 }}>
                        {annotation.text}
                      </span>
                      {annotation.type === 'comment' && (
                        <Chip
                          size="small"
                          icon={<CommentIcon />}
                          label={annotation.comment}
                          color="primary"
                        />
                      )}
                      {annotation.type === 'category' && (
                        <Chip
                          size="small"
                          icon={<CategoryIcon />}
                          label={annotation.category}
                          color="secondary"
                        />
                      )}
                    </Box>
                  }
                  secondary={`Создано: ${new Date(annotation.createdAt).toLocaleString()}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleEditAnnotation(annotation)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteAnnotation(annotation.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editingAnnotation ? 'Редактировать аннотацию' : 'Новая аннотация'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Тип аннотации</InputLabel>
              <Select
                value={newAnnotation.type}
                onChange={(e) => setNewAnnotation({
                  ...newAnnotation,
                  type: e.target.value as NewAnnotation['type']
                })}
              >
                <MenuItem value="highlight">Выделение</MenuItem>
                <MenuItem value="comment">Комментарий</MenuItem>
                <MenuItem value="category">Категория</MenuItem>
              </Select>
            </FormControl>

            {newAnnotation.type === 'highlight' && (
              <TextField
                fullWidth
                label="Цвет"
                type="color"
                value={newAnnotation.color}
                onChange={(e) => setNewAnnotation({
                  ...newAnnotation,
                  color: e.target.value
                })}
                sx={{ mb: 2 }}
              />
            )}

            {newAnnotation.type === 'comment' && (
              <TextField
                fullWidth
                label="Комментарий"
                multiline
                rows={3}
                value={newAnnotation.comment}
                onChange={(e) => setNewAnnotation({
                  ...newAnnotation,
                  comment: e.target.value
                })}
                sx={{ mb: 2 }}
              />
            )}

            {newAnnotation.type === 'category' && (
              <TextField
                fullWidth
                label="Категория"
                value={newAnnotation.category}
                onChange={(e) => setNewAnnotation({
                  ...newAnnotation,
                  category: e.target.value
                })}
                sx={{ mb: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={editingAnnotation ? handleUpdateAnnotation : handleSaveAnnotation}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentAnnotation; 