export interface Holiday {
  name: string;
  date: Date;
}

/** Día `n` (1 = primero) del día de la semana `weekday` (0 = domingo) en el mes dado. */
function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

/** Último día de la semana `weekday` del mes dado. */
function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

/** Si el feriado cae en sábado se observa el viernes; si cae en domingo, el lunes. */
function observed(date: Date): Date {
  const result = new Date(date);
  if (result.getDay() === 6) {
    result.setDate(result.getDate() - 1);
  } else if (result.getDay() === 0) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

/** Feriados federales de EE. UU. (fecha observada) de un año. */
export function usFederalHolidays(year: number): Holiday[] {
  return [
    { name: 'Año Nuevo', date: observed(new Date(year, 0, 1)) },
    { name: 'Día de Martin Luther King Jr.', date: nthWeekday(year, 0, 1, 3) },
    { name: 'Día de los Presidentes', date: nthWeekday(year, 1, 1, 3) },
    { name: 'Memorial Day', date: lastWeekday(year, 4, 1) },
    { name: 'Juneteenth', date: observed(new Date(year, 5, 19)) },
    { name: 'Día de la Independencia', date: observed(new Date(year, 6, 4)) },
    { name: 'Labor Day', date: nthWeekday(year, 8, 1, 1) },
    { name: 'Día de Colón', date: nthWeekday(year, 9, 1, 2) },
    { name: 'Día de los Veteranos', date: observed(new Date(year, 10, 11)) },
    { name: 'Día de Acción de Gracias', date: nthWeekday(year, 10, 4, 4) },
    { name: 'Navidad', date: observed(new Date(year, 11, 25)) },
  ];
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Devuelve el feriado federal observado en esa fecha, o `null` si no hay ninguno. */
export function usHolidayOn(date: Date): Holiday | null {
  const key = dateKey(date);
  // El Año Nuevo del año siguiente puede observarse el 31 de diciembre.
  const candidates = [...usFederalHolidays(date.getFullYear()), ...usFederalHolidays(date.getFullYear() + 1)];
  return candidates.find((holiday) => dateKey(holiday.date) === key) ?? null;
}
