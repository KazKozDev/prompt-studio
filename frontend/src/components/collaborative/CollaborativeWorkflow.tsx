import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions,
  Button, IconButton, TextField, Divider, Avatar, Chip, List,
  ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction,
  Tabs, Tab, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  Badge, Tooltip, CircularProgress, Menu, ListItemIcon
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Comment as CommentIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Lock as LockIcon,
  Group as GroupIcon,
  Add as AddIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  MoreVert as MoreVertIcon,
  PriorityHigh as PriorityHighIcon,
  Visibility as VisibilityIcon,
  Publish as PublishIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import axios from 'axios';

// Типы данных
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface Comment {
  id: number;
  user_id: number;
  user: User;
  content: string;
  created_at: string;
  updated_at?: string;
  parent_id?: number;
  replies?: Comment[];
}

interface ChangeRecord {
  id: number;
  user_id: number;
  user: User;
  description: string;
  changes: any;
  created_at: string;
}

interface ApprovalStatus {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  user_id?: number;
  user?: User;
  comment?: string;
  created_at: string;
}

interface CollaborativeItem {
  id: number;
  type: 'prompt' | 'template' | 'test';
  name: string;
  description?: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  owner_id: number;
  owner: User;
  created_at: string;
  updated_at: string;
  collaborators: User[];
  comments: Comment[];
  changes: ChangeRecord[];
  approval: ApprovalStatus[];
  current_version: number;
}

