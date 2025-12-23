import './KpiCard.css';

interface KpiCardProps {
    titulo: string;
    valor: string;
    subtitulo?: string;
    icono?: string;
    variante?: 'default' | 'success' | 'danger' | 'info';
}

export function KpiCard({
    titulo,
    valor,
    subtitulo,
    icono,
    variante = 'default'
}: KpiCardProps) {
    return (
        <div className={`kpi-card kpi-card--${variante}`}>
            <div className="kpi-header">
                {icono && <span className="kpi-icon">{icono}</span>}
                <span className="kpi-titulo">{titulo}</span>
            </div>
            <div className="kpi-valor">{valor}</div>
            {subtitulo && <div className="kpi-subtitulo">{subtitulo}</div>}
        </div>
    );
}
