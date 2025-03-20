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
import { Box, Typography } from '@mui/material';

// Регистрируем необходимые компоненты ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TokenUsageChartProps {
  showDetailed?: boolean;
}

const TokenUsageChart: React.FC<TokenUsageChartProps> = ({ showDetailed = false }) => {
  // Опции для диаграммы
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: showDetailed 
          ? 'Детальный анализ использования токенов по секциям' 
          : 'Обзор использования токенов',
        font: {
          size: 16
        }
      },
    },
  };

  // Данные для простой диаграммы
  const simpleData: ChartData<'bar'> = {
    labels: ['Запрос', 'Ответ', 'Общее'],
    datasets: [
      {
        label: 'Количество токенов',
        data: [520, 843, 1363],
        backgroundColor: 'rgba(53, 162, 235, 0.8)',
      }
    ],
  };

  // Данные для детальной диаграммы
  const detailedData: ChartData<'bar'> = {
    labels: ['Системная роль', 'Пользовательский ввод', 'Ответ помощника', 'Переменные', 'Контроль'],
    datasets: [
      {
        label: 'Использование токенов',
        data: [120, 400, 843, 83, 35],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
      }
    ],
  };

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      {!showDetailed && (
        <Typography variant="subtitle2" sx={{ position: 'absolute', top: 0, right: 0 }}>
          Всего токенов: 1,363
        </Typography>
      )}
      <Bar options={options} data={showDetailed ? detailedData : simpleData} />
    </Box>
  );
};

export default TokenUsageChart; 