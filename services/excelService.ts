import * as XLSX from 'xlsx';
import { Payment } from '../types';

export const parseExcelFile = (file: File): Promise<Payment[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                // Find header row
                let headerRowIndex = -1;
                for (let i = 0; i < json.length; i++) {
                    const row = json[i].map((cell: any) => String(cell).toLowerCase().trim());
                    if (row.includes('fecha') && row.includes('valor')) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    throw new Error("No se encontraron las columnas 'fecha' y 'valor' en el archivo.");
                }

                const headers = json[headerRowIndex].map((h: any) => String(h).toLowerCase().trim());
                const fechaIndex = headers.indexOf('fecha');
                const valorIndex = headers.indexOf('valor');

                const payments: Payment[] = [];
                for (let i = headerRowIndex + 1; i < json.length; i++) {
                    const row = json[i];
                    if (!row[fechaIndex] || !row[valorIndex]) continue;

                    const date = new Date(row[fechaIndex]);
                    const isoDate = date.toISOString().split('T')[0];

                    payments.push({
                        fecha: isoDate,
                        valor: Number(row[valorIndex]),
                        tipo_tasa: 'TASA DIAN', // Default value
                    });
                }
                resolve(payments);

            } catch (err) {
                console.error("Error parsing Excel file:", err);
                reject(err);
            }
        };
        reader.onerror = (err) => {
            reject(err);
        };
        reader.readAsBinaryString(file);
    });
};
