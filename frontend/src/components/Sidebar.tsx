import React from 'react';
import { 
  Drawer, List, ListItem, ListItemIcon, ListItemText, 
  Toolbar, Divider, Box, useTheme, useMediaQuery, Typography
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TemplateIcon from '@mui/icons-material/ViewQuilt';
import TestIcon from '@mui/icons-material/Science';
import AnalyticsIcon from '@mui/icons-material/Assessment';
import DocumentIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

// Основные элементы меню
const mainMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Prompts', icon: <TextFieldsIcon />, path: '/prompts' },
  { text: 'Templates', icon: <TemplateIcon />, path: '/templates' },
  { text: 'Tests', icon: <TestIcon />, path: '/tests' },
  { text: 'Documents', icon: <DocumentIcon />, path: '/documents' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
];

// Расширенные функции
const advancedMenuItems = [
  { text: 'Taxonomy', icon: <CategoryIcon />, path: '/taxonomy' },
  { text: 'Learning', icon: <SchoolIcon />, path: '/learning' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {mainMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(63, 81, 181, 0.12)',
                },
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        {advancedMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(63, 81, 181, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(63, 81, 181, 0.12)',
                },
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
