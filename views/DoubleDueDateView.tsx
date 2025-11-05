
import React from 'react';
import { ExplanationCard, CodeBlock } from '../components/ExplanationCard';
import { ArrowRightIcon, CalculatorIcon, CheckCircleIcon, LightBulbIcon } from '../components/Icons';

export const DoubleDueDateView: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Escenario: Doble Vencimiento con Múltiples Pagos</h2>
                <p className="text-gray-600">Esta lógica es manejada por la función <code className="text-sm font-semibold bg-gray-200 text-gray-800 px-1 py-0.5 rounded">procesar_pagos_doble_vencimiento</code>. Está diseñada para casos donde una obligación tributaria se divide en dos cuotas, cada una con su propia fecha de vencimiento (V1 y V2).</p>
            </div>

            <ExplanationCard title="Inicialización" icon={<CheckCircleIcon className="w-6 h-6" />}>
                <p>La función comienza con los valores iniciales de impuesto y sanción para ambas fechas de vencimiento (V1 y V2), junto con una lista de pagos. Rastrea los saldos de cada obligación por separado.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><code className="text-sm">saldo_v1_impuesto</code>, <code className="text-sm">saldo_v1_sancion</code></li>
                    <li><code className="text-sm">saldo_v2_impuesto</code>, <code className="text-sm">saldo_v2_sancion</code></li>
                </ul>
            </ExplanationCard>

            <ExplanationCard title="Procesamiento Principal" icon={<CalculatorIcon className="w-6 h-6" />}>
                <p>Similar al escenario de vencimiento único, esta función itera a través de cada pago. Sin embargo, los cálculos son más complejos ya que debe considerar el estado de ambas obligaciones.</p>
                 <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                    <div className="p-3 bg-blue-100 rounded-lg font-semibold">1. Calcular Deuda Total</div>
                    <ArrowRightIcon className="w-6 h-6 text-gray-400 hidden md:block" />
                    <div className="p-3 bg-green-100 rounded-lg font-semibold">2. Calcular Proporciones</div>
                    <ArrowRightIcon className="w-6 h-6 text-gray-400 hidden md:block" />
                    <div className="p-3 bg-yellow-100 rounded-lg font-semibold">3. Asignar Pago</div>
                </div>
            </ExplanationCard>
            
            <ExplanationCard title="Paso 1: Cálculo de la Deuda Total en la Fecha de Pago" icon={<LightBulbIcon className="w-6 h-6" />}>
                <p>
                    Antes de distribuir el pago, la función calcula la deuda total de ambas obligaciones <span className="font-bold">a la fecha de pago</span>. Esto implica:
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>
                        <strong>Cálculo de Intereses:</strong> Se calculan los intereses para V1 (si su fecha de vencimiento ha pasado) y para V2 (si su fecha de vencimiento ha pasado) sobre sus respectivos saldos de impuesto pendientes.
                    </li>
                    <li>
                        <strong>Actualización de Sanciones:</strong> Las sanciones para V1 y V2 se actualizan con el IPC, de manera similar a la lógica de vencimiento único. Cada sanción se actualiza de forma independiente según su propia fecha de vencimiento.
                    </li>
                </ul>
                <CodeBlock>
{`
# Lógica simplificada para encontrar los componentes de la deuda total
# Cálculos V1
dias_mora_v1 = (fecha_pago - v1_fecha).days
intereses_v1_periodo_actual = calcular_interes_mora(saldo_v1_impuesto, ...)
saldo_v1_sancion = redondear_sancion_update_abajo(incremento_ipc_compuesto(...))

# Cálculos V2 (si aplica)
if fecha_pago > v2_fecha:
    dias_mora_v2 = (fecha_pago - v2_fecha).days
    intereses_v2_periodo_actual = calcular_interes_mora(saldo_v2_impuesto, ...)
    saldo_v2_sancion = redondear_sancion_update_abajo(incremento_ipc_compuesto(...))

# Suma total
Impuesto_Total_Periodo = saldo_v1_impuesto + saldo_v2_impuesto
Intereses_Total_Periodo = intereses_v1_periodo_actual + intereses_v2_periodo_actual
Sanciones_Total_Periodo = saldo_v1_sancion + saldo_v2_sancion
`}
                </CodeBlock>
            </ExplanationCard>
            
            <ExplanationCard title="Paso 2 y 3: Asignación Proporcional del Pago" icon={<LightBulbIcon className="w-6 h-6" />}>
                <p>
                    Una vez que se conoce la deuda total actual (Impuesto + Intereses + Sanción), se calcula un factor de proporcionalidad. Este factor determina el <span className="font-bold">monto total</span> que debe asignarse a cada categoría (Impuesto Total, Intereses Totales, Sanción Total).
                </p>
                <p>
                    El pago se asigna entonces con una prioridad estricta:
                </p>
                <ol className="list-decimal list-inside space-y-2 font-semibold">
                    <li>Primero, al monto de <span className="text-blue-700">Impuesto Total Proporcional</span> (pagando primero el impuesto de V1, luego el de V2).</li>
                    <li>Segundo, al monto de <span className="text-green-700">Intereses Totales Proporcionales</span>.</li>
                    <li>Tercero, al monto de <span className="text-yellow-700">Sanción Total Proporcional</span> (distribuido proporcionalmente entre las sanciones de V1 y V2).</li>
                </ol>
                <CodeBlock>
{`
# Lógica de asignación simplificada
# 1. Asignar a Impuesto (V1 primero)
amount_to_allocate_impuesto = min(monto_pago, proportional_impuesto_total_pago)
# ... lógica para pagar v1_impuesto y luego v2_impuesto

# 2. Asignar a Intereses
amount_to_allocate_intereses = min(monto_pago_restante, proportional_intereses_total_pago)

# 3. Asignar a Sanción
amount_to_allocate_sancion = min(monto_pago_restante, proportional_sanciones_total_pago)
# ... lógica para distribuir entre v1_sancion y v2_sancion
`}
                </CodeBlock>
                 <p className="mt-2">
                    Una distinción importante aquí es que, a diferencia del escenario de vencimiento único, los intereses <span className="font-bold">no se acumulan</span> como un saldo corriente. Se calculan de nuevo para cada período de pago, y cualquier porción no cubierta por el pago se condona efectivamente para ese período. Los saldos pendientes de impuesto y sanción se actualizan para la siguiente iteración.
                </p>
            </ExplanationCard>
        </div>
    );
};