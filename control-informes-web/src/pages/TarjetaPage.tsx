import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import { CustomSelect, Loader } from '../components';
import { publicadoresService } from '../services/publicadoresService';
import type { TarjetaPublicadorDto } from '../types';
import { generarOpcionesAno, calcularAnoServicioActual } from '../utils/anoServicio';

const ANOS_OPTIONS = generarOpcionesAno().map((o) => ({ value: o.valor, label: o.etiqueta }));

const NOMBRES_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function TarjetaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anoServicio, setAnoServicio] = useState<number>(calcularAnoServicioActual());
  const [tarjeta, setTarjeta] = useState<TarjetaPublicadorDto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchTarjeta = async () => {
      setLoading(true);
      try {
        const data = await publicadoresService.getTarjeta(id, anoServicio);
        setTarjeta(data);
      } catch {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchTarjeta();
  }, [id, anoServicio]);

  const totales = tarjeta
    ? {
        cursos: tarjeta.meses.reduce((s, m) => s + m.cursosBiblicos, 0),
        horas: tarjeta.meses.reduce((s, m) => s + (m.horas ?? 0), 0),
        participaciones: tarjeta.meses.filter((m) => m.participo).length,
      }
    : null;

  if (loading) return <Loader />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/publicadores')}
          size="small"
          sx={{ borderRadius: 2.5, color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}
        >
          Volver
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(25,118,210,0.25)',
            }}
          >
            <BadgeIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#1a2027' }}>
              Tarjeta de Publicador
            </Typography>
            {tarjeta && (
              <Typography variant="body2" sx={{ color: '#637381' }}>
                {tarjeta.nombreCompleto}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ ml: 'auto', width: 180 }}>
          <CustomSelect
            label="Año de Servicio"
            value={anoServicio}
            options={ANOS_OPTIONS}
            onChange={(val) => setAnoServicio(val as number)}
          />
        </Box>
      </Box>

      {/* KPI summary */}
      {totales && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Meses participados', value: totales.participaciones, color: '#e8f5e9', textColor: '#2e7d32' },
            { label: 'Total cursos', value: totales.cursos, color: '#e3f2fd', textColor: '#1565c0' },
            { label: 'Total horas', value: totales.horas, color: '#f3e5f5', textColor: '#6a1b9a' },
          ].map((kpi) => (
            <Grid size={{ xs: 12, sm: 4 }} key={kpi.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  border: '1px solid rgba(145,158,171,0.12)',
                  bgcolor: kpi.color,
                }}
              >
                <Typography variant="h4"
          sx={{ fontWeight: 700, color: kpi.textColor, }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" sx={{ color: kpi.textColor, opacity: 0.8, mt: 0.5 }}>
                  {kpi.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {tarjeta && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ border: '1px solid rgba(145,158,171,0.12)' }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mes</TableCell>
                <TableCell align="center">Participó</TableCell>
                <TableCell align="center">Cursos</TableCell>
                <TableCell align="center">Horas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tarjeta.meses.map((mes, idx) => (
                <TableRow key={`${mes.ano}-${mes.mes}`} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#fafbff' }}>
                  <TableCell sx={{ fontWeight: 500, color: '#374151' }}>{NOMBRES_MES[mes.mes - 1] ?? mes.mes}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={mes.participo ? 'Participó' : 'No participó'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        bgcolor: mes.participo ? '#e8f5e9' : '#f5f5f5',
                        color: mes.participo ? '#2e7d32' : '#9e9e9e',
                        border: `1px solid ${mes.participo ? '#a5d6a7' : '#e0e0e0'}`,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
          sx={{ fontWeight: mes.cursosBiblicos > 0 ? 700 : 400, color: mes.cursosBiblicos > 0 ? '#1976d2' : '#9e9e9e' }}>
                      {mes.cursosBiblicos > 0 ? mes.cursosBiblicos : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
          sx={{ fontWeight: (mes.horas ?? 0) > 0 ? 700 : 400, color: (mes.horas ?? 0) > 0 ? '#7b1fa2' : '#9e9e9e' }}>
                      {(mes.horas ?? 0) > 0 ? mes.horas : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {totales && (
                <>
                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0 }}>
                      <Divider />
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#e8f0fe' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1565c0' }}>TOTALES</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${totales.participaciones} / 12`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2"
          sx={{ fontWeight: 700, color: '#1565c0', }}>
                        {totales.cursos}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2"
          sx={{ fontWeight: 700, color: '#7b1fa2', }}>
                        {totales.horas}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}