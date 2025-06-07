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

// Additional utility functions for AI module
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateAge = (birthDate: string | Date): number => {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

export const isWithinDays = (date: string | Date, days: number): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= days;
};
