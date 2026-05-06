class BookmarkService {
    constructor(shadowRoot, openWindowCallback) {
        this.root = shadowRoot;
        this.openWindow = openWindowCallback;
        this.storageKey = 'user-bookmarks';
        this.selectedUrl = null; 
        
        // Регистрируем глобальный клик для закрытия
        document.addEventListener('mousedown', (e) => this.handleOutsideClick(e));
    }

    handleOutsideClick(e) {
        const menu = this.root.getElementById('bookmarks-menu');
        const ctxMenu = this.root.getElementById('bookmark-context-menu');
        const path = e.composedPath();

        if (menu && menu.style.display === 'flex' && !path.includes(menu)) {
            menu.style.display = 'none';
        }
        if (ctxMenu && ctxMenu.style.display === 'block' && !path.includes(ctxMenu)) {
            ctxMenu.style.display = 'none';
        }
    }

    // Метод для добавления новой закладки с заголовком
    addBookmark(url, title) {
        let bookmarks = this.getBookmarks();
        
        // Проверяем, нет ли уже такой ссылки
        if (!bookmarks.find(b => b.url === url)) {
            bookmarks.push({
                url: url,
                title: title || new URL(url).hostname // Если заголовка нет, берем домен
            });
            localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
            this.render();
        }
    }

    // Показ контекстного меню
    showContextMenu(e, url) {
        this.selectedUrl = url;
        let menu = this.root.getElementById('bookmark-context-menu');
        
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'bookmark-context-menu';
            // Убедитесь, что элемент с id 'links' существует в вашем shadowRoot
            const linksContainer = this.root.getElementById('links');
            if (linksContainer) linksContainer.appendChild(menu);
            else this.root.appendChild(menu); 
        }

        menu.innerHTML = `
            <div class="ctx-item" data-action="open">Открыть</div>
            <div class="ctx-item" data-action="preview">Открыть превью</div>
            <div class="ctx-item" data-action="new-win">В новом окне</div>
            <div class="ctx-item delete" data-action="delete">Удалить</div>
        `;

        menu.style.display = 'block';
        menu.style.position = 'fixed';
        
        // Рассчитываем позицию
        const menuHeight = menu.offsetHeight || 120;
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY - menuHeight}px`;

        menu.querySelectorAll('.ctx-item').forEach(item => {
            item.onclick = (ev) => {
                ev.stopPropagation();
                const action = item.dataset.action;
                this.handleAction(action);
                menu.style.display = 'none';
            };
        });
    }

    handleAction(action) {
        if (!this.selectedUrl) return;

        switch (action) {
            case 'open':
                this.openWindow(this.selectedUrl);
                break;
            case 'preview':
                this.root.host.dispatchEvent(new CustomEvent('open-preview', { 
                    detail: { url: this.selectedUrl } 
                }));
                break;
            case 'new-win':
                window.open(this.selectedUrl, '_blank');
                break;
            case 'delete':
                this.deleteBookmark(this.selectedUrl);
                break;
        }
    }

    deleteBookmark(url) {
        // Фильтруем по свойству url в объекте
        let bookmarks = this.getBookmarks().filter(b => b.url !== url);
        localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
        this.render();
    }

    getBookmarks() {
        const rawData = localStorage.getItem(this.storageKey);
        if (!rawData) return [];
        
        try {
            let data = JSON.parse(rawData);
            // ПРОВЕРКА И КОНВЕРТАЦИЯ: если в памяти старый формат (просто строки),
            // превращаем их в объекты на лету, чтобы код не упал.
            return data.map(item => {
                if (typeof item === 'string') {
                    return { url: item, title: new URL(item).hostname };
                }
                return item;
            });
        } catch (e) {
            console.error("Ошибка чтения закладок", e);
            return [];
        }
    }

    render() {
    const menu = this.root.getElementById('bookmarks-menu');
    if (!menu) return;

    const bookmarks = this.getBookmarks();
    menu.innerHTML = bookmarks.map(bookmark => {
        let domain = "link";
        try { domain = new URL(bookmark.url).hostname; } catch(e) {}
        
        // --- ДОБАВЛЯЕМ ЛОГИКУ ОБРЕЗКИ ТУТ ---
        const maxLength = 22; // Золотая середина (20-25)
        const displayTitle = bookmark.title.length > maxLength 
            ? bookmark.title.substring(0, maxLength) + '...' 
            : bookmark.title;
        // ------------------------------------

        return `
            <div class="bookmark-item" data-url="${bookmark.url}">
                <img src="https://www.google.com/s2/favicons?sz=32&domain=${domain}">
                <span title="${bookmark.title}">${displayTitle}</span>
            </div>
        `;
    }).join('');

        menu.querySelectorAll('.bookmark-item').forEach(el => {
            el.onclick = () => {
                this.openWindow(el.dataset.url);
                menu.style.display = 'none';
            };
            
            el.oncontextmenu = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showContextMenu(e, el.dataset.url);
            };
        });
    }

    toggleMenu() {
        const menu = this.root.getElementById('bookmarks-menu');
        if (!menu) return;
        const isVisible = menu.style.display === 'flex';
        menu.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) this.render();
    }
}