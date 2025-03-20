import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  Tooltip,
  Divider,
  IconButton
} from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

interface OptimizationTip {
  id: string;
  type: 'suggestion' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  canAutoFix: boolean;
}

const PromptOptimizationTips: React.FC = () => {
  const [appliedTips, setAppliedTips] = useState<string[]>([]);

  // Имитация рекомендаций для улучшения промпта
  const tips: OptimizationTip[] = [
    {
      id: 'tip1',
      type: 'suggestion',
      title: 'Уточните роль системы',
      description: 'Добавьте более конкретное описание задачи в системной роли для повышения релевантности ответов.',
      impact: 'high',
      canAutoFix: true
    },
    {
      id: 'tip2',
      type: 'warning',
      title: 'Избыточные инструкции',
      description: 'Обнаружено дублирование инструкций в разделах "Инструкция" и "Дополнительные инструкции". Рекомендуется объединить.',
      impact: 'medium',
      canAutoFix: true
    },
    {
      id: 'tip3',
      type: 'info',
      title: 'Оптимизация токенов',
      description: 'Переформулируйте системную роль более кратко. Потенциальная экономия: 8 токенов.',
      impact: 'low',
      canAutoFix: false
    },
    {
      id: 'tip4',
      type: 'suggestion',
      title: 'Структурируйте запрос',
      description: 'Используйте маркированные списки для инструкций, чтобы улучшить восприятие модели.',
      impact: 'medium',
      canAutoFix: true
    }
  ];

  // Имитация применения рекомендации
  const applyTip = (tipId: string) => {
    if (!appliedTips.includes(tipId)) {
      setAppliedTips([...appliedTips, tipId]);
    }
  };

  // Получение иконки на основе типа рекомендации
  const getTipIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <TipsAndUpdatesIcon color="primary" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  // Получение цвета для уровня влияния
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ height: '100%', width: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" gutterBottom>
          Рекомендации по оптимизации
        </Typography>
        <Chip 
          label={`${appliedTips.length}/${tips.length}`} 
          size="small" 
          color="primary" 
          sx={{ height: 24 }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List dense>
        {tips.map((tip) => {
          const isApplied = appliedTips.includes(tip.id);
          
          return (
            <ListItem 
              key={tip.id}
              sx={{ 
                mb: 1, 
                bgcolor: isApplied ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                borderRadius: 1,
                opacity: isApplied ? 0.7 : 1
              }}
              secondaryAction={
                tip.canAutoFix && !isApplied ? (
                  <Tooltip title="Применить автоматически">
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={() => applyTip(tip.id)}
                    >
                      <AutoFixHighIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : isApplied ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : null
              }
            >
              <ListItemIcon>
                {getTipIcon(tip.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {tip.title}
                    </Typography>
                    <Chip 
                      label={tip.impact} 
                      size="small" 
                      color={getImpactColor(tip.impact) as any}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {tip.description}
                  </Typography>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default PromptOptimizationTips; 