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

    // Основной метод показа меню
    showContextMenu(e, url) {
        this.selectedUrl = url;
        let menu = this.root.getElementById('bookmark-context-menu');
        
        if (!menu) {
            menu = document.createElement('div');
            menu.id = 'bookmark-context-menu';
            this.root.getElementById('links').appendChild(menu);
        }

        menu.innerHTML = `
            <div class="ctx-item" data-action="open">Открыть</div>
            <div class="ctx-item" data-action="preview">Открыть превью</div>
            <div class="ctx-item" data-action="new-win">В новом окне</div>
            <div class="ctx-item delete" data-action="delete">Удалить</div>
        `;

        menu.style.display = 'block';
        menu.style.position = 'fixed';
        
        // Считаем координаты (левый нижний угол у курсора)
        const menuHeight = menu.offsetHeight || 120; // 120 как запасной вариант
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY - menuHeight}px`;

        // Вешаем события на кнопки ПРЯМО ЗДЕСЬ
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
        let bookmarks = this.getBookmarks().filter(b => b !== url);
        localStorage.setItem(this.storageKey, JSON.stringify(bookmarks));
        this.render();
    }

    getBookmarks() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    }

    render() {
        const menu = this.root.getElementById('bookmarks-menu');
        if (!menu) return;

        const bookmarks = this.getBookmarks();
        menu.innerHTML = bookmarks.map(url => {
            let domain = "link";
            try { domain = new URL(url).hostname; } catch(e) {}
            return `
                <div class="bookmark-item" data-url="${url}">
                    <img src="https://www.google.com/s2/favicons?sz=32&domain=${domain}">
                    <span>${domain}</span>
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
                // Вызываем наш обновленный метод
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