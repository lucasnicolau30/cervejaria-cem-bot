import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cervejaria API',
            version: '1.0.0',
            description: 'API para consulta de eventos e agendamentos da cervejaria via Google Sheets',
        },
        servers: [{ url: process.env.API_URL || 'http://localhost:8000' }],
        components: {
            schemas: {
                Evento: {
                    type: 'object',
                    properties: {
                        tipo:               { type: 'string', example: 'Aula' },
                        nome:               { type: 'string', example: 'Água Cervejeira' },
                        data:               { type: 'string', example: '15/06/2026' },
                        horario:            { type: 'string', example: '19:00' },
                        vagas_total:        { type: 'integer', example: 20 },
                        vagas_disponiveis:  { type: 'integer', example: 12 },
                    },
                },
                Agendamento: {
                    type: 'object',
                    properties: {
                        nome:             { type: 'string', example: 'João Silva' },
                        telefone:         { type: 'string', example: '11999999999' },
                        tipo:             { type: 'string', example: 'Aula' },
                        nome_evento:      { type: 'string', example: 'Água Cervejeira' },
                        data:             { type: 'string', example: '20/06/2026' },
                        horario:          { type: 'string', example: '18:00' },
                        data_agendamento: { type: 'string', example: '12/05/2026' },
                        pagamento:        { type: 'string', example: 'Pendente' },
                    },
                },
            },
        },
    },
    // Lê as anotações JSDoc diretamente do index.ts
    apis: ['./src/index.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
