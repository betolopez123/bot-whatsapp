const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');

console.log('Iniciando bot...');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote'
    ]
  }
});

const GRUPO_PERMITIDO = 'Aztecdrake🐉 Alianza';

const USUARIOS_AUTORIZADOS = [
  '525527549796@c.us'
];

const niveles = {
  1: 0, 2: 20, 3: 60, 4: 140, 5: 260, 6: 400, 7: 580, 8: 780, 9: 1020, 10: 1280,
  11: 1860, 12: 2780, 13: 4020, 14: 5580, 15: 7480, 16: 9700, 17: 12240, 18: 15100,
  19: 18300, 20: 21820, 21: 34580, 22: 56600, 23: 87860, 24: 128380, 25: 178140,
  26: 237140, 27: 305400, 28: 382900, 29: 469660, 30: 565660, 31: 748060,
  32: 1016860, 33: 1372060, 34: 1813660, 35: 2341660, 36: 2956060, 37: 3656860,
  38: 4444060, 39: 5317660, 40: 6277660, 41: 7510300, 42: 9015580, 43: 10793500,
  44: 12844060, 45: 15167260, 46: 17763100, 47: 20631580, 48: 23772700,
  49: 27186460, 50: 30872860, 51: 34597660, 52: 38360860, 53: 42162460,
  54: 46002460, 55: 49880860, 56: 53797660, 57: 57752860, 58: 61746460,
  59: 65778460, 60: 69848860, 61: 73959400, 62: 78110080, 63: 82300900,
  64: 86531860, 65: 90802960, 66: 95114200, 67: 99465580, 68: 103857100,
  69: 108288760, 70: 112760568
};

const produccion = {
  30: 25200,
  40: 28800
};

client.on('qr', async (qr) => {
  console.log('QR RECIBIDO');
  qrcode.generate(qr, { small: true });

  const qrImage = await QRCode.toDataURL(qr);
  console.log('Abre este link para ver el QR:');
  console.log(qrImage);
});

client.on('authenticated', () => {
  console.log('Autenticado correctamente');
});

client.on('auth_failure', (msg) => {
  console.log('Fallo de autenticación:', msg);
});

client.on('loading_screen', (percent, message) => {
  console.log('Cargando WhatsApp:', percent, message);
});

client.on('ready', () => {
  console.log('Bot conectado');
});

client.on('disconnected', (reason) => {
  console.log('Bot desconectado:', reason);
  process.exit(1);
});

client.on('message', async (message) => {
  try {
    if (message.fromMe) return;

    const chat = await message.getChat();
    const texto = (message.body || '').toLowerCase().trim();

    const esGrupoPermitido = chat.isGroup && chat.name === GRUPO_PERMITIDO;

    const esPrivadoAutorizado =
      !chat.isGroup && USUARIOS_AUTORIZADOS.includes(message.from);

    if (!esGrupoPermitido && !esPrivadoAutorizado) {
      return;
    }

    console.log('Mensaje permitido:', {
      from: message.from,
      body: message.body,
      grupo: chat.isGroup ? chat.name : 'privado'
    });

    if (texto === '!hola') {
      const nombre = message._data?.notifyName || 'miembro';
      await message.reply(`Hola ${nombre} 👋`);
      return;
    }

    if (texto === '!menu') {
      await message.reply(
        `🐉 *MENÚ DE COMANDOS*\n\n` +
        `👋 *!hola*\nSaludo personalizado\n\n` +
        `🍽️ *!alimentar 1 a 35*\nCalcula comida necesaria\n\n` +
        `🌾 *!granja 40|30*\nProducción en 6h y 24h\n\n` +
        `📋 *!menu*\nMuestra este menú`
      );
      return;
    }

    if (texto.startsWith('!alimentar')) {
      const partes = texto.split(' ');
      const actual = parseInt(partes[1]);
      const destino = parseInt(partes[3]);

      if (isNaN(actual) || isNaN(destino)) {
        await message.reply('Usa: !alimentar 10 a 20');
        return;
      }

      if (!niveles[actual] && actual !== 1) {
        await message.reply('Nivel actual no válido');
        return;
      }

      if (!niveles[destino]) {
        await message.reply('Nivel destino no válido');
        return;
      }

      if (destino <= actual) {
        await message.reply('El nivel destino debe ser mayor');
        return;
      }

      const comida = niveles[destino] - niveles[actual];

      await message.reply(
        `🐉 *CÁLCULO DE COMIDA*\n\n` +
        `Nivel: *${actual} ➜ ${destino}*\n` +
        `Comida estimada: *${comida.toLocaleString('es-ES')}* 🍽️`
      );
      return;
    }

    if (texto.startsWith('!granja')) {
      const datos = texto.replace('!granja', '').trim();
      const partes = datos.split('|');

      const cantidad = parseInt(partes[0]);
      const nivel = parseInt(partes[1]);

      if (isNaN(cantidad) || isNaN(nivel)) {
        await message.reply('Usa: !granja 40|30');
        return;
      }

      if (!produccion[nivel]) {
        await message.reply('Nivel no válido. Solo puedes usar 30 o 40');
        return;
      }

      const comida6h = cantidad * produccion[nivel];
      const comida24h = comida6h * 4;

      await message.reply(
        `🐉 *GRANJA DE COMIDA*\n\n` +
        `Dragones: *${cantidad}*\n` +
        `Nivel: *${nivel}*\n` +
        `Producción 6h: *${comida6h.toLocaleString('es-ES')}* 🍖\n` +
        `Producción 24h: *${comida24h.toLocaleString('es-ES')}* 🍖`
      );
      return;
    }

  } catch (error) {
    console.error('ERROR EN MENSAJE:', error);
  }
});

process.on('unhandledRejection', (error) => {
  console.log('UNHANDLED REJECTION:', error);
});

process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT EXCEPTION:', error);
});

client.initialize();