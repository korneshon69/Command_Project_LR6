// Утилиты для работы с localStorage
const Storage = {
    // Получить всех пользователей (API + локальные)
    getUsers() {
        const localUsers = localStorage.getItem('users');
        return localUsers ? JSON.parse(localUsers) : [];
    },

    // Добавить пользователя в localStorage
    addUser(user) {
        const users = this.getUsers();
        // Генерируем уникальный ID для локальных пользователей (отрицательные числа)
        const maxId = users.length > 0 
            ? Math.min(...users.map(u => u.id))
            : 0;
        user.id = maxId <= 0 ? maxId - 1 : -1;
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    },

    // Удалить пользователя из localStorage
    removeUser(userId) {
        const users = this.getUsers();
        const filtered = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filtered));
    },

    // Получить todos пользователя (локальные)
    getUserTodos(userId) {
        const todos = localStorage.getItem(`todos_${userId}`);
        return todos ? JSON.parse(todos) : [];
    },

    // Добавить todo к пользователю
    addTodo(userId, todo) {
        const todos = this.getUserTodos(userId);
        const maxId = todos.length > 0 
            ? Math.min(...todos.map(t => t.id))
            : 0;
        todo.id = maxId <= 0 ? maxId - 1 : -1;
        todo.userId = userId;
        todos.push(todo);
        localStorage.setItem(`todos_${userId}`, JSON.stringify(todos));
        return todo;
    }
};

