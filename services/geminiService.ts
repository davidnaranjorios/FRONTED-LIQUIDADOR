
import { GoogleGenAI } from "@google/genai";

const PYTHON_CODE_TO_ANALYZE = `
import pandas as pd
from datetime import datetime, timedelta
import calendar
import math

# Cargar tasas DIAN
# df_tasas = pd.read_csv('tasas_dian.csv', sep=';', dayfirst=True)
# ... (rest of data loading logic)

# Cargar IPC
# df_ipc = pd.read_csv('ipc.csv', encoding='latin1', sep=';')
# ... (rest of data loading logic)


def obtener_tasa(fecha, df_tasas):
    fila = df_tasas[(df_tasas['fecha_inicio'] <= fecha) & (df_tasas['fecha_fin'] >= fecha)]
    return fila.iloc[0]['tasa'] if not fila.empty else 0.0

def incremento_ipc_compuesto(fecha_inicio_compounding, fecha_fin_compounding, valor_sancion_inicial, df_ipc, origen_sancion):
    saldo_sancion_actual = float(valor_sancion_inicial)
    current_date = fecha_inicio_compounding

    if fecha_inicio_compounding > fecha_fin_compounding:
        return saldo_sancion_actual

    while current_date <= fecha_fin_compounding:
        anio_actual = current_date.year
        anio_siguiente = anio_actual + 1

        if origen_sancion.lower() == 'privada':
             ipc_anual_for_daily_rate = df_ipc[df_ipc['anio'] == anio_actual]['tasa'].iloc[0] if anio_actual in df_ipc['anio'].values else 0.0
        elif origen_sancion.lower() == 'oficial':
             ipc_anual_for_daily_rate = df_ipc[df_ipc['anio'] == anio_siguiente]['tasa'].iloc[0] if anio_siguiente in df_ipc['anio'].values else 0.0
        else:
            ipc_anual_for_daily_rate = 0.0

        total_days_in_year = 366 if calendar.isleap(anio_actual) else 365
        tasa_diaria_full_precision = ipc_anual_for_daily_rate / total_days_in_year if total_days_in_year > 0 else 0.0
        tasa_diaria = round(tasa_diaria_full_precision, 7)
        saldo_sancion_actual *= (1 + tasa_diaria)
        current_date += timedelta(days=1)
    return saldo_sancion_actual


def redondear_mas(valor):
    return int(math.ceil(valor / 1000.0)) * 1000

def redondear_sancion_update_abajo(valor):
    return int(math.floor(valor / 1000.0)) * 1000


class MotorLiquidacion:
    def __init__(self, data, df_tasas, df_ipc):
        self.nit = data['nit']
        self.razon_social = data['razon_social']
        self.concepto = data['concepto']
        self.anio = data['anio']
        self.periodo = data['periodo']
        self.valor_inicial = float(data['valor_inicial'])
        self.saldo_impuesto = float(data['valor_inicial'])
        self.saldo_sancion = float(data['valor_sancion'])
        self.origen_sancion = data['origen_sancion']
        self.fecha_vencimiento = datetime.strptime(data['fecha_vencimiento'], '%d/%m/%Y')
        self.fecha_presentacion_sancion = datetime.strptime(data['fecha_presentacion_sancion'], '%d/%m/%Y')
        self.tipo_norma = data['tipo_norma']
        self.pagos = data['pagos']
        self.df_tasas = df_tasas
        self.df_ipc = df_ipc
        self.saldo_intereses = 0.0
        self.historial = []
        self.fecha_inicio_intereses = self.fecha_vencimiento

    def procesar(self):
        # ... (full processing logic as provided)
        pass # Placeholder for brevity

def procesar_pagos_doble_vencimiento(data, df_tasas, df_ipc):
    # ... (full processing logic as provided)
    pass # Placeholder for brevity

`;

// IMPORTANT: Do not expose the API key in client-side code in a real-world application.
// This is done here for demonstration purposes only as per the instructions.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getCodeExplanation(): Promise<string> {
  if (!API_KEY) {
    throw new Error("La clave de API no está configurada.");
  }
  
  const model = "gemini-2.5-flash";
  const prompt = `
    Como programador financiero experto especializado en la legislación tributaria colombiana, analiza el siguiente código de Python para calcular liquidaciones de impuestos. 
    El código usa pandas pero la parte de carga de datos está comentada; enfócate en la lógica de cálculo.

    Proporciona una explicación clara y estructurada de su propósito y cálculos clave. Desglosa la lógica para que sea comprensible para un usuario de negocio o un desarrollador junior. 
    
    Estructura tu respuesta usando markdown con las siguientes secciones:
    1.  **Propósito General:** Un resumen de alto nivel de lo que hace el script.
    2.  **Escenarios Clave:** Explica los dos escenarios principales que maneja: "Vencimiento Único" y "Doble Vencimiento".
    3.  **Cálculos Principales:** Describe brevemente los cálculos financieros clave involucrados:
        -   Intereses de Mora
        -   Actualización de Sanción (vía IPC)
        -   Distribución de Pagos (Proporcionalidad)
        -   Reglas de Redondeo
    4.  **Funciones Clave:** Explica brevemente qué hacen estas funciones: 'obtener_tasa', 'incremento_ipc_compuesto', 'redondear_mas' y 'redondear_sancion_update_abajo'.

    Código a analizar:
    \`\`\`python
    ${PYTHON_CODE_TO_ANALYZE}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("La clave de API proporcionada no es válida. Por favor, revisa tu configuración.");
    }
    throw new Error("No se pudo obtener la explicación del modelo de IA.");
  }
}