// Основной компонент
const CollaborativeWorkflow: React.FC = () => {
  const [items, setItems] = useState<CollaborativeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CollaborativeItem | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'editor' | 'viewer'>('viewer');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchItems();
  }, []);

  // Загрузка данных совместных проектов
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      // Здесь должен быть API запрос для получения совместных проектов
      // Заглушка для демонстрации
      const mockItems: CollaborativeItem[] = [
        {
          id: 1,
          type: 'prompt',
          name: 'Улучшенный классификационный промпт',
          description: 'Промпт для классификации входящих запросов пользователей',
          status: 'review',
          owner_id: 1,
          owner: {
            id: 1,
            name: 'Иван Петров',
            email: 'ivan@example.com',
            role: 'admin'
          },
          created_at: '2023-10-10T10:00:00Z',
          updated_at: '2023-10-15T15:30:00Z',
          collaborators: [
            {
              id: 2,
              name: 'Анна Сидорова',
              email: 'anna@example.com',
              role: 'editor'
            },
            {
              id: 3,
              name: 'Сергей Иванов',
              email: 'sergey@example.com',
              role: 'viewer'
            }
          ],
          comments: [
            {
              id: 1,
              user_id: 1,
              user: {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
                role: 'admin'
              },
              content: 'Добавил новую секцию для обработки многоязычных запросов',
              created_at: '2023-10-14T12:30:00Z'
            },
            {
              id: 2,
              user_id: 2,
              user: {
                id: 2,
                name: 'Анна Сидорова',
                email: 'anna@example.com',
                role: 'editor'
              },
              content: 'Секция примеров требует доработки, нужно добавить больше случаев',
              created_at: '2023-10-15T09:45:00Z'
            }
          ],
          changes: [
            {
              id: 1,
              user_id: 1,
              user: {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
                role: 'admin'
              },
              description: 'Создание исходного промпта',
              changes: {},
              created_at: '2023-10-10T10:00:00Z'
            },
            {
              id: 2,
              user_id: 2,
              user: {
                id: 2,
                name: 'Анна Сидорова',
                email: 'anna@example.com',
                role: 'editor'
              },
              description: 'Добавлены примеры классификации',
              changes: {},
              created_at: '2023-10-12T14:20:00Z'
            }
          ],
          approval: [
            {
              id: 1,
              status: 'pending',
              created_at: '2023-10-15T15:30:00Z'
            }
          ],
          current_version: 3
        },
        {
          id: 2,
          type: 'template',
          name: 'Шаблон для обработки клиентских обращений',
          description: 'Универсальный шаблон для работы с клиентскими запросами',
          status: 'approved',
          owner_id: 2,
          owner: {
            id: 2,
            name: 'Анна Сидорова',
            email: 'anna@example.com',
            role: 'editor'
          },
          created_at: '2023-10-05T09:00:00Z',
          updated_at: '2023-10-16T11:30:00Z',
          collaborators: [
            {
              id: 1,
              name: 'Иван Петров',
              email: 'ivan@example.com',
              role: 'admin'
            }
          ],
          comments: [
            {
              id: 3,
              user_id: 1,
              user: {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
                role: 'admin'
              },
              content: 'Отличный шаблон, структура очень понятная',
              created_at: '2023-10-15T10:00:00Z'
            }
          ],
          changes: [
            {
              id: 3,
              user_id: 2,
              user: {
                id: 2,
                name: 'Анна Сидорова',
                email: 'anna@example.com',
                role: 'editor'
              },
              description: 'Создание шаблона',
              changes: {},
              created_at: '2023-10-05T09:00:00Z'
            }
          ],
          approval: [
            {
              id: 2,
              status: 'approved',
              user_id: 1,
              user: {
                id: 1,
                name: 'Иван Петров',
                email: 'ivan@example.com',
                role: 'admin'
              },
              comment: 'Согласовано, можно использовать',
              created_at: '2023-10-16T11:30:00Z'
            }
          ],
          current_version: 2
        }
      ];
      
      setItems(mockItems);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleSelectItem = (item: CollaborativeItem) => {
    setSelectedItem(item);
    setTabIndex(0); // По умолчанию открываем вкладку с комментариями
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = () => {
    if (!selectedItem || !newComment.trim()) return;
    
    // Здесь должен быть API запрос для добавления комментария
    const newCommentObj: Comment = {
      id: Date.now(), // Временный ID
      user_id: 1, // ID текущего пользователя
      user: {
        id: 1,
        name: 'Иван Петров',
        email: 'ivan@example.com',
        role: 'admin'
      },
      content: newComment,
      created_at: new Date().toISOString()
    };
    
    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          comments: [...item.comments, newCommentObj]
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    
    if (selectedItem) {
      setSelectedItem({
        ...selectedItem,
        comments: [...selectedItem.comments, newCommentObj]
      });
    }
    
    setNewComment('');
  };

  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
  };

  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };

  const handleNewCollaboratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCollaborator(e.target.value);
  };

  const handleNewCollaboratorRoleChange = (e: SelectChangeEvent<string>) => {
    setNewCollaboratorRole(e.target.value as 'editor' | 'viewer');
  };

  const handleAddCollaborator = () => {
    if (!selectedItem || !newCollaborator.trim()) return;
    
    // Здесь должен быть API запрос для добавления сотрудника
    const newCollaboratorObj: User = {
      id: Date.now(), // Временный ID
      name: newCollaborator,
      email: `${newCollaborator.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      role: newCollaboratorRole
    };
    
    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          collaborators: [...item.collaborators, newCollaboratorObj]
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    
    if (selectedItem) {
      setSelectedItem({
        ...selectedItem,
        collaborators: [...selectedItem.collaborators, newCollaboratorObj]
      });
    }
    
    setNewCollaborator('');
    handleCloseShareDialog();
  };

  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };

  const handleChangeStatus = (newStatus: 'draft' | 'review' | 'approved' | 'published') => {
    if (!selectedItem) return;
    
    // Здесь должен быть API запрос для изменения статуса
    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: newStatus,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    });
    
    setItems(updatedItems);
    
    if (selectedItem) {
      setSelectedItem({
        ...selectedItem,
        status: newStatus,
        updated_at: new Date().toISOString()
      });
    }
  };

  const renderStatusChip = (status: string) => {
    switch (status) {
      case 'draft':
        return <Chip size="small" label="Черновик" color="default" />;
      case 'review':
        return <Chip size="small" label="На проверке" color="primary" />;
      case 'approved':
        return <Chip size="small" label="Одобрено" color="success" />;
      case 'published':
        return <Chip size="small" label="Опубликовано" color="info" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  // Компонент для отображения списка элементов
  const ItemsList = () => (
    <Grid container spacing={2}>
      {items.map(item => (
        <Grid item xs={12} key={item.id}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => handleSelectItem(item)}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6">
                  {item.name}
                </Typography>
                {renderStatusChip(item.status)}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Владелец: {item.owner.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Комментарии">
                    <Badge badgeContent={item.comments.length} color="primary">
                      <CommentIcon fontSize="small" />
                    </Badge>
                  </Tooltip>
                  <Tooltip title="Соавторы">
                    <Badge badgeContent={item.collaborators.length} color="info">
                      <GroupIcon fontSize="small" />
                    </Badge>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Компонент для отображения комментариев
  const CommentsPanel = () => (
    <Box>
      <List>
        {selectedItem?.comments.map(comment => (
          <ListItem key={comment.id} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar>{comment.user.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">
                    {comment.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.created_at).toLocaleString()}
                  </Typography>
                </Box>
              }
              secondary={comment.content}
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start' }}>
        <Avatar sx={{ mr: 1.5 }}>И</Avatar>
        <TextField
          fullWidth
          placeholder="Добавьте комментарий..."
          variant="outlined"
          size="small"
          multiline
          rows={2}
          value={newComment}
          onChange={handleCommentChange}
          InputProps={{
            endAdornment: (
              <IconButton 
                color="primary" 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <SendIcon />
              </IconButton>
            )
          }}
        />
      </Box>
    </Box>
  );

  // Компонент для отображения соавторов
  const CollaboratorsPanel = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleOpenShareDialog}
        >
          Пригласить соавтора
        </Button>
      </Box>
      
      <List>
        <ListItem>
          <ListItemAvatar>
            <Avatar>{selectedItem?.owner.name.charAt(0)}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={selectedItem?.owner.name}
            secondary={`${selectedItem?.owner.email} (Владелец)`}
          />
        </ListItem>
        
        {selectedItem?.collaborators.map(collaborator => (
          <ListItem key={collaborator.id}>
            <ListItemAvatar>
              <Avatar>{collaborator.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={collaborator.name}
              secondary={`${collaborator.email} (${
                collaborator.role === 'editor' ? 'Редактор' : 
                collaborator.role === 'viewer' ? 'Просмотр' : 
                collaborator.role
              })`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      
      {/* Диалог приглашения соавторов */}
      <Dialog open={shareDialogOpen} onClose={handleCloseShareDialog}>
        <DialogTitle>Пригласить соавтора</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя пользователя"
            fullWidth
            value={newCollaborator}
            onChange={handleNewCollaboratorChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Права доступа</InputLabel>
            <Select
              value={newCollaboratorRole}
              onChange={handleNewCollaboratorRoleChange}
              label="Права доступа"
            >
              <MenuItem value="editor">Редактор</MenuItem>
              <MenuItem value="viewer">Просмотр</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog}>Отмена</Button>
          <Button 
            onClick={handleAddCollaborator} 
            variant="contained"
            disabled={!newCollaborator.trim()}
          >
            Пригласить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Компонент для отображения истории изменений
  const HistoryPanel = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={handleOpenHistoryDialog}
        >
          Полная история
        </Button>
      </Box>
      
      <List>
        {selectedItem?.changes.map(change => (
          <ListItem key={change.id}>
            <ListItemAvatar>
              <Avatar>{change.user.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">
                    {change.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(change.created_at).toLocaleString()}
                  </Typography>
                </Box>
              }
              secondary={change.description}
            />
          </ListItem>
        ))}
      </List>
      
      {/* Диалог полной истории изменений */}
      <Dialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>История изменений</DialogTitle>
        <DialogContent>
          <List>
            {selectedItem?.changes.map(change => (
              <ListItem key={change.id}>
                <ListItemAvatar>
                  <Avatar>{change.user.name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">
                        {change.user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(change.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">{change.description}</Typography>
                      <Button size="small" startIcon={<VisibilityIcon />}>
                        Просмотреть изменения
                      </Button>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Компонент для отображения рабочего процесса и утверждения
  const WorkflowPanel = () => (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Текущий статус
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {renderStatusChip(selectedItem?.status || 'draft')}
          <Typography variant="body2" sx={{ ml: 1 }}>
            Обновлено: {selectedItem ? new Date(selectedItem.updated_at).toLocaleString() : ''}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Действия
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedItem?.status === 'draft' && (
            <Button 
              variant="contained" 
              startIcon={<SendIcon />}
              onClick={() => handleChangeStatus('review')}
            >
              Отправить на проверку
            </Button>
          )}
          
          {selectedItem?.status === 'review' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleChangeStatus('approved')}
              >
                Одобрить
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleChangeStatus('draft')}
              >
                Отклонить
              </Button>
            </>
          )}
          
          {selectedItem?.status === 'approved' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<PublishIcon />}
              onClick={() => handleChangeStatus('published')}
            >
              Опубликовать
            </Button>
          )}
        </Box>
      </Paper>
      
      <Typography variant="h6" gutterBottom>
        История утверждений
      </Typography>
      <List>
        {selectedItem?.approval.map(approval => (
          <ListItem key={approval.id}>
            <ListItemIcon>
              {approval.status === 'approved' ? (
                <CheckCircleIcon color="success" />
              ) : approval.status === 'rejected' ? (
                <CancelIcon color="error" />
              ) : (
                <AccessTimeIcon color="warning" />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">
                    {approval.status === 'approved' ? 'Одобрено' : 
                     approval.status === 'rejected' ? 'Отклонено' : 
                     'Ожидает утверждения'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(approval.created_at).toLocaleString()}
                  </Typography>
                </Box>
              }
              secondary={
                approval.user ? `${approval.user.name} ${approval.comment ? `- ${approval.comment}` : ''}` : 
                'Ожидается проверка'
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Совместная работа
      </Typography>
      
      <Grid container spacing={3}>
        {selectedItem ? (
          <>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button 
                  variant="text" 
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setSelectedItem(null)}
                >
                  Назад
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {renderStatusChip(selectedItem.status)}
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="h5" gutterBottom>
                {selectedItem.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {selectedItem.description}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                  <Tab label="Комментарии" icon={<CommentIcon />} iconPosition="start" />
                  <Tab label="Соавторы" icon={<GroupIcon />} iconPosition="start" />
                  <Tab label="История" icon={<HistoryIcon />} iconPosition="start" />
                  <Tab label="Рабочий процесс" icon={<AccessTimeIcon />} iconPosition="start" />
                </Tabs>
              </Box>
              <Box sx={{ pt: 2 }}>
                {tabIndex === 0 && <CommentsPanel />}
                {tabIndex === 1 && <CollaboratorsPanel />}
                {tabIndex === 2 && <HistoryPanel />}
                {tabIndex === 3 && <WorkflowPanel />}
              </Box>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Совместные проекты
                </Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                  >
                    Создать новый
                  </Button>
                  <IconButton sx={{ ml: 1 }} onClick={() => setNotificationsOpen(!notificationsOpen)}>
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              {loading ? (
                <CircularProgress />
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <ItemsList />
              )}
            </Grid>
          </>
        )}
      </Grid>
      
      {/* Меню уведомлений */}
      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      >
        <List sx={{ width: 300 }}>
          <ListItem>
            <ListItemIcon>
              <CommentIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Новый комментарий"
              secondary="Анна добавила комментарий к промпту 'Классификационный промпт'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ShareIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Приглашение к совместной работе"
              secondary="Сергей пригласил вас в проект 'Шаблон для анализа'"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Промпт одобрен"
              secondary="Ваш промпт 'Генерация кода' был одобрен"
            />
          </ListItem>
        </List>
      </Menu>
    </Box>
  );
};

export default CollaborativeWorkflow; 