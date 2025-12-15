// API модуль для работы с jsonplaceholder
const API = {
    baseUrl: 'https://jsonplaceholder.typicode.com',

    // Дебаунс функция
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Общий метод для запросов
    async request(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return [];
        }
    },

    // Получить всех пользователей
    async getUsers() {
        return this.request('/users');
    },

    // Получить todos
    async getTodos() {
        return this.request('/todos');
    },

    // Получить посты
    async getPosts() {
        return this.request('/posts');
    },

    // Получить комментарии
    async getComments() {
        return this.request('/comments');
    },

    // Получить todos конкретного пользователя
    async getUserTodos(userId) {
        return this.request(`/todos?userId=${userId}`);
    },

    // Получить посты конкретного пользователя
    async getUserPosts(userId) {
        return this.request(`/posts?userId=${userId}`);
    },

    // Получить комментарии к конкретному посту
    async getPostComments(postId) {
        return this.request(`/comments?postId=${postId}`);
    }
};

