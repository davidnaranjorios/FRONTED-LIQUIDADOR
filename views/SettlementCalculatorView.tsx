import React, { useState, useRef } from 'react';
import { CalculatorIcon, FileUploadIcon, PlusCircleIcon, SpinnerIcon, TrashIcon } from '../components/Icons';
import { SettlementForm, Payment, DueDate, Sanction, Results } from '../types';
import { processSettlement } from '../services/settlementEngine';
import { parseExcelFile } from '../services/excelService';
import ResultsDisplay from '../components/ResultsDisplay';

const initialDueDate: DueDate = {
    periodo: '',
    anio: new Date().getFullYear(),
    valor_inicial: 0,
    fecha_vencimiento: '',
    hasSancion: false,
    sancion: {
        fecha_presentacion: '',
        tipo: 'Privada',
        valor_inicial: 0,
    }
};

const initialFormState: SettlementForm = {
    nit: '',
    razon_social: '',
    concepto: 'Renta',
    hasMultipleDueDates: false,
    dueDates: [initialDueDate],
};

const conceptos = ['Renta', 'Renta CREE', 'Ventas', 'Consumo', 'Retención', 'Retención CREE', 'Patrimonio', 'Riqueza', 'GMF', 'Sanción', 'Otros'];
const tasaTipos = ['TASA DIAN', 'ART. 91 LEY 2277', 'ART 45 LEY 2155', 'ART 48 LEY 2155', 'ART 120 LEY 2010'];


