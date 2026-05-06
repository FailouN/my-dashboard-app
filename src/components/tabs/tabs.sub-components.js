window.Links = class Links extends Component {
    constructor() {
        super();
    }
     
     static getIcon(link) {
    const defaultColor = "#726f6f";
    
    // 1. Системная иконка из конфига (приоритет)
    if (link.icon && link.icon.trim() !== "") {
        return `<i class="ti ti-${link.icon} link-icon" style="color: ${link.icon_color ?? defaultColor}"></i>`;
    }
    
    try {
        const domain = new URL(link.url).hostname;
        const cacheKey = `icon_cache_${domain}`;
        const cachedData = localStorage.getItem(cacheKey);

        // 2. Если иконка уже есть в LocalStorage — отдаем её сразу
        if (cachedData) {
            return `<img src="${cachedData}" class="link-icon" style="width: 24px; height: 24px; object-fit: contain; margin-bottom: 2px;">`;
        }

        // 3. Если нет — загружаем и кэшируем "на лету"
        const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        const iconId = `icon-${Math.random().toString(36).substr(2, 9)}`;

        // Фоновая функция для сохранения в кэш
        setTimeout(() => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Важно для работы с Canvas
            img.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(this, 0, 0);
                try {
                    const dataURL = canvas.toDataURL("image/png");
                    localStorage.setItem(cacheKey, dataURL);
                } catch (e) {
                    console.warn("Кэш переполнен или ошибка CORS");
                }
            };
            img.src = googleUrl;
        }, 100);

        return `<img id="${iconId}" src="${googleUrl}" 
                    class="link-icon" 
                    style="width: 24px; height: 24px; object-fit: contain; margin-bottom: 2px;"
                    onerror="this.onerror=null; this.outerHTML='<i class=\'ti ti-link link-icon\' style=\'color: #726f6f\'></i>';">`;
    } catch (e) {
        return `<i class="ti ti-link link-icon"></i>`;
    }
}

    static getAll(tabName, tabs) {
        if (!tabs) return "";
        const tab = tabs.find((t) => t.name === tabName);
        if (!tab) return "";
        
        const { categories } = tab;

        return `
            ${categories.map(({ name, links }) => {
                return `
                    <li>
                        <h1>${name}</h1>
                        <div class="links-wrapper">
                            ${links.map((link) => `
                                <div class="link-info">
                                    <a href="${link.url}">
                                        ${Links.getIcon(link)}
                                        ${link.name ? `<p class="link-name">${link.name}</p>` : ""}
                                    </a>
                                </div>
                            `).join("")}
                        </div>
                    </li>
                `;
            }).join("")}
        `;
    }
}

class Category extends Component {
  constructor() {
    super();
  }

static getBackgroundStyle(url) {
    // Оставляем 100% 100% для левого баннера ("телефон")
    return `style="background-image: url(${url}); background-repeat: no-repeat; background-size: 100% 100%; background-position: center;"`;
  }

 static getAll(tabs) {
  return `
    ${tabs.map(({ name, background_url, links_background, links_blur, links_opacity }, index) => {
      
      // Передаем все настройки в style через переменные
      const linksStyle = links_background 
        ? `style="
            --bg: url(${links_background}); 
            --blur: ${links_blur || 20}px; 
            --opacity: ${links_opacity || 0.7};
          "` 
        : "";

      return `<ul class="${name}" ${index == 0 ? "active" : ""}>
          <div class="banner" ${Category.getBackgroundStyle(background_url)}></div>
          <div class="links" ${linksStyle}>
            ${Links.getAll(name, tabs)}
          </div>
        </ul>`;
    }).join("")}
  `;
  }
}
