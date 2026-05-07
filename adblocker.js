const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs').promises; 
const { existsSync } = require('fs');
const path = require('path');
const { app } = require('electron');

// Переменная для хранения активного экземпляра
let activeBlocker = null;

async function setupBlocker(sessionInstance) {
    const blockerCachePath = path.join(app.getPath('userData'), 'adblocker.bin');
    const githubUrl = 'https://github.com/FailouN/WebHub_Desktop/releases/download/1.0.0/adblocker1.bin';

    // 1. СНАЧАЛА ЗАГРУЖАЕМ ТО ЧТО ЕСТЬ (МГНОВЕННО)
    try {
        if (existsSync(blockerCachePath)) {
            const buffer = await fs.readFile(blockerCachePath);
            activeBlocker = await ElectronBlocker.deserialize(new Uint8Array(buffer));
            activeBlocker.enableBlockingInSession(sessionInstance);
            console.log('AdBlock: Запущен из локального кэша.');
        } else {
            // Если кэша нет совсем, грузим минимальный список
            activeBlocker = await ElectronBlocker.fromLists(fetch, ['https://secure.fanboy.co.nz/easylist.txt']);
            activeBlocker.enableBlockingInSession(sessionInstance);
        }
    } catch (e) { console.error("Ошибка быстрого старта AdBlock:", e); }

    // 2. ОБНОВЛЕНИЕ ДЕЛАЕМ В ФОНЕ (не задерживаем запуск)
    setTimeout(async () => {
        try {
            const response = await fetch(githubUrl);
            if (response.ok) {
                const buffer = await response.arrayBuffer();
                await fs.writeFile(blockerCachePath, Buffer.from(buffer));
                console.log('AdBlock: Списки обновлены в фоне (применятся при следующем запуске).');
            }
        } catch (err) { /* игнорируем ошибки сети в фоне */ }
    }, 5000); 
}

async function disableBlocker(sessionInstance) {
    if (!sessionInstance) return;
    
    try {
        if (activeBlocker) {
            // Пытаемся отключить через сохраненный объект
            activeBlocker.disableBlockingInSession(sessionInstance);
            activeBlocker = null;
        } else {
            // Если объекта нет (например, после перезапуска), снимаем обработчики через "пустой" костыль
            const { ElectronBlocker } = require('@ghostery/adblocker-electron');
            const empty = await ElectronBlocker.fromLists(fetch, []);
            // Принудительно заменяем старые фильтры на пустые
            empty.enableBlockingInSession(sessionInstance);
        }

        console.log('AdBlock: Полностью деактивирован');
    } catch (err) {
        // Если библиотека ругается, что блокировка не была включена — 
        // значит сессия уже чиста или произошла ошибка инициализации.
        console.log('AdBlock Info: Сессия очищена от блокировщика.');
    }
}

module.exports = { setupBlocker, disableBlocker };