# Cervejaria Cem — Sistema de Bot de Agendamento

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=flat&logo=whatsapp&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=flat&logo=google-sheets&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=flat&logo=swagger&logoColor=black)
![Hostinger](https://img.shields.io/badge/Hostinger-673DE6?style=flat&logo=hostinger&logoColor=white)

Leia em: Português | [English](README.md)

Aplicação web full-stack desenvolvida para automatizar o agendamento de eventos da Cervejaria Cem, integrando um bot de WhatsApp com o Google Sheets como banco de dados, com suporte a reservas de aulas e degustações e pagamento via Pix ou no dia do evento.

**Demo ao vivo:** em breve

## Capturas de Tela

Abaixo estão algumas telas da aplicação, incluindo a landing page e o banco de dados no Google Sheets.

### Landing Page

<img src="public/img/readme/home.png" height="400">

### Google Sheets

<img src="public/img/readme/eventos.png" height="400">

<img src="public/img/readme/agendamentos.png" height="400">

## Contexto

Gerenciar reservas de eventos manualmente por mensagens de WhatsApp é demorado e sujeito a erros, especialmente à medida que o número de eventos e clientes cresce.

A ideia surgiu da necessidade de automatizar **todo o processo de agendamento** — da primeira mensagem do cliente até o registro da reserva em uma planilha — sem exigir um banco de dados dedicado ou infraestrutura complexa.

Este projeto foi criado para conduzir todo o fluxo de reserva pelo WhatsApp, usando o **Google Sheets** como um banco de dados leve e acessível que o dono da cervejaria pode gerenciar diretamente.

## Estrutura do Projeto

```
cervejaria/
├─ src/
│  ├─ bot/
│  │  └─ bot.ts                 # Lógica do bot de WhatsApp e fluxo de conversa
│  │
│  ├─ sheets/
│  │  ├─ sheetsClient.ts        # Autenticação e configuração do cliente Google Sheets
│  │  └─ sheetsService.ts       # Operações de leitura/escrita nas planilhas
│  │
│  ├─ frontend/
│  │  └─ main.ts                # TypeScript do frontend — lista de eventos e lógica de UI
│  │
│  ├─ index.ts                  # Ponto de entrada do servidor Express
│  └─ swagger.ts                # Configuração da documentação Swagger/OpenAPI
│
├─ public/
│  ├─ index.html                # Landing page
│  ├─ styles.css                # Estilos do frontend
│  ├─ main.js                   # Script do frontend compilado
│  └─ img/
│     ├─ logo.png               # Logo da cervejaria
│     ├─ logo-icon.png          # Ícone da logo
│     └─ readme/                # Capturas de tela do README
│
├─ .env
├─ credentials.json             # Chave da Service Account do Google
├─ readme.MD                    # Documentação do projeto
├─ tsconfig.json                # Config do TypeScript do backend
├─ tsconfig.frontend.json       # Config do TypeScript do frontend
└─ package.json
```

## Como Funciona

1. O cliente envia **"quero agendar"** pelo WhatsApp
2. O bot pergunta se ele quer reservar uma **aula** ou uma **degustação**
3. O bot busca os eventos disponíveis no Google Sheets e os lista
4. O cliente escolhe um evento pelo número
5. O bot pede o **nome completo** do cliente
6. O bot pergunta a **forma de pagamento** preferida: Pix ou no dia do evento
7. Se for Pix: o bot envia a chave Pix e aguarda o **comprovante de pagamento** (imagem ou PDF)
8. A reserva é salva na planilha Agendamentos e as vagas disponíveis do evento são decrementadas
9. O cliente recebe uma **mensagem de confirmação**

## Fluxo do Bot

### Etapas da Conversa

O bot gerencia o estado de cada usuário de forma independente usando um `Map` em memória, avançando pelos seguintes estágios:

- `escolha_tipo` — cliente escolhe entre Aula ou Degustação
- `escolha_evento` — cliente escolhe entre os eventos disponíveis buscados no Sheets
- `aguardando_nome` — cliente informa o nome completo
- `aguardando_pagamento` — cliente escolhe a forma de pagamento
- `aguardando_comprovante` — (apenas Pix) cliente envia o comprovante de pagamento

### Gerenciamento de Vagas

Após a confirmação de uma reserva, o bot lê as vagas disponíveis atuais na planilha **Eventos** e grava de volta o valor decrementado, mantendo a planilha sempre atualizada.

## Estrutura do Google Sheets

O sistema usa duas planilhas:

**Planilha Eventos**

- tipo
- nome
- data
- horario
- vagas_total
- vagas_disponiveis

**Planilha Agendamentos**

- nome
- telefone
- tipo
- nome_evento
- data
- horario
- data_agendamento
- pagamento

Esse design permite:

- controle de disponibilidade de vagas em tempo real
- histórico completo de reservas acessível ao dono
- nenhum banco de dados dedicado necessário

## Documentação da API

A documentação Swagger está disponível em: [Swagger](http://localhost:8000/docs)

<img src="public/img/readme/swagger.png" height="400">

## Deploy

Configuração de produção:

- Ponto de entrada: `dist/index.js` (compilado de `src/index.ts`)
- Frontend servido como arquivos estáticos via `express.static`, com `index.html` como índice
- O bot inicializa junto com o servidor via `whatsapp-web.js` com persistência de sessão `LocalAuth`
- Variáveis de ambiente configuradas via `.env`: `PORT`, `API_URL`, `EVENTOS_SHEET_ID`, `AGENDAMENTOS_SHEET_ID`, `PIX_KEY`

## Referências

- [Google Cloud](https://console.cloud.google.com/)
- [Google Workspace](https://developers.google.com/workspace/sheets?hl=pt-br)

## Autor

Lucas Nicolau — Estudante de Engenharia de Software na @UFAM
