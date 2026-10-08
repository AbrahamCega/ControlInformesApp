import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  Collapse,
} from '@mui/material';
import {
  PersonOutlineRounded,
  LockOutlined,
  Visibility,
  VisibilityOff,
  LoginRounded,
  InfoOutlined,
} from '@mui/icons-material';

interface LoginFormInputs {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormInputs) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const schema = yup.object({
  username: yup.string().required('El usuario es requerido'),
  password: yup.string().required('La contraseña es requerida'),
});

export default function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const handleFormSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    await onSubmit(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      sx={{ width: '100%' }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{textAlign:'center' ,fontWeight: 700, fontSize: 28, color: '#1a1a2e', mb: 0.75, letterSpacing: '-0.5px' }}
        >
          Bienvenido
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#6b7280' }}>
          Ingresa tus credenciales para continuar
        </Typography>
      </Box>

      {/* Error alert */}
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 500 } }}>
          {error}
        </Alert>
      </Collapse>

      {/* Username */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.75 }}>
          Usuario
        </Typography>
        <TextField
          {...register('username')}
          fullWidth
          autoFocus
          autoComplete="username"
          placeholder="nombre.apellido"
          error={!!errors.username}
          helperText={errors.username?.message}
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#e5e7eb' },
              '&:hover fieldset': { borderColor: '#2563eb' },
              '&.Mui-focused fieldset': { borderColor: '#2563eb' },
            },
          }}
          slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineRounded sx={{ color: '#2563eb', fontSize: 20 }} />
              </InputAdornment>
            ),
          } }}
        />
      </Box>

      {/* Password */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            Contrasena
          </Typography>
          <Typography
            component="span"
            sx={{ fontSize: 13, color: '#2563eb', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          >
            Olvidaste tu contrasena?
          </Typography>
        </Box>
        <TextField
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          fullWidth
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          disabled={isLoading}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: '#fff',
              '& fieldset': { borderColor: '#e5e7eb' },
              '&:hover fieldset': { borderColor: '#2563eb' },
              '&.Mui-focused fieldset': { borderColor: '#2563eb' },
            },
          }}
          slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlined sx={{ color: '#2563eb', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                  disabled={isLoading}
                  size="small"
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                </IconButton>
              </InputAdornment>
            ),
          } }}
        />
      </Box>

      {/* Submit button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={!isValid || isLoading}
        endIcon={isLoading ? null : <LoginRounded />}
        sx={{
          py: 1.5,
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '1rem',
          bgcolor: '#2563eb',
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover:not(:disabled)': { bgcolor: '#1d4ed8', boxShadow: 'none' },
          '&:active': { bgcolor: '#1e40af' },
        }}
      >
        {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Iniciar sesion'}
      </Button>

      {/* Divider */}
      <Box sx={{ my: 3, height: '1px', bgcolor: '#e5e7eb' }} />

      {/* Footer */}
      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 0.75 }}>
          <InfoOutlined sx={{ fontSize: 14, color: '#6b7280' }} />
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.5px' }}>
            SISTEMA DE GESTION INTERNO
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
          <LockOutlined sx={{ fontSize: 13, color: '#ef4444' }} />
          <Typography sx={{ fontSize: 12, color: '#ef4444', fontWeight: 500 }}>
            Acceso restringido
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
