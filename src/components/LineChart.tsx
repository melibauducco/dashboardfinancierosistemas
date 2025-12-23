import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import type { FinancialRecord } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';
import './Charts.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface LineChartProps {
    data: FinancialRecord[];
}

export function LineChart({ data }: LineChartProps) {
    // Agrupar datos por fecha
    const groupedByDate = data.reduce((acc, record) => {
        const dateKey = formatDate(record.fecha);
        if (!acc[dateKey]) {
            acc[dateKey] = { mes: 0, real: 0 };
        }
        if (record.tipo === 'Mes') {
            acc[dateKey].mes += Math.abs(record.importe);
        } else {
            acc[dateKey].real += Math.abs(record.importe);
        }
        return acc;
    }, {} as Record<string, { mes: number; real: number }>);

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
    });

    const chartData = {
        labels: sortedDates,
        datasets: [
            {
                label: 'Mes (Presupuestado)',
                data: sortedDates.map(date => groupedByDate[date].mes),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Real (Ejecutado)',
                data: sortedDates.map(date => groupedByDate[date].real),
                borderColor: 'rgb(168, 85, 247)',
                backgroundColor: 'rgba(168, 85, 247, 0.5)',
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                text: 'Evolución Temporal',
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
                ticks: { color: '#a1a1aa' },
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
            <Line data={chartData} options={options} />
        </div>
    );
}