export const SettlementCalculatorView: React.FC = () => {
    const [formData, setFormData] = useState<SettlementForm>(initialFormState);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [results, setResults] = useState<Results | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({ ...prev, [name]: checked !== undefined ? checked : value }));
    };

    const handleDueDateChange = (index: number, field: keyof DueDate, value: any) => {
        const newDueDates = [...formData.dueDates];
        (newDueDates[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, dueDates: newDueDates }));
    };

    const handleSanctionChange = (index: number, field: keyof Sanction, value: any) => {
        const newDueDates = [...formData.dueDates];
        (newDueDates[index].sancion as any)[field] = value;
        setFormData(prev => ({ ...prev, dueDates: newDueDates }));
    };

    const handlePaymentChange = (index: number, field: keyof Payment, value: any) => {
        const newPayments = [...payments];
        (newPayments[index] as any)[field] = value;
        setPayments(newPayments);
    };

    const addPayment = () => {
        setPayments([...payments, { fecha: '', valor: 0, tipo_tasa: 'TASA DIAN' }]);
    };
    
    const removePayment = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const newPayments = await parseExcelFile(file);
                setPayments(prev => [...prev, ...newPayments]);
                setError(null);
            } catch (err) {
                setError('Error al procesar el archivo Excel. Asegúrate que las columnas son "fecha" y "valor".');
                console.error(err);
            }
        }
    };

    const handleCalculate = () => {
        setIsLoading(true);
        setError(null);
        setResults(null);
        try {
            // Basic Validation
            if (!formData.nit || !formData.razon_social) {
                throw new Error("Por favor, completa la información del contribuyente.");
            }
            if (payments.length === 0) {
                throw new Error("Debes añadir al menos un pago.");
            }
            const res = processSettlement(formData, payments);
            setResults(res);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // UI Rendering
    return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Liquidador de Impuestos</h1>
            <p className="text-lg text-gray-600">Ingresa los datos para calcular la liquidación de impuestos, intereses y sanciones.</p>
        </div>

        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">1. Información del Contribuyente</h2>
            <div className="grid md:grid-cols-3 gap-4">
                <Input label="NIT" name="nit" value={formData.nit} onChange={handleFormChange} />
                <Input label="Razón Social" name="razon_social" value={formData.razon_social} onChange={handleFormChange} />
                <Select label="Concepto" name="concepto" value={formData.concepto} onChange={handleFormChange} options={conceptos} />
            </div>

            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">2. Configuración de Vencimientos</h2>
             <div className="flex items-center gap-4">
                <label className="font-medium">¿Tiene más de 1 vencimiento?</label>
                <div className="flex items-center gap-4">
                    <Radio name="hasMultipleDueDates" label="No" checked={!formData.hasMultipleDueDates} onChange={() => setFormData(p => ({...p, hasMultipleDueDates: false, dueDates: [initialDueDate]}))} />
                    <Radio name="hasMultipleDueDates" label="Sí (2)" checked={formData.hasMultipleDueDates} onChange={() => setFormData(p => ({...p, hasMultipleDueDates: true, dueDates: [initialDueDate, initialDueDate]}))} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {formData.dueDates.map((dueDate, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50/80 space-y-4">
                         <h3 className="font-bold text-lg text-indigo-700">Vencimiento {index + 1}</h3>
                         <div className="grid sm:grid-cols-2 gap-4">
                            <Input label="Periodo" value={dueDate.periodo} onChange={e => handleDueDateChange(index, 'periodo', e.target.value)} />
                            <Input label="Año" type="number" value={dueDate.anio} onChange={e => handleDueDateChange(index, 'anio', parseInt(e.target.value))} />
                         </div>
                         <Input label="Fecha de Vencimiento" type="date" value={dueDate.fecha_vencimiento} onChange={e => handleDueDateChange(index, 'fecha_vencimiento', e.target.value)} />
                         <Input label="Valor Inicial Impuesto" type="number" value={dueDate.valor_inicial} onChange={e => handleDueDateChange(index, 'valor_inicial', parseFloat(e.target.value))} />
                         
                         <div className="flex items-center gap-4 pt-2">
                             <label className="font-medium">¿Tiene sanción?</label>
                             <div className="flex items-center gap-4">
                                <Radio name={`hasSancion-${index}`} label="No" checked={!dueDate.hasSancion} onChange={() => handleDueDateChange(index, 'hasSancion', false)} />
                                <Radio name={`hasSancion-${index}`} label="Sí" checked={dueDate.hasSancion} onChange={() => handleDueDateChange(index, 'hasSancion', true)} />
                            </div>
                         </div>
                         {dueDate.hasSancion && (
                             <div className="p-3 bg-indigo-50 rounded-md space-y-4 border border-indigo-200">
                                <Input label="Fecha Presentación Sanción" type="date" value={dueDate.sancion.fecha_presentacion} onChange={e => handleSanctionChange(index, 'fecha_presentacion', e.target.value)} />
                                <Select label="Tipo de Sanción" value={dueDate.sancion.tipo} onChange={e => handleSanctionChange(index, 'tipo', e.target.value)} options={['Privada', 'Oficial']} />
                                <Input label="Valor Inicial Sanción" type="number" value={dueDate.sancion.valor_inicial} onChange={e => handleSanctionChange(index, 'valor_inicial', parseFloat(e.target.value))} />
                             </div>
                         )}
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">3. Pagos</h2>
            <div className="space-y-3">
                {payments.map((payment, index) => (
                    <div key={index} className="grid md:grid-cols-4 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                        <Input label={`Fecha Pago ${index+1}`} type="date" value={payment.fecha} onChange={e => handlePaymentChange(index, 'fecha', e.target.value)} noLabel />
                        <Input label={`Monto Pago ${index+1}`} type="number" value={payment.valor} onChange={e => handlePaymentChange(index, 'valor', parseFloat(e.target.value))} noLabel />
                        <Select label={`Tipo Tasa ${index+1}`} value={payment.tipo_tasa} onChange={e => handlePaymentChange(index, 'tipo_tasa', e.target.value)} options={tasaTipos} noLabel />
                        <button onClick={() => removePayment(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full bg-red-100/50 hover:bg-red-100 transition-colors">
                            <TrashIcon className="w-5 h-5 mx-auto" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-4">
                 <button onClick={addPayment} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    <PlusCircleIcon className="w-5 h-5" />
                    Añadir Pago
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    <FileUploadIcon className="w-5 h-5" />
                    Cargar desde Excel
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
            </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-end">
            <button
                onClick={handleCalculate}
                disabled={isLoading}
                className="flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 w-full md:w-auto"
            >
                {isLoading ? <><SpinnerIcon className="w-6 h-6 animate-spin" /> Procesando...</> : <><CalculatorIcon className="w-6 h-6" /> Calcular Liquidación</>}
            </button>
        </div>
        
        {/* Error and Results Section */}
        {error && <div className="mt-6 bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg">{error}</div>}
        {results && <ResultsDisplay results={results} />}
    </div>
    );
};

// Helper components for form inputs
const Input: React.FC<{label: string, name?: string, type?: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, noLabel?: boolean}> = 
({ label, name, type = 'text', value, onChange, noLabel }) => (
    <div>
        {!noLabel && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <input type={type} name={name} value={value} onChange={onChange} placeholder={noLabel ? label : ''}
               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

const Select: React.FC<{label: string, name?: string, value: any, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], noLabel?: boolean}> = 
({ label, name, value, onChange, options, noLabel }) => (
     <div>
        {!noLabel && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select name={name} value={value} onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const Radio: React.FC<{name: string, label: string, checked: boolean, onChange: () => void}> = 
({ name, label, checked, onChange }) => (
    <label className="flex items-center gap-2">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
        <span className="text-gray-800">{label}</span>
    </label>
);
