const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs').promises; // Используем асинхронные версии
const { existsSync } = require('fs');
const path = require('path');
const { app } = require('electron');

async function setupBlocker(sessionInstance) {
    // Используем стандартную папку данных приложения
    const userDataPath = app.getPath('userData');
    const blockerCachePath = path.join(userDataPath, 'adblocker.bin');
    
    const githubUrl = 'https://github.com/FailouN/WebHub_Desktop/releases/download/1.0.0/adblocker.bin';

    try {
        // Проверяем наличие папки асинхронно
        if (!existsSync(userDataPath)) {
            await fs.mkdir(userDataPath, { recursive: true });
        }

        // Логика обновления (можно добавить условие "раз в сутки")
        try {
            console.log('AdBlock: Проверка обновлений...');
            const response = await fetch(githubUrl);
            
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                await fs.writeFile(blockerCachePath, Buffer.from(buffer));
                console.log('AdBlock: Списки обновлены.');
            }
        } catch (downloadErr) {
            console.warn('AdBlock: Не удалось обновить списки, работаем на старом кэше.');
        }

        let blocker;

        if (existsSync(blockerCachePath)) {
            const buffer = await fs.readFile(blockerCachePath);
            blocker = await ElectronBlocker.deserialize(new Uint8Array(buffer));
            console.log('AdBlock: Десериализация успешна.');
        } else {
            // Если файла нет совсем, загружаем базовые списки из сети (fallback)
            blocker = await ElectronBlocker.fromLists(fetch, [
                'https://secure.fanboy.co.nz/easylist.txt'
            ]);
        }

        blocker.enableBlockingInSession(sessionInstance);
        console.log('AdBlock: Активен');

    } catch (err) {
        console.error('AdBlock Critical Error:', err);
    }
}

module.exports = { setupBlocker };