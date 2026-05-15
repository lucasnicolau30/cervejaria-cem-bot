🍺 Cervejaria Bot — Ideias & Decisões do Projeto
📌 Visão Geral
Bot de agendamento para uma cervejaria via WhatsApp, permitindo que clientes agendem aulas de fabricação e degustações. Projeto desenvolvido como portfólio com potencial de venda para outros negócios similares.

✅ Decisões Tomadas (MVP)
Stack

Backend: Node.js + Express + TypeScript
Bot: whatsapp-web.js (não-oficial, sem necessidade de empresa verificada)
Banco de dados: Google Sheets (fonte de verdade)
Hospedagem: Hostinger (plano atual já suporta Node.js)

Fluxo do Bot

Cliente acessa link → abre WhatsApp com mensagem "Quero agendar"
Bot lista tipos: Aula de fabricação ou Degustação
Bot lista datas e vagas disponíveis
Coleta nome do cliente
Informa que pagamento é no dia do evento
Confirma agendamento e salva na planilha

Planilhas

Eventos (dono preenche manualmente):
tipo | data | horario | vagas_total | vagas_disponiveis
Agendamentos (bot preenche automaticamente):
nome | telefone | tipo | data | horario | data_agendamento | pagamento

Controle de Vagas

Bot decrementa vagas automaticamente ao confirmar agendamento
Eventos sem vagas não aparecem para o cliente

Pagamento

MVP: informado no dia do evento, dono marca manualmente na planilha
Em aberto: pagamento na inscrição (Pix) ou presencialmente

Painel do Dono

MVP: dono gerencia direto no Google Sheets
Sem login (acesso direto por enquanto)


🔮 Ideias Futuras (Pós-MVP)
Painel Web com React

Dashboard com gráficos de agendamentos por período
Visualização de clientes, eventos mais procurados, taxa de ocupação
Cadastro de datas/horários/vagas pela interface (sem editar o Sheets)
Histórico de pagamentos

Banco de Dados

Migrar do Google Sheets para MySQL (Hostinger já oferece)
Sheets passaria a ser apenas exportação/visualização
Mais robusto e escalável

Pagamento Online

Integração com gateway de pagamento (ex: Mercado Pago, Stripe)
Pagamento no momento do agendamento via Pix ou cartão
Confirmação automática no bot após pagamento

Melhorias no Bot

Cancelamento de agendamento pelo WhatsApp
Lembrete automático 24h antes do evento
Lista de espera quando evento está lotado
Avaliação/feedback após o evento

Escalabilidade

Produto replicável para outros negócios (estúdios, restaurantes, salões, etc.)
Painel multi-tenant (vários clientes no mesmo sistema)
API oficial do WhatsApp Business (quando negócio crescer)


🛠️ Arquitetura Atual
cervejaria/
  src/
    bot/
      bot.ts           → lógica do WhatsApp + fluxo de conversa
    routes/
      agendamento.ts   → rotas da API REST
    sheets/
      sheetsClient.ts  → autenticação Google Sheets
      sheetsService.ts → leitura e escrita nas planilhas
    index.ts           → servidor principal
  public/
    index.html         → página com link de redirecionamento pro WhatsApp
  credentials.json     → chave da Service Account (não vai pro GitHub)
  .env                 → IDs das planilhas (não vai pro GitHub)
  package.json
  tsconfig.json

🔗 Links Úteis

Planilha Eventos: https://docs.google.com/spreadsheets/d/1-ELmFZymXfL0OG_54D8SkKC9lfafnrTWGk2CLsRFuFI
Planilha Agendamentos: https://docs.google.com/spreadsheets/d/1_uanekf7x5yrf8lMJbIWL4o8QA5XqWC396TARnV8GBM
Google Cloud Project: cervejaria-bot
Service Account: cervejaria-bot@cervejaria-bot.iam.gserviceaccount.com


https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get?apix=true&%3Bhl=pt-br&hl=pt-br

https://console.cloud.google.com/iam-admin/iam?project=cervejaria-bot