import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';

// Создаем свою тепловую карту, так как библиотеки для хитмап не всегда подходят для наших нужд
const PromptHeatmap: React.FC = () => {
  // Моделируем данные для тепловой карты
  // В реальном приложении эти данные будут получены из анализа промпта
  const promptSections = [
    {
      id: 'system',
      title: 'Системная роль',
      content: 'Вы высококвалифицированный AI-ассистент, специализирующийся на создании исчерпывающих, точных и информативных ответов.',
      impact: 0.85, // от 0 до 1, где 1 - максимальное влияние
      tokens: 25
    },
    {
      id: 'context',
      title: 'Контекст',
      content: 'Контекст: пользователь хочет понять, как эффективно использовать различные техники промпт-инженерии для получения лучших результатов при работе с AI-моделями.',
      impact: 0.78,
      tokens: 32
    },
    {
      id: 'instruction',
      title: 'Инструкция',
      content: 'Объясните основные техники промпт-инженерии, включая Chain-of-Thought, Few-shot Learning, Self-consistency и другие методы. Для каждой техники приведите короткий пример.',
      impact: 0.92,
      tokens: 40
    },
    {
      id: 'format',
      title: 'Формат',
      content: 'Ответ должен быть структурирован в формате списка методов, где каждый метод содержит название, краткое описание (2-3 предложения) и пример использования.',
      impact: 0.65,
      tokens: 30
    },
    {
      id: 'extra1',
      title: 'Дополнительный контекст',
      content: 'Пользователь имеет базовые знания в программировании и машинном обучении, но не является экспертом в области NLP и больших языковых моделей.',
      impact: 0.45,
      tokens: 28
    },
    {
      id: 'extra2',
      title: 'Дополнительные инструкции',
      content: 'Избегайте излишне технических терминов. Если необходимо использовать сложные термины, дайте краткое объяснение.',
      impact: 0.58,
      tokens: 20
    }
  ];

  // Функция для определения цвета на основе значения воздействия
  const getImpactColor = (impact: number) => {
    // От красного (низкое влияние) до зеленого (высокое влияние)
    if (impact >= 0.8) return 'rgba(0, 128, 0, 0.8)'; // Зеленый
    if (impact >= 0.6) return 'rgba(144, 238, 144, 0.8)'; // Светло-зеленый
    if (impact >= 0.4) return 'rgba(255, 255, 0, 0.8)'; // Желтый
    if (impact >= 0.2) return 'rgba(255, 165, 0, 0.8)'; // Оранжевый
    return 'rgba(255, 0, 0, 0.8)'; // Красный
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Тепловая карта секций промпта
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Карта показывает влияние различных секций на качество ответа
      </Typography>
      
      <Grid container spacing={2}>
        {promptSections.map((section) => (
          <Grid item xs={12} key={section.id}>
            <Paper 
              sx={{ 
                p: 2,
                backgroundColor: getImpactColor(section.impact),
                color: section.impact > 0.6 ? 'white' : 'black',
                mb: 2,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {section.title}
                </Typography>
                <Typography variant="body2">
                  Влияние: {Math.round(section.impact * 100)}% | {section.tokens} токенов
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {section.content}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Рекомендации по улучшению:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Усильте инструкции в секции "Дополнительный контекст" для большего влияния</li>
          <li>Рассмотрите возможность сокращения секции "Формат" для оптимизации токенов</li>
          <li>Основная инструкция имеет высокое влияние, сохраните её детализацию</li>
        </Typography>
      </Box>
    </Box>
  );
};

export default PromptHeatmap; 