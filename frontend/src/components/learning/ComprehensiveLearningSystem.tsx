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
          name: 'Role Assignment',
          description: 'A technique of dividing prompts into clear roles that the model should perform',
          category: 'Structuring',
          difficulty: 'beginner',
          examples: [
            'You are an experienced scientific editor. Your task is to improve the following paragraph...',
            'Act as a UX design expert. Analyze the following interface...'
          ],
          tags: ['roles', 'persona', 'character']
        },
        {
          id: 2,
          name: 'Step-by-Step Thinking',
          description: 'A technique that instructs the model to break down solutions into sequential steps',
          category: 'Reasoning',
          difficulty: 'intermediate',
          examples: [
            'Solve the problem step by step. First, list what we know, then...',
            'Step by step, analyze the following code and find errors...'
          ],
          tags: ['reasoning', 'logic', 'steps']
        },
        {
          id: 3,
          name: 'Self-Verification',
          description: 'A technique where the model evaluates and corrects its own response',
          category: 'Quality Improvement',
          difficulty: 'advanced',
          examples: [
            'After you come up with a solution, check it for correctness and potential errors.',
            'First write the code, then review it and fix possible bugs and suboptimal sections.'
          ],
          tags: ['verification', 'improvement', 'iteration']
        }
      ];
      
      const mockTutorials: Tutorial[] = [
        {
          id: 1,
          title: 'Prompt Engineering Fundamentals',
          description: 'Basic course on creating effective prompts',
          content: [
            {
              type: 'text',
              content: 'Prompt engineering is the art of crafting queries for language models that lead to desired results. In this tutorial, we will cover the basics...'
            },
            {
              type: 'code',
              content: 'You are an expert in [field]. Help me with [task].\n\nSpecific situation: [details].\n\nI need: [specific request].',
              explanation: 'This basic template establishes the role, context, and specific goal of the request.'
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
          title: 'Step-by-Step Reasoning Techniques',
          description: 'How to make the model think sequentially to improve results',
          content: [
            {
              type: 'text',
              content: 'One of the most effective prompt engineering techniques is "Chain-of-Thought". This technique helps models solve complex problems by breaking them down into sequential steps...'
            },
            {
              type: 'code',
              content: 'Solve the problem step by step. For each step, explain your reasoning before moving to the next step.\n\nProblem: [problem description]',
              explanation: 'This template makes the model demonstrate its thought process, which is particularly useful for complex tasks.'
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
          title: 'Advanced Self-Verification Techniques',
          description: 'How to make the model check and improve its own answers',
          content: [
            {
              type: 'text',
              content: 'The self-verification technique significantly improves the quality of model responses, especially in tasks requiring high accuracy and reliability...'
            },
            {
              type: 'code',
              content: 'First solve the problem [problem description].\n\nThen perform the following steps:\n1. Check your solution for possible errors or inconsistencies\n2. Consider alternative approaches\n3. Choose and present the most optimal solution',
              explanation: 'This template makes the model critically evaluate its initial response and improve it.'
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
          title: 'Creating an Informative Article Summary',
          description: 'Create a prompt that helps the model generate a comprehensive and structured summary of a scientific article.',
          difficulty: 'beginner',
          techniques: [1],
          instructions: 'Write a prompt that will help the model create a quality article summary highlighting key ideas, methodology, and results.',
          starting_point: 'Summarize the following article:',
          completed_by_user: false
        },
        {
          id: 2,
          title: 'Solving a Mathematical Problem with Step-by-Step Explanation',
          description: 'Create a prompt that will make the model solve a complex mathematical problem with detailed step-by-step explanation',
          difficulty: 'intermediate',
          techniques: [2],
          instructions: 'Write a prompt that will make the model explain each stage of solving a mathematical problem in detail, making the calculations understandable even for beginners.',
          starting_point: 'Solve the following problem:',
          completed_by_user: false
        }
      ];
      
      const mockSkillProgress: SkillProgress[] = [
        {
          category: 'Structuring',
          level: 75,
          techniques_mastered: 3,
          techniques_total: 4
        },
        {
          category: 'Reasoning',
          level: 60,
          techniques_mastered: 2,
          techniques_total: 5
        },
        {
          category: 'Quality Improvement',
          level: 40,
          techniques_mastered: 1,
          techniques_total: 3
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
        Skills Progress Map
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
                  {skill.techniques_mastered} / {skill.techniques_total} techniques
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
                  label={tutorial.difficulty === 'beginner' ? 'Beginner' : 
                         tutorial.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
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
                  {tutorial.estimated_time} min. reading
                </Typography>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Progress:
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
                {tutorial.completed_by_user ? "Repeat" : tutorial.progress > 0 ? "Continue" : "Start"}
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
            Back to List
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {selectedTutorial.title}
            <Chip 
              size="small" 
              label={selectedTutorial.difficulty === 'beginner' ? 'Beginner' : 
                    selectedTutorial.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
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
            Previous Lesson
          </Button>
          <Button variant="contained">
            Next Lesson
          </Button>
        </Box>
      </Box>
    );
  };

  // Компонент для отображения списка техник промпт-инженерии
  const TechniquesList = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map(category => (
            <Chip
              key={category}
              label={category === 'all' ? 'All Categories' : category}
              onClick={() => handleCategoryChange(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>
      
      {filteredTechniques.length === 0 ? (
        <Alert severity="info">
          Techniques not found. Try changing search parameters.
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
                      label={technique.difficulty === 'beginner' ? 'Beginner' : 
                            technique.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
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
                    Example Usage:
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
                  label={challenge.difficulty === 'beginner' ? 'Beginner' : 
                        challenge.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
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
                {challenge.completed_by_user ? "Completed" : "Start"}
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
            Back to List
          </Button>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {selectedChallenge.title}
            <Chip 
              size="small" 
              label={selectedChallenge.difficulty === 'beginner' ? 'Beginner' : 
                    selectedChallenge.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
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
            Instructions
          </Typography>
          <Typography variant="body1" paragraph>
            {selectedChallenge.instructions}
          </Typography>
          
          {selectedChallenge.starting_point && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Starting Point:
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
            Your Solution
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="Write your prompt here..."
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined">
            Hint
          </Button>
          <Button variant="contained">
            Check Solution
          </Button>
        </Box>
      </Box>
    );
  };

  // Компонент для отображения демо помощника по контексту
  const ContextualHelper = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Contextual Helper
      </Typography>
      <Typography variant="body2" paragraph>
        Enter your prompt below, and the system will suggest appropriate techniques based on the content.
      </Typography>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="Write your prompt here..."
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
              More Info
            </Button>
          }
        >
          <AlertTitle>Recommended Technique: {contextualTip.name}</AlertTitle>
          {contextualTip.description}
        </Alert>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Prompt Engineering Learning System
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<InfoIcon />}
          onClick={handleOpenHelpDialog}
        >
          Help
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Learning Materials" />
          <Tab label="Techniques" />
          <Tab label="Challenges" />
          <Tab label="Helper" />
        </Tabs>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h5" gutterBottom>
          Learn Prompt Engineering
        </Typography>
        <Typography variant="body1">
          Explore our learning section dedicated to prompt engineering techniques. Access a curated collection of tutorials, 
          practical methods, and interactive exercises to enhance your prompting skills. Use this knowledge to create more 
          effective prompts directly in the tool, leveraging real-time feedback and examples to improve your results.
        </Typography>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
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
        <DialogTitle>How to Use the Learning System</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Learning Materials
          </Typography>
          <Typography variant="body1" paragraph>
            This section contains structured learning materials on prompt engineering. You can study lessons in the recommended order or choose topics that interest you.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Techniques
          </Typography>
          <Typography variant="body1" paragraph>
            Prompt engineering techniques library with examples of usage. Study various approaches and methods for creating effective prompts.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Challenges
          </Typography>
          <Typography variant="body1" paragraph>
            Practical tasks to consolidate the learned material. Complete them to check your skills and get feedback.
          </Typography>
          
          <Typography variant="h6" gutterBottom>
            Helper
          </Typography>
          <Typography variant="body1" paragraph>
            Smart helper that analyzes your prompts and suggests recommendations for improvement based on studied techniques.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHelpDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComprehensiveLearningSystem; 