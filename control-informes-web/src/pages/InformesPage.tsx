import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tab,
  Tabs,
  IconButton,
  TextField,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WeekendIcon from '@mui/icons-material/Weekend';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConfirmDialog, CustomSelect, KpiCard } from '../components';
import { informesService } from '../services/informesService';
import { grupoService } from '../services/grupoService';
import { publicadoresService } from '../services/publicadoresService';
import { useNotificationStore } from '../stores/notificationStore';
import type {
  InformeMensualDto,
  ActualizarInformeDto,
  RegistrarInformeDto,
  TotalInformeDto,
  ResultadoImportacionDto,
  GrupoDto,
  PublicadorDto,
  FiltrosInformeListado,
} from '../types';
import { TipoPublicador } from '../types';

// ─── constantes ────────────────────────────────────────────────────────────────

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

const TIPO_OPTIONS_FILTRO = [
  { value: '', label: 'Todos' },
  { value: String(TipoPublicador.Publicador), label: 'Publicador' },
  { value: String(TipoPublicador.NoBautizado), label: 'No Bautizado' },
  { value: String(TipoPublicador.PrecursorAuxiliar), label: 'Precursor Auxiliar' },
  { value: String(TipoPublicador.PrecursorRegular), label: 'Precursor Regular' },
];

const TIPO_OPTIONS_FORM = [
  { value: TipoPublicador.Publicador, label: 'Publicador' },
  { value: TipoPublicador.NoBautizado, label: 'No Bautizado' },
  { value: TipoPublicador.PrecursorAuxiliar, label: 'Precursor Auxiliar' },
  { value: TipoPublicador.PrecursorRegular, label: 'Precursor Regular' },
];

const TIPO_LABEL: Record<number, string> = {
  [TipoPublicador.Publicador]: 'Publicador',
  [TipoPublicador.NoBautizado]: 'No Bautizado',
  [TipoPublicador.PrecursorAuxiliar]: 'Precursor Auxiliar',
  [TipoPublicador.PrecursorRegular]: 'Precursor Regular',
};

const PAGE_SIZE = 15;

// ─── helpers ───────────────────────────────────────────────────────────────────

function usaHoras(tipo: TipoPublicador) {
  return tipo === TipoPublicador.PrecursorAuxiliar || tipo === TipoPublicador.PrecursorRegular;
}

// ─── tipos locales ─────────────────────────────────────────────────────────────

interface EditFormState {
  participo: boolean;
  cursosBiblicos: number;
  horas: number | '';
  inactivo: boolean;
  observacion: string;
  tipo: TipoPublicador;
}

interface NuevoFormState {
  idPublicador: string;
  participo: boolean;
  cursosBiblicos: number;
  horas: number | '';
  observacion: string;
  tipo: TipoPublicador;
}

interface ImportState {
  step: 1 | 2;
  ano: number;
  mes: number;
  idGrupo: string;
  file: File | null;
  result: ResultadoImportacionDto | null;
  loading: boolean;
}

// ─── componente principal ──────────────────────────────────────────────────────

