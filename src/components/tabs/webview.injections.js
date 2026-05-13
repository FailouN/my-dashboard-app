const WebviewInjections = {
    // 1. Все CSS инъекции
    getCSS: () => `
         ::-webkit-scrollbar { 
            width: 0px !important; 
            display: none !important; 
        }
 
        // Принудительно разрешаем фуллскрин, если сайт сомневается
    document.addEventListener('fullscreenerror', (e) => {
        console.error('Fullscreen error caught:', e);
    });

    // Иногда плееры ищут эти свойства, чтобы показать кнопку
    if (!document.fullscreenEnabled) {
        Object.defineProperty(document, 'fullscreenEnabled', { value: true });
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
        
   `
};