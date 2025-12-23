import './Header.css';

interface HeaderProps {
    rangoFechas: string;
}

export function Header({ rangoFechas }: HeaderProps) {
    return (
        <header className="dashboard-header">
            <div className="header-left">
                <h1 className="header-title">Dashboard Financiero Agencia IA</h1>
                <p className="header-subtitle">Cuentas Contables, gastos y métricas clave</p>
            </div>
            <div className="header-right">
                <div className="fecha-rango">
                    <span className="fecha-label">Período:</span>
                    <span className="fecha-value">{rangoFechas}</span>
                </div>
            </div>
        </header>
    );
}
