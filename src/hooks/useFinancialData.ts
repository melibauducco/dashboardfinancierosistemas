import { useState, useEffect } from 'react';
import type { RawFinancialRecord, FinancialRecord } from '../types';

const WEBHOOK_URL = 'https://n8n-n8n.hqzrjg.easypanel.host/webhook/6b5bc95c-2a06-46b5-9be8-94a60f93874c';

interface UseFinancialDataReturn {
    data: FinancialRecord[];
    loading: boolean;
    error: string | null;
}

// Mapeo de nombre de mes a número (1-12)
const MES_A_NUMERO: Record<string, number> = {
    'ENERO': 1,
    'FEBRERO': 2,
    'MARZO': 3,
    'ABRIL': 4,
    'MAYO': 5,
    'JUNIO': 6,
    'JULIO': 7,
    'AGOSTO': 8,
    'SEPTIEMBRE': 9,
    'OCTUBRE': 10,
    'NOVIEMBRE': 11,
    'DICIEMBRE': 12,
};

// Convertir un registro crudo en dos registros (Mes y Real)
function normalizeRecord(raw: RawFinancialRecord): FinancialRecord[] {
    try {
        if (!raw || !raw.anio || !raw.mes) {
            return [];
        }

        const mesNumero = MES_A_NUMERO[raw.mes.toUpperCase()] || 1;
        const fecha = new Date(raw.anio, mesNumero - 1, 15); // Día 15 del mes

        const records: FinancialRecord[] = [];

        // Registro de Presupuesto (Mes)
        if (raw.presupuesto !== undefined) {
            records.push({
                rowNumber: raw.row_number * 2,
                fecha,
                tipo: 'Mes',
                categoria: raw.concepto || 'Sin concepto',
                canal: raw.centro_costo || 'Sin centro de costo',
                importe: raw.presupuesto || 0,
                descripcion: `${raw.concepto} - Presupuesto ${raw.mes} ${raw.anio}`,
                variacion: raw.variacion_real_presup,
            });
        }

        // Registro de Gasto Real
        if (raw.real !== undefined) {
            records.push({
                rowNumber: raw.row_number * 2 + 1,
                fecha,
                tipo: 'Real',
                categoria: raw.concepto || 'Sin concepto',
                canal: raw.centro_costo || 'Sin centro de costo',
                importe: raw.real || 0,
                descripcion: `${raw.concepto} - Real ${raw.mes} ${raw.anio}`,
                variacion: raw.variacion_real_presup,
            });
        }

        return records;
    } catch {
        return [];
    }
}

export function useFinancialData(): UseFinancialDataReturn {
    const [data, setData] = useState<FinancialRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(WEBHOOK_URL);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const jsonData = await response.json();

                // El webhook puede devolver { Data: [...], Count: n } o directamente un array
                const rawData: RawFinancialRecord[] = Array.isArray(jsonData)
                    ? jsonData
                    : (jsonData.Data || jsonData.data || []);

                // Normalizar y aplanar (cada registro crudo genera 2 registros)
                const normalizedData = rawData.flatMap(normalizeRecord);

                setData(normalizedData);
            } catch (err) {
                setError('Error al cargar datos del servidor');
                console.error('Error fetching financial data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { data, loading, error };
}
