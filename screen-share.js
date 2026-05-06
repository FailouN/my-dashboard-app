const { desktopCapturer, Menu, nativeImage } = require('electron');

/**
 * Инициализирует продвинутый обработчик выбора экрана
 */
function setupScreenShare(session) {
    session.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({
            types: ['screen', 'window'],
            thumbnailSize: { width: 150, height: 150 },
            fetchWindowIcons: true
        }).then(async (sources) => {
            
            const filteredSources = sources.filter(source => {
                const name = source.name.toLowerCase();
                if (!name || name.trim() === "" || name.includes('.ini')) return false;
                
                const junkApps = ['nvidia geforce overlay', 'settings', 'параметры', 'program manager', 'microsoft text input application'];
                return !junkApps.some(junk => name.includes(junk));
            });

            if (filteredSources.length === 0) {
                console.log("Доступные источники не найдены.");
                return callback(null); // Важно: закрываем запрос, чтобы сайт не висел
            }

            // Создаем меню с иконками приложений
            const menu = Menu.buildFromTemplate(
                filteredSources.map((source) => ({
                    label: source.name.length > 50 ? source.name.substring(0, 50) + '...' : source.name,
                    // Добавляем иконку окна в меню, если она есть
                    icon: source.appIcon ? source.appIcon.resize({ width: 16, height: 16 }) : undefined,
                    click: () => {
                        callback({ 
                            video: source, 
                            audio: process.platform === 'win32' ? 'loopback' : undefined 
                        });
                    }
                }))
            );

            // КРИТИЧЕСКИЙ МОМЕНТ: Обработка закрытия меню без выбора
            // В Electron нет события "onClose" для popup-меню, 
            // поэтому мы добавляем пункт "Отмена"
            menu.append(new (require('electron').MenuItem)({ type: 'separator' }));
            menu.append(new (require('electron').MenuItem)({
                label: 'Отмена',
                click: () => callback(null)
            }));

            // Показываем меню
            menu.popup({
                callback: () => {
                    // Если через 500мс после закрытия меню выбор не сделан — сбрасываем
                    // (предотвращает зависание UI на сайте)
                    setTimeout(() => {
                        try { callback(null); } catch (e) {} 
                    }, 500);
                }
            });
            
        }).catch(err => {
            console.error("Ошибка захвата экрана:", err);
            callback(null);
        });
    });
}

module.exports = { setupScreenShare };