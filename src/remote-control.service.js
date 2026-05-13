class RemoteControlService {
    constructor(shadowRoot) {
        this.shadowRoot = shadowRoot;
        this.unsubscribers = [];
    }

    init() {
        if (!window.electronAPI) return;

        // Список настроек: канал события -> логика поиска кнопки
        const actions = [
            {
                channel: 'execute-discord-answer',
                urlPart: 'discord.com',
                script: `(function() {
                    const btn = document.querySelector('button[aria-label="Присоединиться к звонку"]') || 
                                document.querySelector('button[aria-label*="Присоединиться"]') ||
                                document.querySelector('button[aria-label*="Принять"]') ||
                                document.querySelector('.join_f1ceac');
                    if (btn) {
                        btn.dispatchEvent(new MouseEvent('click', {view: window, bubbles: true, cancelable: true}));
                        btn.click();
                    }
                })()`
            },
            {
                channel: 'execute-discord-mute',
                urlPart: 'discord.com',
                script: `(function() {
                    const btn = document.querySelector('button[aria-label="Заглушить"]') || 
                                document.querySelector('button[aria-label="Включить микрофон"]') ||
                                document.querySelector('button[aria-label*="Заглушить"]') ||
                                document.querySelector('button[aria-label*="микрофон"]') ||
                                document.querySelector('.audioButtonWithMenu__5e764');
                    if (btn) {
                        const opt = { view: window, bubbles: true, cancelable: true };
                        btn.dispatchEvent(new MouseEvent('mousedown', opt));
                        btn.dispatchEvent(new MouseEvent('mouseup', opt));
                        btn.click();
                    }
                })()`
            },
            {
                channel: 'execute-yandex-play',
                urlPart: 'music.yandex',
                script: `(function() {
                    const btn = document.querySelector('.BaseSonataControlsDesktop_sonataButtons__7vLtw button[aria-label="Воспроизведение"]') || 
                                document.querySelector('.BaseSonataControlsDesktop_sonataButtons__7vLtw button[aria-label="Пауза"]');
                    if (btn) btn.click();
                })()`
            },
            {
                channel: 'execute-yandex-next',
                urlPart: 'music.yandex',
                script: `document.querySelector('.BaseSonataControlsDesktop_sonataButtons__7vLtw button[aria-label="Следующая песня"]')?.click();`
            },
            {
                channel: 'execute-yandex-prev',
                urlPart: 'music.yandex',
                script: `document.querySelector('.BaseSonataControlsDesktop_sonataButtons__7vLtw button[aria-label="Предыдущая песня"]')?.click();`
            }
        ];

        // Регистрируем все события в цикле
        actions.forEach(action => {
            const unsub = window.electronAPI.on(action.channel, () => {
                this.executeInWebviews(action.urlPart, action.script);
            });
            this.unsubscribers.push(unsub);
        });
    }

    // Универсальный метод для запуска скрипта во всех подходящих webview
    executeInWebviews(urlPart, script) {
        const allFrames = this.shadowRoot.querySelectorAll('webview');
        allFrames.forEach(frame => {
            if (frame.src && frame.src.includes(urlPart) && frame.getWebContentsId) {
                frame.executeJavaScript(script).catch(() => {});
            }
        });
    }

    // Очистка при удалении компонента
    destroy() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
}

window.RemoteControlService = RemoteControlService;