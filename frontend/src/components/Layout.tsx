import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Prompts', icon: <DescriptionIcon />, path: '/prompts' },
  { text: 'Templates', icon: <CategoryIcon />, path: '/templates' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
]; 