class Search extends Component {
  refs = {
    search: '#search',
    input: 'input[type="text"]',
    engines: '.search-engines',
    close: '.close'
  };

  constructor() {
    super();
    this.engines = CONFIG.search.engines;
  }

  style() {
    // Стиль оставляем без изменений, он у тебя хороший
    return `
      #search {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: calc(100% - 2px);
          height: 100%;
          background: rgb(24 24 29 / 90%);
          z-index: 99;
          visibility: hidden;
          top: -100%;
          backdrop-filter: blur(8px);
          transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      #search.active { top: 0; visibility: visible; }
      #search div { position: relative; width: 80%; }
      #search input {
          border: 0; outline: 0; width: 100%;
          box-shadow: inset 0 -2px rgba(255,255,255,0.2);
          padding: .5em 0; background: none;
          font: 500 24px 'Roboto', sans-serif;
          color: #d4be98;
          transition: box-shadow .2s;
      }
      #search input:focus { box-shadow: inset 0 -2px #d4be98; }
      #search .close {
          background: 0; border: 0; color: #d4be98;
          position: absolute; right: 0; cursor: pointer; top: 15px;
      }
      .search-engines {
          list-style: none; display: flex; padding: 0; margin: 1em 0;
          color: rgba(212, 190, 152, 0.4); font-size: 12px;
      }
      .search-engines li { margin-right: 1.5em; transition: color .2s; }
      .search-engines li.active { color: #d4be98; font-weight: bold; }
    `;
  }

  template() {
    return `
        <div id="search">
          <div>
            <input type="text" spellcheck="false" placeholder="Найти...">
            <button class="close"><i class="material-icons">close</i></button>
            <ul class="search-engines"></ul>
          </div>
        </div>
    `;
  }

  // Оптимизированная загрузка движков
  loadEngines() {
    const html = Object.keys(this.engines)
      .map(key => `<li data-key="!${key}"><p title="${this.engines[key][1]}">!${key}</p></li>`)
      .join('');
    this.refs.engines.innerHTML = html;
  }

  activate() {
    this.refs.search.classList.add('active');
    // Небольшая задержка для плавности анимации перед фокусом
    requestAnimationFrame(() => {
        setTimeout(() => this.refs.input.focus(), 150);
    });
  }

  deactivate() {
    this.refs.search.classList.remove('active');
    this.refs.input.value = '';
    this.updateActiveEngine(''); // Сбрасываем подсветку
  }

  // Вынесли подсветку в отдельный метод для чистоты
  updateActiveEngine(prefix) {
    this.shadowRoot.querySelectorAll('.search-engines li').forEach(li => {
      if (li.dataset.key === prefix) li.classList.add('active');
      else li.classList.remove('active');
    });
  }

  handleSearch(event) {
    const { key } = event;
    const value = this.refs.input.value.trim();
    
    if (!value && key === 'Enter') return;

    const args = value.split(' ');
    const prefix = args[0];

    // Подсветка движка "на лету"
    this.updateActiveEngine(prefix);

    if (key === 'Enter') {
      let engineUrl = this.engines['g'][0]; // Дефолт - Google
      let queryArgs = args;

      if (prefix.startsWith('!')) {
        const engineKey = prefix.substring(1);
        if (this.engines[engineKey]) {
          engineUrl = this.engines[engineKey][0];
          queryArgs = args.slice(1);
        }
      }

      const finalUrl = engineUrl + encodeURIComponent(queryArgs.join(' '));

      this.dispatchEvent(new CustomEvent('open-link', {
        detail: { url: finalUrl },
        bubbles: true,
        composed: true
      }));

      this.deactivate();
    }

    if (key === 'Escape') this.deactivate();
  }

  setEvents() {
    this._onKeyUp = (e) => this.handleSearch(e);
    this._onClose = () => this.deactivate();

    this.refs.input.addEventListener('keyup', this._onKeyUp);
    this.refs.close.addEventListener('click', this._onClose);
  }

  // Чистим за собой
  disconnectedCallback() {
    this.refs.input.removeEventListener('keyup', this._onKeyUp);
    this.refs.close.removeEventListener('click', this._onClose);
  }

  connectedCallback() {
    this.render().then(() => {
      this.loadEngines();
      this.setEvents();
    });
  }
}