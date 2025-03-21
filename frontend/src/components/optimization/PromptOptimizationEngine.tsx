import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions,
  Button, IconButton, Divider, TextField, Chip, CircularProgress,
  Alert, AlertTitle, List, ListItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, Tab, Tabs,
  Tooltip, LinearProgress, Snackbar, Rating
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  AutoFixHigh as AutoFixHighIcon,
  DataUsage as DataUsageIcon,
  Insights as InsightsIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
  Speed as SpeedIcon,
  Bolt as BoltIcon,
  Save as SaveIcon,
  Compare as CompareIcon,
  Cached as CachedIcon,
  History as HistoryIcon,
  ModelTraining as ModelTrainingIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import axios from 'axios';

// Типы данных для системы оптимизации
interface PromptIssue {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  message: string;
  position?: { start: number; end: number };
  suggestion?: string;
  description?: string;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

interface ModelPerformance {
  model: string;
  responseTime: number;
  tokenUsage: TokenUsage;
  quality: number; // 0-100
}

interface OptimizationResult {
  optimizedPrompt: string;
  improvement: string;
  issues: PromptIssue[];
  tokenSavings: number;
  performanceIncrease: number;
}

interface PerformanceMetrics {
  relevance: number; // 0-100
  accuracy: number; // 0-100
  clarity: number; // 0-100
  efficiency: number; // 0-100
  overall: number; // 0-100
}

// Основной компонент системы оптимизации
const PromptOptimizationEngine: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [issues, setIssues] = useState<PromptIssue[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [highlightedIssue, setHighlightedIssue] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [fixDialogOpen, setFixDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<PromptIssue | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<string[]>([]);

  // Обработчик изменения промпта
  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
    
    // Сбрасываем результаты анализа при изменении промпта
    if (issues.length > 0 || metrics || tokenUsage) {
      setIssues([]);
      setMetrics(null);
      setTokenUsage(null);
      setOptimizedPrompt('');
      setOptimizationResult(null);
    }
  };

  // Обработчик переключения вкладок
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Функция для анализа промпта
  const analyzePrompt = async () => {
    if (!prompt.trim()) return;
    
    setAnalyzing(true);
    setIssues([]);
    setMetrics(null);
    setTokenUsage(null);
    
    try {
      // Здесь должен быть API запрос для анализа промпта
      // Заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Моковые данные для демонстрации
      const mockIssues: PromptIssue[] = [
        {
          id: '1',
          type: 'critical',
          message: 'Отсутствие четких инструкций',
          position: { start: 0, end: prompt.indexOf(' ') > 0 ? prompt.indexOf(' ') : prompt.length },
          suggestion: 'Добавьте конкретные инструкции о том, что именно вы хотите получить от модели.',
          description: 'Четкие инструкции помогают модели понять ожидаемый результат и формат ответа.'
        },
        {
          id: '2',
          type: 'warning',
          message: 'Недостаточный контекст',
          suggestion: 'Предоставьте больше контекста о задаче или предметной области.',
          description: 'Дополнительная информация о контексте помогает модели генерировать более точные и релевантные ответы.'
        },
        {
          id: '3',
          type: 'improvement',
          message: 'Можно добавить структуру ответа',
          suggestion: 'Укажите предпочтительный формат или структуру ответа (например, маркированный список, таблица и т.д.).',
          description: 'Указание структуры помогает получить ответ в наиболее удобном для использования формате.'
        }
      ];
      
      const mockMetrics: PerformanceMetrics = {
        relevance: 65,
        accuracy: 58,
        clarity: 42,
        efficiency: 70,
        overall: 59
      };
      
      const mockTokenUsage: TokenUsage = {
        promptTokens: prompt.split(/\s+/).length * 1.3,
        completionTokens: prompt.split(/\s+/).length * 2,
        totalTokens: prompt.split(/\s+/).length * 3.3,
        estimatedCost: prompt.split(/\s+/).length * 0.00002
      };
      
      const mockModelPerformance: ModelPerformance[] = [
        {
          model: 'GPT-4',
          responseTime: 2800,
          quality: 82,
          tokenUsage: {
            promptTokens: mockTokenUsage.promptTokens,
            completionTokens: mockTokenUsage.completionTokens * 1.2,
            totalTokens: mockTokenUsage.promptTokens + (mockTokenUsage.completionTokens * 1.2),
            estimatedCost: (mockTokenUsage.promptTokens + (mockTokenUsage.completionTokens * 1.2)) * 0.00003
          }
        },
        {
          model: 'GPT-3.5 Turbo',
          responseTime: 900,
          quality: 75,
          tokenUsage: mockTokenUsage
        },
        {
          model: 'Claude 3 Sonnet',
          responseTime: 2100,
          quality: 80,
          tokenUsage: {
            promptTokens: mockTokenUsage.promptTokens,
            completionTokens: mockTokenUsage.completionTokens * 1.1,
            totalTokens: mockTokenUsage.promptTokens + (mockTokenUsage.completionTokens * 1.1),
            estimatedCost: (mockTokenUsage.promptTokens + (mockTokenUsage.completionTokens * 1.1)) * 0.000025
          }
        }
      ];
      
      setIssues(mockIssues);
      setMetrics(mockMetrics);
      setTokenUsage(mockTokenUsage);
      setModelPerformance(mockModelPerformance);
      
    } catch (error) {
      console.error('Ошибка при анализе промпта:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Функция для оптимизации промпта
  const optimizePrompt = async () => {
    if (!prompt.trim()) return;
    
    setOptimizing(true);
    
    try {
      // Здесь должен быть API запрос для оптимизации промпта
      // Заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Добавляем к исходному промпту улучшения для демонстрации
      let improved = prompt;
      
      // Добавляем улучшения в зависимости от найденных проблем
      if (issues.some(issue => issue.type === 'critical' && issue.id === '1')) {
        improved = `Я прошу тебя предоставить подробный анализ следующего текста. Пожалуйста, структурируй ответ с заголовками и подзаголовками. ${improved}`;
      }
      
      if (issues.some(issue => issue.type === 'warning' && issue.id === '2')) {
        improved += '\n\nКонтекст: Этот анализ будет использоваться для бизнес-презентации. Важно выделить ключевые аспекты и практические рекомендации.';
      }
      
      if (issues.some(issue => issue.type === 'improvement' && issue.id === '3')) {
        improved += '\n\nПожалуйста, структурируй ответ следующим образом:\n1. Основные тезисы (маркированный список)\n2. Анализ (параграфы с подзаголовками)\n3. Рекомендации (нумерованный список)';
      }
      
      // Результат оптимизации
      const result: OptimizationResult = {
        optimizedPrompt: improved,
        improvement: 'Добавлены четкие инструкции, контекст и структура ответа',
        issues: [],
        tokenSavings: -improved.split(/\s+/).length + prompt.split(/\s+/).length,
        performanceIncrease: 25
      };
      
      setOptimizedPrompt(improved);
      setOptimizationResult(result);
      setOptimizationHistory([...optimizationHistory, prompt]);
      setShowSuccessSnackbar(true);
      
    } catch (error) {
      console.error('Ошибка при оптимизации промпта:', error);
    } finally {
      setOptimizing(false);
    }
  };

  // Обработчик применения оптимизированного промпта
  const handleApplyOptimizedPrompt = () => {
    if (optimizedPrompt) {
      setPrompt(optimizedPrompt);
      setOptimizedPrompt('');
      setOptimizationResult(null);
      setShowSuccessSnackbar(true);
    }
  };

  // Обработчик копирования промпта в буфер обмена
  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowSuccessSnackbar(true);
  };

  // Обработчик применения исправления для конкретной проблемы
  const handleOpenFixDialog = (issue: PromptIssue) => {
    setSelectedIssue(issue);
    setFixDialogOpen(true);
  };

  // Обработчик закрытия диалога исправления
  const handleCloseFixDialog = () => {
    setFixDialogOpen(false);
    setSelectedIssue(null);
  };

  // Обработчик применения предложенного исправления
  const handleApplyFix = () => {
    if (!selectedIssue || !selectedIssue.suggestion) return;
    
    let newPrompt = prompt;
    
    if (selectedIssue.position) {
      // Если у проблемы есть позиция, заменяем часть текста
      const { start, end } = selectedIssue.position;
      newPrompt = prompt.substring(0, start) + selectedIssue.suggestion + prompt.substring(end);
    } else {
      // Иначе просто добавляем предложение в конец
      newPrompt += '\n\n' + selectedIssue.suggestion;
    }
    
    setPrompt(newPrompt);
    setFixDialogOpen(false);
    setSelectedIssue(null);
    
    // Повторный анализ после применения исправления
    setTimeout(() => {
      analyzePrompt();
    }, 500);
  };

  // Компонент для отображения метрик производительности
  const PerformanceMetricsCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Метрики производительности
        </Typography>
        
        {metrics ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Общая оценка:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.overall} 
                    sx={{ height: 10, borderRadius: 2 }}
                    color={metrics.overall > 75 ? "success" : metrics.overall > 50 ? "primary" : "warning"}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 35 }}>
                  {metrics.overall}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Релевантность:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.relevance} 
                    color={metrics.relevance > 75 ? "success" : metrics.relevance > 50 ? "primary" : "warning"}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 35 }}>
                  {metrics.relevance}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Точность:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.accuracy} 
                    color={metrics.accuracy > 75 ? "success" : metrics.accuracy > 50 ? "primary" : "warning"}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 35 }}>
                  {metrics.accuracy}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Ясность:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.clarity} 
                    color={metrics.clarity > 75 ? "success" : metrics.clarity > 50 ? "primary" : "warning"}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 35 }}>
                  {metrics.clarity}%
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ width: 120 }}>
                  Эффективность:
                </Typography>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={metrics.efficiency} 
                    color={metrics.efficiency > 75 ? "success" : metrics.efficiency > 50 ? "primary" : "warning"}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 35 }}>
                  {metrics.efficiency}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Метрики будут отображены после анализа промпта.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Компонент для отображения использования токенов
  const TokenUsageCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Использование токенов
        </Typography>
        
        {tokenUsage ? (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Токены промпта
              </Typography>
              <Typography variant="h5">
                {Math.round(tokenUsage.promptTokens)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Токены ответа (оценка)
              </Typography>
              <Typography variant="h5">
                {Math.round(tokenUsage.completionTokens)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Всего токенов
              </Typography>
              <Typography variant="h5">
                {Math.round(tokenUsage.totalTokens)}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Оценка стоимости
              </Typography>
              <Typography variant="h5">
                ${tokenUsage.estimatedCost.toFixed(4)}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Информация о токенах будет отображена после анализа промпта.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Компонент для отображения сравнения моделей
  const ModelComparisonCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Сравнение моделей
        </Typography>
        
        {modelPerformance.length > 0 ? (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Модель
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Время ответа
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Качество
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="body2" color="text.secondary">
                  Стоимость
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ mb: 2 }} />
            
            {modelPerformance.map((model, index) => (
              <Box key={index}>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={3}>
                    <Typography variant="body2" fontWeight="bold">
                      {model.model}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">
                      {model.responseTime}мс
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={model.quality} 
                        sx={{ height: 8, borderRadius: 2, width: '70%', mr: 1 }}
                        color={model.quality > 75 ? "success" : model.quality > 50 ? "primary" : "warning"}
                      />
                      <Typography variant="body2">
                        {model.quality}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2">
                      ${model.tokenUsage.estimatedCost.toFixed(4)}
                    </Typography>
                  </Grid>
                </Grid>
                {index < modelPerformance.length - 1 && <Divider sx={{ mb: 2 }} />}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Информация о моделях будет отображена после анализа промпта.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Компонент для отображения найденных проблем
  const IssuesCard = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Найденные проблемы
        </Typography>
        
        {issues.length > 0 ? (
          <List>
            {issues.map((issue) => (
              <ListItem 
                key={issue.id}
                onMouseEnter={() => setHighlightedIssue(issue.id)}
                onMouseLeave={() => setHighlightedIssue(null)}
                sx={{ 
                  mb: 1, 
                  backgroundColor: highlightedIssue === issue.id ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: issue.type === 'critical' ? 'error.light' : 
                              issue.type === 'warning' ? 'warning.light' : 'info.light',
                }}
              >
                <ListItemIcon>
                  {issue.type === 'critical' ? (
                    <ErrorOutlineIcon color="error" />
                  ) : issue.type === 'warning' ? (
                    <WarningAmberIcon color="warning" />
                  ) : (
                    <LightbulbOutlinedIcon color="info" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={issue.message}
                  secondary={issue.description}
                />
                <Button 
                  size="small" 
                  variant="outlined" 
                  color={issue.type === 'critical' ? 'error' : 
                        issue.type === 'warning' ? 'warning' : 'info'}
                  onClick={() => handleOpenFixDialog(issue)}
                  disabled={!issue.suggestion}
                >
                  Исправить
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Проблемы будут отображены после анализа промпта.
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  // Компонент для отображения оптимизированного промпта
  const OptimizedPromptCard = () => (
    <Box sx={{ display: optimizedPrompt ? 'block' : 'none' }}>
      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'success.light' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="success.main">
              Оптимизированный промпт
            </Typography>
            <Chip 
              icon={<CheckCircleIcon />}
              label="Улучшено"
              color="success"
              variant="outlined"
            />
          </Box>
          
          {optimizationResult && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>Улучшения</AlertTitle>
              {optimizationResult.improvement}
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            minRows={5}
            maxRows={15}
            value={optimizedPrompt}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Box sx={{ position: 'absolute', right: 8, bottom: 8 }}>
                  <Tooltip title="Копировать">
                    <IconButton onClick={() => handleCopyPrompt(optimizedPrompt)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            color="success"
            onClick={handleApplyOptimizedPrompt}
          >
            Применить оптимизированный промпт
          </Button>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Система оптимизации промптов
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ваш промпт
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={8}
                maxRows={15}
                placeholder="Введите ваш промпт здесь..."
                value={prompt}
                onChange={handlePromptChange}
                InputProps={{
                  endAdornment: prompt ? (
                    <Box sx={{ position: 'absolute', right: 8, bottom: 8 }}>
                      <Tooltip title="Копировать">
                        <IconButton onClick={() => handleCopyPrompt(prompt)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : null
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<InsightsIcon />}
                  disabled={!prompt.trim() || analyzing}
                  onClick={analyzePrompt}
                >
                  {analyzing ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Анализ...
                    </>
                  ) : 'Анализировать'}
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<AutoFixHighIcon />}
                  color="secondary"
                  disabled={!prompt.trim() || optimizing}
                  onClick={optimizePrompt}
                >
                  {optimizing ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                      Оптимизация...
                    </>
                  ) : 'Оптимизировать'}
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <OptimizedPromptCard />
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Проблемы" icon={<ErrorOutlineIcon />} iconPosition="start" />
              <Tab label="Метрики" icon={<DataUsageIcon />} iconPosition="start" />
              <Tab label="Сравнение моделей" icon={<ModelTrainingIcon />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {tabIndex === 0 && (
            <IssuesCard />
          )}
          
          {tabIndex === 1 && (
            <>
              <PerformanceMetricsCard />
              <TokenUsageCard />
            </>
          )}
          
          {tabIndex === 2 && (
            <ModelComparisonCard />
          )}
        </Grid>
      </Grid>
      
      {/* Диалог исправления проблемы */}
      <Dialog
        open={fixDialogOpen}
        onClose={handleCloseFixDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedIssue && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {selectedIssue.type === 'critical' ? (
                  <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
                ) : selectedIssue.type === 'warning' ? (
                  <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
                ) : (
                  <LightbulbOutlinedIcon color="info" sx={{ mr: 1 }} />
                )}
                {selectedIssue.message}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedIssue.description}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Предлагаемое исправление:
              </Typography>
              <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', mb: 2 }}>
                <Typography variant="body1">
                  {selectedIssue.suggestion}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseFixDialog}>Отмена</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleApplyFix}
              >
                Применить исправление
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Уведомление об успехе */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnackbar(false)}
        message="Операция выполнена успешно"
      />
    </Box>
  );
};

export default PromptOptimizationEngine; 