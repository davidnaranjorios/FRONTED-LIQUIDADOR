import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Results, SingleDueDateHistory, DoubleDueDateHistory } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
};

const ResultsDisplay: React.FC<{ results: Results }> = ({ results }) => {
    
    const isSingleDueDate = (results.history as any[]).every(h => h.hasOwnProperty('impuesto_saldo'));

    const chartLabels = results.history.map((_, index) => `Pago ${index + 1}`);
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Saldo Impuesto',
                data: results.history.map(h => (h as any).impuesto_saldo ?? ((h as any).v1_impuesto_saldo + (h as any).v2_impuesto_saldo)),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Saldo Intereses',
                data: results.history.map(h => (h as any).intereses_saldo ?? 0), // No hay saldo de interes en doble vencimiento
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Saldo Sanción',
                data: results.history.map(h => (h as any).sancion_saldo ?? ((h as any).v1_sancion_saldo + (h as any).v2_sancion_saldo)),
                borderColor: 'rgb(245, 158, 11)',
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                yAxisID: 'y',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Evolución de Saldos por Pago' },
        },
        scales: { y: { beginAtZero: true } }
    };

    return (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Resultados de la Liquidación</h2>
            
            {/* Chart */}
            <div className="p-4 border rounded-lg bg-gray-50/50">
                <Line options={chartOptions} data={chartData} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Historial de Pagos</h3>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        {isSingleDueDate ? <SingleDateHeader /> : <DoubleDateHeader />}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isSingleDueDate 
                            ? (results.history as SingleDueDateHistory[]).map((row, i) => <SingleDateRow key={i} row={row} />)
                            : (results.history as DoubleDueDateHistory[]).map((row, i) => <DoubleDateRow key={i} row={row} />)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Th: React.FC<{children: React.ReactNode}> = ({children}) => <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{children}</th>
const Td: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => <td className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 ${className}`}>{children}</td>

// Single Due Date Table Components
const SingleDateHeader = () => (
    <tr>
        <Th>Fecha Pago</Th>
        <Th>Abono Impuesto</Th>
        <Th>Abono Intereses</Th>
        <Th>Abono Sanción</Th>
        <Th>Saldo Impuesto</Th>
        <Th>Saldo Intereses</Th>
        <Th>Saldo Sanción</Th>
    </tr>
);

const SingleDateRow: React.FC<{row: SingleDueDateHistory}> = ({row}) => (
    <tr>
        <Td>{row.fecha_pago}</Td>
        <Td>{formatCurrency(row.impuesto_proporcion)}</Td>
        <Td>{formatCurrency(row.intereses_proporcion)}</Td>
        <Td>{formatCurrency(row.sancion_proporcion)}</Td>
        <Td className="font-semibold bg-blue-50">{formatCurrency(row.impuesto_saldo)}</Td>
        <Td className="font-semibold bg-red-50">{formatCurrency(row.intereses_saldo)}</Td>
        <Td className="font-semibold bg-yellow-50">{formatCurrency(row.sancion_saldo)}</Td>
    </tr>
);

// Double Due Date Table Components
const DoubleDateHeader = () => (
     <tr>
        <Th>Fecha Pago</Th>
        <Th>Monto Pago</Th>
        <Th>Abono Imp. V1</Th>
        <Th>Abono Imp. V2</Th>
        <Th>Abono Sanc. V1</Th>
        <Th>Abono Sanc. V2</Th>
        <Th>Total Pago Interés</Th>
        <Th>Saldo Imp. Total</Th>
        <Th>Saldo Sanc. Total</Th>
    </tr>
);

const DoubleDateRow: React.FC<{row: DoubleDueDateHistory}> = ({row}) => (
    <tr>
        <Td>{row.fecha_pago}</Td>
        <Td>{formatCurrency(row.monto_pago)}</Td>
        <Td>{formatCurrency(row.v1_impuesto_pago)}</Td>
        <Td>{formatCurrency(row.v2_impuesto_pago)}</Td>
        <Td>{formatCurrency(row.v1_sancion_pago)}</Td>
        <Td>{formatCurrency(row.v2_sancion_pago)}</Td>
        <Td>{formatCurrency(row.intereses_total_pago)}</Td>
        <Td className="font-semibold bg-blue-50">{formatCurrency(row.v1_impuesto_saldo + row.v2_impuesto_saldo)}</Td>
        <Td className="font-semibold bg-yellow-50">{formatCurrency(row.v1_sancion_saldo + row.v2_sancion_saldo)}</Td>
    </tr>
);


export default ResultsDisplay;
