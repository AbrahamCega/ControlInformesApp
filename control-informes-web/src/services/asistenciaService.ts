import type {
  AsistenciaDto,
  RegistrarAsistenciaDto,
  ActualizarAsistenciaDto,
  RegistrarFechaDto,
  FiltrosAsistenciaListado,
  PagedResult,
} from '../types';
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import apiClient from './apiClient';

export interface ImportarPlantillaResult {
  insertados: number;
  actualizados: number;
  errores?: string[];
}

export const asistenciaService = {
  getListado: (filtros: FiltrosAsistenciaListado) =>
    apiGet<PagedResult<AsistenciaDto>>('/asistencia', filtros as unknown as Record<string, unknown>),

  getById: (id: string) =>
    apiGet<AsistenciaDto>(`/asistencia/${id}`),

  registrar: (dto: RegistrarAsistenciaDto) =>
    apiPost<string>('/asistencia', dto),

  registrarFecha: (dto: RegistrarFechaDto) =>
    apiPost<string>('/asistencia/fecha', dto),

  actualizar: (dto: ActualizarAsistenciaDto) =>
    apiPut<string>(`/asistencia}`, dto),

  eliminar: (id: string) =>
    apiDelete<string>(`/asistencia/${id}`),

  descargarPlantilla: async (): Promise<void> => {
    const response = await apiClient.get('/asistencia/plantilla/excel', {
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_asistencia.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importarPlantilla: async (file: File): Promise<ImportarPlantillaResult> => {
    const formData = new FormData();
    formData.append('archivo', file);
    const response = await apiClient.post('/asistencia/importar/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as ImportarPlantillaResult;
  },

  descargarTarjetaReuniones: async (anoServicio1: number, anoServicio2: number): Promise<void> => {
    const response = await apiClient.get('/asistencia/tarjeta/pdf', {
      params: { anoServicio1, anoServicio2 },
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tarjeta_Reuniones_${anoServicio1}-${anoServicio2}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
