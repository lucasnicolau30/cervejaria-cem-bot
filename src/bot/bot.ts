import { Client, LocalAuth } from 'whatsapp-web.js';
import { getEventos, Evento, getAgendamentos } from '../sheets/sheetsService';      
import qrcode from 'qrcode-terminal';

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

// Define as etapas possíveis da conversa
type Etapa = 'escolha_tipo' | 'escolha_evento' | 'aguardando_nome';

// Interface que representa o estado atual de um usuário
interface EstadoUsuario {
    etapa: Etapa;
    tipo?: string; // 'Aula' ou 'Degustação' — opcional pois só existe após escolha
    eventosDisponiveis?: any[]; // eventos filtrados pelo tipo escolhido
}

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
        await msg.reply('🍺 Olá! Bem-vindo à Cervejaria!\n\nO que você deseja agendar?\n\n 1. Aula de fabricação\n 2. Degustação\n\nResponda com *1* ou *2*.');
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
        estados.set(telefone, { etapa: 'escolha_evento', tipo });

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
            mensagem += `${i + 1}. ${e.data} às ${e.horario} — ${e.vagas_disponiveis} vaga(s)\n`;
        });
        mensagem += '\nResponda com o *número* da opção desejada.';

        // Atualiza o estado com o tipo e os eventos disponíveis
        estados.set(telefone, { etapa: 'escolha_evento', tipo, eventosDisponiveis: eventosFiltrados });
        await msg.reply(mensagem);
        return;

    }
});

// Inicia o bot
client.initialize();