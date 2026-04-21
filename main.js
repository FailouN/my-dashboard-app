const { app, BrowserWindow, session, desktopCapturer, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const { exec } = require('child_process');

const { ElectronBlocker } = require('@ghostery/adblocker-electron');
const fetch = require('cross-fetch');


// Реальный путь к данным в профиле пользователя (%APPDATA%)
const userDataPath = path.join(app.getPath('appData'), 'my-dashboard-app-profile');

// Путь для папки-ссылки в директории программы
const linkPath = path.join(process.cwd(), 'DATA_LINK'); 

// Устанавливаем путь к userData до готовности приложения
if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
}
app.setPath('userData', userDataPath);


async function handleCookieImport() {
    const win = BrowserWindow.getFocusedWindow();

    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
        title: 'Выберите файл куков (JSON)',
        properties: ['openFile'],
        filters: [{ name: 'JSON Cookies', extensions: ['json'] }]
    });
    if (canceled || filePaths.length === 0) return;

    try {
        const rawData = fs.readFileSync(filePaths[0], 'utf8');
        const cookies = JSON.parse(rawData);
        const currentSession = session.defaultSession;
        for (const cookie of cookies) {
            const domain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
            const url = `${cookie.secure || cookie.name.startsWith('__Secure-') || cookie.name.startsWith('__Host-') ? 'https' : 'http'}://${domain}${cookie.path}`;

            const cookieDetails = {
                url: url,
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expirationDate: cookie.expirationDate,
                // Добавляем принудительно SameSite, если его нет, чтобы Secure куки проходили
                sameSite: cookie.name.startsWith('__Host') ? 'no_restriction' : undefined 
            };
            // Если кука имеет защищенный префикс, она ОБЯЗАНА быть secure
            if (cookie.name.startsWith('__Secure-') || cookie.name.startsWith('__Host-')) {
                cookieDetails.secure = true;
            }

            await currentSession.cookies.set(cookieDetails).catch(e => {
    // Игнорируем специфические ошибки префиксов и перезаписи secure-кук
    const ignoredErrors = ['invalid __Host-', 'overwritten a Secure cookie'];
    if (!ignoredErrors.some(msg => e.message.includes(msg))) {
        console.warn(`Ошибка куки ${cookie.name}:`, e.message);
    }
});
        }
        console.log('import coocies completed');
        if (win) win.reload(); // Перезагружаем для применения авторизации

    } catch (err) {
        console.error("Ошибка импорта:", err);
        dialog.showErrorBox('Ошибка', 'Could not read or set cookie.');
    }
}

async function handleClearCookies() {
    const win = BrowserWindow.getFocusedWindow();
    const { response } = await dialog.showMessageBox(win, {
        type: 'question',
        buttons: ['Отмена', 'Да, удалить всё'],
        defaultId: 1,
        title: 'Подтверждение',
        message: 'Вы уверены, что хотите удалить все куки и данные авторизации?',
        detail: 'Это приведет к выходу из всех аккаунтов на всех сайтах.'
    });

    if (response === 1) {
        await session.defaultSession.clearStorageData();
        console.log('Все куки и данные очищены.');
        if (win) win.reload();
    }
}

// Определяем доступные UA
const AGENTS = {
    desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    mobile: "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36", // <--- ТУТ НУЖНА ЗАПЯТАЯ
    IosMobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1" // <--- ТУТ УБРАЛ ТОЧКУ С ЗАПЯТОЙ
};

function setUserAgent(type) {
    const newUA = AGENTS[type];
    if (!newUA) return;

    session.defaultSession.setUserAgent(newUA);
    
    // Получаем все окна и webview
    const wins = BrowserWindow.getAllWindows();
    wins.forEach(w => {
        // Перезагружаем контент только если он уже загружен
        if (!w.webContents.isLoading()) {
            w.webContents.reload();
        }
    });
    
    // Используем правильную кодировку для консоли (чтобы не было кракозябр)
    console.log(`User-Agent changed to: ${type}`);
}

/**
 * СОЗДАНИЕ ПРИКЛАДНОГО МЕНЮ
 */
