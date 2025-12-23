import { useState, useMemo } from 'react';
import { useFinancialData } from './hooks/useFinancialData';
import type { Filters } from './types';
import { formatDate, formatCurrency } from './utils/formatters';

import { Header } from './components/Header';
import { FiltersBar } from './components/FiltersBar';
import { KpiCard } from './components/KpiCard';
import { LineChart } from './components/LineChart';
import { CategoryBarChart } from './components/CategoryBarChart';
import { DonutChart } from './components/DonutChart';
import { ChannelBarChart } from './components/ChannelBarChart';
import { TransactionsTable } from './components/TransactionsTable';

import './App.css';

function App() {
  const { data, loading, error } = useFinancialData();

  const [filters, setFilters] = useState<Filters>({
    fechaDesde: null,
    fechaHasta: null,
    tipo: 'Todos',
    cuentas: [],
    canales: [],
    busqueda: ''
  });

  // Obtener opciones para filtros
  const cuentasDisponibles = useMemo(() => {
    const cuentas = new Set(data.map(d => d.categoria));
    return Array.from(cuentas).filter(Boolean).sort();
  }, [data]);

  const canalesDisponibles = useMemo(() => {
    const canales = new Set(data.map(d => d.canal));
    return Array.from(canales).filter(Boolean).sort();
  }, [data]);

  // Aplicar filtros
  const filteredData = useMemo(() => {
    return data.filter(record => {
      // Filtro por fecha desde
      if (filters.fechaDesde && record.fecha < filters.fechaDesde) {
        return false;
      }

      // Filtro por fecha hasta
      if (filters.fechaHasta && record.fecha > filters.fechaHasta) {
        return false;
      }

      // Filtro por tipo
      if (filters.tipo !== 'Todos' && record.tipo !== filters.tipo) {
        return false;
      }

      // Filtro por cuentas contables
      if (filters.cuentas.length > 0 && !filters.cuentas.includes(record.categoria)) {
        return false;
      }

      // Filtro por canales
      if (filters.canales.length > 0 && !filters.canales.includes(record.canal)) {
        return false;
      }

      // Filtro por búsqueda de texto  
      if (filters.busqueda) {
        const searchLower = filters.busqueda.toLowerCase();
        const matchDescripcion = record.descripcion.toLowerCase().includes(searchLower);
        const matchRowNumber = record.rowNumber.toString().includes(filters.busqueda);
        if (!matchDescripcion && !matchRowNumber) {
          return false;
        }
      }

      return true;
    });
  }, [data, filters]);

  // Calcular KPIs
  const kpis = useMemo(() => {
    // Gastos totales (suma absoluta de Real)
    const gastosTotales = filteredData
      .filter(r => r.tipo === 'Real')
      .reduce((sum, r) => sum + Math.abs(r.importe), 0);

    // Calcular Mes totales  
    const mesTotales = filteredData
      .filter(r => r.tipo === 'Mes')
      .reduce((sum, r) => sum + Math.abs(r.importe), 0);

    // Desvíos = Mes - Real (positivo = ahorro, negativo = sobregasto)
    const desvios = mesTotales - gastosTotales;

    // Cuenta contable más rentable (menor gasto real)
    const gastosPorCuenta = filteredData.reduce((acc, r) => {
      if (!acc[r.categoria]) {
        acc[r.categoria] = { mes: 0, real: 0 };
      }
      if (r.tipo === 'Mes') {
        acc[r.categoria].mes += Math.abs(r.importe);
      } else {
        acc[r.categoria].real += Math.abs(r.importe);
      }
      return acc;
    }, {} as Record<string, { mes: number; real: number }>);

    // Encontrar la cuenta con mayor beneficio (mes - real)
    let ccMasRentable = { nombre: 'N/A', importe: 0 };
    Object.entries(gastosPorCuenta).forEach(([cuenta, valores]) => {
      const beneficio = valores.mes - valores.real;
      if (beneficio > ccMasRentable.importe) {
        ccMasRentable = { nombre: cuenta, importe: beneficio };
      }
    });

    // Número de operaciones
    const numeroOperaciones = filteredData.length;

    // Ticket medio
    const ticketMedio = numeroOperaciones > 0
      ? gastosTotales / filteredData.filter(r => r.tipo === 'Real').length
      : 0;

    return {
      gastosTotales,
      desvios,
      ccMasRentable,
      numeroOperaciones,
      ticketMedio
    };
  }, [filteredData]);

  // Calcular rango de fechas para mostrar
  const rangoFechas = useMemo(() => {
    if (filteredData.length === 0) return 'Sin datos';

    const fechas = filteredData.map(r => r.fecha.getTime());
    const minFecha = new Date(Math.min(...fechas));
    const maxFecha = new Date(Math.max(...fechas));

    return `${formatDate(minFecha)} - ${formatDate(maxFecha)}`;
  }, [filteredData]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p className="error-text">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-container">
        <Header rangoFechas={rangoFechas} />

        <FiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          cuentasDisponibles={cuentasDisponibles}
          canalesDisponibles={canalesDisponibles}
        />

        <div className="kpis-grid">
          <KpiCard
            titulo="Gastos Totales"
            valor={formatCurrency(kpis.gastosTotales)}
            subtitulo="Suma de gastos reales"
            icono="💰"
            variante="default"
          />
          <KpiCard
            titulo="Desvíos"
            valor={formatCurrency(kpis.desvios)}
            subtitulo={kpis.desvios >= 0 ? 'Por debajo del presupuesto' : 'Por encima del presupuesto'}
            icono={kpis.desvios >= 0 ? '📉' : '📈'}
            variante={kpis.desvios >= 0 ? 'success' : 'danger'}
          />
          <KpiCard
            titulo="C.C Más Rentable"
            valor={kpis.ccMasRentable.nombre}
            subtitulo={`Ahorro: ${formatCurrency(kpis.ccMasRentable.importe)}`}
            icono="🏆"
            variante="info"
          />
          <KpiCard
            titulo="Operaciones"
            valor={kpis.numeroOperaciones.toString()}
            subtitulo={`Ticket medio: ${formatCurrency(kpis.ticketMedio)}`}
            icono="📊"
            variante="default"
          />
        </div>

        <div className="charts-grid">
          <LineChart data={filteredData} />
          <CategoryBarChart data={filteredData} />
        </div>

        <div className="charts-grid" style={{ marginTop: '1.5rem' }}>
          <DonutChart data={filteredData} />
          <ChannelBarChart data={filteredData} />
        </div>

        <TransactionsTable data={filteredData} />
      </div>
    </div>
  );
}

export default App;
