import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';

// Регистрируем необходимые компоненты ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const HistoricalTrendChart: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('week');

  const handleTimeRangeChange = (_: React.MouseEvent<HTMLElement>, newTimeRange: string | null) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  // Данные для разных временных диапазонов
  const timeRangeData = {
    day: {
      labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      qualityData: [4.2, 4.3, 4.3, 4.4, 4.2, 4.5, 4.6, 4.7, 4.6],
      tokenData: [1200, 1350, 1280, 1420, 1380, 1500, 1550, 1600, 1550]
    },
    week: {
      labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      qualityData: [4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8],
      tokenData: [1150, 1250, 1350, 1450, 1550, 1600, 1650]
    },
    month: {
      labels: ['1 нед', '2 нед', '3 нед', '4 нед'],
      qualityData: [4.0, 4.3, 4.5, 4.7],
      tokenData: [1100, 1350, 1550, 1650]
    },
    quarter: {
      labels: ['Янв', 'Фев', 'Мар'],
      qualityData: [3.8, 4.2, 4.7],
      tokenData: [950, 1250, 1650]
    }
  };

  // Опции для диаграммы
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Исторические тренды эффективности промптов',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Качество ответа (1-5)'
        },
        min: 1,
        max: 5
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Использование токенов'
        }
      },
    },
  };

  // Данные для линейной диаграммы
  const data: ChartData<'line'> = {
    labels: timeRangeData[timeRange as keyof typeof timeRangeData].labels,
    datasets: [
      {
        label: 'Качество ответа',
        data: timeRangeData[timeRange as keyof typeof timeRangeData].qualityData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'y',
        tension: 0.3
      },
      {
        label: 'Использование токенов',
        data: timeRangeData[timeRange as keyof typeof timeRangeData].tokenData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y1',
        tension: 0.3
      }
    ],
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Исторические тренды
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
        >
          <ToggleButton value="day">День</ToggleButton>
          <ToggleButton value="week">Неделя</ToggleButton>
          <ToggleButton value="month">Месяц</ToggleButton>
          <ToggleButton value="quarter">Квартал</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box sx={{ height: 'calc(100% - 60px)' }}>
        <Line options={options} data={data} />
      </Box>
    </Box>
  );
};

export default HistoricalTrendChart; 