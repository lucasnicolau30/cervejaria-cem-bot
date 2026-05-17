import { Client, LocalAuth } from 'whatsapp-web.js';
import { getEventos, Evento, salvarAgendamento, decrementarVaga } from '../sheets/sheetsService';      
import qrcode from 'qrcode-terminal';

// Define as etapas possíveis da conversa
type Etapa = 'escolha_tipo' | 'escolha_evento' | 'aguardando_nome' | 'aguardando_pagamento' | 'aguardando_comprovante';

// Interface que representa o estado atual de um usuário
interface EstadoUsuario {
    etapa: Etapa;
    tipo?: string; // 'Aula' ou 'Degustação' — opcional pois só existe após escolha
    eventosDisponiveis?: Evento[]; // eventos filtrados pelo tipo escolhido
    eventoEscolhido?: Evento; // evento que o usuário escolheu
    nomeUsuario?: string; // nome do usuário, preenchido após etapa de nome
}

// Cria o cliente do bot
const client = new Client({
    // LocalAuth salva a sessão em disco — não precisa escanear QR toda vez
    authStrategy: new LocalAuth(),
    puppeteer: {
        // Necessário para rodar em servidor Linux sem interface gráfica
        args: ['--no-sandbox']
    }
});

// Evento disparado quando o bot gera um QR Code para autenticação
client.on('qr', (qr) => {
    // Desenha o QR Code no terminal para ser escaneado com o celular
    qrcode.generate(qr, { small: true });
    console.log('📱 Escaneie o QR Code acima com o WhatsApp!');
});

// Evento disparado quando o bot conecta com sucesso
client.on('ready', () => {
    console.log('✅ Bot conectado ao WhatsApp!');
});

// Mapa que guarda o estado de cada usuário pelo telefone
// chave: número do telefone | valor: estado atual
const estados = new Map<string, EstadoUsuario>();

