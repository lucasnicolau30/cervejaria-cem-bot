import express from 'express';
import { getAgendamentos, getEventos } from './sheets/sheetsService';

const app = express();
const port = 8000;

app.use(express.json());

// Retorna os eventos disponíveis (aulas e degustações) com vagas
app.get('/eventos', async (req, res) => {
    const eventos = await getEventos()
    res.json(eventos)
});

// Retorna todos os agendamentos feitos pelos clientes via bot
app.get('/agendamentos', async (req, res) => {
    const agendamentos = await getAgendamentos()
    res.json(agendamentos)
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});