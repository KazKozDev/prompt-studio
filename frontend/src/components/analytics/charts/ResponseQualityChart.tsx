import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';

// Регистрируем необходимые компоненты ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ResponseQualityChartProps {
  showDetailed?: boolean;
}

const ResponseQualityChart: React.FC<ResponseQualityChartProps> = ({ showDetailed = false }) => {
  // Опции для диаграммы
  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 5,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          showLabelBackdrop: false
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Метрики качества ответов',
        font: {
          size: 16
        }
      },
    },
  };

  // Данные для радарной диаграммы
  const data: ChartData<'radar'> = {
    labels: ['Релевантность', 'Точность', 'Креативность', 'Полнота', 'Ясность', 'Последовательность'],
    datasets: [
      {
        label: 'Текущий промпт',
        data: [4.5, 4.2, 3.8, 4.0, 4.7, 4.3],
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        borderColor: 'rgba(53, 162, 235, 0.8)',
        pointBackgroundColor: 'rgba(53, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(53, 162, 235, 1)',
      },
      {
        label: 'Средний показатель',
        data: [3.8, 3.6, 3.2, 3.5, 3.7, 3.6],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 0.8)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      }
    ],
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Качество ответов
      </Typography>
      <Box sx={{ height: 'calc(100% - 40px)' }}>
        <Radar options={options} data={data} />
      </Box>
    </Box>
  );
};

export default ResponseQualityChart; 