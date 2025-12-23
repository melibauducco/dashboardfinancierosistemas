import type { Filters } from '../types';
import './FiltersBar.css';

interface FiltersBarProps {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
    cuentasDisponibles: string[];
    canalesDisponibles: string[];
}

export function FiltersBar({
    filters,
    onFiltersChange,
    cuentasDisponibles,
    canalesDisponibles
}: FiltersBarProps) {

    const handleFechaDesdeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onFiltersChange({
            ...filters,
            fechaDesde: value ? new Date(value) : null
        });
    };

    const handleFechaHastaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onFiltersChange({
            ...filters,
            fechaHasta: value ? new Date(value) : null
        });
    };

    const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFiltersChange({
            ...filters,
            tipo: e.target.value
        });
    };

    const handleCuentasChange = (cuenta: string) => {
        const nuevasCuentas = filters.cuentas.includes(cuenta)
            ? filters.cuentas.filter(c => c !== cuenta)
            : [...filters.cuentas, cuenta];
        onFiltersChange({
            ...filters,
            cuentas: nuevasCuentas
        });
    };

    const handleCanalesChange = (canal: string) => {
        const nuevosCanales = filters.canales.includes(canal)
            ? filters.canales.filter(c => c !== canal)
            : [...filters.canales, canal];
        onFiltersChange({
            ...filters,
            canales: nuevosCanales
        });
    };

    const handleBusquedaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange({
            ...filters,
            busqueda: e.target.value
        });
    };

    const limpiarFiltros = () => {
        onFiltersChange({
            fechaDesde: null,
            fechaHasta: null,
            tipo: 'Todos',
            cuentas: [],
            canales: [],
            busqueda: ''
        });
    };

    const formatDateForInput = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="filters-bar">
            <div className="filters-row">
                <div className="filter-group">
                    <label className="filter-label">Desde</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={formatDateForInput(filters.fechaDesde)}
                        onChange={handleFechaDesdeChange}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">Hasta</label>
                    <input
                        type="date"
                        className="filter-input"
                        value={formatDateForInput(filters.fechaHasta)}
                        onChange={handleFechaHastaChange}
                    />
                </div>

                <div className="filter-group">
                    <label className="filter-label">Tipo</label>
                    <select
                        className="filter-select"
                        value={filters.tipo}
                        onChange={handleTipoChange}
                    >
                        <option value="Todos">Todos</option>
                        <option value="Mes">Mes</option>
                        <option value="Real">Real</option>
                    </select>
                </div>

                <div className="filter-group filter-group-wide">
                    <label className="filter-label">Buscar (Descripción / #)</label>
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Buscar..."
                        value={filters.busqueda}
                        onChange={handleBusquedaChange}
                    />
                </div>

                <button className="filter-clear-btn" onClick={limpiarFiltros}>
                    Limpiar
                </button>
            </div>

            <div className="filters-row filters-row-multi">
                <div className="filter-group-multi">
                    <label className="filter-label">Cuentas Contables</label>
                    <div className="multi-select-container">
                        {cuentasDisponibles.map(cuenta => (
                            <label key={cuenta} className="multi-select-option">
                                <input
                                    type="checkbox"
                                    checked={filters.cuentas.includes(cuenta)}
                                    onChange={() => handleCuentasChange(cuenta)}
                                />
                                <span className="checkbox-label">{cuenta}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-group-multi">
                    <label className="filter-label">Canales</label>
                    <div className="multi-select-container">
                        {canalesDisponibles.map(canal => (
                            <label key={canal} className="multi-select-option">
                                <input
                                    type="checkbox"
                                    checked={filters.canales.includes(canal)}
                                    onChange={() => handleCanalesChange(canal)}
                                />
                                <span className="checkbox-label">{canal}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
