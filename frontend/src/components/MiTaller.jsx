import React, { useState, useEffect } from 'react';

export default function MiTaller({ creatorId }) {
    const [stats, setStats] = useState({
        totalSalesCount: 0,
        totalRoyalties: 0,
        storeCredit: 0,
        designs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Simulación de llamada a nuestra API usando el id_creador
        // fetch(`/api/creators/${creatorId}/dashboard`)
        const fetchDashboardData = async () => {
            // Mock Data que vendría de sumar las filas en la tabla 'Sale' de Prisma
            setTimeout(() => {
                setStats({
                    totalSalesCount: 84,
                    totalRoyalties: 378.00, // Dinero líquido
                    storeCredit: 120.00,    // Saldo para comprar en tienda
                    designs: [
                        { id: '1', title: 'Soporte Auriculares Sci-Fi', sales: 50, commission: 225.00 },
                        { id: '2', title: 'Engranaje Decorativo', sales: 34, commission: 153.00 },
                    ]
                });
                setLoading(false);
            }, 800);
        };

        fetchDashboardData();
    }, [creatorId]);

    if (loading) return <div style={{ padding: '40px' }}>Cargando Mi Taller...</div>;

    return (
        <div className="taller-dashboard" style={styles.container}>
            <h1 style={styles.header}>Mi Taller</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>Panel de estadísticas y regalías de tus diseños</p>

            {/* Top Cards */}
            <div style={styles.cardContainer}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Piezas Vendidas</h3>
                    <p style={styles.cardNumber}>{stats.totalSalesCount}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Ganancias en Efectivo</h3>
                    <p style={{ ...styles.cardNumber, color: '#10b981' }}>${stats.totalRoyalties.toFixed(2)}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Saldo en NewRev</h3>
                    <p style={{ ...styles.cardNumber, color: '#3b82f6' }}>${stats.storeCredit.toFixed(2)}</p>
                </div>
            </div>

            {/* Lista de Diseños */}
            <h2 style={{ marginTop: '40px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Mis Modelos Producidos</h2>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.trHeading}>
                        <th style={styles.th}>Nombre del Diseño</th>
                        <th style={styles.th}>Unidades Vendidas</th>
                        <th style={styles.th}>Ganado (Royalties)</th>
                        <th style={styles.th}>Propiedad Intelectual</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.designs.map(design => (
                        <tr key={design.id} style={styles.tr}>
                            <td style={styles.td}><strong>{design.title}</strong></td>
                            <td style={styles.td}>{design.sales} ud.</td>
                            <td style={styles.td}>${design.commission.toFixed(2)}</td>
                            <td style={styles.td}><span style={styles.badge}>🔒 Bóveda Segura</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Acciones Financieras */}
            <div style={styles.actions}>
                <button style={styles.btnPrimary}>Retirar Efectivo (PayPal)</button>
                <button style={styles.btnSecondary}>Canjear Saldo por Piezas Físicas</button>
            </div>
        </div>
    );
}

// Estilos
const styles = {
    container: { padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' },
    header: { fontSize: '2.5rem', marginBottom: '5px' },
    cardContainer: { display: 'flex', gap: '20px' },
    card: { padding: '24px', background: '#f8fafc', borderRadius: '12px', flex: 1, border: '1px solid #e2e8f0' },
    cardTitle: { margin: 0, fontSize: '1rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
    cardNumber: { margin: '15px 0 0 0', fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
    trHeading: { textAlign: 'left', borderBottom: '2px solid #cbd5e1' },
    th: { padding: '16px 12px', color: '#475569', fontWeight: '600' },
    tr: { borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' },
    td: { padding: '16px 12px', color: '#334155' },
    badge: { background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 'bold' },
    actions: { marginTop: '40px', display: 'flex', gap: '15px' },
    btnPrimary: { padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
    btnSecondary: { padding: '12px 24px', background: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
};
