class ConfigTab extends Component {
    refs = {
        config: '#config',
        save: '.save',
        close: '.close'
    };

    constructor() {
        super();
        const saved = localStorage.getItem("CONFIG");
        this.config = saved ? JSON.parse(saved) : CONFIG.config;
        
        // Базовый набор иконок на случай, если fetch не сработает
        this.iconNames = ["telegram", "brand-yandex", "brand-google", "2fa", "settings", "home", "user", "mail", "device-desktop"];
    }

    // Загрузка иконок вынесена в отдельный метод, который ждем при инициализации
    async initIconNames() {
        try {
            const response = await fetch('./src/css/tabler-icons.min.css');
            if (!response.ok) return;

            const cssText = await response.text();
            const regex = /\.ti-([a-z0-9-]+):before/g;
            const matches = [...cssText.matchAll(regex)];

            if (matches.length > 0) {
                const scannedNames = matches.map(match => match[1]);
                this.iconNames = [...new Set([...this.iconNames, ...scannedNames])];
                console.log(`Система: Загружено ${this.iconNames.length} иконок.`);
            }
        } catch (error) {
            console.warn("Не удалось автоматически загрузить список иконок:", error);
        }
    }

    style() {
        return window.ConfigStyles || '';
    }

    imports() {
        return [
            this.resources.fonts.roboto,
            this.resources.icons.material
        ];
    }

    template() {
        return window.getConfigTemplate(this.tabs);
    }

    activate() {
        this.refs.config.classList.add('active');
    }

    deactivate() {
        this.refs.config.classList.remove('active');
        // Скрываем все подсказки при закрытии
        this.shadowRoot.querySelectorAll('.icon-suggestions').forEach(box => {
            box.style.display = 'none';
        });
    }

    saveConfig() {
    // Вызываем статический метод save у объекта ConfigService
    window.ConfigService.save(this.shadowRoot);
}

    // Рефакторинг событий: используем именованные функции для возможности их удаления
    setEvents() {
        const root = this.shadowRoot;

        // 1. Стандартные кнопки
        root.querySelector('.close').onclick = () => this.deactivate();
        root.querySelector('.save-all').onclick = () => this.saveConfig();

        // 2. Сброс конфигурации
        const resetBtn = root.getElementById('reset-config');
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm('Сбросить все настройки к исходным?')) {
                    localStorage.removeItem("CONFIG");
                    location.reload();
                }
            };
        }

        // 3. Живой поиск иконок (Делегирование событий)
        // Вместо цикла по всем инпутам вешаем один слушатель на весь ShadowRoot
        this._onIconInput = (e) => {
            if (e.target.classList.contains('search-icon-input')) {
                const input = e.target;
                const suggestionsBox = input.nextElementSibling;
                const val = input.value.toLowerCase().trim();

                suggestionsBox.innerHTML = '';

                if (val.length < 1) {
                    suggestionsBox.style.display = 'none';
                    return;
                }

                const matches = this.iconNames
                    .filter(name => name.includes(val))
                    .slice(0, 15);

                if (matches.length > 0) {
                    suggestionsBox.style.display = 'block';
                    matches.forEach(name => {
                        const item = document.createElement('div');
                        item.className = 'icon-suggestion-item';
                        item.innerHTML = `<i class="ti ti-${name}"></i><span>${name}</span>`;

                        item.onclick = (event) => {
                            event.stopPropagation();
                            input.value = name;
                            suggestionsBox.style.display = 'none';
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        };
                        suggestionsBox.appendChild(item);
                    });
                } else {
                    suggestionsBox.style.display = 'none';
                }
            }
        };

        root.addEventListener('input', this._onIconInput);

        // Клик вне списка закрывает подсказки
        this._onOutsideClick = () => {
            root.querySelectorAll('.icon-suggestions').forEach(box => {
                box.style.display = 'none';
            });
        };
        root.addEventListener('click', this._onOutsideClick);

        // 4. Обработка кнопок выбора файлов (Обзор)
        root.querySelectorAll('.btn-browse').forEach(btn => {
            btn.onclick = async () => {
                const { target: targetId, tab: tabIdx } = btn.dataset;
                const input = tabIdx !== undefined 
                    ? root.querySelector(`.${targetId}[data-tab="${tabIdx}"]`)
                    : root.getElementById(targetId);

                if (input && window.electronAPI?.invoke) {
                    try {
                        const newPath = await window.electronAPI.invoke('select-file');
                        if (newPath) {
                            input.value = newPath;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    } catch (err) {
                        console.error("Ошибка выбора файла:", err);
                    }
                }
            };
        });

        // ESC для закрытия
        this._onEsc = (e) => { if (e.key === 'Escape') this.deactivate(); };
        window.addEventListener('keyup', this._onEsc);
    }

    // Очистка при удалении компонента (Марафет)
    disconnectedCallback() {
        const root = this.shadowRoot;
        root.removeEventListener('input', this._onIconInput);
        root.removeEventListener('click', this._onOutsideClick);
        window.removeEventListener('keyup', this._onEsc);
    }

    async connectedCallback() {
        // Сначала ждем рендер, потом загружаем иконки, потом вешаем события
        await this.render();
        await this.initIconNames();
        this.setEvents();
    }
}