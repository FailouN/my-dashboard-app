// hotkeys.manager.js
const HotkeyManager = {
    /**
     * Скрипт, который впрыскивается в каждый webview при загрузке.
     * Обернут в (function(){...})() для изоляции и гарантированного возврата undefined.
     */
    getInjectionScript: () => `
        (function() {
            if (window.HotkeyControl) return;

            window.HotkeyControl = {
                toggleMedia: function() {
                    try {
                        // 1. Стандартные HTML5 плееры
                        const media = document.querySelectorAll('video, audio');
                        media.forEach(m => {
                            if (m.paused) {
                                m.play().catch(() => {});
                            } else {
                                m.pause();
                            }
                        });

                        // 2. Управление через Media Session API
                        if (navigator.mediaSession && navigator.mediaSession.playbackState !== 'none') {
                            const state = navigator.mediaSession.playbackState;
                            navigator.mediaSession.playbackState = (state === 'playing') ? 'paused' : 'playing';
                        }

                        // 3. Специфические кнопки для Яндекс.Музыки и других сервисов
                        const playBtn = document.querySelector('button[aria-label="Пауза"], button[aria-label="Воспроизвести"]');
                        if (playBtn) {
                            playBtn.click();
                        }
                    } catch (e) {
                        console.error("HotkeyControl Error:", e);
                    }
                    
                    // ВАЖНО: Возвращаем null, чтобы Electron не пытался клонировать сложные объекты
                    return null;
                }
            };
        })();
        undefined; // Явный возврат примитива
    `,

    /**
     * Рассылает команду всем активным webview.
     * Добавлены проверки на готовность DOM и корректное состояние.
     */
    execute: async (root) => {
        if (!root) return;

        const webviews = root.querySelectorAll('webview');
        
        for (const wv of webviews) {
            try {
                // ПРОВЕРКА 1: Элемент должен быть в DOM
                if (!wv.isConnected || !wv.parentElement) continue;

                // ПРОВЕРКА 2: Webview должен быть готов (не в состоянии загрузки)
                // Если он еще грузится, вызов executeJavaScript вызовет ошибку
                if (wv.isLoading()) continue;

                // ПРОВЕРКА 3: Наличие метода (защита от обращения к неинициализированному объекту)
                if (typeof wv.executeJavaScript !== 'function') continue;

                // Выполняем скрипт. Оборачиваем вызов в void, чтобы ничего не возвращать в основной процесс.
                await wv.executeJavaScript("if(window.HotkeyControl) { window.HotkeyControl.toggleMedia(); void 0; }");

            } catch (e) {
                // Ловим и гасим ошибки для конкретной вкладки (например, если она "упала" или закрывается)
                if (e.message.includes('cloned') || e.message.includes('attached')) {
                    // Эти ошибки мы ожидаем в переходных состояниях, просто игнорируем их
                    continue;
                }
                console.warn("HotkeyManager: Skip webview", e.message);
            }
        }
    }
};

// Экспортируем, если используешь модули, или оставляем так для глобального доступа
// export default HotkeyManager;