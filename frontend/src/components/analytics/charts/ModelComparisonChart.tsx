import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

// Регистрируем необходимые компоненты ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ModelComparisonChart: React.FC = () => {
  const [metric, setMetric] = React.useState('overall');

  const handleMetricChange = (event: SelectChangeEvent) => {
    setMetric(event.target.value);
  };

  // Опции для диаграммы
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Сравнение производительности различных моделей',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: 'Оценка (1-5)'
        }
      }
    }
  };

  // Различные метрики для сравнения
  const metricData = {
    overall: {
      label: 'Общая производительность',
      data: [4.7, 4.3, 4.2, 3.8, 3.5]
    },
    relevance: {
      label: 'Релевантность',
      data: [4.8, 4.5, 4.0, 3.7, 3.3]
    },
    accuracy: {
      label: 'Точность',
      data: [4.9, 4.4, 4.3, 3.9, 3.6]
    },
    creativity: {
      label: 'Креативность',
      data: [4.3, 4.6, 4.4, 3.7, 3.2]
    },
    cost: {
      label: 'Стоимость (обратная шкала)',
      data: [2.5, 3.1, 3.8, 4.5, 4.9]
    },
    speed: {
      label: 'Скорость',
      data: [4.8, 4.4, 4.2, 3.5, 3.0]
    }
  };

  // Данные для диаграммы
  const data: ChartData<'bar'> = {
    labels: ['Claude 3.5 Opus', 'GPT-4o', 'Claude 3 Sonnet', 'Gemini Pro', 'Llama 3'],
    datasets: [
      {
        label: metricData[metric as keyof typeof metricData].label,
        data: metricData[metric as keyof typeof metricData].data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Сравнение моделей
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="metric-select-label">Метрика</InputLabel>
          <Select
            labelId="metric-select-label"
            id="metric-select"
            value={metric}
            label="Метрика"
            onChange={handleMetricChange}
            size="small"
          >
            <MenuItem value="overall">Общая производительность</MenuItem>
            <MenuItem value="relevance">Релевантность</MenuItem>
            <MenuItem value="accuracy">Точность</MenuItem>
            <MenuItem value="creativity">Креативность</MenuItem>
            <MenuItem value="cost">Стоимость</MenuItem>
            <MenuItem value="speed">Скорость</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ height: 'calc(100% - 60px)' }}>
        <Bar options={options} data={data} />
      </Box>
    </Box>
  );
};

export default ModelComparisonChart; 