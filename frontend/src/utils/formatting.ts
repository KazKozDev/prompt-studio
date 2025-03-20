/**
 * Утилита для форматирования размера файла из байтов в человекочитаемый вид
 * @param bytes - размер в байтах
 * @returns форматированная строка, например "2.5 MB"
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Форматирует дату в человекочитаемую строку
 * @param dateString - строка с датой или временная метка
 * @returns форматированная строка даты, например "10 мая 2023, 14:30"
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Опции форматирования
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('ru-RU', options);
}; 