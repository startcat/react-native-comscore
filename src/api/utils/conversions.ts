// Convertir segundos a milisegundos
export const secondsToMs = (seconds: number): number => seconds * 1000;

// Convertir minutos a milisegundos
export const minutesToMs = (minutes: number): number => minutes * 60 * 1000;

// Convertir porcentaje a decimal
export const percentageToDecimal = (percentage: number): number =>
  percentage / 100;
