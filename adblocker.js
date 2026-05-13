const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs').promises; 
const { existsSync } = require('fs');
const path = require('path');
const { app } = require('electron');

let activeBlocker = null;

async function setupBlocker(sessionInstance) {
    if (!sessionInstance) return;

    const userDataPath = app.getPath('userData');
    const blockerCachePath = path.join(userDataPath, 'adblocker.bin');
    const githubUrl = 'https://github.com/FailouN/WebHub_Desktop/releases/download/1.0.0/adblocker.bin';

    const applyBlocker = async (blocker) => {
        try {
            // 1. Если уже есть активный блокер — отключаем его методы
            if (activeBlocker) {
                activeBlocker.disableBlockingInSession(sessionInstance);
            }
            
            // 2. ЖЕСТКАЯ ОЧИСТКА (Фикс MaxListenersExceededWarning)
            // Эти строки гарантируют, что Electron забудет про ВСЕ старые подписки на сетевые запросы
            sessionInstance.webRequest.onBeforeRequest(null);
            sessionInstance.webRequest.onBeforeSendHeaders(null);
            sessionInstance.webRequest.onHeadersReceived(null); // Добавил еще один важный хук

            activeBlocker = blocker;
            activeBlocker.enableBlockingInSession(sessionInstance);
        } catch (e) {
            console.error("AdBlock: Ошибка при применении фильтров:", e.message);
        }
    };

    // 1. БЫСТРЫЙ СТАРТ
    try {
        if (existsSync(blockerCachePath)) {
            const buffer = await fs.readFile(blockerCachePath);
            const blocker = await ElectronBlocker.deserialize(new Uint8Array(buffer));
            await applyBlocker(blocker);
            console.log('AdBlock: Запущен из локального кэша.');
        }
    } catch (e) { 
        console.error("Ошибка быстрого старта AdBlock:", e); 
    }

    // 2. ОБНОВЛЕНИЕ В ФОНЕ
    setTimeout(async () => {
        try {
            // Проверка: жива ли еще сессия?
            if (!sessionInstance || sessionInstance.destroyed) return;

            const response = await fetch(githubUrl, { method: 'GET', redirect: 'follow' });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);
                await fs.writeFile(blockerCachePath, Buffer.from(uint8Array));
                
                const newBlocker = await ElectronBlocker.deserialize(uint8Array);
                await applyBlocker(newBlocker);
                
                console.log('AdBlock: Списки обновлены.');
            }
        } catch (err) {
            console.error('AdBlock: Ошибка фонового обновления:', err.message);
        }
    }, 15000);
}

async function disableBlocker(sessionInstance) {
    if (!sessionInstance) return;
    
    try {
        if (activeBlocker) {
            activeBlocker.disableBlockingInSession(sessionInstance);
            activeBlocker = null;
        }

        // Вместо создания "пустого" блокера — просто обнуляем все сетевые хуки сессии
        sessionInstance.webRequest.onBeforeRequest(null);
        sessionInstance.webRequest.onBeforeSendHeaders(null);
        sessionInstance.webRequest.onHeadersReceived(null);

        console.log('AdBlock: Полностью деактивирован, хуки очищены.');
    } catch (err) {
        console.log('AdBlock Info: Сессия очищена.');
    }
}

module.exports = { setupBlocker, disableBlocker };