import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CustomSelect } from '../components';
import { excelService } from '../services/excelService';
import { useNotificationStore } from '../stores/notificationStore';
import type { ImportResult } from '../types';

const currentYear = new Date().getFullYear();

const ANOS_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: currentYear - i,
  label: `${currentYear - i}`,
}));

const MESES_OPTIONS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export default function ExcelPage() {
  const showNotification = useNotificationStore((s) => s.showNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ano, setAno] = useState<number>(currentYear);
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification('Seleccione un archivo', 'warning');
      return;
    }
    setUploading(true);
    try {
      const data = await excelService.importar(file, ano, mes);
      setResult(data);
      showNotification(`Importación completada: ${data.exitosos} registros exitosos`, 'success');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      // Error handled by interceptor
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await excelService.descargarTemplate();
      showNotification('Template descargado', 'success');
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1b5e20, #388e3c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(56,142,60,0.25)',
          }}
        >
          <UploadFileIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ color: '#1a2027' }}>Importar Excel</Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>Carga masiva de informes</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Upload section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(145,158,171,0.12)' }}>
            <Typography variant="subtitle1"
          sx={{ fontWeight: 600, color: '#1a2027', mb: 2.5, }}>
              Importar Informes desde Excel
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomSelect label="Año" value={ano} options={ANOS_OPTIONS} onChange={(val) => setAno(val as number)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomSelect label="Mes" value={mes} options={MESES_OPTIONS} onChange={(val) => setMes(val as number)} />
              </Grid>
            </Grid>

            {/* Drag & Drop zone */}
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${file ? '#388e3c' : 'rgba(25,118,210,0.30)'}`,
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: file ? 'rgba(56,142,60,0.04)' : 'rgba(25,118,210,0.02)',
                transition: 'all 0.2s ease',
                mb: 3,
                '&:hover': {
                  bgcolor: file ? 'rgba(56,142,60,0.07)' : 'rgba(25,118,210,0.05)',
                  borderColor: file ? '#2e7d32' : '#1976d2',
                },
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
              {file ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#388e3c', mb: 1 }} />
                  <Typography variant="subtitle1"
          sx={{ fontWeight: 600, color: '#2e7d32', }}>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#637381', mt: 0.5 }}>
                    Haz clic para cambiar el archivo
                  </Typography>
                </>
              ) : (
                <>
                  <InsertDriveFileIcon sx={{ fontSize: 48, color: '#90caf9', mb: 1 }} />
                  <Typography variant="subtitle1"
          sx={{ fontWeight: 600, color: '#374151', }}>
                    Arrastra el archivo aquí
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#637381', mt: 0.5 }}>
                    o haz clic para seleccionar — .xlsx, .xls
                  </Typography>
                </>
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
              disabled={!file || uploading}
              sx={{ borderRadius: 2.5 }}
            >
              {uploading ? 'Importando...' : 'Subir e Importar'}
            </Button>
          </Paper>
        </Grid>

        {/* Template section */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid rgba(145,158,171,0.12)',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f8fbff 0%, #fff 100%)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <Box sx={{ mx: 'auto', width: 64, height: 64, borderRadius: 3, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DownloadIcon sx={{ fontSize: 32, color: '#1976d2' }} />
            </Box>
            <Typography variant="subtitle1"
          sx={{ fontWeight: 600, color: '#1a2027', }}>
              Plantilla Excel
            </Typography>
            <Typography variant="body2" sx={{ color: '#637381' }}>
              Descarga la plantilla con el formato correcto para ingresar los informes.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ borderRadius: 2.5, mt: 0.5 }}
            >
              Descargar Template
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Import results */}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Alert
            severity={result.errores.length > 0 ? 'warning' : 'success'}
            sx={{ mb: 2, borderRadius: 2.5 }}
            icon={result.errores.length === 0 ? <CheckCircleIcon /> : undefined}
          >
            <Typography variant="body2"
          sx={{ fontWeight: 600, }}>
              {result.errores.length === 0
                ? `¡Importación exitosa! ${result.exitosos} registros procesados.`
                : `Importación con observaciones — Total: ${result.totalRegistros} | Exitosos: ${result.exitosos} | Errores: ${result.errores.length}`}
            </Typography>
          </Alert>

          {result.errores.length > 0 && (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid rgba(145,158,171,0.12)' }}>
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#c62828' }}>
                  Detalle de errores ({result.errores.length})
                </Typography>
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fila</TableCell>
                    <TableCell>Descripción del error</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.errores.map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ fontWeight: 600, color: '#374151' }}>{err.fila}</TableCell>
                      <TableCell sx={{ color: '#637381' }}>{err.mensaje}</TableCell>
                      <TableCell>
                        <Chip label="Error" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600, border: '1px solid #ffcdd2' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
