export interface Sanction {
    fecha_presentacion: string;
    tipo: 'Privada' | 'Oficial';
    valor_inicial: number;
}

export interface DueDate {
    periodo: string;
    anio: number;
    valor_inicial: number;
    fecha_vencimiento: string;
    hasSancion: boolean;
    sancion: Sanction;
}

export interface SettlementForm {
    nit: string;
    razon_social: string;
    concepto: string;
    hasMultipleDueDates: boolean;
    dueDates: DueDate[];
}

export interface Payment {
    fecha: string;
    valor: number;
    tipo_tasa: string; // TASA DIAN, etc.
}

// Result types
export interface SingleDueDateHistory {
    fecha_pago: string;
    saldo_impuesto_inicial_pago: number;
    saldo_intereses_inicial_pago: number;
    saldo_sancion_inicial_pago: number;
    tipo_proporcion: string;
    factor_proporcionalidad: number;
    impuesto_proporcion: number;
    intereses_proporcion: number;
    sancion_proporcion: number;
    impuesto_saldo: number;
    intereses_saldo: number;
    sancion_saldo: number;
}

export interface DoubleDueDateHistory {
    fecha_pago: string;
    monto_pago: number;
    v1_impuesto_pago: number;
    intereses_total_pago: number;
    v1_sancion_pago: number;
    v2_impuesto_pago: number;
    v2_sancion_pago: number;
    v1_impuesto_saldo: number;
    v1_sancion_saldo: number;
    v2_impuesto_saldo: number;
    v2_sancion_saldo: number;
}


export interface Results {
    type: 'single' | 'double';
    history: SingleDueDateHistory[] | DoubleDueDateHistory[];
}
