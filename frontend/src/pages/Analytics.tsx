import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Grid, FormControl, InputLabel, 
  Select, MenuItem, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, ButtonGroup, Button, Tabs, Tab, Container, AlertTitle
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchPromptUsage, fetchProviderUsage, fetchAggregatedAnalytics 
} from '../store/slices/analyticsSlice';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  Cell, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import { useNavigate } from 'react-router-dom';

// TabPanel component for tab display
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
      sx={{ pt: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

const Analytics: React.FC = () => {
  const dispatch = useAppDispatch();
  const { promptUsage, providerUsage, aggregatedData, loading, error } = useAppSelector((state) => state.analytics);
  
  const [timeFrame, setTimeFrame] = useState('month');
  const [tabIndex, setTabIndex] = useState(0);
  const [chartType, setChartType] = useState<Record<string, string>>({
    promptUsage: 'bar',
    providerUsage: 'pie',
    tokenUsage: 'area'
  });

  const navigate = useNavigate();

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Fetch analytics data
  useEffect(() => {
    if (tabIndex === 0) { // Only fetch API data when on the standard analytics tab
    dispatch(fetchPromptUsage(timeFrame === 'week' ? 7 : timeFrame === 'month' ? 30 : 90));
    dispatch(fetchProviderUsage(timeFrame === 'week' ? 7 : timeFrame === 'month' ? 30 : 90));
    dispatch(fetchAggregatedAnalytics(timeFrame === 'week' ? '7d' : timeFrame === 'month' ? '30d' : '90d'));
    }
  }, [dispatch, timeFrame, tabIndex]);

  // Handle time frame change
  const handleTimeFrameChange = (event: React.ChangeEvent<HTMLInputElement> | any) => {
    setTimeFrame(event.target.value as string);
  };

  // Handle chart type change
  const handleChartTypeChange = (section: string, newType: string) => {
    setChartType(prev => ({
      ...prev,
      [section]: newType
    }));
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  // Processed token usage data for charts
  const tokenUsageData = useMemo(() => {
    if (!providerUsage || providerUsage.length === 0) return [];
    
    return providerUsage.map(provider => ({
      name: provider.provider,
      input: provider.input_tokens,
      output: provider.output_tokens,
      total: provider.total_tokens,
      runs: provider.runs,
      value: provider.total_tokens // for bubble chart
    }));
  }, [providerUsage]);

  // Processed prompt usage data
  const promptUsageData = useMemo(() => {
    if (!promptUsage || promptUsage.length === 0) return [];
    
    return promptUsage.slice(0, 10); // Only top 10 prompts
  }, [promptUsage]);

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="subtitle2" color="textPrimary">
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value.toLocaleString()}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Render prompt usage chart based on selected chart type
  const renderPromptUsageChart = () => {
    if (promptUsageData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    switch (chartType.promptUsage) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={promptUsageData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="prompt_name" type="category" width={100} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="runs" fill="#8884d8" name="Runs" />
              <Bar dataKey="total_tokens" fill="#82ca9d" name="Total Tokens" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={promptUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="prompt_name" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="runs" stroke="#8884d8" name="Runs" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="total_tokens" stroke="#82ca9d" name="Total Tokens" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Prompt Name</TableCell>
                  <TableCell align="right">Runs</TableCell>
                  <TableCell align="right">Input Tokens</TableCell>
                  <TableCell align="right">Output Tokens</TableCell>
                  <TableCell align="right">Total Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {promptUsageData.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell component="th" scope="row">
                      {row.prompt_name}
                    </TableCell>
                    <TableCell align="right">{row.runs?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">{row.input_tokens?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">{row.output_tokens?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">{
                      (row.total_tokens !== undefined ? 
                        row.total_tokens?.toLocaleString() : 
                        ((row.input_tokens || 0) + (row.output_tokens || 0)).toLocaleString()
                      )
                    }</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  // Render provider usage chart based on selected chart type
  const renderProviderUsageChart = () => {
    if (providerUsage.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    switch (chartType.providerUsage) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={providerUsage}
                dataKey="total_tokens"
                nameKey="provider"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {providerUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={providerUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="provider" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="input_tokens" fill="#8884d8" name="Input Tokens" />
              <Bar dataKey="output_tokens" fill="#82ca9d" name="Output Tokens" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'table':
        return (
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Provider</TableCell>
                  <TableCell align="right">Runs</TableCell>
                  <TableCell align="right">Input Tokens</TableCell>
                  <TableCell align="right">Output Tokens</TableCell>
                  <TableCell align="right">Total Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {providerUsage.map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell component="th" scope="row">
                      {row.provider}
                    </TableCell>
                    <TableCell align="right">{row.runs?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">{row.input_tokens?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">{row.output_tokens?.toLocaleString() || '0'}</TableCell>
                    <TableCell align="right">{
                      (row.total_tokens !== undefined ? 
                        row.total_tokens?.toLocaleString() : 
                        ((row.input_tokens || 0) + (row.output_tokens || 0)).toLocaleString()
                      )
                    }</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  // Render token usage chart based on selected chart type
  const renderTokenUsageChart = () => {
    if (tokenUsageData.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">No data available</Typography>
        </Box>
      );
    }

    switch (chartType.tokenUsage) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tokenUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="input" stackId="1" fill="#8884d8" stroke="#8884d8" name="Input Tokens" />
              <Area type="monotone" dataKey="output" stackId="1" fill="#82ca9d" stroke="#82ca9d" name="Output Tokens" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bubble':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="category" dataKey="name" name="Provider" />
              <YAxis type="number" dataKey="total" name="Total Tokens" />
              <ZAxis type="number" dataKey="runs" range={[50, 500]} name="Runs" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Providers" data={tokenUsageData} fill="#8884d8">
                {tokenUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Analytics</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="time-frame-label">Period</InputLabel>
            <Select
              labelId="time-frame-label"
              id="time-frame"
              value={timeFrame}
              label="Period"
              onChange={handleTimeFrameChange}
              size="small"
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="quarter">Quarter</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h5" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Typography variant="body1">
          Monitor and analyze your prompt performance metrics. Track token usage, compare different providers, 
          and gain insights into your prompt engineering effectiveness. Use these analytics to optimize your prompts 
          and improve interaction quality with AI models.
        </Typography>
      </Paper>

      <Paper sx={{ width: '100%', mb: 4, p: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Standard Metrics" />
          <Tab label="Advanced Analytics" />
        </Tabs>
        
        <TabPanel value={tabIndex} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <>
              {/* Metrics Summary Cards */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Prompts</Typography>
                      <Typography variant="h4">{aggregatedData?.total_prompts || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
                <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                      <Typography color="textSecondary" gutterBottom>Total Runs</Typography>
                      <Typography variant="h4">{aggregatedData?.total_runs?.toLocaleString() || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
                <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                      <Typography color="textSecondary" gutterBottom>Input Tokens</Typography>
                      <Typography variant="h4">{aggregatedData?.total_input_tokens?.toLocaleString() || 0}</Typography>
                  </CardContent>
                </Card>
              </Grid>
                <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                      <Typography color="textSecondary" gutterBottom>Output Tokens</Typography>
                      <Typography variant="h4">{aggregatedData?.total_output_tokens?.toLocaleString() || 0}</Typography>
                  </CardContent>
                </Card>
            </Grid>
            
                {/* Prompt Usage Chart */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Top Prompts by Usage</Typography>
                      <ButtonGroup size="small">
                        <Tooltip title="Bar Chart">
                          <Button 
                            onClick={() => handleChartTypeChange('promptUsage', 'bar')}
                            variant={chartType.promptUsage === 'bar' ? 'contained' : 'outlined'}
                          >
                            <BarChartIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Line Chart">
                          <Button 
                            onClick={() => handleChartTypeChange('promptUsage', 'line')}
                            variant={chartType.promptUsage === 'line' ? 'contained' : 'outlined'}
                          >
                            <ShowChartIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Table View">
                          <Button 
                            onClick={() => handleChartTypeChange('promptUsage', 'table')}
                            variant={chartType.promptUsage === 'table' ? 'contained' : 'outlined'}
                          >
                            <TableChartIcon />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </Box>
                    {renderPromptUsageChart()}
                </Paper>
              </Grid>
              
                {/* Provider Usage Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Usage by Provider</Typography>
                      <ButtonGroup size="small">
                        <Tooltip title="Pie Chart">
                          <Button 
                            onClick={() => handleChartTypeChange('providerUsage', 'pie')}
                            variant={chartType.providerUsage === 'pie' ? 'contained' : 'outlined'}
                          >
                            <PieChartIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Bar Chart">
                          <Button 
                            onClick={() => handleChartTypeChange('providerUsage', 'bar')}
                            variant={chartType.providerUsage === 'bar' ? 'contained' : 'outlined'}
                          >
                            <BarChartIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Table View">
                          <Button 
                            onClick={() => handleChartTypeChange('providerUsage', 'table')}
                            variant={chartType.providerUsage === 'table' ? 'contained' : 'outlined'}
                          >
                            <TableChartIcon />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </Box>
                    {renderProviderUsageChart()}
                </Paper>
              </Grid>
              
                {/* Token Usage Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Token Distribution</Typography>
                      <ButtonGroup size="small">
                        <Tooltip title="Area Chart">
                          <Button 
                            onClick={() => handleChartTypeChange('tokenUsage', 'area')}
                            variant={chartType.tokenUsage === 'area' ? 'contained' : 'outlined'}
                          >
                            <ShowChartIcon />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Bubble Chart">
                          <Button 
                            onClick={() => handleChartTypeChange('tokenUsage', 'bubble')}
                            variant={chartType.tokenUsage === 'bubble' ? 'contained' : 'outlined'}
                          >
                            <BubbleChartIcon />
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </Box>
                    {renderTokenUsageChart()}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
        </TabPanel>
        
        <TabPanel value={tabIndex} index={1}>
          <AnalyticsDashboard />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;
