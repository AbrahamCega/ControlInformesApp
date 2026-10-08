import { useState, useEffect } from 'react';
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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import { grupoService } from '../../services/grupoService';
import { useNotificationStore } from '../../stores/notificationStore';
import type { MiembroGrupoDto } from '../../types';

interface Props {
  open: boolean;
  idGrupo: string;
  nombreGrupo?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuitarMiembrosModal({ open, idGrupo, nombreGrupo, onClose, onSuccess }: Props) {
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [miembros, setMiembros] = useState<MiembroGrupoDto[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !idGrupo) return;
    setLoading(true);
    grupoService
      .getMiembros(idGrupo)
      .then((data) => {
        setMiembros(data);
        setChecked(data.map((m) => m.idPublicador));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, idGrupo]);

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = async () => {
    const aQuitar = miembros
      .filter((m) => !checked.includes(m.idPublicador))
      .map((m) => m.idPublicador);

    if (aQuitar.length === 0) {
      showNotification('No hay publicadores seleccionados para quitar', 'warning');
      return;
    }

    setSaving(true);
    try {
      await grupoService.quitarPublicadores({ idGrupo, idPublicadores: aQuitar });
      const n = aQuitar.length;
      showNotification(`${n} publicador${n > 1 ? 'es' : ''} quitado${n > 1 ? 's' : ''} del grupo`, 'success');
      onSuccess();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const aQuitar = miembros.filter((m) => !checked.includes(m.idPublicador)).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ color: '#1565c0', fontSize: 22 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Miembros del Grupo
              </Typography>
              {nombreGrupo && (
                <Typography variant="caption" sx={{ color: '#637381' }}>
                  {nombreGrupo}
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#637381' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : miembros.length === 0 ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            Este grupo no tiene miembros asignados.
          </Alert>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 1.5 }}>
              Desmarca los publicadores que deseas quitar del grupo. El capitán no puede ser quitado.
            </Typography>
            <List dense disablePadding sx={{ maxHeight: 340, overflow: 'auto' }}>
              {miembros.map((m) => {
                const isChecked = checked.includes(m.idPublicador);
                const isCapitan = m.esCapitan;
                return (
                  <ListItem
                    key={m.idPublicador}
                    disablePadding
                    onClick={() => !isCapitan && toggle(m.idPublicador)}
                    sx={{
                      cursor: isCapitan ? 'default' : 'pointer',
                      borderRadius: 1.5,
                      mb: 0.5,
                      px: 1,
                      opacity: isCapitan ? 0.7 : 1,
                      bgcolor: !isChecked
                        ? 'rgba(198,40,40,0.06)'
                        : 'transparent',
                      '&:hover': {
                        bgcolor: isCapitan
                          ? 'transparent'
                          : !isChecked
                          ? 'rgba(198,40,40,0.1)'
                          : 'rgba(25,118,210,0.05)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        checked={isChecked}
                        disabled={isCapitan}
                        size="small"
                        onChange={() => !isCapitan && toggle(m.idPublicador)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m.nombreCompleto}</span>
                          {isCapitan && (
                            <Chip
                              icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                              label="Capitán"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.68rem',
                                bgcolor: 'rgba(25,118,210,0.1)',
                                color: '#1565c0',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#1565c0' },
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={m.tipoDescripcion}
                    slotProps={{ secondary: { sx: { fontSize: '0.75rem', color: '#637381' } } }}
                     
                    />
                  </ListItem>
                );
              })}
            </List>
            {aQuitar > 0 && (
              <Typography variant="caption" sx={{ color: '#c62828', display: 'block', mt: 1.5 }}>
                {aQuitar} publicador{aQuitar > 1 ? 'es' : ''} será{aQuitar > 1 ? 'n' : ''} quitado{aQuitar > 1 ? 's' : ''} del grupo.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={saving}
          variant="outlined"
          color="inherit"
          sx={{ color: '#637381', borderColor: 'rgba(145,158,171,0.32)' }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="error"
          disabled={saving || loading || miembros.length === 0 || aQuitar === 0}
          sx={{ minWidth: 100 }}
        >
          {saving && <CircularProgress size={14} sx={{ mr: 1, color: 'inherit' }} />}
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
