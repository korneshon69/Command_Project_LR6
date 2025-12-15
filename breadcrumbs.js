// Breadcrumbs навигация
const Breadcrumbs = {
    // Навигационная цепочка
    routes: {
        'users': { label: 'Пользователи', path: '#users' },
        'todos': { label: 'Задачи', path: '#users#todos' },
        'posts': { label: 'Посты', path: '#users#posts' },
        'comments': { label: 'Комментарии', path: '#users#posts#comments' }
    },

    // Получить breadcrumbs для текущего пути
    getBreadcrumbs(hash) {
        const parts = hash.split('#').filter(p => p);
        const breadcrumbs = [{ label: 'Главная', path: '#' }];

        parts.forEach((part, index) => {
            const route = this.routes[part];
            if (route) {
                // Собираем путь до текущего элемента
                const pathParts = parts.slice(0, index + 1);
                const path = '#' + pathParts.join('#');
                breadcrumbs.push({ label: route.label, path });
            }
        });

        return breadcrumbs;
    },

    // Создать компонент breadcrumbs
    render(container, hash) {
        const breadcrumbs = this.getBreadcrumbs(hash);
        
        const nav = builder.createElement('nav', { className: 'breadcrumbs' });
        const list = builder.createElement('ul', { className: 'breadcrumbs-list' });

        breadcrumbs.forEach((crumb, index) => {
            const li = builder.createElement('li', { className: 'breadcrumbs-item' });
            
            if (index === breadcrumbs.length - 1) {
                // Последний элемент - не ссылка
                const span = builder.createElement('span', { className: 'breadcrumbs-current' }, {}, crumb.label);
                li.appendChild(span);
            } else {
                // Остальные - ссылки
                const link = builder.createLink(crumb.label, crumb.path, 'breadcrumbs-link', (e) => {
                    e.preventDefault();
                    window.location.hash = crumb.path;
                });
                li.appendChild(link);
            }

            // Разделитель
            if (index < breadcrumbs.length - 1) {
                const separator = builder.createElement('span', { className: 'breadcrumbs-separator' }, {}, ' / ');
                li.appendChild(separator);
            }

            list.appendChild(li);
        });

        nav.appendChild(list);
        container.innerHTML = '';
        container.appendChild(nav);
    }
};

