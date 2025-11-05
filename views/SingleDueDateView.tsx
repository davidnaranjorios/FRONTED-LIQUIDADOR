
import React from 'react';
import { ExplanationCard, CodeBlock } from '../components/ExplanationCard';
import { ArrowRightIcon, CalculatorIcon, CheckCircleIcon, LightBulbIcon } from '../components/Icons';

export const SingleDueDateView: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Escenario: Vencimiento Único con Múltiples Pagos</h2>
                <p className="text-gray-600">Esta lógica es manejada por la clase <code className="text-sm font-semibold bg-gray-200 text-gray-800 px-1 py-0.5 rounded">MotorLiquidacion</code>. Procesa una serie de pagos contra una única obligación tributaria que tiene una sola fecha de vencimiento.</p>
            </div>

            <ExplanationCard title="Inicialización (__init__)" icon={<CheckCircleIcon className="w-6 h-6" />}>
                <p>El proceso comienza creando una instancia de la clase, cargando todos los datos necesarios para un caso tributario específico. Esto incluye:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Valores iniciales de impuesto y sanción.</li>
                    <li>Fechas de vencimiento y presentación.</li>
                    <li>Una lista de pagos realizados por el contribuyente.</li>
                    <li>Datos de referencia para tasas de interés (tasas DIAN) e inflación (IPC).</li>
                </ul>
            </ExplanationCard>

            <ExplanationCard title="Procesamiento Principal (método procesar)" icon={<CalculatorIcon className="w-6 h-6" />}>
                <p>El método <code className="text-sm bg-gray-200 px-1 rounded">procesar</code> itera a través de cada pago en orden cronológico. Para cada pago, realiza una serie de cálculos para determinar el estado de la deuda en ese momento.</p>
                <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                    <div className="p-3 bg-blue-100 rounded-lg font-semibold">1. Calcular Intereses</div>
                    <ArrowRightIcon className="w-6 h-6 text-gray-400 hidden md:block" />
                    <div className="p-3 bg-green-100 rounded-lg font-semibold">2. Actualizar Sanción</div>
                    <ArrowRightIcon className="w-6 h-6 text-gray-400 hidden md:block" />
                    <div className="p-3 bg-yellow-100 rounded-lg font-semibold">3. Distribuir Pago</div>
                </div>
            </ExplanationCard>

            <ExplanationCard title="Paso 1: Cálculo de Intereses de Mora" icon={<LightBulbIcon className="w-6 h-6" />}>
                <p>
                    Para cada pago, el código calcula los intereses devengados sobre el <span className="font-bold">saldo de impuesto pendiente actual</span>.
                    El cálculo se basa en el número de días entre la fecha de vencimiento original y la fecha de pago.
                </p>
                <CodeBlock>
{`
# Lógica simplificada
dias_mora = (fecha_pago - self.fecha_vencimiento).days
tasa = obtener_tasa(fecha_pago, self.df_tasas)
dias_en_anio_pago = 366 if calendar.isleap(fecha_pago.year) else 365

intereses_periodo_due = self.saldo_impuesto * tasa * dias_mora / dias_en_anio_pago
self.saldo_intereses += redondear_mas(intereses_periodo_due)
`}
                </CodeBlock>
                <p className="mt-2">El interés calculado para el período se redondea hacia arriba al millar más cercano y se añade al saldo total de intereses.</p>
            </ExplanationCard>

            <ExplanationCard title="Paso 2: Actualización de la Sanción (Ajuste por IPC)" icon={<LightBulbIcon className="w-6 h-6" />}>
                 <p>
                    El valor de la sanción no es estático; se actualiza con la inflación (IPC). El código verifica si la sanción necesita ser compuesta antes de aplicar el pago. Esta capitalización se realiza diariamente durante períodos específicos, generalmente terminando el 31 de diciembre de los años en que aplica una actualización.
                </p>
                <CodeBlock>
{`
# Lógica simplificada para la actualización de la sanción
compounded_value = incremento_ipc_compuesto(...)
self.saldo_sancion = redondear_sancion_update_abajo(compounded_value)
`}
                </CodeBlock>
                <p className="mt-2">
                    La función clave es <code className="text-sm bg-gray-200 px-1 rounded">incremento_ipc_compuesto</code>, que aplica una tasa de capitalización diaria. El valor final actualizado se redondea <span className="font-bold">hacia abajo</span> al millar más cercano.
                    La lógica difiere según el origen de la sanción:
                </p>
                <ul className="list-disc list-inside mt-2">
                    <li><strong>Oficial:</strong> Utiliza la tasa de IPC del <span className="font-bold">próximo año</span> para los cálculos.</li>
                    <li><strong>Privada:</strong> Utiliza la tasa de IPC del <span className="font-bold">año actual</span>.</li>
                </ul>
            </ExplanationCard>
            
            <ExplanationCard title="Paso 3: Distribución del Pago (Proporcionalidad)" icon={<LightBulbIcon className="w-6 h-6" />}>
                <p>
                    Este es el paso más complejo. El pago no se aplica simplemente al saldo del impuesto. Se distribuye proporcionalmente entre los tres componentes de la deuda: <span className="font-bold">Impuesto, Intereses y Sanción.</span>
                </p>
                <p>
                    Se calcula un "factor de proporcionalidad" basado en el monto del pago en relación con la deuda total. Luego, el código determina cuál de los tres componentes de la deuda es el más grande y utiliza un orden de prioridad específico para distribuir el pago.
                </p>
                <CodeBlock>
{`
# Lógica simplificada
total_deuda = self.saldo_impuesto + self.saldo_intereses + self.saldo_sancion
factor = calcular_factor(monto_pago, total_deuda)

# Determinar el tipo de proporción según el saldo mayor
tipo_proporcion = determinar_tipo_proporcion(...)

# Aplicar el pago según el tipo de proporción
if tipo_proporcion == "Proporción 1: Impuesto mayor":
    # Prioridad: Intereses, Sanción, luego Impuesto
    intereses_pago = redondear_mas(factor * self.saldo_intereses)
    sancion_pago = redondear_mas(factor * self.saldo_sancion)
    impuesto_pago = monto_pago - intereses_pago - sancion_pago
# ... otras proporciones tienen diferentes órdenes de prioridad
`}
                </CodeBlock>
                <p className="mt-2">Después de calcular cuánto del pago va a cada componente, los saldos respectivos se reducen y los resultados se guardan en un registro histórico.</p>
            </ExplanationCard>
        </div>
    );
};