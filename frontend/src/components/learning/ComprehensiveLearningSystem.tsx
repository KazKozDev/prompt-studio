import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions,
  Button, IconButton, Divider, Tabs, Tab, List, ListItem,
  ListItemText, ListItemIcon, ListItemAvatar, Avatar, Chip,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Accordion, AccordionSummary, AccordionDetails, Rating,
  CircularProgress, Alert, Badge, LinearProgress, Tooltip,
  AlertTitle
} from '@mui/material';
import {
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  Psychology as PsychologyIcon,
  Category as CategoryIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as EmojiEventsIcon,
  Bookmarks as BookmarksIcon,
  VideoLibrary as VideoLibraryIcon,
  Code as CodeIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

// Типы данных для системы обучения
interface Technique {
  id: number;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examples: string[];
  tags: string[];
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  content: TutorialContent[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techniques: number[]; // ID техник, которые охватывает учебник
  estimated_time: number; // в минутах
  prerequisites: number[]; // ID необходимых предварительных туториалов
  completed_by_user: boolean;
  progress: number; // 0-100%
}

interface TutorialContent {
  type: 'text' | 'code' | 'image' | 'video' | 'interactive' | 'quiz';
  content: string;
  explanation?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techniques: number[]; // ID релевантных техник
  instructions: string;
  starting_point?: string; // Начальный промпт, если применимо
  solution?: string; // Пример решения
  completed_by_user: boolean;
}

interface SkillProgress {
  category: string;
  level: number; // 0-100%
  techniques_mastered: number;
  techniques_total: number;
}

// Основной компонент системы обучения
const ComprehensiveLearningSystem: React.FC = () => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [contextualTip, setContextualTip] = useState<Technique | null>(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchData();
  }, []);

  // Загрузка всех данных
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Здесь должны быть API запросы для получения данных
      // Заглушка для демонстрации
      const mockTechniques: Technique[] = [
        {
          id: 1,
          name: 'Разделение на роли',
          description: 'Техника разделения промпта на четкие роли, которые должна выполнять модель',
          category: 'Структурирование',
          difficulty: 'beginner',
          examples: [
            'Ты опытный редактор научных текстов. Твоя задача - улучшить следующий абзац...',
            'Действуй как эксперт по UX-дизайну. Проанализируй следующий интерфейс...'
          ],
          tags: ['роли', 'персона', 'характер']
        },
        {
          id: 2,
          name: 'Пошаговое мышление',
          description: 'Техника, предписывающая модели разбивать решение на последовательные шаги',
          category: 'Рассуждение',
          difficulty: 'intermediate',
          examples: [
            'Решай задачу поэтапно. Сначала выпиши, что нам известно, затем...',
            'Шаг за шагом проанализируй следующий код и найди ошибки...'
          ],
          tags: ['рассуждение', 'логика', 'шаги']
        },
        {
          id: 3,
          name: 'Самопроверка',
          description: 'Техника, при которой модель оценивает и исправляет свой собственный ответ',
          category: 'Улучшение качества',
          difficulty: 'advanced',
          examples: [
            'После того, как ты придумаешь решение, проверь его на корректность и наличие ошибок.',
            'Сначала напиши код, а затем просмотри его и исправь возможные баги и неоптимальные участки.'
          ],
          tags: ['проверка', 'улучшение', 'итерация']
        }
      ];
      
      const mockTutorials: Tutorial[] = [
        {
          id: 1,
          title: 'Основы промпт-инженерии',
          description: 'Базовый курс по основам составления эффективных промптов',
          content: [
            {
              type: 'text',
              content: 'Промпт-инженерия - это искусство составления запросов к языковым моделям, которые приводят к желаемым результатам. В этом туториале мы разберем основы...'
            },
            {
              type: 'code',
              content: 'Ты эксперт по [область]. Помоги мне с [задача].\n\nКонкретная ситуация: [детали].\n\nМне нужно: [конкретный запрос].',
              explanation: 'Этот базовый шаблон устанавливает роль, контекст и конкретную цель запроса.'
            }
          ],
          difficulty: 'beginner',
          techniques: [1],
          estimated_time: 20,
          prerequisites: [],
          completed_by_user: true,
          progress: 100
        },
        {
          id: 2,
          title: 'Техники пошагового рассуждения',
          description: 'Как заставить модель мыслить последовательно для улучшения результатов',
          content: [
            {
              type: 'text',
              content: 'Одна из наиболее эффективных техник промпт-инженерии — "пошаговое мышление" (Chain-of-Thought). Эта техника помогает моделям решать сложные задачи, разбивая их на последовательные шаги...'
            },
            {
              type: 'code',
              content: 'Решай задачу поэтапно. Для каждого шага объясни свое рассуждение, прежде чем перейти к следующему шагу.\n\nЗадача: [описание задачи]',
              explanation: 'Этот шаблон заставляет модель демонстрировать ход своих мыслей, что особенно полезно для сложных задач.'
            }
          ],
          difficulty: 'intermediate',
          techniques: [2],
          estimated_time: 30,
          prerequisites: [1],
          completed_by_user: false,
          progress: 40
        },
        {
          id: 3,
          title: 'Продвинутые техники самопроверки',
          description: 'Как заставить модель проверять и улучшать свои собственные ответы',
          content: [
            {
              type: 'text',
              content: 'Техника самопроверки позволяет значительно повысить качество ответов модели, особенно в задачах, требующих высокой точности и надежности...'
            },
            {
              type: 'code',
              content: 'Сначала реши задачу [описание задачи].\n\nПосле этого выполни следующие шаги:\n1. Проверь свое решение на возможные ошибки или нелогичности\n2. Рассмотри альтернативные подходы\n3. Выбери и представь наиболее оптимальное решение',
              explanation: 'Этот шаблон заставляет модель критически оценить свой первоначальный ответ и улучшить его.'
            }
          ],
          difficulty: 'advanced',
          techniques: [3],
          estimated_time: 45,
          prerequisites: [1, 2],
          completed_by_user: false,
          progress: 0
        }
      ];
      
      const mockChallenges: Challenge[] = [
        {
          id: 1,
          title: 'Создание информативного резюме статьи',
          description: 'Создайте промпт, который поможет модели создать содержательное и структурированное резюме научной статьи.',
          difficulty: 'beginner',
          techniques: [1],
          instructions: 'Напишите промпт, который поможет модели создать качественное резюме статьи с выделением ключевых идей, методологии и результатов.',
          starting_point: 'Резюмируй следующую статью:',
          completed_by_user: false
        },
        {
          id: 2,
          title: 'Решение математической задачи с пошаговым объяснением',
          description: 'Создайте промпт, который заставит модель решить сложную математическую задачу с подробным пошаговым объяснением',
          difficulty: 'intermediate',
          techniques: [2],
          instructions: 'Напишите промпт, который заставит модель детально объяснить каждый этап решения математической задачи, делая выкладки понятными даже для начинающих.',
          starting_point: 'Реши следующую задачу:',
          completed_by_user: false
        }
      ];
      
      const mockSkillProgress: SkillProgress[] = [
        {
          category: 'Структурирование',
          level: 75,
          techniques_mastered: 3,
          techniques_total: 4
        },
        {
          category: 'Рассуждение',
          level: 40,
          techniques_mastered: 2,
          techniques_total: 5
        },
        {
          category: 'Улучшение качества',
          level: 20,
          techniques_mastered: 1,
          techniques_total: 5
        }
      ];
      
      setTechniques(mockTechniques);
      setTutorials(mockTutorials);
      setChallenges(mockChallenges);
      setSkillProgress(mockSkillProgress);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения контекстных подсказок на основе содержимого промпта
  const getContextualTips = (promptContent: string) => {
    // Простая логика для демонстрации
    // В реальном приложении здесь должен быть более сложный алгоритм
    if (promptContent.includes('шаг') || promptContent.includes('этап')) {
      return techniques.find(t => t.id === 2) || null; // Пошаговое мышление
    } else if (promptContent.includes('роль') || promptContent.includes('эксперт')) {
      return techniques.find(t => t.id === 1) || null; // Разделение на роли
    } else if (promptContent.includes('проверь') || promptContent.includes('улучши')) {
      return techniques.find(t => t.id === 3) || null; // Самопроверка
    }
    return null;
  };

  // Обработчик изменения текста промпта (для демо контекстных подсказок)
  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    const tip = getContextualTips(text);
    setContextualTip(tip);
  };

  // Обработчик поиска
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Обработчик изменения категории
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Обработчик переключения вкладок
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Обработчик выбора туториала
  const handleSelectTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
  };

  // Обработчик возврата к списку туториалов
  const handleBackToTutorials = () => {
    setSelectedTutorial(null);
  };

  // Обработчик выбора задания
  const handleSelectChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  // Обработчик возврата к списку заданий
  const handleBackToChallenges = () => {
    setSelectedChallenge(null);
  };

  // Обработчик открытия диалога помощи
  const handleOpenHelpDialog = () => {
    setHelpDialogOpen(true);
  };

  // Обработчик закрытия диалога помощи
  const handleCloseHelpDialog = () => {
    setHelpDialogOpen(false);
  };

  // Функция фильтрации техник по поиску и категории
  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = 
      searchQuery === '' || 
      technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technique.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      technique.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      technique.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Получение списка уникальных категорий
  const categories = ['all', ...Array.from(new Set(techniques.map(t => t.category)))];

  // Компонент для отображения карты прогресса навыков
  const SkillsProgressMap = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Карта прогресса навыков
      </Typography>
      <Grid container spacing={2}>
        {skillProgress.map((skill, index) => (
          <Grid item xs={12} key={index}>
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">
                  {skill.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {skill.techniques_mastered} / {skill.techniques_total} техник
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={skill.level} 
                sx={{ height: 8, borderRadius: 2 }}
                color={skill.level > 75 ? "success" : skill.level > 40 ? "primary" : "warning"}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Компонент для отображения списка учебных материалов
  const TutorialsList = () => (
    <Grid container spacing={2}>
      {tutorials.map(tutorial => (
        <Grid item xs={12} md={6} lg={4} key={tutorial.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="div">
                  {tutorial.title}
                </Typography>
                <Chip 
                  size="small" 
                  label={tutorial.difficulty === 'beginner' ? 'Начинающий' : 
                         tutorial.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                  color={tutorial.difficulty === 'beginner' ? 'success' : 
                         tutorial.difficulty === 'intermediate' ? 'primary' : 'error'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {tutorial.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MenuBookIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {tutorial.estimated_time} мин. чтения
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Прогресс:
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={tutorial.progress} 
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => handleSelectTutorial(tutorial)}
                startIcon={tutorial.completed_by_user ? <CheckCircleIcon /> : undefined}
                color={tutorial.completed_by_user ? "success" : "primary"}
              >
                {tutorial.completed_by_user ? "Повторить" : tutorial.progress > 0 ? "Продолжить" : "Начать"}
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton size="small">
                <BookmarkIcon />
              </IconButton>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Компонент для отображения деталей учебного материала
  const TutorialDetail = () => {
    if (!selectedTutorial) return null;
    
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="text" 
            onClick={handleBackToTutorials}
            startIcon={<ArrowBackIcon />}
          >
            Назад к списку
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {selectedTutorial.title}
            <Chip 
              size="small" 
              label={selectedTutorial.difficulty === 'beginner' ? 'Начинающий' : 
                    selectedTutorial.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
              color={selectedTutorial.difficulty === 'beginner' ? 'success' : 
                    selectedTutorial.difficulty === 'intermediate' ? 'primary' : 'error'}
              sx={{ ml: 1 }}
            />
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedTutorial.description}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box>
          {selectedTutorial.content.map((content, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              {content.type === 'text' && (
                <Typography variant="body1" paragraph>
                  {content.content}
                </Typography>
              )}
              
              {content.type === 'code' && (
                <Box>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 1 }}>
                    <Typography component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {content.content}
                    </Typography>
                  </Paper>
                  {content.explanation && (
                    <Typography variant="body2" color="text.secondary">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {content.explanation}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Box>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined">
            Предыдущий урок
          </Button>
          <Button variant="contained">
            Следующий урок
          </Button>
        </Box>
      </Box>
    );
  };

  // Компонент для отображения списка техник промпт-инженерии
  const TechniquesList = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск техник промпт-инженерии..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          size="small"
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map(category => (
            <Chip
              key={category}
              label={category === 'all' ? 'Все категории' : category}
              onClick={() => handleCategoryChange(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>
      
      {filteredTechniques.length === 0 ? (
        <Alert severity="info">
          Техники не найдены. Попробуйте изменить параметры поиска.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredTechniques.map(technique => (
            <Grid item xs={12} key={technique.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1">
                      {technique.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Chip 
                      size="small" 
                      label={technique.category}
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      size="small" 
                      label={technique.difficulty === 'beginner' ? 'Начинающий' : 
                            technique.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                      color={technique.difficulty === 'beginner' ? 'success' : 
                            technique.difficulty === 'intermediate' ? 'primary' : 'error'}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    {technique.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Примеры использования:
                  </Typography>
                  <List>
                    {technique.examples.map((example, index) => (
                      <ListItem key={index} sx={{ backgroundColor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                        <ListItemText
                          primary={<Typography component="span" sx={{ fontFamily: 'monospace' }}>{example}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                    {technique.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Компонент для отображения списка заданий
  const ChallengesList = () => (
    <Grid container spacing={2}>
      {challenges.map(challenge => (
        <Grid item xs={12} md={6} key={challenge.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6">
                  {challenge.title}
                </Typography>
                <Chip 
                  size="small" 
                  label={challenge.difficulty === 'beginner' ? 'Начинающий' : 
                        challenge.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                  color={challenge.difficulty === 'beginner' ? 'success' : 
                        challenge.difficulty === 'intermediate' ? 'primary' : 'error'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                {challenge.description}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                {challenge.techniques.map(techId => {
                  const tech = techniques.find(t => t.id === techId);
                  return tech ? (
                    <Chip key={techId} label={tech.name} size="small" variant="outlined" />
                  ) : null;
                })}
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                onClick={() => handleSelectChallenge(challenge)}
                startIcon={challenge.completed_by_user ? <CheckCircleIcon /> : undefined}
                color={challenge.completed_by_user ? "success" : "primary"}
              >
                {challenge.completed_by_user ? "Пройдено" : "Начать"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Компонент для отображения деталей задания
  const ChallengeDetail = () => {
    if (!selectedChallenge) return null;
    
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Button 
            variant="text" 
            onClick={handleBackToChallenges}
            startIcon={<ArrowBackIcon />}
          >
            Назад к списку
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {selectedChallenge.title}
            <Chip 
              size="small" 
              label={selectedChallenge.difficulty === 'beginner' ? 'Начинающий' : 
                    selectedChallenge.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
              color={selectedChallenge.difficulty === 'beginner' ? 'success' : 
                    selectedChallenge.difficulty === 'intermediate' ? 'primary' : 'error'}
              sx={{ ml: 1 }}
            />
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedChallenge.description}
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Инструкция
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedChallenge.instructions}
          </Typography>
          
          {selectedChallenge.starting_point && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Начальная точка:
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                <Typography component="pre" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {selectedChallenge.starting_point}
                </Typography>
              </Paper>
            </Box>
          )}
        </Paper>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Ваше решение
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Напишите ваш промпт здесь..."
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined">
            Подсказка
          </Button>
          <Button variant="contained">
            Проверить решение
          </Button>
        </Box>
      </Box>
    );
  };

  // Компонент для отображения демо помощника по контексту
  const ContextualHelper = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Помощник по контексту
      </Typography>
      <Typography variant="body2" paragraph>
        Введите ваш промпт ниже, и система предложит подходящие техники в зависимости от содержимого.
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="Напишите ваш промпт здесь..."
        variant="outlined"
        onChange={handlePromptChange}
        sx={{ mb: 2 }}
      />
      
      {contextualTip && (
        <Alert 
          severity="info" 
          icon={<LightbulbIcon />}
          action={
            <Button size="small" color="inherit">
              Подробнее
            </Button>
          }
        >
          <AlertTitle>Рекомендуемая техника: {contextualTip.name}</AlertTitle>
          {contextualTip.description}
        </Alert>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Обучение промпт-инженерии
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<InfoIcon />}
          onClick={handleOpenHelpDialog}
        >
          Помощь
        </Button>
      </Box>
      
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab icon={<SchoolIcon />} label="Учебные материалы" iconPosition="start" />
              <Tab icon={<CategoryIcon />} label="Техники" iconPosition="start" />
              <Tab icon={<AssignmentIcon />} label="Задания" iconPosition="start" />
              <Tab icon={<PsychologyIcon />} label="Помощник" iconPosition="start" />
            </Tabs>
          </Box>
          
          {tabIndex === 0 && (
            <Box>
              {!selectedTutorial ? (
                <>
                  <SkillsProgressMap />
                  <TutorialsList />
                </>
              ) : (
                <TutorialDetail />
              )}
            </Box>
          )}
          
          {tabIndex === 1 && (
            <TechniquesList />
          )}
          
          {tabIndex === 2 && (
            <Box>
              {!selectedChallenge ? (
                <ChallengesList />
              ) : (
                <ChallengeDetail />
              )}
            </Box>
          )}
          
          {tabIndex === 3 && (
            <ContextualHelper />
          )}
        </Box>
      )}
      
      {/* Диалог помощи */}
      <Dialog
        open={helpDialogOpen}
        onClose={handleCloseHelpDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Как использовать обучающую систему</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Учебные материалы
          </Typography>
          <Typography variant="body1" paragraph>
            Этот раздел содержит структурированные учебные материалы по промпт-инженерии. Вы можете изучать уроки в рекомендуемом порядке или выбирать интересующие вас темы.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Техники
          </Typography>
          <Typography variant="body1" paragraph>
            Библиотека техник промпт-инженерии с примерами использования. Изучайте различные подходы и методы для создания эффективных промптов.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Задания
          </Typography>
          <Typography variant="body1" paragraph>
            Практические задания для закрепления изученного материала. Выполните их, чтобы проверить свои навыки и получить обратную связь.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Помощник
          </Typography>
          <Typography variant="body1" paragraph>
            Умный помощник, который анализирует ваши промпты и предлагает рекомендации по улучшению на основе изученных техник.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelpDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComprehensiveLearningSystem; 