function createApplicationMenu() {
    const template = [
        {
            label: 'Аккаунты',
            submenu: [
                {
                    label: 'Импортировать профиль (JSON)',
                    accelerator: 'CmdOrCtrl+I',
                    click: () => { handleCookieImport(); }
                },

                {
                    label: 'Удалить все куки',
                    click: () => { handleClearCookies(); }
                },

                { type: 'separator' },
                { role: 'reload', label: 'Перезагрузить страницу' },
                { role: 'quit', label: 'Выход' }
            ]
        },
        {
            label: 'Вид',
            submenu: [
                {
                    label: 'Режим отображения',
                    submenu: [
                        { 
                            label: 'Компьютер (Desktop)', 
                            click: () => setUserAgent('desktop') 
                        },
                        { 
                            label: 'Телефон (Mobile)', 
                            click: () => setUserAgent('mobile') 
                        },
                        { 
                            label: 'Ios (Mobile)', 
                            click: () => setUserAgent('IosMobile') 
                        }
                    ]
                },
                { role: 'toggleDevTools', label: 'Консоль разработчика' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Сбросить масштаб' },
                { role: 'zoomin', label: 'Увеличить' },
                { role: 'zoomout', label: 'Уменьшить' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * ОСНОВНОЕ ОКНО ПРИЛОЖЕНИЯ
 */
async function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        autoHideMenuBar: true, // Меню скрыто, появляется по нажатию Alt
        webPreferences: {
            autoplayPolicy: 'no-user-gesture-required',
            touchEvents: true,
            enableRemoteModule: true,
            webviewTag: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    });

// Создание символьной ссылки (DATA_LINK)
    if (!fs.existsSync(linkPath)) {
        const command = `mklink /D "${linkPath}" "${userDataPath}"`;
        exec(command, (err) => {
            if (err) console.error('Ошибка создания ссылки (нужен Админ):', err.message);
            else console.log('DATA_LINK created successfully.');
        });
    }



// ПУТЬ К ФАЙЛУ КЕША БЛОКИРОВЩИКА
    const blockerCachePath = path.join(userDataPath, 'adblocker.bin');

// ЗАПУСК БЛОКИРОВЩИКА (Параллельно, без ожидания)
    const setupBlocker = async () => {
        try {
            let blocker;
            
            // Проверяем, есть ли уже сохраненные фильтры на диске
            if (fs.existsSync(blockerCachePath)) {
                console.log('Downhload Ublock...');
                const buffer = fs.readFileSync(blockerCachePath);
                blocker = await ElectronBlocker.deserialize(buffer);
            } else {
                console.log('Cash not found');
                blocker = await ElectronBlocker.fromLists(fetch, [
                    'https://easylist.to/easylist/easylist.txt',
                    'https://easylist.to/easylist/easyprivacy.txt',
                    'https://ruadlist.github.io/ruadlist/ruadlist.txt',
                    'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt'
                ]);
                // Сохраняем на диск для следующего раза
                fs.writeFileSync(blockerCachePath, blocker.serialize());
            }

            blocker.enableBlockingInSession(session.defaultSession);
            console.log('Ublock Ready');
        } catch (err) {
            console.error('Не удалось запустить блокировщик:', err);
        }
    };

setupBlocker(); // Запускаем в фоне

    // Настройка User-Agent
    // Находим место, где были старые строки, и пишем:
     setUserAgent('desktop');


    // Обработчик выбора экрана (Screen Sharing)
    session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        desktopCapturer.getSources({
            types: ['screen', 'window'],
            thumbnailSize: { width: 150, height: 150 }
        }).then((sources) => {
            const filteredSources = sources.filter(source => {
                const name = source.name.toLowerCase();
                if (!name || name.trim() === "") return false;
                if (name.includes('.ini')) return false; // Скрываем Rainmeter

                const junkApps = ['nvidia geforce overlay', 'settings', 'параметры', 'program manager'];
                if (junkApps.some(junk => name.includes(junk))) return false;
                if (source.thumbnail.isEmpty()) return false;
                return true;
            });

            const menu = Menu.buildFromTemplate(
                filteredSources.map((source) => ({
                    label: source.name,
                    click: () => callback({ video: source, audio: 'loopback' })
                }))
            );
            if (filteredSources.length > 0) {
                menu.popup();
            } else {
                console.log("Actiw window not found.");
            }
        });
    });

    // Настройка Прокси
    const proxyConfig = {
        proxyRules: "http://77.239.104.196:8888",
        proxyBypassRules: "vk.com, m.vk.com, google.com, yandex.ru, mail.yandex.ru, kinopoisk.ru, www.kinopoisk.ru, disk.yandex.ru, 2ip.ru, ya.ru, mail.ru, *.my-local-site.ru"
    };
    session.defaultSession.setProxy(proxyConfig)
        .then(() => {
            console.log('Proxy configured.');
            win.loadFile('index.html');
        })
        .catch((err) => console.error('Proxy error:', err));
   
       

    // Снятие защиты заголовков (CORS/X-Frame)
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = details.responseHeaders;
        const blockList = ['x-frame-options', 'content-security-policy', 'frame-ancestors'];
        
        Object.keys(responseHeaders).forEach(header => {
            if (blockList.includes(header.toLowerCase())) {
                delete responseHeaders[header];
            }
        });

        // ПРИНУДИТЕЛЬНО РАЗРЕШАЕМ ВСЁ ДЛЯ ВИДЕО
        responseHeaders['Access-Control-Allow-Origin'] = ['*'];
        // Помогаем YouTube понять, что мы свои
        if (details.url.includes('youtube.com')) {
            responseHeaders['Feature-Policy'] = ["autoplay 'self'; fullscreen 'self'"];
        }

        callback({ cancel: false, responseHeaders });
    });
}

// Авторизация на прокси
app.on('login', (event, webContents, request, authInfo, callback) => {
    if (authInfo.isProxy) {
        event.preventDefault();
        callback('user', 'pass123'); // Твои данные Gost
    }
});


// Запуск приложения
app.whenReady().then(() => {
    createApplicationMenu(); // Инициализируем меню
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
}); 