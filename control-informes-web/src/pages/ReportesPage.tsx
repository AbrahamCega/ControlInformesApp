import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import { Loader } from '../components';
import { reportesService } from '../services/reportesService';
import type { ResumenMensual } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
}

function KpiCard({ title, value, icon, gradient }: KpiCardProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid rgba(145,158,171,0.12)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ color: '#637381', fontSize: '0.8rem', mb: 0.25 }}>
            {title}
          </Typography>
          <Typography variant="h5"
          sx={{ fontWeight: 700, color: '#1a2027', }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

const PIE_COLORS = ['#1976d2', '#42a5f5', '#90caf9'];

export default function ReportesPage() {
  const [resumen, setResumen] = useState<ResumenMensual | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResumen = async () => {
      setLoading(true);
      try {
        const data = await reportesService.getResumenMensual();
        setResumen(data);
      } catch {
        // Error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);

  if (loading) return <Loader />;
  if (!resumen) return null;

  const pieData = [
    { name: 'Publicadores', value: resumen.publicadores },
    { name: 'Prec. Auxiliares', value: resumen.precursoresAuxiliares },
    { name: 'Prec. Regulares', value: resumen.precursoresRegulares },
  ];

  const barData = [
    { label: 'Publicadores', cantidad: resumen.publicadores },
    { label: 'Prec. Aux.', cantidad: resumen.precursoresAuxiliares },
    { label: 'Prec. Reg.', cantidad: resumen.precursoresRegulares },
  ];

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1565c0, #1976d2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(25,118,210,0.25)',
          }}
        >
          <BarChartIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ color: '#1a2027' }}>Reportes</Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>Estadísticas generales</Typography>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard title="Total Publicadores" value={resumen.totalPublicadores}
            icon={<PeopleIcon sx={{ color: '#fff', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, #1565c0, #1976d2)" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard title="Informes" value={resumen.totalInformes}
            icon={<DescriptionIcon sx={{ color: '#fff', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, #1b5e20, #388e3c)" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard title="Cursos" value={resumen.totalCursos}
            icon={<SchoolIcon sx={{ color: '#fff', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, #bf360c, #f57c00)" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard title="Horas" value={resumen.totalHoras}
            icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, #4a148c, #7b1fa2)" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <KpiCard title="Prom. Asistencia" value={resumen.promedioAsistencia}
            icon={<GroupsIcon sx={{ color: '#fff', fontSize: 24 }} />}
            gradient="linear-gradient(135deg, #880e4f, #c2185b)" />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(145,158,171,0.12)', height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '0.95rem', color: '#1a2027' }}>
              Distribución por Categoría
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f3f8" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#637381' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#637381' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }} cursor={{ fill: 'rgba(25,118,210,0.06)' }} />
                <Bar dataKey="cantidad" name="Cantidad" fill="#1976d2" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(145,158,171,0.12)', height: 300 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: '0.95rem', color: '#1a2027' }}>
              Tipos de Publicador
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: 12, color: '#637381' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary table */}
      <Paper elevation={0} sx={{ border: '1px solid rgba(145,158,171,0.12)', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '0.95rem', color: '#1a2027' }}>
            Resumen por Tipo
          </Typography>
        </Box>
        <Divider />
        {[
          { label: 'Publicadores', value: resumen.publicadores, color: '#e3f2fd', textColor: '#1565c0' },
          { label: 'Precursores Auxiliares', value: resumen.precursoresAuxiliares, color: '#e8f5e9', textColor: '#2e7d32' },
          { label: 'Precursores Regulares', value: resumen.precursoresRegulares, color: '#f3e5f5', textColor: '#6a1b9a' },
        ].map((row, idx) => (
          <Box key={row.label}>
            {idx > 0 && <Divider />}
            <Box
              sx={{
                px: 3, py: 1.5,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'background 0.15s',
                '&:hover': { bgcolor: 'rgba(25,118,210,0.03)' },
              }}
            >
              <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>{row.label}</Typography>
              <Box
                sx={{
                  px: 2, py: 0.5, borderRadius: 2,
                  bgcolor: row.color,
                  minWidth: 48, textAlign: 'center',
                }}
              >
                <Typography variant="body2"
          sx={{ fontWeight: 700, color: row.textColor, }}>
                  {row.value}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            bgcolor: color,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5"
          sx={{ fontWeight: 700, }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}