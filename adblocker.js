const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs').promises; 
const { existsSync } = require('fs');
const path = require('path');
const { app } = require('electron');

async function setupBlocker(sessionInstance) {
    const userDataPath = app.getPath('userData');
    const blockerCachePath = path.join(userDataPath, 'adblocker.bin');
    const githubUrl = 'https://github.com/FailouN/WebHub_Desktop/releases/download/1.0.0/adblocker.bin';

    try {
        if (!existsSync(userDataPath)) {
            await fs.mkdir(userDataPath, { recursive: true });
        }

        try {
            console.log('AdBlock: Проверка обновлений...');
            const response = await fetch(githubUrl);
            
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                await fs.writeFile(blockerCachePath, Buffer.from(buffer));
                console.log('AdBlock: Списки обновлены.');
            }
        } catch (downloadErr) {
            console.warn('AdBlock: Работаем на имеющемся кэше.');
        }

        let blocker;

        if (existsSync(blockerCachePath)) {
            const buffer = await fs.readFile(blockerCachePath);
            blocker = await ElectronBlocker.deserialize(new Uint8Array(buffer));
            console.log('AdBlock: Десериализация успешна.');
        } else {
            blocker = await ElectronBlocker.fromLists(fetch, [
                'https://secure.fanboy.co.nz/easylist.txt'
            ]);
        }

        // --- ИСПРАВЛЕНИЕ ДЛЯ CHATGPT ---
        // Добавляем исключения напрямую в движок блокировщика.
        // Это предотвращает конфликт скриптов, вызывающий "Maximum call stack size exceeded".
        blocker.addFilters([
            '@@||chatgpt.com^$important',
            '@@||openai.com^$important',
            '@@||auth0.com^$important',
            '@@||intercom.io^$important'
        ]);

        // Активируем блокировку. Теперь она не будет трогать указанные выше домены.
        blocker.enableBlockingInSession(sessionInstance);
        
        console.log('AdBlock: Активен (ChatGPT в исключениях)');

    } catch (err) {
        console.error('AdBlock Critical Error:', err);
    }
}

module.exports = { setupBlocker };