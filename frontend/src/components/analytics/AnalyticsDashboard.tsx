import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Tabs, Tab, Container } from '@mui/material';
import TokenUsageChart from './charts/TokenUsageChart';
import ResponseQualityChart from './charts/ResponseQualityChart';
import ModelComparisonChart from './charts/ModelComparisonChart';
import HistoricalTrendChart from './charts/HistoricalTrendChart';
import PromptHeatmap from './charts/PromptHeatmap';
import PromptOptimizationTips from './PromptOptimizationTips';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Аналитическая панель управления
      </Typography>
      
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="analytics dashboard tabs"
        sx={{ mb: 2 }}
      >
        <Tab label="Общий обзор" />
        <Tab label="Использование токенов" />
        <Tab label="Качество ответов" />
        <Tab label="Сравнение моделей" />
        <Tab label="Исторические тренды" />
        <Tab label="Тепловая карта" />
      </Tabs>
      
      <TabPanel value={tabIndex} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <TokenUsageChart />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Ключевые метрики
              </Typography>
              <Typography variant="body2">
                Общее использование токенов: <b>12,345</b>
              </Typography>
              <Typography variant="body2">
                Средняя длина ответа: <b>843 токенов</b>
              </Typography>
              <Typography variant="body2">
                Средняя оценка качества: <b>4.2/5</b>
              </Typography>
              <Typography variant="body2">
                Оптимизация промпта: <b>87%</b>
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 300,
              }}
            >
              <ResponseQualityChart />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 300,
              }}
            >
              <PromptOptimizationTips />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabIndex} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <TokenUsageChart showDetailed={true} />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabIndex} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <ResponseQualityChart showDetailed={true} />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabIndex} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <ModelComparisonChart />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabIndex} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <HistoricalTrendChart />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabIndex} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <PromptHeatmap />
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default AnalyticsDashboard; 