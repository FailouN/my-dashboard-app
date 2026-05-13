const RenderedComponents = {};

class Component extends HTMLElement {
  refs = {};

  // Оставил ресурсы как в исходнике, чтобы ссылки в других файлах не отвалились
  resources = {
    fonts: {
      roboto: '<link href="https://fonts.googleapis.com/css?family=Roboto:100,400,700" rel="stylesheet">',
      nunito: '<link href="https://fonts.googleapis.com/css?family=Nunito:200" rel="stylesheet">',
      raleway: '<link href="https://fonts.googleapis.com/css?family=Raleway:600" rel="stylesheet">'
    },
    icons: {
      material: '<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" type="text/css">',
      cryptofont: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/monzanifabio/cryptofont/cryptofont.css">',
      tabler: '<link rel="stylesheet" href="src/css/tabler-icons.min.css">'
    },
    libs: {
      awoo: '<link rel="stylesheet" type="text/css" href="src/css/awoo.min.css">'
    }
  };

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  style()    { return null; }
  template() { return null; }
  imports()  { return []; }

  set stylePath(path) {
    this.resources.style = `<link rel="preload" as="style" href="${path}" onload="this.rel='stylesheet'">`;
  }

  get getResources() {
    const imports = this.imports();
    if (this.resources?.style) imports.push(this.resources.style);
    return imports;
  }

  async loadStyles() {
    let html = this.getResources.join("\n");
    const styleContent = this.style();
    if (styleContent) html += `<style>${styleContent}</style>`;
    return html;
  }

  async buildHTML() {
    return await this.loadStyles() + await this.template();
  }

  // Оставил твою логику Proxy, но починил работу с селекторами
  createRef() {
    return new Proxy(this.refs, {
      get: (target, prop) => {
        const selector = target[prop];
        if (!selector) return null;

        const elems = this.shadow.querySelectorAll(selector);
        if (elems.length > 1) return Array.from(elems);
        if (elems.length === 1) return elems[0];
        
        return selector;
      },
      set: (target, prop, value) => {
        const el = this.shadow.querySelector(target[prop]);
        if (el) el.innerHTML = value;
        return true;
      }
    });
  }

  // Самое важное: чистим за собой при удалении компонента
  disconnectedCallback() {
    delete RenderedComponents[this.localName];
  }

  async render() {
    // Используем DocumentFragment для быстрой вставки без лишнего мерцания
    const html = await this.buildHTML();
    const template = document.createElement('template');
    template.innerHTML = html;
    
    // Очищаем и вставляем
    this.shadow.innerHTML = ''; 
    this.shadow.appendChild(template.content.cloneNode(true));

    this.refs = this.createRef();
    RenderedComponents[this.localName] = this;
  }
}