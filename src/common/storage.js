class Storage {
  constructor(key) {
    this.key = key;
  }

  /**
   * Получает данные из хранилища.
   * Если prop не указан — вернет весь объект.
   * @param {string} [prop] 
   */
  get(prop) {
    try {
      const item = localStorage.getItem(this.key);
      if (!item) return prop ? undefined : {};

      // Используем parse из твоих utils.js (JSON.parse)
      const data = parse(item);
      
      return prop ? data[prop] : data;
    } catch (e) {
      console.error(`Ошибка чтения Storage [${this.key}]:`, e);
      return prop ? undefined : {};
    }
  }

  /**
   * Сохраняет данные. 
   * Автоматически превращает объекты в строку.
   */
  save(value) {
    try {
      // Если передали объект — упаковываем его
      const dataToSave = typeof value === 'object' ? stringify(value) : value;
      localStorage.setItem(this.key, dataToSave);
    } catch (e) {
      console.error(`Ошибка записи в Storage [${this.key}]:`, e);
    }
  }

  /**
   * Проверяет, существует ли ключ в хранилище 
   * или конкретное свойство внутри сохраненного объекта.
   */
  has(prop) {
    const data = this.get();
    if (!data) return false;
    
    if (prop) return prop in data;
    return localStorage.getItem(this.key) !== null;
  }

  // Для совместимости со старым кодом, если он где-то остался
  hasValue(value) {
    return this.has(value);
  }
}