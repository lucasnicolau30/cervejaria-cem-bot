import { sheetsClient, EVENTOS_SHEET_ID, AGENDAMENTOS_SHEET_ID } from './sheetsClient';

// Interface que representa um evento da planilha
export interface Evento{
    tipo: string;
    data: string;
    horario: string;
    vagas_total: number;
    vagas_disponiveis: number;
    index: number; // índice real da planilha, decrementar vagas 
}

/**
 * Retorna todos os eventos disponíveis na planilha.
 * Colunas: tipo | data | horario | vagas_total | vagas_disponiveis
 */
export async function getEventos(): Promise<Evento[]> {
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: EVENTOS_SHEET_ID,
        range: 'Eventos!A:E',
    });

    const rows = response.data.values;

    if(!rows || rows.length === 0){
        return [];
    }

    return rows.slice(1).map((row, index) => ({
        tipo: row[0] || '',
        data: row[1] || '',
        horario: row[2] || '',
        // Number letra maiúscula porque é o nome da função nativa converte um valor pra número, ja que as células do sheets voltam como string 
        vagas_total: Number(row[3]) || 0,
        vagas_disponiveis: Number(row[4]) || 0,
        index: index + 2, // +2 porque começa na linha 2 (linha 1 é o cabeçalho)
    })).filter(e => e.vagas_disponiveis > 0); // filtra apenas eventos com vagas disponíveis
}

/**
 * Retorna todos os agendamentos registrados na planilha.
 * Colunas: nome | telefone | tipo | data | horario | data_agendamento | pagamento
 */
export async function getAgendamentos() {
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: AGENDAMENTOS_SHEET_ID,
        range: 'Agendamentos!A:G',
    });

    return response.data.values;
}