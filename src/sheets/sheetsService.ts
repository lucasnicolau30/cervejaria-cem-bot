import { sheetsClient, EVENTOS_SHEET_ID, AGENDAMENTOS_SHEET_ID } from './sheetsClient';

/**
 * Retorna todos os eventos disponíveis na planilha.
 * Colunas: tipo | data | horario | vagas_total | vagas_disponiveis
 */
export async function getEventos() {
    const response = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: EVENTOS_SHEET_ID,
        range: 'Eventos!A:E',
    });

    return response.data.values;
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