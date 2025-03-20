import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, 
  Button, Avatar, Tooltip, Box 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/slices/authSlice';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HelpButton from './welcome/HelpButton';
import AddIcon from '@mui/icons-material/Add';

interface NavbarProps {
  toggleDrawer?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleDrawer }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };
  
  const firstLetter = user?.full_name ? user.full_name[0].toUpperCase() : (
    user?.email ? user.email[0].toUpperCase() : 'U'
  );
  
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {toggleDrawer && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Multimodal Prompt Studio
        </Typography>
        
        <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
          <HelpButton variant="icon" />
          
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/prompts/new')}
            size="small"
            sx={{ mr: 2 }}
          >
            New Prompt
          </Button>
          
          <Tooltip title={user?.full_name || user?.email || 'User'}>
            <IconButton
              size="large"
              aria-label="account"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {firstLetter}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
