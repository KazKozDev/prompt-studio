import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Tooltip, CircularProgress, Alert, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, Select, MenuItem, IconButton, LinearProgress, SelectChangeEvent
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter,
  ZAxis, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';

// Типы данных
interface TestVariant {
  id: string;
  name: string;
  content: any[];
  results?: TestVariantResult;
}

interface TestVariantResult {
  total_runs: number;
  success_rate: number;
  avg_response_time: number;
  avg_token_count: number;
  significance_score?: number;
  confidence_interval?: [number, number];
}

interface TestConfig {
  runs_per_variant: number;
  variants_count: number;
  metrics: {
    relevance: boolean;
    accuracy: boolean;
    creativity: boolean;
    response_time: boolean;
    token_usage: boolean;
  };
  target_models: string[];
  significance_threshold: number;
}

interface AdvancedTest {
  id: number;
  name: string;
  description: string;
  prompt_id: number;
  prompt_name?: string;
  config: TestConfig;
  variants: TestVariant[];
  status: 'draft' | 'running' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
  results?: {
    winner?: string;
    statistical_significance: boolean;
    p_value?: number;
    confidence_level?: number;
  };
}

// Компонент для отображения табличного сравнения вариантов
const VariantComparisonTable: React.FC<{ test: AdvancedTest }> = ({ test }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Вариант</TableCell>
            <TableCell align="right">Число запусков</TableCell>
            <TableCell align="right">Частота успеха</TableCell>
            <TableCell align="right">Ср. время ответа (мс)</TableCell>
            <TableCell align="right">Ср. использование токенов</TableCell>
            <TableCell align="right">Стат. значимость</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {test.variants.map((variant) => (
            <TableRow key={variant.id} hover sx={variant.id === test.results?.winner ? { backgroundColor: 'rgba(76, 175, 80, 0.1)' } : {}}>
              <TableCell component="th" scope="row">
                {variant.name}
                {variant.id === test.results?.winner && (
                  <Chip size="small" label="Лучший" color="success" sx={{ ml: 1 }} />
                )}
              </TableCell>
              <TableCell align="right">{variant.results?.total_runs || 0}</TableCell>
              <TableCell align="right">{variant.results?.success_rate ? `${(variant.results.success_rate * 100).toFixed(1)}%` : 'Н/Д'}</TableCell>
              <TableCell align="right">{variant.results?.avg_response_time ? `${variant.results.avg_response_time.toFixed(0)}` : 'Н/Д'}</TableCell>
              <TableCell align="right">{variant.results?.avg_token_count ? variant.results.avg_token_count.toFixed(0) : 'Н/Д'}</TableCell>
              <TableCell align="right">
                {variant.results?.significance_score ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <LinearProgress
                      variant="determinate"
                      value={variant.results.significance_score * 100}
                      sx={{ width: 60, mr: 1 }}
                      color={variant.results.significance_score > test.config.significance_threshold ? "success" : "primary"}
                    />
                    {(variant.results.significance_score * 100).toFixed(0)}%
                  </Box>
                ) : 'Н/Д'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Компонент для визуализации результатов сравнения
const TestResultsVisualization: React.FC<{ test: AdvancedTest }> = ({ test }) => {
  const [chartType, setChartType] = useState('bar');
  const [metric, setMetric] = useState('success_rate');

  const handleChartTypeChange = (_: React.SyntheticEvent, newValue: string) => {
    setChartType(newValue);
  };

  const handleMetricChange = (event: SelectChangeEvent) => {
    setMetric(event.target.value);
  };

  // Преобразование данных для отображения на графиках
  const chartData = test.variants.map((variant) => {
    let value = 0;
    let label = '';
    
    switch (metric) {
      case 'success_rate':
        value = (variant.results?.success_rate || 0) * 100;
        label = 'Успешность (%)';
        break;
      case 'response_time':
        value = variant.results?.avg_response_time || 0;
        label = 'Время ответа (мс)';
        break;
      case 'token_usage':
        value = variant.results?.avg_token_count || 0;
        label = 'Токены';
        break;
      default:
        value = 0;
    }
    
    return {
      name: variant.name,
      value,
      label
    };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={chartType} onChange={handleChartTypeChange} aria-label="chart type">
          <Tab value="bar" label="Гистограмма" icon={<BarChartIcon />} />
          <Tab value="pie" label="Круговая" icon={<PieChart />} />
        </Tabs>
      </Box>
      
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>Метрика</InputLabel>
        <Select value={metric} onChange={handleMetricChange} label="Метрика">
          <MenuItem value="success_rate">Частота успеха</MenuItem>
          <MenuItem value="response_time">Время отклика</MenuItem>
          <MenuItem value="token_usage">Использование токенов</MenuItem>
        </Select>
      </FormControl>
      
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value: number) => [`${value}`, chartData[0]?.label || '']} 
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name={chartData[0]?.label || ''} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => [`${value}`, chartData[0]?.label || '']} 
              />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </Box>
      
      {test.results?.statistical_significance && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Статистическая значимость: Да (p-value: {test.results.p_value?.toFixed(4)}, уровень доверия: {test.results.confidence_level?.toFixed(1)}%)
          </Typography>
        </Alert>
      )}
      
      {!test.results?.statistical_significance && test.status === 'completed' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Статистическая значимость не достигнута. Рекомендуется увеличить количество тестов.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

// Основной компонент системы тестирования
const AdvancedTestingFramework: React.FC = () => {
  const [tests, setTests] = useState<AdvancedTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<AdvancedTest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState<Partial<AdvancedTest>>({
    name: '',
    description: '',
    prompt_id: 0,
    config: {
      runs_per_variant: 10,
      variants_count: 2,
      metrics: {
        relevance: true,
        accuracy: true,
        creativity: false,
        response_time: true,
        token_usage: true
      },
      target_models: ['gpt-4'],
      significance_threshold: 0.05
    },
    variants: [
      { id: '1', name: 'Вариант A', content: [] },
      { id: '2', name: 'Вариант B', content: [] }
    ]
  });

  // Загрузка тестов
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Здесь должен быть API запрос на получение тестов
      // Заглушка для демонстрации
      const mockTests: AdvancedTest[] = [
        {
          id: 1,
          name: 'Тест эффективности промпта для классификации',
          description: 'Сравнение двух подходов к классификации текста',
          prompt_id: 123,
          prompt_name: 'Классификационный промпт',
          config: {
            runs_per_variant: 50,
            variants_count: 2,
            metrics: {
              relevance: true,
              accuracy: true,
              creativity: false,
              response_time: true,
              token_usage: true
            },
            target_models: ['gpt-4'],
            significance_threshold: 0.05
          },
          variants: [
            {
              id: 'v1',
              name: 'Вариант A',
              content: [],
              results: {
                total_runs: 50,
                success_rate: 0.88,
                avg_response_time: 1250,
                avg_token_count: 320,
                significance_score: 0.95,
                confidence_interval: [0.82, 0.94]
              }
            },
            {
              id: 'v2',
              name: 'Вариант B',
              content: [],
              results: {
                total_runs: 50,
                success_rate: 0.74,
                avg_response_time: 1450,
                avg_token_count: 380,
                significance_score: 0.80,
                confidence_interval: [0.65, 0.83]
              }
            }
          ],
          status: 'completed',
          created_at: '2023-10-15T12:00:00Z',
          updated_at: '2023-10-15T14:30:00Z',
          results: {
            winner: 'v1',
            statistical_significance: true,
            p_value: 0.031,
            confidence_level: 95
          }
        },
        {
          id: 2,
          name: 'Многовариантный тест промпта для суммаризации',
          description: 'Сравнение 3 подходов к суммаризации документов',
          prompt_id: 456,
          prompt_name: 'Суммаризационный промпт',
          config: {
            runs_per_variant: 30,
            variants_count: 3,
            metrics: {
              relevance: true,
              accuracy: true,
              creativity: true,
              response_time: true,
              token_usage: true
            },
            target_models: ['gpt-4', 'claude-3-sonnet'],
            significance_threshold: 0.05
          },
          variants: [
            {
              id: 'v1',
              name: 'Структурированный',
              content: [],
              results: {
                total_runs: 30,
                success_rate: 0.83,
                avg_response_time: 1850,
                avg_token_count: 520,
                significance_score: 0.92,
                confidence_interval: [0.76, 0.90]
              }
            },
            {
              id: 'v2',
              name: 'Пошаговый',
              content: [],
              results: {
                total_runs: 30,
                success_rate: 0.90,
                avg_response_time: 2150,
                avg_token_count: 680,
                significance_score: 0.97,
                confidence_interval: [0.84, 0.96]
              }
            },
            {
              id: 'v3',
              name: 'Краткий',
              content: [],
              results: {
                total_runs: 30,
                success_rate: 0.76,
                avg_response_time: 1550,
                avg_token_count: 420,
                significance_score: 0.75,
                confidence_interval: [0.68, 0.84]
              }
            }
          ],
          status: 'completed',
          created_at: '2023-10-18T09:30:00Z',
          updated_at: '2023-10-18T12:15:00Z',
          results: {
            winner: 'v2',
            statistical_significance: true,
            p_value: 0.042,
            confidence_level: 95
          }
        }
      ];
      
      setTests(mockTests);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке тестов');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (test: AdvancedTest) => {
    setSelectedTest(test);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleCreateTest = () => {
    // Здесь должна быть логика создания теста
    console.log('Creating test:', newTest);
    // После создания теста
    handleCloseCreateDialog();
    fetchTests(); // Обновляем список тестов
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Advanced test analytics provides multivariate testing capabilities and statistical significance analysis for prompt optimization.
        </Typography>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {tests.map((test) => (
          <Grid item xs={12} key={test.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {test.name}
                  <Chip 
                    size="small" 
                    label={
                      test.status === 'completed' ? 'Завершен' : 
                      test.status === 'running' ? 'Выполняется' : 
                      test.status === 'draft' ? 'Черновик' : 'Ошибка'
                    }
                    color={
                      test.status === 'completed' ? 'success' : 
                      test.status === 'running' ? 'primary' : 
                      test.status === 'draft' ? 'default' : 'error'
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {test.description}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Промпт:</strong> {test.prompt_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Варианты:</strong> {test.variants.length}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Запусков на вариант:</strong> {test.config.runs_per_variant}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Создан:</strong> {new Date(test.created_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Обновлен:</strong> {new Date(test.updated_at).toLocaleDateString()}
                    </Typography>
                    {test.results?.winner && (
                      <Typography variant="body2">
                        <strong>Победитель:</strong> {test.variants.find(v => v.id === test.results?.winner)?.name}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
              <Box sx={{ px: 2, pb: 2 }}>
                <Button 
                  variant="outlined" 
                  endIcon={<VisibilityIcon />}
                  onClick={() => handleOpenDetails(test)}
                >
                  Детали и результаты
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Диалог с деталями теста */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
      >
        {selectedTest && (
          <>
            <DialogTitle>
              {selectedTest.name}
              <Chip 
                size="small" 
                label={
                  selectedTest.status === 'completed' ? 'Завершен' : 
                  selectedTest.status === 'running' ? 'Выполняется' : 
                  selectedTest.status === 'draft' ? 'Черновик' : 'Ошибка'
                }
                color={
                  selectedTest.status === 'completed' ? 'success' : 
                  selectedTest.status === 'running' ? 'primary' : 
                  selectedTest.status === 'draft' ? 'default' : 'error'
                }
                sx={{ ml: 1 }}
              />
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {selectedTest.description}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Конфигурация теста
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Промпт:</strong> {selectedTest.prompt_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Варианты:</strong> {selectedTest.variants.length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Запусков на вариант:</strong> {selectedTest.config.runs_per_variant}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Целевые модели:</strong> {selectedTest.config.target_models.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Метрики:</strong> {Object.entries(selectedTest.config.metrics)
                      .filter(([_, value]) => value)
                      .map(([key]) => key)
                      .join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Порог значимости:</strong> {selectedTest.config.significance_threshold}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Сравнение вариантов
              </Typography>
              <VariantComparisonTable test={selectedTest} />
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Визуализация результатов
              </Typography>
              <TestResultsVisualization test={selectedTest} />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Диалог создания нового теста */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Создание нового теста</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Название теста"
            fullWidth
            value={newTest.name}
            onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Описание"
            fullWidth
            multiline
            rows={2}
            value={newTest.description}
            onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
          />
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Промпт</InputLabel>
            <Select
              value={newTest.prompt_id || ''}
              onChange={(e) => setNewTest({ ...newTest, prompt_id: e.target.value as number })}
              label="Промпт"
            >
              <MenuItem value={123}>Классификационный промпт</MenuItem>
              <MenuItem value={456}>Суммаризационный промпт</MenuItem>
              <MenuItem value={789}>Генеративный промпт</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Конфигурация теста
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Запусков на вариант"
                type="number"
                fullWidth
                value={newTest.config?.runs_per_variant || 10}
                onChange={(e) => setNewTest({ 
                  ...newTest, 
                  config: { 
                    ...newTest.config,
                    runs_per_variant: parseInt(e.target.value) 
                  } as any
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                label="Количество вариантов"
                type="number"
                fullWidth
                value={newTest.config?.variants_count || 2}
                onChange={(e) => {
                  const variantsCount = parseInt(e.target.value);
                  // Обновляем количество вариантов
                  const currentVariants = [...(newTest.variants || [])];
                  if (variantsCount > currentVariants.length) {
                    // Добавляем новые варианты
                    for (let i = currentVariants.length; i < variantsCount; i++) {
                      currentVariants.push({
                        id: `${i + 1}`,
                        name: `Вариант ${String.fromCharCode(65 + i)}`, // A, B, C, ...
                        content: []
                      });
                    }
                  } else if (variantsCount < currentVariants.length) {
                    // Удаляем лишние варианты
                    currentVariants.splice(variantsCount);
                  }
                  
                  setNewTest({
                    ...newTest,
                    config: {
                      ...newTest.config,
                      variants_count: variantsCount
                    } as any,
                    variants: currentVariants
                  });
                }}
              />
            </Grid>
          </Grid>
          
          <FormControl fullWidth margin="dense">
            <InputLabel>Целевые модели</InputLabel>
            <Select
              multiple
              value={newTest.config?.target_models || []}
              onChange={(e) => setNewTest({
                ...newTest,
                config: {
                  ...newTest.config,
                  target_models: e.target.value as string[]
                } as any
              })}
              label="Целевые модели"
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              <MenuItem value="gpt-4">GPT-4</MenuItem>
              <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
              <MenuItem value="claude-3-sonnet">Claude 3 Sonnet</MenuItem>
              <MenuItem value="claude-3-opus">Claude 3 Opus</MenuItem>
              <MenuItem value="mistral-large">Mistral Large</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Отслеживаемые метрики:
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(newTest.config?.metrics || {}).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <FormControl>
                  <Button
                    variant={value ? "contained" : "outlined"}
                    onClick={() => setNewTest({
                      ...newTest,
                      config: {
                        ...newTest.config,
                        metrics: {
                          ...newTest.config?.metrics,
                          [key]: !value
                        }
                      } as any
                    })}
                    fullWidth
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Button>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Отмена</Button>
          <Button onClick={handleCreateTest} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedTestingFramework; 