// Evento disparado toda vez que o bot recebe uma mensagem
client.on('message', async (msg) => {
    // Ignora mensagens de grupos
    if (msg.from.includes('@g.us')){
        return;
    } 

    const telefone = msg.from; // número do telefone do remetente
    const texto = msg.body.trim().toLowerCase(); // texto da mensagem em minúsculo para facilitar comparação
    const estado = estados.get(telefone); // estado atual do usuário, se existir

    // Gatilho principal — só responde quem veio pelo link
    if(texto === 'quero agendar'){
        // Cria o estado inicial do usuário
        estados.set(telefone, { etapa: 'escolha_tipo' });
        await msg.reply('🍺 Olá! Bem-vindo à Cervejaria Cem!\n\nO que você deseja agendar?\n\n1️⃣ Aula\n2️⃣ Degustação\n\nResponda com *1* ou *2*.');
        return;
    }

    // Se não tem estado ativo, ignora a mensagem
    if(!estado){
        return;
    } 

    // Etapa: usuário escolhe entre Aula ou Degustação
    if(estado.etapa === 'escolha_tipo'){
        if(texto !== '1' && texto !== '2'){
            await msg.reply('Por favor, responda com *1* para Aula ou *2* para Degustação.');
            return;
        }

        const tipo = texto === '1' ? 'Aula' : 'Degustação';

        // Busca os eventos disponíveis no Sheets
        const eventos = await getEventos();

        // Filtra apenas os eventos do tipo escolhido
        const eventosFiltrados = eventos.filter(e => e.tipo === tipo);

        // Se não houver eventos disponíveis
        if(eventosFiltrados.length === 0){
            await msg.reply(`😔 Não há ${tipo.toLowerCase()}s disponíveis no momento. Tente novamente mais tarde!`);
            estados.delete(telefone); // limpa o estado do usuário
            return;
        }

        // Monta a mensagem com as datas disponíveis
        let mensagem = `📅 *${tipo}s disponíveis:*\n\n`;
        eventosFiltrados.forEach((e, i) => {
            mensagem += `${i + 1}. *${e.nome}* | ${e.data} às ${e.horario} — ${e.vagas_disponiveis} vaga(s)\n`;
        });
        mensagem += '\nResponda com o *número* da opção desejada.';

        // Atualiza o estado com o tipo e os eventos disponíveis
        estados.set(telefone, { etapa: 'escolha_evento', tipo, eventosDisponiveis: eventosFiltrados });
        await msg.reply(mensagem);
        return;
    }


    // Etapa: usuário escolhe entre Aula ou Degustação
    if(estado.etapa === 'escolha_evento'){
        const eventos = estado.eventosDisponiveis || [];            
        const opcao = parseInt(texto);

        // Verifica se a opção é válida
        if(isNaN(opcao) || opcao < 1 || opcao > eventos.length){            
            await msg.reply(`⚠️ Por favor, escolha um número entre 1 e ${eventos.length}.`);
            return;
        }

        // -1 pelo indíce que começa em 0
        const eventoEscolhido = eventos[opcao - 1];

        // Atualiza o estado com o evento escolhido
        estados.set(telefone, { 
            ...estado, // pread operator — ele copia todos os campos do estado atual.
            etapa: 'aguardando_nome',
            eventoEscolhido 
        });

        await msg.reply(`✅ Ótimo! Você escolheu:\n\n🍺 *${eventoEscolhido.nome}*\n📅 ${eventoEscolhido.data} às ${eventoEscolhido.horario}\n\nQual é o seu *nome completo*?`);
        return;
    }

    // Etapa: usuário informa o nome e o agendamento é confirmado
    if(estado.etapa === 'aguardando_nome'){
        const nome = msg.body.trim(); // preserva maiúsculas/minúsculas do nome
        const evento = estado.eventoEscolhido!; // ! diz ao TypeScript que o evento existe

        // Salva o nome no estado e avança pra etapa de pagamento
        estados.set(telefone, {
            ...estado,
            etapa: 'aguardando_pagamento',
            eventoEscolhido: evento,
            nomeUsuario: nome,
        });

        await msg.reply(`Obrigado, *${nome}*! 😊\n\nComo prefere realizar o pagamento?\n\n1️⃣ Pix antecipado\n2️⃣ No dia do evento`);     
        return;
    }

    // Etapa: usuário escolhe forma de pagamento
    if(estado.etapa === 'aguardando_pagamento'){
        if(texto !== '1' && texto !== '2'){
            await msg.reply('⚠️ Por favor, responda com *1* para Pix ou *2* para no dia do evento.');
            return;
        }

        const nome = estado.nomeUsuario!;
        const evento = estado.eventoEscolhido!;
        const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Manaus' });

        // Se escolheu no dia, confirma direto
        if(texto === '2'){
        await salvarAgendamento({
            nome,
            telefone: telefone.replace('@c.us', ''),
            tipo: evento.tipo,
            nome_evento: evento.nome,
            data: evento.data,
            horario: evento.horario,
            data_agendamento: agora,
            pagamento: 'No dia do evento',
        });

        await decrementarVaga(evento.index);

            await msg.reply(`✅ *Agendamento confirmado, ${nome}!*\n\n🍺 ${evento.nome}\n📅 ${evento.data} às ${evento.horario}\n\n💰 Pagamento no dia do evento\n\nTe esperamos! 🍻`);
            estados.delete(telefone);
            return;
        }

        // Se escolheu Pix, envia a chave e aguarda comprovante
        estados.set(telefone, {
            ...estado,
            etapa: 'aguardando_comprovante',
        });

        await msg.reply(`💰 Chave Pix: *00000000000*\n\nApós o pagamento, envie o *comprovante* aqui para confirmar seu agendamento!`);
        return;
    }

    if(estado.etapa === 'aguardando_comprovante'){

        const nome = estado.nomeUsuario!;
        const evento = estado.eventoEscolhido!;
        const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Manaus' });

        // Verifica se veio uma imagem ou PDF
        if(msg.type !== 'image' && msg.type !== 'document'){
            await msg.reply('⚠️ Por favor, envie uma *imagem* ou *PDF* do comprovante de pagamento.');
            return;
        }

        await salvarAgendamento({
            nome,
            telefone: telefone.replace('@c.us', ''),
            tipo: evento.tipo,
            nome_evento: evento.nome,
            data: evento.data,
            horario: evento.horario,
            data_agendamento: agora,
            pagamento: 'Chave Pix enviada — aguardando confirmação',
        });

        await decrementarVaga(evento.index);

        await msg.reply(`✅ *Agendamento confirmado, ${nome}!*\n\n🍺 ${evento.nome}\n📅 ${evento.data} às ${evento.horario}\n\n💰 Comprovante recebido! O dono irá verificar o pagamento.\n\nTe esperamos! 🍻`);
        estados.delete(telefone);
        return;
    }
});

// Inicia o bot
client.initialize();