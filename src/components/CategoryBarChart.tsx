import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { FinancialRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import './Charts.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface CategoryBarChartProps {
    data: FinancialRecord[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
    // Agrupar por categoría (Cuenta Contable)
    const groupedByCategory = data.reduce((acc, record) => {
        if (!acc[record.categoria]) {
            acc[record.categoria] = { mes: 0, real: 0 };
        }
        if (record.tipo === 'Mes') {
            acc[record.categoria].mes += Math.abs(record.importe);
        } else {
            acc[record.categoria].real += Math.abs(record.importe);
        }
        return acc;
    }, {} as Record<string, { mes: number; real: number }>);

    const categories = Object.keys(groupedByCategory);

    const chartData = {
        labels: categories,
        datasets: [
            {
                label: 'Mes (Presupuestado)',
                data: categories.map(cat => groupedByCategory[cat].mes),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
                borderRadius: 4,
            },
            {
                label: 'Real (Ejecutado)',
                data: categories.map(cat => groupedByCategory[cat].real),
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                borderColor: 'rgb(168, 85, 247)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#a1a1aa',
                    font: { size: 12 },
                },
            },
            title: {
                display: true,
                text: 'Gastos por Cuenta Contable',
                color: '#fafafa',
                font: { size: 16, weight: 'bold' as const },
            },
            tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                titleColor: '#fafafa',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(99, 102, 241, 0.5)',
                borderWidth: 1,
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#a1a1aa',
                    maxRotation: 45,
                    minRotation: 45,
                },
                grid: { color: 'rgba(63, 63, 70, 0.5)' },
            },
            y: {
                ticks: {
                    color: '#a1a1aa',
                    callback: function (value: any) {
                        return formatCurrency(value);
                    },
                },
                grid: { color: 'rgba(63, 63, 70, 0.5)' },
            },
        },
    };

    return (
        <div className="chart-container">
            <Bar data={chartData} options={options} />
        </div>
    );
}
