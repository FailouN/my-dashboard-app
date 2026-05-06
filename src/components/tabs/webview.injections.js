const WebviewInjections = {
    // 1. Все CSS инъекции
    getCSS: () => `
         ::-webkit-scrollbar { 
            width: 0px !important; 
            display: none !important; 
        }

        /* СДВИГАЕМ ВЕСЬ САЙТ ВНИЗ НА 32 ПИКСЕЛЯ */
        html, body {
            margin-top: 14px !important; 
            position: relative !important;
        }
        /* 4. СПЕЦИАЛЬНО ДЛЯ YOUTUBE (и других сайтов с фиксированными шапками) */
    
    /* Сдвигаем основной контейнер мастхеда */
    ytd-masthead, 
    #masthead-container.ytd-app, 
    #container.ytd-masthead {
        transform: translateY(6px) !important;
        top: 0 !important;
    }

    /* Сдвигаем фоновую подложку шапки, если она отдельным элементом */
    #background.ytd-masthead {
        top: 6px !important;
    }

    /* Чтобы контент под шапкой не уезжал слишком сильно, 
       корректируем главный контейнер приложения */
    ytd-page-manager {
        margin-top: 6px !important;
    }
    
    /* Для поиска YouTube (выпадающий список) */
    .sbdd_a { 
        margin-top: 6px !important; 
    }
        /* 4. СПЕЦИАЛЬНО ДЛЯ VK */

/* 1. Двигаем основной контейнер шапки (самый верхний уровень) */
#page_header_cont,
.vkuiFixedLayout--top,
[data-onboarding-tooltip-container="fixed"] {
    top: 24px !important;
}

/* 2. Двигаем обертку (id из твоего скриншота) */
#page_header_wrap {
    top: 24px !important;
}

/* 3. Двигаем сам контент внутри шапки (лого, поиск, плеер) */
#page_header {
    height: 48px !important; /* Фиксируем высоту */
    display: flex !important;
    align-items: center !important; /* Центрируем по вертикали */
}

/* 4. Сдвигаем левое меню и тело страницы, чтобы не было дырки или нахлеста */
#side_bar, 
#page_body, 
.LayoutWrapper__root--aldwF,
.vkuiAppRoot__main {
    padding-top: 14px !important;
}

/* 5. Исправляем z-index, чтобы шапка не перекрывалась */
#page_header_cont {
    z-index: 1000 !important;
}

/* Системные переменные ВК для внутренних отступов */
:root {
    --vkui_internal--safe_area_inset_top: 16px !important;
    --vkui_internal--header_height: 48px !important;
}
    `,

    // 2. Все JS инъекции (сюда потом добавишь логику для звонков)
    getJS: () => `
        // Горячие клавиши внутри сайта
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.code === 'KeyD') {
                e.preventDefault();
                console.log('WEBVIEW_ACTION:SAVE_BOOKMARK');
            }
        });

        // Навигация мышью
        window.addEventListener('mouseup', (e) => {
            if (e.button === 3) console.log('WEBVIEW_ACTION:GO_BACK');
            if (e.button === 4) console.log('WEBVIEW_ACTION:GO_FORWARD');
        });

        // Клик вовне (для закрытия меню)
        window.addEventListener('mousedown', () => {
            console.log('WEBVIEW_ACTION:EXTERNAL_CLICK');
        });
        
        // Тут в будущем будет код для перехвата звонков:
        // window.onCallReceived = ...
    `
};