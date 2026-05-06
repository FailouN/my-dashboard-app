const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');
const fs = require('fs');

async function build() {
    console.log('Начинаю сборку бинарника...');
    const blocker = await ElectronBlocker.fromLists(fetch, [
        'https://easylist.to/easylist/easylist.txt',
            'https://easylist.to/easylist/easyprivacy.txt',
            'https://easylist-downloads.adblockplus.org/ruadlist+easylist.txt',
            
            // uBlock Origin - Стабильные прямые ссылки
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/resource-abuse.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2025.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters-2026.txt',
            
            // Специфические фильтры
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-cookies.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/annoyances-others.txt',
            'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/quick-fixes.txt'
    ]);

    const buffer = blocker.serialize();
    fs.writeFileSync('adblocker.bin', Buffer.from(buffer));
    console.log(`Готово! Файл adblocker.bin создан. Размер: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
    console.log('Теперь загрузи этот файл в свой репозиторий на GitHub.');
}

build();