import { useState, useMemo } from 'react';
import type { FinancialRecord } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';
import './TransactionsTable.css';

interface TransactionsTableProps {
    data: FinancialRecord[];
}

type SortField = 'fecha' | 'tipo' | 'categoria' | 'canal' | 'importe' | 'descripcion';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export function TransactionsTable({ data }: TransactionsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<SortField>('fecha');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Calcular desvíos por categoría
    const desviosPorCategoria = useMemo(() => {
        const grouped = data.reduce((acc, record) => {
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

        return Object.entries(grouped).reduce((acc, [cat, values]) => {
            acc[cat] = values.mes - values.real;
            return acc;
        }, {} as Record<string, number>);
    }, [data]);

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'fecha':
                    comparison = a.fecha.getTime() - b.fecha.getTime();
                    break;
                case 'tipo':
                    comparison = a.tipo.localeCompare(b.tipo);
                    break;
                case 'categoria':
                    comparison = a.categoria.localeCompare(b.categoria);
                    break;
                case 'canal':
                    comparison = a.canal.localeCompare(b.canal);
                    break;
                case 'importe':
                    comparison = a.importe - b.importe;
                    break;
                case 'descripcion':
                    comparison = a.descripcion.localeCompare(b.descripcion);
                    break;
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [data, sortField, sortDirection]);

    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return '↕';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const getDesvio = (categoria: string) => {
        return desviosPorCategoria[categoria] || 0;
    };

    return (
        <div className="table-container">
            <h3 className="table-title">Detalle de Transacciones</h3>

            <div className="table-wrapper">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('fecha')}>
                                Fecha <span className="sort-icon">{getSortIcon('fecha')}</span>
                            </th>
                            <th onClick={() => handleSort('tipo')}>
                                Tipo <span className="sort-icon">{getSortIcon('tipo')}</span>
                            </th>
                            <th onClick={() => handleSort('categoria')}>
                                Cuenta Contable <span className="sort-icon">{getSortIcon('categoria')}</span>
                            </th>
                            <th onClick={() => handleSort('canal')}>
                                Canal <span className="sort-icon">{getSortIcon('canal')}</span>
                            </th>
                            <th onClick={() => handleSort('importe')}>
                                Importe ($) <span className="sort-icon">{getSortIcon('importe')}</span>
                            </th>
                            <th onClick={() => handleSort('descripcion')}>
                                Descripción <span className="sort-icon">{getSortIcon('descripcion')}</span>
                            </th>
                            <th>Desvío</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((record) => {
                            const desvio = getDesvio(record.categoria);
                            return (
                                <tr key={record.rowNumber} className={record.tipo === 'Real' ? 'row-real' : 'row-mes'}>
                                    <td>{formatDate(record.fecha)}</td>
                                    <td>
                                        <span className={`badge badge-${record.tipo.toLowerCase()}`}>
                                            {record.tipo}
                                        </span>
                                    </td>
                                    <td>{record.categoria}</td>
                                    <td>{record.canal}</td>
                                    <td className={record.importe < 0 ? 'importe-negativo' : 'importe-positivo'}>
                                        {formatCurrency(record.importe)}
                                    </td>
                                    <td className="descripcion-cell">{record.descripcion}</td>
                                    <td>
                                        <span className={`badge-desvio ${desvio >= 0 ? 'desvio-positivo' : 'desvio-negativo'}`}>
                                            {desvio >= 0 ? '▼' : '▲'} {formatCurrency(Math.abs(desvio))}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                >
                    ««
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    «
                </button>

                <span className="pagination-info">
                    Página {currentPage} de {totalPages} ({sortedData.length} registros)
                </span>

                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    »
                </button>
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    »»
                </button>
            </div>
        </div>
    );
}
