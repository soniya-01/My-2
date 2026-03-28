const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys");
const pino = require("pino");

exports.handler = async (event, context) => {
    const number = event.queryStringParameters.number;
    
    if (!number) return { statusCode: 400, body: JSON.stringify({ error: "No number" }) };

    // Netlify functions වල temporary storage එක /tmp/ පාවිච්චි කරයි
    const { state } = await useMultiFileAuthState('/tmp/session-' + number);

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop")
    });

    try {
        const code = await sock.requestPairingCode(number.replace(/[^0-9]/g, ''));
        return {
            statusCode: 200,
            body: JSON.stringify({ code: code })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to get code" }) };
    }
};
