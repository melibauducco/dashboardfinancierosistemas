// Tipo de dato crudo del webhook (NUEVO ESQUEMA)
export interface RawFinancialRecord {
    row_number: number;
    anio: number;
    mes: string;
    centro_costo: string;
    concepto: string;
    presupuesto: number;
    real: number;
    variacion_real_presup: number;
    variacion_mes_anterior: number;
    proyeccion_rem: number;
}

// Tipo normalizado para uso interno
export interface FinancialRecord {
    rowNumber: number;
    fecha: Date;
    tipo: "Mes" | "Real";
    categoria: string;
    canal: string;
    importe: number;
    descripcion: string;
    variacion?: number;
}

// Tipo para filtros
export interface Filters {
    fechaDesde: Date | null;
    fechaHasta: Date | null;
    tipo: string;
    cuentas: string[];
    canales: string[];
    busqueda: string;
}

// Tipo para KPIs
export interface KpiData {
    gastosTotales: number;
    desvios: number;
    ccMasRentable: { nombre: string; importe: number };
    numeroOperaciones: number;
    ticketMedio: number;
}
