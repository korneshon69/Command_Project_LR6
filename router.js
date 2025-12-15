// Роутер для навигации
const Router = {
    currentRoute: '',
    currentUser: null,
    currentPost: null,
    routes: {},

    // Зарегистрировать маршрут
    register(path, handler) {
        this.routes[path] = handler;
    },

    // Сохранить текущего пользователя
    setCurrentUser(user) {
        this.currentUser = user;
        if (user) {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }
    },

    // Загрузить текущего пользователя
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        const stored = sessionStorage.getItem('currentUser');
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return this.currentUser;
        }
        return null;
    },

    // Сохранить текущий пост
    setCurrentPost(post) {
        this.currentPost = post;
        if (post) {
            sessionStorage.setItem('currentPost', JSON.stringify(post));
        }
    },

    // Загрузить текущий пост
    getCurrentPost() {
        if (this.currentPost) return this.currentPost;
        const stored = sessionStorage.getItem('currentPost');
        if (stored) {
            this.currentPost = JSON.parse(stored);
            return this.currentPost;
        }
        return null;
    },

    // Обработать текущий хеш
    async handleRoute(hash) {
        // Нормализуем хеш
        if (!hash || hash === '#' || hash === '') {
            hash = '#users';
        }

        this.currentRoute = hash;
        
        // Обновляем breadcrumbs
        const breadcrumbsContainer = document.getElementById('breadcrumbs');
        if (breadcrumbsContainer) {
            Breadcrumbs.render(breadcrumbsContainer, hash);
        }

        // Вызываем обработчик маршрута
        const handler = this.routes[hash];
        if (handler) {
            await handler();
        } else {
            // Если точного совпадения нет, пробуем найти по паттерну
            const parts = hash.split('#').filter(p => p);
            if (parts.length > 0) {
                const baseRoute = '#' + parts[0];
                if (this.routes[baseRoute]) {
                    await this.routes[baseRoute]();
                }
            }
        }
    },

    // Инициализация роутера
    init() {
        // Обработчик изменения хеша
        window.addEventListener('hashchange', () => {
            this.handleRoute(window.location.hash);
        });

        // Обработка начального хеша
        this.handleRoute(window.location.hash);
    }
};

