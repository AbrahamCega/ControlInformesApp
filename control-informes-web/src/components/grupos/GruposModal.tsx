import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import { grupoService } from '../../services/grupoService';
import { publicadoresService } from '../../services/publicadoresService';
import { useNotificationStore } from '../../stores/notificationStore';
import ConfirmDialog from '../ConfirmDialog';
import CustomSelect from '../CustomSelect';
import AsignarPublicadoresModal from './AsignarPublicadoresModal';
import type { GrupoDto, CrearGrupoDto, ActualizarGrupoDto, PublicadorDto } from '../../types';

interface GruposModalProps {
  open: boolean;
  onClose: () => void;
}

interface GrupoFormState {
  nombre: string;
  idCapitan: string;
}

const emptyForm: GrupoFormState = { nombre: '', idCapitan: '' };

export default function GruposModal({ open, onClose }: GruposModalProps) {
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [grupos, setGrupos] = useState<GrupoDto[]>([]);
  const [publicadores, setPublicadores] = useState<PublicadorDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GrupoFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [asignarOpen, setAsignarOpen] = useState(false);
  const [asignarGrupoId, setAsignarGrupoId] = useState('');

  const fetchGrupos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await grupoService.getAll();
      setGrupos(data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicadores = useCallback(async () => {
    try {
      const data = await publicadoresService.getAll();
      setPublicadores(data);
    } catch {
      // handled by interceptor
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchGrupos();
      fetchPublicadores();
    }
  }, [open, fetchGrupos, fetchPublicadores]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (grupo: GrupoDto) => {
    setEditingId(grupo.idGrupo);
    setForm({ nombre: grupo.nombre, idCapitan: grupo.idCapitan });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim()) {
      showNotification('El nombre es requerido', 'warning');
      return;
    }
    if (!form.idCapitan) {
      showNotification('El capitán es requerido', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const dto: ActualizarGrupoDto = { idGrupo: editingId, nombre: form.nombre, idCapitan: form.idCapitan };
        await grupoService.actualizar(dto);
        showNotification('Grupo actualizado', 'success');
      } else {
        const dto: CrearGrupoDto = { nombre: form.nombre, idCapitan: form.idCapitan };
        await grupoService.crear(dto);
        showNotification('Grupo creado', 'success');
      }
      setFormOpen(false);
      fetchGrupos();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await grupoService.eliminar(deletingId);
      showNotification('Grupo eliminado', 'success');
      setDeleteOpen(false);
      fetchGrupos();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const capitanOptions = publicadores.map((p) => ({
    value: p.idPublicador,
    label: p.nombreCompleto,
  }));

  return (
    <>
      {/* Modal principal — listado de grupos */}
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1565c0, #1976d2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupIcon sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Grupos
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
              >
                Nuevo Grupo
              </Button>
              <IconButton size="small" onClick={onClose} sx={{ color: '#637381' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, minHeight: 200 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : grupos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                No hay grupos registrados
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e8f0fe' }}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#1565c0',
                      }}
                    >
                      Nombre
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#1565c0',
                      }}
                    >
                      Capitán
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#1565c0',
                      }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grupos.map((g) => (
                    <TableRow key={g.idGrupo} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{g.nombre}</TableCell>
                      <TableCell sx={{ color: '#637381' }}>{g.nombreCapitan}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Asignar publicadores">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setAsignarGrupoId(g.idGrupo);
                                setAsignarOpen(true);
                              }}
                              sx={{
                                color: '#2e7d32',
                                bgcolor: 'rgba(46,125,50,0.08)',
                                '&:hover': { bgcolor: 'rgba(46,125,50,0.16)' },
                              }}
                            >
                              <PersonAddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(g)}
                              sx={{
                                color: '#1976d2',
                                bgcolor: 'rgba(25,118,210,0.08)',
                                '&:hover': { bgcolor: 'rgba(25,118,210,0.16)' },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setDeletingId(g.idGrupo);
                                setDeleteOpen(true);
                              }}
                              sx={{
                                color: '#c62828',
                                bgcolor: 'rgba(198,40,40,0.08)',
                                '&:hover': { bgcolor: 'rgba(198,40,40,0.16)' },
                              }}
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
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sub-dialog: formulario crear/editar grupo */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {editingId ? 'Editar Grupo' : 'Nuevo Grupo'}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setFormOpen(false)}
              sx={{ color: '#637381' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1.5 }}>
            <TextField
              label="Nombre del grupo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              fullWidth
              autoFocus
              placeholder="Ej. Grupo Norte"
            />
            <CustomSelect
              label="Capitán"
              value={form.idCapitan}
              options={capitanOptions}
              onChange={(val) => setForm({ ...form, idCapitan: val as string })}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button
            onClick={() => setFormOpen(false)}
            disabled={saving}
            variant="outlined"
            color="inherit"
            sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={saving}>
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={deleteOpen}
        message="¿Está seguro de eliminar este grupo? Los publicadores asignados quedarán sin grupo."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        confirmText="Eliminar"
        loading={deleting}
      />

      {/* Modal asignar publicadores */}
      <AsignarPublicadoresModal
        open={asignarOpen}
        idGrupo={asignarGrupoId}
        onClose={() => setAsignarOpen(false)}
        onSuccess={() => {
          setAsignarOpen(false);
          fetchGrupos();
        }}
      />
    </>
  );
}
