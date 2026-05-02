export const ProxyManager = {
    // Получаем список асинхронно через основной процесс
    async list() {
        try {
            return await window.proxyAPI.getBypassList();
        } catch (e) {
            console.error("Ошибка загрузки списка:", e);
            return [];
        }
    },

    async add(domain) {
        if (!domain || domain.trim() === "") return;
        
        // Ждем, пока основной процесс реально запишет файл
        await window.proxyAPI.addDomain(domain.trim());
        
        // Обновляем UI только ПОСЛЕ успешной записи
        this.render();
    },

    async remove(domain) {
        await window.proxyAPI.removeDomain(domain);
        this.render();
    },

    async render() {
        const container = document.getElementById('proxy-list-container');
        if (!container) return;

        const domains = await this.list(); // Ждем получения данных
        
        container.innerHTML = domains.map(d => `
            <div class="proxy-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background: #32302f; padding: 8px 12px; border-radius: 4px; border: 1px solid #504945;">
                <span style="color: #ebdbb2; font-size: 14px;">${d}</span>
                <button id="del-${d}" style="background:none; border:none; color:#fb4934; cursor:pointer; font-size: 18px; line-height: 1;">&times;</button>
            </div>
        `).join('');

        // Навешиваем события вручную (избегайте onclick в строках для безопасности)
        domains.forEach(d => {
            const btn = container.querySelector(`#del-${d.replace(/\./g, '\\.')}`);
            if (btn) btn.onclick = () => this.remove(d);
        });
    }
};