// Утилита для создания компонентов
class ComponentBuilder {
    constructor() {
        this.elements = [];
    }

    // Создать элемент с атрибутами и слушателями
    createElement(tag, attributes = {}, listeners = {}, content = null) {
        const element = document.createElement(tag);

        // Установка атрибутов
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'style' && typeof attributes[key] === 'object') {
                Object.assign(element.style, attributes[key]);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, attributes[key]);
            } else {
                element[key] = attributes[key];
            }
        });

        // Установка слушателей событий
        Object.keys(listeners).forEach(event => {
            element.addEventListener(event, listeners[event]);
        });

        // Добавление контента
        if (content !== null) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (Array.isArray(content)) {
                content.forEach(item => {
                    if (item instanceof Node) {
                        element.appendChild(item);
                    } else if (typeof item === 'string') {
                        element.appendChild(document.createTextNode(item));
                    }
                });
            } else if (content instanceof Node) {
                element.appendChild(content);
            }
        }

        return element;
    }

    // Создать контейнер
    createContainer(className = '', attributes = {}) {
        return this.createElement('div', { className, ...attributes });
    }

    // Создать кнопку
    createButton(text, className = '', onClick = null, attributes = {}) {
        const listeners = onClick ? { click: onClick } : {};
        return this.createElement('button', { className, ...attributes }, listeners, text);
    }

    // Создать input
    createInput(type = 'text', placeholder = '', className = '', onChange = null, attributes = {}) {
        const listeners = onChange ? { input: onChange } : {};
        return this.createElement('input', {
            type,
            placeholder,
            className,
            ...attributes
        }, listeners);
    }

    // Создать ссылку
    createLink(text, href, className = '', onClick = null, attributes = {}) {
        const listeners = onClick ? { click: onClick } : {};
        return this.createElement('a', { href, className, ...attributes }, listeners, text);
    }

    // Создать заголовок
    createHeading(level, text, className = '') {
        return this.createElement(`h${level}`, { className }, {}, text);
    }

    // Создать список
    createList(items, className = '', itemClassName = '') {
        const list = this.createElement('ul', { className });
        items.forEach(item => {
            const li = this.createElement('li', { className: itemClassName });
            if (item instanceof Node) {
                li.appendChild(item);
            } else {
                li.textContent = item;
            }
            list.appendChild(li);
        });
        return list;
    }

    // Создать карточку
    createCard(content, className = '') {
        const card = this.createElement('div', { className: `card ${className}`.trim() });
        if (typeof content === 'string') {
            card.innerHTML = content;
        } else if (content instanceof Node) {
            card.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                if (item instanceof Node) {
                    card.appendChild(item);
                }
            });
        }
        return card;
    }
}

// Экспорт глобального экземпляра
const builder = new ComponentBuilder();

