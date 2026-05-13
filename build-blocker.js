const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs');

async function build() {
    console.log('Начинаю сборку бинарника (оптимизированная версия)...');
    
    // Используем только стабильные и проверенные списки
    const blocker = await ElectronBlocker.fromLists(fetch, [
        // Базовые списки (реклама и трекеры)
        'https://easylist.to/easylist/easylist.txt',
        'https://easylist.to/easylist/easyprivacy.txt',
        'https://easylist-downloads.adblockplus.org/ruadlist+easylist.txt',
        
        // uBlock Origin - Только необходимые фильтры (RAW ссылки!)
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt', // КРИТИЧНО: чинит сломанные сайты
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt',
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/quick-fixes.txt',
        
        // Удаляем раздражители (печенье и т.д.), но не трогаем ресурсы плееров
        'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-cookies.txt'
    ]);

    const buffer = blocker.serialize();
    fs.writeFileSync('adblocker.bin', Buffer.from(buffer));
    
    console.log(`Готово! Файл adblocker.bin создан.`);
    console.log(`Размер: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
}

build().catch(err => console.error('Ошибка сборки:', err));