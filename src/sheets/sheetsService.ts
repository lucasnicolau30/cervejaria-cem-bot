import { sheetsClient, EVENTOS_SHEET_ID, AGENDAMENTOS_SHEET_ID } from './sheetsClient';

// Interface que representa um evento da planilha
export interface Evento{
    tipo: string;
    nome: string;
    data: string;
    horario: string;
    vagas_total: number;
    vagas_disponiveis: number;
    index: number; // índice real da planilha, decrementar vagas 
}

// Interface que representa um agendamento
export interface Agendamento{
    nome: string;
    telefone: string;
    tipo: string;
    nome_evento: string;
    data: string;
    horario: string;
    data_agendamento: string;
    pagamento: string;
}

/**
 * Retorna todos os eventos disponíveis na planilha.
 * Colunas: tipo | nome | data | horario | vagas_total | vagas_disponiveis
 */
export async function getEventos(): Promise<Evento[]> {
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: EVENTOS_SHEET_ID,
        range: 'Eventos!A:F',
    });

    const rows = response.data.values;

    if(!rows || rows.length === 0){
        return [];
    }

    return rows.slice(1).map((row, index) => ({
        tipo: row[0] || '',
        nome: row[1] || '',
        data: row[2] || '',
        horario: row[3] || '',
        // Number letra maiúscula porque é o nome da função nativa converte um valor pra número, ja que as células do sheets voltam como string 
        vagas_total: Number(row[4]) || 0,
        vagas_disponiveis: Number(row[5]) || 0,
        index: index + 2, // +2 porque começa na linha 2 (linha 1 é o cabeçalho)
    })).filter(e => e.vagas_disponiveis > 0); // filtra apenas eventos com vagas disponíveis
}

/**
 * Retorna todos os agendamentos registrados na planilha.
 * Colunas: nome | telefone | tipo | nome_evento | data | horario | data_agendamento | pagamento
 */
export async function getAgendamentos(){
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: AGENDAMENTOS_SHEET_ID,
        range: 'Agendamentos!A:H',
    });

    return response.data.values;
}

/**
 * Salva um agendamento na planilha.
 */

export async function salvarAgendamento(agendamento: Agendamento): Promise<void>{
    await sheetsClient.spreadsheets.values.append({
        spreadsheetId: AGENDAMENTOS_SHEET_ID,
        range: 'Agendamentos!A:H',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[
                agendamento.nome,
                agendamento.telefone,
                agendamento.tipo,
                agendamento.nome_evento,
                agendamento.data,
                agendamento.horario,
                agendamento.data_agendamento,
                agendamento.pagamento,
            ]],
        },
    });
}

// Decrementa uma vaga do evento após agendamento
export async function decrementarVaga(eventoIndex: number): Promise<void> {
    // Lê a vaga atual
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: EVENTOS_SHEET_ID,
        range: `Eventos!F${eventoIndex}`,
    });

    const vagasAtuais = Number(response.data.values?.[0]?.[0]) || 0;

    // Atualiza com -1
    await sheetsClient.spreadsheets.values.update({
        spreadsheetId: EVENTOS_SHEET_ID,
        range: `Eventos!F${eventoIndex}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [[vagasAtuais - 1]],
        },
    });
}