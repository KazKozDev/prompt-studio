import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  CardActions, Button, TextField, Tab, Tabs, Paper, 
  Chip, LinearProgress, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, AlertTitle, CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tooltip
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchDocuments,
  uploadDocument,
  deleteDocument
} from '../store/slices/documentSlice';
import { formatBytes, formatDate } from '../utils/formatting';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Documents: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    documents,
    loading, 
    error, 
    uploadProgress 
  } = useAppSelector(state => state.documents);

  // Состояния UI
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: number, type: 'document'} | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  // Обработчики UI
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenUploadDialog = () => {
    setSelectedFile(null);
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await dispatch(uploadDocument(formData));
      setUploadDialogOpen(false);
      dispatch(fetchDocuments());
    }
  };

  const handleDeleteConfirmation = (id: number, type: 'document') => {
    setItemToDelete({ id, type });
    setConfirmDeleteDialogOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'document') {
        await dispatch(deleteDocument(itemToDelete.id));
        dispatch(fetchDocuments());
      }
      setConfirmDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Рендеринг компонента
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Documents</Typography>
        
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={handleOpenUploadDialog}
          >
            Upload Document
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 4 }}>
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !documents || documents.length === 0 ? (
            <Alert severity="info">
              You don't have any uploaded documents yet. Upload documents to use them for RAG.
            </Alert>
          ) : (
            <TableContainer>
              <Table aria-label="documents table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Upload Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {doc.title || doc.filename}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{doc.file_type.toUpperCase()}</TableCell>
                      <TableCell>{formatBytes(doc.file_size)}</TableCell>
                      <TableCell>
                        {doc.processing_status === 'completed' ? (
                          doc.processing_error ? (
                            <Tooltip title={doc.processing_error}>
                              <Chip
                                icon={<ErrorIcon />}
                                label="Error"
                                color="error"
                                size="small"
                              />
                            </Tooltip>
                          ) : (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Processed"
                              color="success"
                              size="small"
                            />
                          )
                        ) : doc.processing_status === 'failed' ? (
                          <Tooltip title={doc.processing_error || "Processing error"}>
                            <Chip
                              icon={<ErrorIcon />}
                              label="Error"
                              color="error"
                              size="small"
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            label="Processing..."
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>
                      <TableCell>{formatDate(doc.created_at)}</TableCell>
                      <TableCell>
                        <Box>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteConfirmation(doc.id, 'document')}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Document upload dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mb: 3, p: 5, borderStyle: 'dashed' }}
            >
              {selectedFile ? selectedFile.name : "Choose a file to upload"}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.csv,.md,.json,.html"
              />
            </Button>

            {selectedFile && (
              <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                Size: {formatBytes(selectedFile.size)}
              </Typography>
            )}

            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {uploadProgress}% uploaded
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || loading}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents; 