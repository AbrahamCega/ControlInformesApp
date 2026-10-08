import type {
  PublicadorDto,
  PublicadorGrupoDto,
  TarjetaPublicadorDto,
  CrearPublicadorDto,
  ActualizarPublicadorDto,
  FiltroPublicadorGrupoDto,
  ResultadoImportacionTarjetasDto,
  PagedResult,
} from '../types';
import { TipoResumenPublicador } from '../types';
import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './apiClient';
import apiClient from './apiClient';

export const publicadoresService = {
  getAll: () =>
    apiGet<PublicadorDto[]>('/publicadores'),

  getSinGrupo: () =>
    apiGet<PublicadorDto[]>('/publicadores/sin-grupo'),

  getListado: (filtros: FiltroPublicadorGrupoDto) =>
    apiGet<PagedResult<PublicadorGrupoDto>>('/publicadores/listado', filtros as unknown as Record<string, unknown>),

  getById: (id: string) =>
    apiGet<PublicadorDto>(`/publicadores/${id}`),

  getTarjeta: (id: string, anoServicio?: number) =>
    apiGet<TarjetaPublicadorDto>(`/publicadores/${id}/tarjeta`, anoServicio ? { anoServicio } : undefined),

  crear: (dto: CrearPublicadorDto) =>
    apiPost<string>('/publicadores', dto),

  actualizar: (id: string, dto: ActualizarPublicadorDto) =>
    apiPut<string>(`/publicadores/${id}`, dto),

  eliminar: (id: string) =>
    apiDelete<string>(`/publicadores/${id}`),

  importarTarjetas: (archivos: File[], idGrupo?: string): Promise<ResultadoImportacionTarjetasDto> => {
    const formData = new FormData();
    archivos.forEach((archivo) => formData.append('archivos', archivo));
    const url = idGrupo
      ? `/publicadores/importar-tarjetas?idGrupo=${idGrupo}`
      : '/publicadores/importar-tarjetas';
    return apiPostFormData<ResultadoImportacionTarjetasDto>(url, formData);
  },

  descargarTarjetaPdf: async (idPublicador: string, anoServicio: number, nombrePublicador: string): Promise<void> => {
    const response = await apiClient.get(`/publicadores/${idPublicador}/tarjeta/pdf`, {
      params: { anoServicio },
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombrePublicador} - ${anoServicio}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  descargarTarjetasPorGrupo: async (idGrupo: string, anoServicio: number, nombreGrupo: string): Promise<void> => {
    const response = await apiClient.get(`/publicadores/grupo/${idGrupo}/tarjetas/pdf`, {
      params: { anoServicio },
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tarjetas ${nombreGrupo} ${anoServicio}-${anoServicio + 1}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  descargarTarjetaResumen: async (anoServicio: number, tipo: TipoResumenPublicador): Promise<void> => {
    const NOMBRES: Record<TipoResumenPublicador, string> = {
      [TipoResumenPublicador.Publicador]: `Publicadores_${anoServicio}.pdf`,
      [TipoResumenPublicador.PrecursorAuxiliar]: `Precursores_Auxiliares_${anoServicio}.pdf`,
      [TipoResumenPublicador.PrecursorRegular]: `Precursores_Regulares_${anoServicio}.pdf`,
    };
    const response = await apiClient.get('/publicadores/tarjeta-resumen/pdf', {
      params: { anoServicio, tipo },
      responseType: 'blob',
    });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = NOMBRES[tipo];
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
