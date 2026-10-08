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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { publicadoresService } from '../../services/publicadoresService';
import { grupoService } from '../../services/grupoService';
import { useNotificationStore } from '../../stores/notificationStore';
import type { PublicadorDto } from '../../types';
import { TipoPublicador } from '../../types';

const TIPO_LABEL: Record<number, string> = {
  [TipoPublicador.Publicador]: 'Publicador',
  [TipoPublicador.NoBautizado]: 'No Bautizado',
  [TipoPublicador.PrecursorAuxiliar]: 'Precursor Auxiliar',
  [TipoPublicador.PrecursorRegular]: 'Precursor Regular',
};

interface AsignarPublicadoresModalProps {
  open: boolean;
  idGrupo: string;
  nombreGrupo?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AsignarPublicadoresModal({
  open,
  idGrupo,
  nombreGrupo,
  onClose,
  onSuccess,
}: AsignarPublicadoresModalProps) {
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [publicadores, setPublicadores] = useState<PublicadorDto[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !idGrupo) return;
    setSelected([]);
    setLoading(true);
    publicadoresService
      .getSinGrupo()
      .then(setPublicadores)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, idGrupo]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = async () => {
    if (selected.length === 0) {
      showNotification('Seleccione al menos un publicador', 'warning');
      return;
    }
    setSaving(true);
    try {
      await grupoService.asignarPublicadores({ idGrupo, idPublicadores: selected });
      const n = selected.length;
      showNotification(`${n} publicador${n > 1 ? 'es' : ''} asignado${n > 1 ? 's' : ''}`, 'success');
      onSuccess();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon sx={{ color: '#2e7d32', fontSize: 22 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Asignar Publicadores
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
        ) : publicadores.length === 0 ? (
          <Alert severity="info" sx={{ mt: 1 }}>
            No hay publicadores sin grupo disponibles para asignar.
          </Alert>
        ) : (
          <>
            <Typography variant="caption" sx={{ color: '#637381', display: 'block', mb: 1.5 }}>
              Seleccionados: {selected.length} / {publicadores.length}
            </Typography>
            <List dense disablePadding sx={{ maxHeight: 340, overflow: 'auto' }}>
              {publicadores.map((p) => (
                <ListItem
                  key={p.idPublicador}
                  disablePadding
                  onClick={() => toggle(p.idPublicador)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    mb: 0.5,
                    px: 1,
                    bgcolor: selected.includes(p.idPublicador)
                      ? 'rgba(25,118,210,0.08)'
                      : 'transparent',
                    '&:hover': { bgcolor: 'rgba(25,118,210,0.05)' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      checked={selected.includes(p.idPublicador)}
                      size="small"
                      onChange={() => toggle(p.idPublicador)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={p.nombreCompleto}
                    secondary={TIPO_LABEL[p.tipo] ?? ''}
                    slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: 500 } }, secondary: { sx: { fontSize: '0.75rem', color: '#637381' } } }}
                   
                   
                  />
                </ListItem>
              ))}
            </List>
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
          color="success"
          disabled={saving || loading || publicadores.length === 0}
        >
          Asignar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
