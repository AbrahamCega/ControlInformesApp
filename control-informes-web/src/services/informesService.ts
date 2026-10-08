import type {
  InformeMensualDto,
  RegistrarInformeDto,
  ActualizarInformeDto,
  TotalInformeDto,
  ResultadoImportacionDto,
  FiltrosInformeListado,
  PagedResult,
} from '../types';
import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData, apiGetBlob } from './apiClient';

export const informesService = {
  getListado: (filtros: FiltrosInformeListado) =>
    apiGet<PagedResult<InformeMensualDto>>('/informes', filtros as unknown as Record<string, unknown>),

  getTotal: (ano: number, mes: number) =>
    apiGet<TotalInformeDto>('/informes/total', { ano, mes }),

  crear: (dto: RegistrarInformeDto) =>
    apiPost<string>('/informes', dto),

  actualizar: (id: string, dto: ActualizarInformeDto) =>
    apiPut<string>(`/informes/${id}`, dto),

  eliminar: (id: string) =>
    apiDelete<string>(`/informes/${id}`),

  importar: (file: File, ano: number, mes: number, idGrupo: string) => {
    const formData = new FormData();
    formData.append('archivo', file);
    return apiPostFormData<ResultadoImportacionDto>(
      `/informes/importar?ano=${ano}&mes=${mes}&idGrupo=${idGrupo}`,
      formData
    );
  },

  descargarTemplate: async (idGrupo: string) => {
    const blob = await apiGetBlob(`/informes/template/${idGrupo}`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template_informes.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
