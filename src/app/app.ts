import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { usHolidayOn } from './us-holidays';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected startDate = '';
  protected weeks: number | null = null;
  protected readonly result = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected calculateDate(): void {
    this.error.set(null);
    this.result.set(null);

    if (!this.startDate || this.weeks === null || !Number.isInteger(this.weeks) || this.weeks < 0) {
      this.error.set('Introduce una fecha y un número entero de semanas igual o mayor que cero.');
      return;
    }

    const [year, month, day] = this.startDate.split('-').map(Number);
    const calculatedDate = new Date(year, month - 1, day);
    calculatedDate.setDate(calculatedDate.getDate() + this.weeks * 7);

    this.result.set(new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(calculatedDate));
  }

  protected diffStartDate = '';
  protected diffEndDate = '';
  protected readonly diffResult = signal<number | null>(null);
  protected readonly diffError = signal<string | null>(null);

  protected calculateDaysBetween(): void {
    this.diffError.set(null);
    this.diffResult.set(null);

    if (!this.diffStartDate || !this.diffEndDate) {
      this.diffError.set('Introduce ambas fechas para calcular la diferencia.');
      return;
    }

    const [startYear, startMonth, startDay] = this.diffStartDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = this.diffEndDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.round((end.getTime() - start.getTime()) / msPerDay);

    this.diffResult.set(Math.abs(days));
  }

  protected diffWorkStartDate = '';
  protected diffWorkDays: number | null = null;
  protected readonly diffWorkResult = signal<string | null>(null);
  protected readonly diffWorkError = signal<string | null>(null);
  protected readonly skippedHolidays = signal<string[]>([]);

  protected calculateWorkDaysBetween(): void {
    this.diffWorkError.set(null);
    this.diffWorkResult.set(null);
    this.skippedHolidays.set([]);

    if (!this.diffWorkStartDate || this.diffWorkDays === null || !Number.isInteger(this.diffWorkDays) || this.diffWorkDays < 0) {
      this.diffWorkError.set('Introduce una fecha y un número entero de días hábiles igual o mayor que cero.');
      return;
    }

    const [year, month, day] = this.diffWorkStartDate.split('-').map(Number);
    const current = new Date(year, month - 1, day);
    const skipped: string[] = [];
    const shortFormat = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    let remaining = this.diffWorkDays;

    while (remaining > 0) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      const holiday = usHolidayOn(current);
      if (holiday) {
        skipped.push(`${holiday.name} (${shortFormat.format(current)})`);
        continue;
      }
      remaining--;
    }

    this.skippedHolidays.set(skipped);
    this.diffWorkResult.set(new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(current));
  }
}
