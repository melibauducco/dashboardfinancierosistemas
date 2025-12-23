import { parse, format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

// Parsear fecha de string dd/MM/yyyy a Date
export function parseDate(dateStr: string | undefined | null): Date {
    if (!dateStr || typeof dateStr !== 'string') {
        return new Date(); // Default to current date if invalid
    }
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    return isValid(parsed) ? parsed : new Date();
}

// Formatear Date a string dd/MM/yyyy
export function formatDate(date: Date): string {
    return format(date, 'dd/MM/yyyy', { locale: es });
}

// Formatear número como pesos argentinos
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Formatear número con separador de miles
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('es-AR').format(num);
}
