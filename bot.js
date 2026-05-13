import http from 'http';

const BOT_TOKEN = "8674826347:AAEuZgw8-gPqjFHT18EeNSo4WP9tgkET3aU";
const OWNER_ID = "8558052873";

let offset = 0;

async function tg(method, data) {
    try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch(e) { return {}; }
}

async function poll() {
    while (true) {
        try {
            const data = await tg('getUpdates', { offset, timeout: 30 });
            if (data.ok && data.result) {
                for (const update of data.result) {
                    offset = update.update_id + 1;
                    if (update.message && update.message.text === '/start') {
                        const chatId = update.message.chat.id;
                        const userId = update.message.from.id;
                        await tg('sendMessage', {
                            chat_id: chatId,
                            text: `✅ Welcome! Your Telegram ID is: ${userId}\n\nUse this ID when placing orders.`
                        });
                        await tg('sendMessage', {
                            chat_id: OWNER_ID,
                            text: `🆕 New user: ${userId}`
                        });
                    }
                    if (update.message && update.message.text && update.message.text.startsWith('/send') && update.message.chat.id.toString() === OWNER_ID) {
                        const parts = update.message.text.split(' ');
                        if (parts.length >= 3) {
                            const target = parts[1];
                            const code = parts.slice(2).join(' ');
                            await tg('sendMessage', {
                                chat_id: target,
                                text: `🎉 GIFT CARD!\n\nCode: ${code}\n\nThank you for shopping!`
                            });
                        }
                    }
                }
            }
        } catch(e) { console.log(e); }
        await new Promise(r => setTimeout(r, 2000));
    }
}

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot running");
});
server.listen(3001, () => console.log("Bot running on port 3001"));
poll();
