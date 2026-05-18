import { google } from 'googleapis';
import path from 'node:path';

const credentials = process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : undefined;

const auth = new google.auth.GoogleAuth({
    ...(credentials ? { credentials } : { keyFile: path.resolve('credentials.json') }),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Cliente reutilizável da API Google Sheets v4
export const sheetsClient = google.sheets({ version: 'v4', auth });

// IDs das planilhas lidos do .env para evitar hardcode
export const EVENTOS_SHEET_ID = process.env.EVENTOS_SHEET_ID!
export const AGENDAMENTOS_SHEET_ID = process.env.AGENDAMENTOS_SHEET_ID!

