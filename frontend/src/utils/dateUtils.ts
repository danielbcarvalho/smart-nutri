import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Formata uma data string para o formato dd/MM/yyyy, ajustando para o fuso horário local
 * @param dateString - A data em formato string
 * @returns A data formatada no padrão brasileiro
 */
export const formatDateToLocal = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const localDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    return format(localDate, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
};

/**
 * Converte uma data local para UTC antes de enviar para o backend
 * @param dateString - A data em formato string
 * @returns A data formatada no padrão yyyy-MM-dd em UTC
 */
export const formatDateToUTC = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return format(utcDate, "yyyy-MM-dd");
  } catch {
    return dateString;
  }
};
