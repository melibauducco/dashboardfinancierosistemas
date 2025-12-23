import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { FinancialRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import './Charts.css';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

interface DonutChartProps {
    data: FinancialRecord[];
}

export function DonutChart({ data }: DonutChartProps) {
    // Solo considerar registros de tipo Real
    const realData = data.filter(record => record.tipo === 'Real');

    // Agrupar por categoría
    const groupedByCategory = realData.reduce((acc, record) => {
        if (!acc[record.categoria]) {
            acc[record.categoria] = 0;
        }
        acc[record.categoria] += Math.abs(record.importe);
        return acc;
    }, {} as Record<string, number>);

    const categories = Object.keys(groupedByCategory);
    const values = categories.map(cat => groupedByCategory[cat]);
    const total = values.reduce((sum, val) => sum + val, 0);

    const colors = [
        'rgba(99, 102, 241, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(34, 197, 94, 0.8)',
    ];

    const chartData = {
        labels: categories,
        datasets: [
            {
                data: values,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: colors.slice(0, categories.length).map(c => c.replace('0.8', '1')),
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#a1a1aa',
                    font: { size: 11 },
                    padding: 15,
                    usePointStyle: true,
                },
            },
            title: {
                display: true,
                text: 'Distribución de Gastos Reales',
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
                        const value = context.raw;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="chart-container chart-container--donut">
            <Doughnut data={chartData} options={options} />
        </div>
    );
}
