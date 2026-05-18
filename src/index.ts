import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import { getAgendamentos, getEventos } from './sheets/sheetsService';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.get('/', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Documentação interativa disponível em /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /eventos:
 *   get:
 *     summary: Lista todos os eventos disponíveis
 *     description: Retorna os eventos da planilha Google Sheets com tipo, data, horário e vagas.
 *     tags:
 *       - Eventos
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evento'
 */
app.get('/eventos', async (req, res) => {
    const eventos = await getEventos()
    res.json(eventos)
});

/**
 * @swagger
 * /agendamentos:
 *   get:
 *     summary: Lista todos os agendamentos
 *     description: Retorna os agendamentos feitos pelos clientes via bot do WhatsApp.
 *     tags:
 *       - Agendamentos
 *     responses:
 *       200:
 *         description: Lista de agendamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agendamento'
 */
app.get('/agendamentos', async (req, res) => {
    const agendamentos = await getAgendamentos()
    res.json(agendamentos)
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger docs: http://localhost:${port}/docs`);
});

// Inicia o bot
import './bot/bot';