export default function InformesPage() {
  const showNotification = useNotificationStore((s) => s.showNotification);

  // filtros compartidos
  const [tab, setTab] = useState(0);
  const [ano, setAno] = useState(currentYear);
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  // ── Tab Detalle ──────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<InformeMensualDto[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroInactivo, setFiltroInactivo] = useState(false);

  // ── Editar ───────────────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editingInforme, setEditingInforme] = useState<InformeMensualDto | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    participo: false,
    cursosBiblicos: 0,
    horas: '',
    inactivo: false,
    observacion: '',
    tipo: TipoPublicador.Publicador,
  });
  const [saving, setSaving] = useState(false);

  // ── Nuevo Informe ────────────────────────────────────────────────────────────
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [publicadores, setPublicadores] = useState<PublicadorDto[]>([]);
  const [nuevoForm, setNuevoForm] = useState<NuevoFormState>({
    idPublicador: '',
    participo: false,
    cursosBiblicos: 0,
    horas: '',
    observacion: '',
    tipo: TipoPublicador.Publicador,
  });
  const [creando, setCreando] = useState(false);

  // ── Eliminar ─────────────────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Importar Excel ───────────────────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false);
  const [importState, setImportState] = useState<ImportState>({
    step: 1,
    ano: currentYear,
    mes: new Date().getMonth() + 1,
    idGrupo: '',
    file: null,
    result: null,
    loading: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Template ─────────────────────────────────────────────────────────────────
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateGrupoId, setTemplateGrupoId] = useState('');
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  // ── Grupos (compartido) ──────────────────────────────────────────────────────
  const [grupos, setGrupos] = useState<GrupoDto[]>([]);

  // ── Tab Total ────────────────────────────────────────────────────────────────
  const [totalData, setTotalData] = useState<TotalInformeDto | null>(null);
  const [loadingTotal, setLoadingTotal] = useState(false);

  // ─── fetch ────────────────────────────────────────────────────────────────────

  const fetchGrupos = useCallback(async () => {
    try {
      const data = await grupoService.getAll();
      setGrupos(data);
    } catch { /* handled by interceptor */ }
  }, []);

  const fetchDetalle = useCallback(async (page: number) => {
    setLoadingDetalle(true);
    const filtros: FiltrosInformeListado = {
      ano,
      mes,
      pagina: page + 1,
      tamanoPagina: PAGE_SIZE,
      ...(filtroGrupo && { idGrupo: filtroGrupo }),
      ...(filtroTipo !== '' && { tipo: Number(filtroTipo) as TipoPublicador }),
      ...(filtroInactivo && { inactivo: true }),
    };
    try {
      const result = await informesService.getListado(filtros);
      setRows(result.items);
      setTotalRows(result.totalRegistros);
    } catch { /* handled by interceptor */ }
    finally { setLoadingDetalle(false); }
  }, [ano, mes, filtroGrupo, filtroTipo, filtroInactivo]);

  const fetchTotal = useCallback(async () => {
    setLoadingTotal(true);
    try {
      const data = await informesService.getTotal(ano, mes);
      setTotalData(data);
    } catch { /* handled by interceptor */ }
    finally { setLoadingTotal(false); }
  }, [ano, mes]);

  useEffect(() => { fetchGrupos(); }, [fetchGrupos]);

  useEffect(() => {
    setPagina(0);
    if (tab === 0) fetchDetalle(0);
    else fetchTotal();
  }, [tab, ano, mes, filtroGrupo, filtroTipo, filtroInactivo, fetchDetalle, fetchTotal]);

  // ─── handlers editar ──────────────────────────────────────────────────────────

  const handleOpenEdit = (informe: InformeMensualDto) => {
    setEditingInforme(informe);
    setEditForm({
      participo: informe.participo,
      cursosBiblicos: informe.cursosBiblicos,
      horas: informe.horas ?? '',
      inactivo: informe.inactivo,
      observacion: informe.observacion ?? '',
      tipo: informe.tipo,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingInforme) return;
    if (usaHoras(editForm.tipo) && editForm.participo && editForm.horas === '') {
      showNotification('Las horas son obligatorias para precursores que participaron', 'warning');
      return;
    }
    setSaving(true);
    try {
      const dto: ActualizarInformeDto = {
        idInformeMensual: editingInforme.idInformeMensual,
        participo: editForm.participo,
        cursosBiblicos: editForm.inactivo ? 0 : editForm.cursosBiblicos,
        horas: usaHoras(editForm.tipo) && editForm.horas !== '' ? Number(editForm.horas) : undefined,
        inactivo: editForm.inactivo,
        observacion: editForm.observacion || undefined,
      };
      await informesService.actualizar(editingInforme.idInformeMensual, dto);
      showNotification('Informe actualizado', 'success');
      setEditOpen(false);
      fetchDetalle(pagina);
    } catch { /* handled by interceptor */ }
    finally { setSaving(false); }
  };

  // ─── handlers nuevo informe ───────────────────────────────────────────────────

  const handleOpenNuevo = async () => {
    if (publicadores.length === 0) {
      try {
        const data = await publicadoresService.getAll();
        setPublicadores(data);
      } catch { /* handled */ }
    }
    setNuevoForm({
      idPublicador: '',
      participo: false,
      cursosBiblicos: 0,
      horas: '',
      observacion: '',
      tipo: TipoPublicador.Publicador,
    });
    setNuevoOpen(true);
  };

  const handleSaveNuevo = async () => {
    if (!nuevoForm.idPublicador) {
      showNotification('Seleccione un publicador', 'warning');
      return;
    }
    if (usaHoras(nuevoForm.tipo) && nuevoForm.participo && nuevoForm.horas === '') {
      showNotification('Las horas son obligatorias para precursores que participaron', 'warning');
      return;
    }
    setCreando(true);
    try {
      const dto: RegistrarInformeDto = {
        idPublicador: nuevoForm.idPublicador,
        ano,
        mes,
        participo: nuevoForm.participo,
        cursosBiblicos: nuevoForm.cursosBiblicos,
        horas: usaHoras(nuevoForm.tipo) && nuevoForm.horas !== '' ? Number(nuevoForm.horas) : undefined,
        observacion: nuevoForm.observacion || undefined,
      };
      await informesService.crear(dto);
      showNotification('Informe registrado', 'success');
      setNuevoOpen(false);
      fetchDetalle(pagina);
    } catch { /* handled by interceptor */ }
    finally { setCreando(false); }
  };

  // ─── handlers eliminar ────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await informesService.eliminar(deletingId);
      showNotification('Informe eliminado', 'success');
      setDeleteOpen(false);
      fetchDetalle(pagina);
    } catch { /* handled by interceptor */ }
    finally { setDeleting(false); }
  };

  // ─── handlers importar ────────────────────────────────────────────────────────

  const handleOpenImport = () => {
    setImportState({
      step: 1,
      ano,
      mes,
      idGrupo: '',
      file: null,
      result: null,
      loading: false,
    });
    setImportOpen(true);
  };

  const handleImportNextStep = () => {
    if (!importState.idGrupo) {
      showNotification('Seleccione un grupo', 'warning');
      return;
    }
    setImportState((s) => ({ ...s, step: 2 }));
  };

  const handleImportSubmit = async () => {
    if (!importState.file) {
      showNotification('Seleccione un archivo', 'warning');
      return;
    }
    setImportState((s) => ({ ...s, loading: true }));
    try {
      const result = await informesService.importar(
        importState.file,
        importState.ano,
        importState.mes,
        importState.idGrupo,
      );
      setImportState((s) => ({ ...s, result, loading: false }));
      fetchDetalle(0);
    } catch {
      setImportState((s) => ({ ...s, loading: false }));
    }
  };

  // ─── handlers template ────────────────────────────────────────────────────────

  const handleDownloadTemplate = async () => {
    if (!templateGrupoId) {
      showNotification('Seleccione un grupo', 'warning');
      return;
    }
    setDownloadingTemplate(true);//AISP
    try {
      await informesService.descargarTemplate(templateGrupoId);
    } catch { /* handled by interceptor */ }
    finally { setDownloadingTemplate(false); }
  };

  // ─── columnas ────────────────────────────────────────────────────────────────

  const columns: GridColDef<InformeMensualDto>[] = [
    { field: 'nombrePublicador', headerName: 'Publicador', flex: 1, minWidth: 180 },
    {
      field: 'nombreGrupo',
      headerName: 'Grupo',
      width: 140,
      renderCell: (p) => (
        <Typography variant="body2" sx={{ color: p.value ? '#1a2027' : '#94a3b8' }}>
          {p.value || 'Sin grupo'}
        </Typography>
      ),
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 170,
      renderCell: (p) => (
        <Chip label={TIPO_LABEL[p.value as number] ?? p.value} size="small" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: 'participo',
      headerName: 'Participó',
      width: 110,
      renderCell: (p) => (
        <Chip
          label={p.value ? 'Sí' : 'No'}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: p.value ? '#e8f5e9' : '#f5f5f5',
            color: p.value ? '#2e7d32' : '#9e9e9e',
            border: `1px solid ${p.value ? '#a5d6a7' : '#e0e0e0'}`,
          }}
        />
      ),
    },
    { field: 'cursosBiblicos', headerName: 'Cursos', width: 90, type: 'number' },
    {
      field: 'horas',
      headerName: 'Horas',
      width: 80,
      type: 'number',
      renderCell: (p) => (
        <Typography variant="body2" sx={{ color: p.value != null ? '#1a2027' : '#94a3b8' }}>
          {p.value != null ? p.value : '—'}
        </Typography>
      ),
    },
    {
      field: 'inactivo',
      headerName: 'Estado',
      width: 95,
      renderCell: (p) => (
        <Chip
          label={p.value ? 'Inactivo' : 'Activo'}
          size="small"
          color={p.value ? 'default' : 'success'}
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(p.row)}
              sx={{ color: '#1976d2', bgcolor: 'rgba(25,118,210,0.08)', '&:hover': { bgcolor: 'rgba(25,118,210,0.16)' } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              onClick={() => { setDeletingId(p.row.idInformeMensual); setDeleteOpen(true); }}
              sx={{ color: '#c62828', bgcolor: 'rgba(198,40,40,0.08)', '&:hover': { bgcolor: 'rgba(198,40,40,0.16)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // ─── opciones select ──────────────────────────────────────────────────────────

  const grupoOptions = [
    { value: '', label: 'Todos los grupos' },
    ...grupos.map((g) => ({ value: g.idGrupo, label: g.nombre })),
  ];
  const grupoOptionsRequired = grupos.map((g) => ({ value: g.idGrupo, label: g.nombre }));
  const publicadorOptions = publicadores.map((p) => ({ value: p.idPublicador, label: p.nombreCompleto }));

  // ─── render ───────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #1565c0, #1976d2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(25,118,210,0.25)',
          }}
        >
          <DescriptionIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ color: '#1a2027' }}>Informes Mensuales</Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>Gestión de informes por período</Typography>
        </Box>
      </Box>

      {/* Filtro año / mes + tabs */}
      <Paper elevation={0} sx={{ mb: 2.5, border: '1px solid rgba(145,158,171,0.12)' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, flexWrap: 'wrap' }}>
          <Box sx={{ width: 140 }}>
            <CustomSelect label="Año" value={ano} options={ANOS_OPTIONS} onChange={(v) => setAno(v as number)} />
          </Box>
          <Box sx={{ width: 170 }}>
            <CustomSelect label="Mes" value={mes} options={MESES_OPTIONS} onChange={(v) => setMes(v as number)} />
          </Box>
        </Box>
        <Divider />
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)} sx={{ px: 2 }}>
          <Tab label="Detalle" />
          <Tab label="Total" />
        </Tabs>
      </Paper>

      {/* ── TAB DETALLE ────────────────────────────────────────────────────────── */}
      {tab === 0 && (
        <Box>
          {/* Toolbar */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ width: 180 }}>
              <CustomSelect
                label="Grupo"
                value={filtroGrupo}
                options={grupoOptions}
                onChange={(v) => setFiltroGrupo(v as string)}
              />
            </Box>
            <Box sx={{ width: 185 }}>
              <CustomSelect
                label="Tipo"
                value={filtroTipo}
                options={TIPO_OPTIONS_FILTRO}
                onChange={(v) => setFiltroTipo(v as string)}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={filtroInactivo}
                  onChange={(e) => setFiltroInactivo(e.target.checked)}
                  size="small"
                />
              }
              label={<Typography variant="body2">Solo inactivos</Typography>}
            />
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => { setTemplateGrupoId(''); setTemplateOpen(true); }}
              >
                Descargar Template
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadFileIcon />}
                onClick={handleOpenImport}
              >
                Importar Excel
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenNuevo}
              >
                Nuevo Informe
              </Button>
            </Box>
          </Box>

          {/* Tabla */}
          <Paper elevation={0} sx={{ border: '1px solid rgba(145,158,171,0.12)' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loadingDetalle}
              getRowId={(r) => r.idInformeMensual}
              rowCount={totalRows}
              paginationMode="server"
              paginationModel={{ page: pagina, pageSize: PAGE_SIZE }}
              onPaginationModelChange={(m) => { setPagina(m.page); fetchDetalle(m.page); }}
              pageSizeOptions={[PAGE_SIZE]}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#e8f0fe', borderBottom: '2px solid #c5d8fc' },
                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#1565c0' },
                '& .MuiDataGrid-row': { transition: 'background-color 0.15s', '&:hover': { backgroundColor: 'rgba(25,118,210,0.035)' } },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f3f8', fontSize: '0.875rem', display: 'flex', alignItems: 'center' },
                '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #f0f3f8', backgroundColor: '#fafbff' },
              }}
            />
          </Paper>
        </Box>
      )}

      {/* ── TAB TOTAL ──────────────────────────────────────────────────────────── */}
      {tab === 1 && (
        <Box>
          {loadingTotal ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : !totalData ? (
            <Alert severity="info">No hay datos para el período seleccionado.</Alert>
          ) : (
            <Box>
              {/* Cards */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    title="Total Publicadores Activos"
                    value={totalData.totalPublicadores}
                    icon={<PeopleOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />}
                    gradient="linear-gradient(135deg,#1565c0,#1976d2)"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    title="Informes — Publicadores"
                    value={totalData.publicadores.cantidadInformes}
                    subtitle={`${totalData.publicadores.cursosBiblicos} curso${totalData.publicadores.cursosBiblicos !== 1 ? 's' : ''} bíblico${totalData.publicadores.cursosBiblicos !== 1 ? 's' : ''}`}
                    icon={<SchoolOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />}
                    gradient="linear-gradient(135deg,#5e35b1,#7e57c2)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    title="Informes — Prec. Auxiliares"
                    value={totalData.precursoresAuxiliares.cantidadInformes}
                    subtitle={`${totalData.precursoresAuxiliares.horas}h · ${totalData.precursoresAuxiliares.cursosBiblicos} cursos`}
                    icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: 24 }} />}
                    gradient="linear-gradient(135deg,#e65100,#f57c00)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    title="Informes — Prec. Regulares"
                    value={totalData.precursoresRegulares.cantidadInformes}
                    subtitle={`${totalData.precursoresRegulares.horas}h · ${totalData.precursoresRegulares.cursosBiblicos} cursos`}
                    icon={<AccessTimeIcon sx={{ color: '#fff', fontSize: 24 }} />}
                    gradient="linear-gradient(135deg,#c62828,#e53935)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    title="Reunión de servicio"
                    value={
                      totalData.promedioReunionEntreSemana.hayReuniones
                        ? `${totalData.promedioReunionEntreSemana.promedio}`
                        : '0'
                    }
                    subtitle={
                      totalData.promedioReunionEntreSemana.hayReuniones
                        ? `${totalData.promedioReunionEntreSemana.cantidadReuniones} reuniones`
                        : undefined
                    }
                    icon={<CalendarTodayIcon sx={{ color: '#fff', fontSize: 24 }} />}
                    gradient="linear-gradient(135deg,#00695c,#00897b)"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <KpiCard
                    title="Reunión publica"
                    value={
                      totalData.promedioReunionFinSemana.hayReuniones
                        ? `${totalData.promedioReunionFinSemana.promedio}`
                        : '0'
                    }
                    subtitle={
                      totalData.promedioReunionFinSemana.hayReuniones
                        ? `${totalData.promedioReunionFinSemana.cantidadReuniones} reuniones`
                        : undefined
                    }
                    icon={<WeekendIcon sx={{ color: '#fff', fontSize: 24 }} />}
                    gradient="linear-gradient(135deg,#0277bd,#0288d1)"
                  />
                </Grid>
              </Grid>

              {/* Pendientes */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: '#1a2027' }}>
                Pendientes del mes
              </Typography>

              {!totalData.pendientes.reunionesRegistradas && (
                <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 1.5 }}>
                  Las reuniones del mes no han sido registradas.
                </Alert>
              )}

              {totalData.pendientes.gruposSinInforme.length > 0 && (
                <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Grupos sin informe ({totalData.pendientes.gruposSinInforme.length}):
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 0.5 }}>
                    {totalData.pendientes.gruposSinInforme.map((g) => (
                      <li key={g}><Typography variant="body2">{g}</Typography></li>
                    ))}
                  </Box>
                </Alert>
              )}

              {Object.keys(totalData.pendientes.publicadoresSinInformePorGrupo).length > 0 && (
                <Box sx={{ mb: 1.5 }}>
                  <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Publicadores sin informe
                    </Typography>
                  </Alert>
                  {Object.entries(totalData.pendientes.publicadoresSinInformePorGrupo).map(
                    ([grupo, publicadores]) => (
                      <Accordion key={grupo} disableGutters sx={{ mb: 0.5, border: '1px solid', borderColor: grupo === 'Sin grupo' ? 'grey.300' : 'warning.light', borderRadius: 1, '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: grupo === 'Sin grupo' ? 'grey.100' : 'warning.50', minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {grupo} ({publicadores.length} pendiente{publicadores.length !== 1 ? 's' : ''})
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ py: 1, px: 2 }}>
                          {publicadores.map((nombre) => (
                            <Typography key={nombre} variant="body2" sx={{ py: 0.25 }}>
                              {nombre}
                            </Typography>
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    )
                  )}
                </Box>
              )}

              {totalData.pendientes.reunionesRegistradas &&
                totalData.pendientes.gruposSinInforme.length === 0 &&
                Object.keys(totalData.pendientes.publicadoresSinInformePorGrupo).length === 0 && (
                  <Alert severity="success">
                    Todos los informes del mes están completos.
                  </Alert>
                )}
            </Box>
          )}
        </Box>
      )}

      {/* ── MODAL EDITAR ─────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Editar Informe</Typography>
            <IconButton size="small" onClick={() => setEditOpen(false)} sx={{ color: '#637381' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {editingInforme && (
            <Box sx={{ pt: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#637381', mb: 2 }}>
                {editingInforme.nombrePublicador} · {TIPO_LABEL[editingInforme.tipo]}
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.participo}
                    onChange={(e) => setEditForm({ ...editForm, participo: e.target.checked })}
                    color="success"
                  />
                }
                label="Participó"
                sx={{ mb: 2 }}
              />

              {!editForm.inactivo && (
                <>
                  <TextField
                    label="Cursos Bíblicos"
                    type="number"
                    value={editForm.cursosBiblicos}
                    onChange={(e) => setEditForm({ ...editForm, cursosBiblicos: Number(e.target.value) })}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    slotProps={{ htmlInput: { min: 0 } }}
                  />

                  {usaHoras(editForm.tipo) && (
                    <TextField
                      label={`Horas${editForm.participo ? ' *' : ''}`}
                      type="number"
                      value={editForm.horas}
                      onChange={(e) => setEditForm({ ...editForm, horas: e.target.value === '' ? '' : Number(e.target.value) })}
                      fullWidth
                      size="small"
                      sx={{ mb: 2 }}
                      slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                    />
                  )}

                  <TextField
                    label="Observación"
                    value={editForm.observacion}
                    onChange={(e) => setEditForm({ ...editForm, observacion: e.target.value })}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={editForm.inactivo}
                    onChange={(e) => setEditForm({ ...editForm, inactivo: e.target.checked })}
                    color="warning"
                  />
                }
                label="Marcar como inactivo"
              />
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} disabled={saving} variant="outlined" color="inherit" sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}>
            Cancelar
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={saving}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL NUEVO INFORME ──────────────────────────────────────────────── */}
      <Dialog open={nuevoOpen} onClose={() => setNuevoOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Nuevo Informe</Typography>
            <IconButton size="small" onClick={() => setNuevoOpen(false)} sx={{ color: '#637381' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            <Autocomplete
              options={publicadorOptions}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              value={publicadorOptions.find((o) => o.value === nuevoForm.idPublicador) ?? null}
              onChange={(_, selected) => {
                const pub = publicadores.find((p) => p.idPublicador === selected?.value);
                setNuevoForm({ ...nuevoForm, idPublicador: selected?.value ?? '', tipo: pub?.tipo ?? TipoPublicador.Publicador });
              }}
              renderInput={(params) => (
                <TextField {...params} label="Publicador" size="small" fullWidth />
              )}
              noOptionsText="Sin resultados"
              clearOnEscape
            />
            <CustomSelect
              label="Tipo"
              value={nuevoForm.tipo}
              options={TIPO_OPTIONS_FORM}
              onChange={(v) => setNuevoForm({ ...nuevoForm, tipo: v as TipoPublicador })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={nuevoForm.participo}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, participo: e.target.checked })}
                  color="success"
                />
              }
              label="Participó"
            />
            <TextField
              label="Cursos Bíblicos"
              type="number"
              value={nuevoForm.cursosBiblicos}
              onChange={(e) => setNuevoForm({ ...nuevoForm, cursosBiblicos: Number(e.target.value) })}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {usaHoras(nuevoForm.tipo) && (
              <TextField
                label={`Horas${nuevoForm.participo ? ' *' : ''}`}
                type="number"
                value={nuevoForm.horas}
                onChange={(e) => setNuevoForm({ ...nuevoForm, horas: e.target.value === '' ? '' : Number(e.target.value) })}
                fullWidth
                size="small"
                slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
              />
            )}
            <TextField
              label="Observación"
              value={nuevoForm.observacion}
              onChange={(e) => setNuevoForm({ ...nuevoForm, observacion: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setNuevoOpen(false)} disabled={creando} variant="outlined" color="inherit" sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}>
            Cancelar
          </Button>
          <Button onClick={handleSaveNuevo} variant="contained" disabled={creando}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── MODAL IMPORTAR EXCEL (2 pasos) ───────────────────────────────────── */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Importar Excel {importState.result ? '— Resultado' : `— Paso ${importState.step} de 2`}
            </Typography>
            <IconButton size="small" onClick={() => setImportOpen(false)} sx={{ color: '#637381' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {/* Resultado */}
          {importState.result && (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                <Card sx={{ flex: 1, border: '1px solid #a5d6a7', bgcolor: '#e8f5e9' }}>
                  <CardContent sx={{ textAlign: 'center', py: '12px !important' }}>
                    <CheckCircleOutlinedIcon sx={{ color: '#2e7d32', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                      {importState.result.exitosos}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#388e3c' }}>Exitosos</Typography>
                  </CardContent>
                </Card>
                <Card sx={{ flex: 1, border: '1px solid #ef9a9a', bgcolor: '#ffebee' }}>
                  <CardContent sx={{ textAlign: 'center', py: '12px !important' }}>
                    <ErrorOutlinedIcon sx={{ color: '#c62828', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ color: '#c62828', fontWeight: 700 }}>
                      {importState.result.fallidos}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#d32f2f' }}>Fallidos</Typography>
                  </CardContent>
                </Card>
              </Box>
              {importState.result.errores.length > 0 && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Errores:</Typography>
                  <List dense disablePadding>
                    {importState.result.errores.map((e, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText primary={e} slotProps={{ primary: { variant: 'body2' } }} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Box>
          )}

          {/* Paso 1 */}
          {!importState.result && importState.step === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    label="Año"
                    value={importState.ano}
                    options={ANOS_OPTIONS}
                    onChange={(v) => setImportState((s) => ({ ...s, ano: v as number }))}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    label="Mes"
                    value={importState.mes}
                    options={MESES_OPTIONS}
                    onChange={(v) => setImportState((s) => ({ ...s, mes: v as number }))}
                  />
                </Box>
              </Box>
              <CustomSelect
                label="Grupo"
                value={importState.idGrupo}
                options={grupoOptionsRequired}
                onChange={(v) => setImportState((s) => ({ ...s, idGrupo: v as string }))}
              />
            </Box>
          )}

          {/* Paso 2 */}
          {!importState.result && importState.step === 2 && (
            <Box sx={{ pt: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#637381', mb: 2 }}>
                Año: <strong>{importState.ano}</strong> · Mes: <strong>{MESES_OPTIONS.find((m) => m.value === importState.mes)?.label}</strong> · Grupo: <strong>{grupos.find((g) => g.idGrupo === importState.idGrupo)?.nombre}</strong>
              </Typography>
              <Paper
                elevation={0}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed rgba(145,158,171,0.32)',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#1976d2', bgcolor: 'rgba(25,118,210,0.03)' },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#637381' }}>
                  {importState.file ? importState.file.name : 'Haz clic para seleccionar el archivo Excel'}
                </Typography>
              </Paper>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setImportState((s) => ({ ...s, file: f }));
                }}
              />
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          {importState.result ? (
            <Button onClick={() => setImportOpen(false)} variant="contained">Cerrar</Button>
          ) : importState.step === 1 ? (
            <>
              <Button onClick={() => setImportOpen(false)} variant="outlined" color="inherit" sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}>Cancelar</Button>
              <Button onClick={handleImportNextStep} variant="contained">Siguiente</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setImportState((s) => ({ ...s, step: 1 }))} variant="outlined" color="inherit" sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}>Atrás</Button>
              <Button onClick={handleImportSubmit} variant="contained" disabled={importState.loading || !importState.file}>
                {importState.loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
                Importar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── MODAL DESCARGAR TEMPLATE ─────────────────────────────────────────── */}
      <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Descargar Template</Typography>
            <IconButton size="small" onClick={() => setTemplateOpen(false)} sx={{ color: '#637381' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ pt: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#637381', mb: 2 }}>
              Seleccione el grupo para descargar la plantilla con los publicadores incluidos.
            </Typography>
            <CustomSelect
              label="Grupo"
              value={templateGrupoId}
              options={grupoOptionsRequired}
              onChange={(v) => setTemplateGrupoId(v as string)}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={() => setTemplateOpen(false)} variant="outlined" color="inherit" sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleDownloadTemplate}
            variant="contained"
            disabled={downloadingTemplate || !templateGrupoId}
            startIcon={downloadingTemplate ? <CircularProgress size={16} /> : <DownloadIcon />}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── CONFIRM ELIMINAR ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={deleteOpen}
        message="¿Está seguro de eliminar este informe? Esta acción no se puede deshacer."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        confirmText="Eliminar"
        loading={deleting}
      />
    </Box>
  );
}
