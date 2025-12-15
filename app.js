// Главный файл приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    if (!app) return;

    // Создаем основную структуру приложения
    const header = builder.createElement('header', { className: 'app-header' });
    const headerTitle = builder.createHeading(1, 'SPA Application', 'app-title');
    header.appendChild(headerTitle);
    
    const breadcrumbsContainer = builder.createElement('div', { id: 'breadcrumbs' });
    const searchContainer = builder.createElement('div', { id: 'search-container', className: 'search-container' });
    const mainContent = builder.createElement('main', { id: 'main-content', className: 'main-content' });

    app.appendChild(header);
    app.appendChild(breadcrumbsContainer);
    app.appendChild(searchContainer);
    app.appendChild(mainContent);

    // Регистрируем маршруты
    Router.register('#users', async () => {
        await UsersScreen.render();
    });

    Router.register('#users#todos', async () => {
        await TodosScreen.render();
    });

    Router.register('#users#posts', async () => {
        await PostsScreen.render();
    });

    Router.register('#users#posts#comments', async () => {
        await CommentsScreen.render();
    });

    // Инициализируем роутер
    Router.init();

    // Если нет хеша, устанавливаем по умолчанию
    if (!window.location.hash || window.location.hash === '#') {
        window.location.hash = '#users';
    }
});

// Экран пользователей
const UsersScreen = {
    allUsers: [],

    async render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';

        // Заголовок
        const title = builder.createHeading(1, 'Пользователи', 'screen-title');
        mainContent.appendChild(title);

        // Кнопка добавления пользователя
        const addButton = builder.createButton('+ Добавить пользователя', 'btn btn-primary', () => {
            this.showAddUserForm();
        });
        mainContent.appendChild(addButton);

        // Контейнер для списка пользователей
        const usersContainer = builder.createContainer('users-container');
        mainContent.appendChild(usersContainer);

        // Показываем поиск
        Search.render('users');

        // Загружаем и отображаем пользователей
        await this.loadUsers();

        // Обновляем поиск после загрузки
        Search.updateHandler();
    },

    async loadUsers() {
        const usersContainer = document.querySelector('.users-container');
        if (!usersContainer) return;

        usersContainer.innerHTML = '<div class="loading">Загрузка...</div>';

        try {
            // Получаем пользователей из API
            const apiUsers = await API.getUsers();
            // Получаем локальных пользователей
            const localUsers = Storage.getUsers();
            // Объединяем (локальные с отрицательными ID будут в начале)
            this.allUsers = [...localUsers, ...apiUsers];

            this.displayUsers(this.allUsers);
        } catch (error) {
            usersContainer.innerHTML = '<div class="error">Ошибка загрузки пользователей</div>';
        }
    },

    displayUsers(users) {
        const usersContainer = document.querySelector('.users-container');
        if (!usersContainer) return;

        // Применяем фильтр поиска
        const searchValue = Search.getSearchValue().toLowerCase();
        const filtered = searchValue
            ? users.filter(user => 
                user.name.toLowerCase().includes(searchValue) || 
                user.email.toLowerCase().includes(searchValue)
            )
            : users;

        usersContainer.innerHTML = '';

        if (filtered.length === 0) {
            usersContainer.innerHTML = '<div class="empty">Пользователи не найдены</div>';
            return;
        }

        filtered.forEach(user => {
            const card = builder.createCard('', 'user-card');
            
            const name = builder.createHeading(3, user.name, 'user-name');
            const email = builder.createElement('p', { className: 'user-email' }, {}, user.email);
            const username = builder.createElement('p', { className: 'user-username' }, {}, `@${user.username}`);
            
            card.appendChild(name);
            card.appendChild(email);
            card.appendChild(username);

            // Кнопки действий
            const actions = builder.createContainer('user-actions');
            
            const todosLink = builder.createLink('Задачи', '#users#todos', 'btn btn-link', (e) => {
                e.preventDefault();
                Router.setCurrentUser(user);
                window.location.hash = '#users#todos';
            });

            const postsLink = builder.createLink('Посты', '#users#posts', 'btn btn-link', (e) => {
                e.preventDefault();
                Router.setCurrentUser(user);
                window.location.hash = '#users#posts';
            });

            actions.appendChild(todosLink);
            actions.appendChild(postsLink);

            // Кнопка удаления только для локальных пользователей
            if (user.id < 0) {
                const deleteBtn = builder.createButton('Удалить', 'btn btn-danger', () => {
                    if (confirm('Удалить пользователя?')) {
                        Storage.removeUser(user.id);
                        UsersScreen.loadUsers();
                    }
                });
                actions.appendChild(deleteBtn);
            }

            card.appendChild(actions);
            usersContainer.appendChild(card);
        });
    },

    showAddUserForm() {
        const mainContent = document.getElementById('main-content');
        const formContainer = builder.createContainer('modal-overlay', { id: 'add-user-modal' });
        
        const form = builder.createElement('form', { className: 'modal-form' }, {
            submit: async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const user = {
                    name: formData.get('name'),
                    username: formData.get('username'),
                    email: formData.get('email'),
                    phone: formData.get('phone') || '',
                    website: formData.get('website') || '',
                    address: {
                        street: '',
                        city: '',
                        zipcode: ''
                    },
                    company: {
                        name: ''
                    }
                };

                Storage.addUser(user);
                await this.loadUsers();
                formContainer.remove();
            }
        });

        const title = builder.createHeading(2, 'Добавить пользователя', 'modal-title');
        form.appendChild(title);

        const nameInput = builder.createInput('text', 'Имя', 'form-input', null, { name: 'name', required: true });
        const usernameInput = builder.createInput('text', 'Username', 'form-input', null, { name: 'username', required: true });
        const emailInput = builder.createInput('email', 'Email', 'form-input', null, { name: 'email', required: true });
        const phoneInput = builder.createInput('tel', 'Телефон', 'form-input', null, { name: 'phone' });

        form.appendChild(nameInput);
        form.appendChild(usernameInput);
        form.appendChild(emailInput);
        form.appendChild(phoneInput);

        const buttonGroup = builder.createContainer('form-actions');
        const submitBtn = builder.createButton('Добавить', 'btn btn-primary', null, { type: 'submit' });
        const cancelBtn = builder.createButton('Отмена', 'btn btn-secondary', () => {
            formContainer.remove();
        }, { type: 'button' });

        buttonGroup.appendChild(submitBtn);
        buttonGroup.appendChild(cancelBtn);
        form.appendChild(buttonGroup);

        formContainer.appendChild(form);
        mainContent.appendChild(formContainer);

        // Закрытие по клику вне формы
        formContainer.addEventListener('click', (e) => {
            if (e.target === formContainer) {
                formContainer.remove();
            }
        });
    }
};

// Экран задач
const TodosScreen = {
    allTodos: [],

    async render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';

        const user = Router.getCurrentUser();
        if (!user) {
            mainContent.innerHTML = '<div class="error">Выберите пользователя</div>';
            const backLink = builder.createLink('← Назад к пользователям', '#users', 'btn btn-link');
            mainContent.appendChild(backLink);
            return;
        }

        const title = builder.createHeading(1, `Задачи пользователя: ${user.name}`, 'screen-title');
        mainContent.appendChild(title);

        // Кнопка добавления задачи
        const addButton = builder.createButton('+ Добавить задачу', 'btn btn-primary', () => {
            this.showAddTodoForm();
        });
        mainContent.appendChild(addButton);

        const todosContainer = builder.createContainer('todos-container');
        mainContent.appendChild(todosContainer);

        // Показываем поиск
        Search.render('todos');

        await this.loadTodos();
        Search.updateHandler();
    },

    async loadTodos() {
        const todosContainer = document.querySelector('.todos-container');
        if (!todosContainer) return;

        todosContainer.innerHTML = '<div class="loading">Загрузка...</div>';

        try {
            const userId = Router.getCurrentUser().id;
            // Получаем todos из API
            const apiTodos = userId > 0 ? await API.getUserTodos(userId) : [];
            // Получаем локальные todos
            const localTodos = Storage.getUserTodos(userId);
            this.allTodos = [...localTodos, ...apiTodos];

            this.displayTodos(this.allTodos);
        } catch (error) {
            todosContainer.innerHTML = '<div class="error">Ошибка загрузки задач</div>';
        }
    },

    displayTodos(todos) {
        const todosContainer = document.querySelector('.todos-container');
        if (!todosContainer) return;

        const searchValue = Search.getSearchValue().toLowerCase();
        const filtered = searchValue
            ? todos.filter(todo => todo.title.toLowerCase().includes(searchValue))
            : todos;

        todosContainer.innerHTML = '';

        if (filtered.length === 0) {
            todosContainer.innerHTML = '<div class="empty">Задачи не найдены</div>';
            return;
        }

        filtered.forEach(todo => {
            const card = builder.createCard('', `todo-card ${todo.completed ? 'todo-completed' : ''}`);
            const checkbox = builder.createElement('input', { 
                type: 'checkbox', 
                className: 'todo-checkbox',
                checked: todo.completed 
            }, {
                change: (e) => {
                    todo.completed = e.target.checked;
                    card.classList.toggle('todo-completed', todo.completed);
                    if (todo.id < 0) {
                    const todos = Storage.getUserTodos(Router.getCurrentUser().id);
                    const index = todos.findIndex(t => t.id === todo.id);
                    if (index !== -1) {
                        todos[index] = todo;
                        localStorage.setItem(`todos_${Router.getCurrentUser().id}`, JSON.stringify(todos));
                    }
                    }
                }
            });
            
            const title = builder.createElement('span', { className: 'todo-title' }, {}, todo.title);
            
            card.appendChild(checkbox);
            card.appendChild(title);
            todosContainer.appendChild(card);
        });
    },

    showAddTodoForm() {
        const mainContent = document.getElementById('main-content');
        const formContainer = builder.createContainer('modal-overlay', { id: 'add-todo-modal' });
        
        const form = builder.createElement('form', { className: 'modal-form' }, {
            submit: async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const todo = {
                    title: formData.get('title'),
                    completed: false
                };

                Storage.addTodo(Router.getCurrentUser().id, todo);
                await this.loadTodos();
                formContainer.remove();
            }
        });

        const title = builder.createHeading(2, 'Добавить задачу', 'modal-title');
        form.appendChild(title);

        const titleInput = builder.createInput('text', 'Название задачи', 'form-input', null, { name: 'title', required: true });
        form.appendChild(titleInput);

        const buttonGroup = builder.createContainer('form-actions');
        const submitBtn = builder.createButton('Добавить', 'btn btn-primary', null, { type: 'submit' });
        const cancelBtn = builder.createButton('Отмена', 'btn btn-secondary', () => {
            formContainer.remove();
        }, { type: 'button' });

        buttonGroup.appendChild(submitBtn);
        buttonGroup.appendChild(cancelBtn);
        form.appendChild(buttonGroup);

        formContainer.appendChild(form);
        mainContent.appendChild(formContainer);

        formContainer.addEventListener('click', (e) => {
            if (e.target === formContainer) {
                formContainer.remove();
            }
        });
    }
};

// Экран постов
const PostsScreen = {
    allPosts: [],

    async render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';

        const user = Router.getCurrentUser();
        if (!user) {
            mainContent.innerHTML = '<div class="error">Выберите пользователя</div>';
            const backLink = builder.createLink('← Назад к пользователям', '#users', 'btn btn-link');
            mainContent.appendChild(backLink);
            return;
        }

        const title = builder.createHeading(1, `Посты пользователя: ${user.name}`, 'screen-title');
        mainContent.appendChild(title);

        const postsContainer = builder.createContainer('posts-container');
        mainContent.appendChild(postsContainer);

        // Показываем поиск
        Search.render('posts');

        await this.loadPosts();
        Search.updateHandler();
    },

    async loadPosts() {
        const postsContainer = document.querySelector('.posts-container');
        if (!postsContainer) return;

        postsContainer.innerHTML = '<div class="loading">Загрузка...</div>';

        try {
            const userId = Router.getCurrentUser().id;
            this.allPosts = userId > 0 ? await API.getUserPosts(userId) : [];
            this.displayPosts(this.allPosts);
        } catch (error) {
            postsContainer.innerHTML = '<div class="error">Ошибка загрузки постов</div>';
        }
    },

    displayPosts(posts) {
        const postsContainer = document.querySelector('.posts-container');
        if (!postsContainer) return;

        const searchValue = Search.getSearchValue().toLowerCase();
        const filtered = searchValue
            ? posts.filter(post => 
                post.title.toLowerCase().includes(searchValue) || 
                post.body.toLowerCase().includes(searchValue)
            )
            : posts;

        postsContainer.innerHTML = '';

        if (filtered.length === 0) {
            postsContainer.innerHTML = '<div class="empty">Посты не найдены</div>';
            return;
        }

        filtered.forEach(post => {
            const card = builder.createCard('', 'post-card');
            
            const title = builder.createHeading(3, post.title, 'post-title');
            const body = builder.createElement('p', { className: 'post-body' }, {}, post.body);
            
            const commentsLink = builder.createLink('Комментарии', '#users#posts#comments', 'btn btn-link', (e) => {
                e.preventDefault();
                Router.setCurrentPost(post);
                window.location.hash = '#users#posts#comments';
            });

            card.appendChild(title);
            card.appendChild(body);
            card.appendChild(commentsLink);
            postsContainer.appendChild(card);
        });
    }
};

// Экран комментариев
const CommentsScreen = {
    allComments: [],

    async render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';

        const post = Router.getCurrentPost();
        if (!post) {
            mainContent.innerHTML = '<div class="error">Выберите пост</div>';
            const backLink = builder.createLink('← Назад к постам', '#users#posts', 'btn btn-link');
            mainContent.appendChild(backLink);
            return;
        }
        const title = builder.createHeading(1, `Комментарии к посту: ${post.title}`, 'screen-title');
        mainContent.appendChild(title);

        const commentsContainer = builder.createContainer('comments-container');
        mainContent.appendChild(commentsContainer);

        // Показываем поиск
        Search.render('comments');

        await this.loadComments();
        Search.updateHandler();
    },

    async loadComments() {
        const commentsContainer = document.querySelector('.comments-container');
        if (!commentsContainer) return;

        commentsContainer.innerHTML = '<div class="loading">Загрузка...</div>';

        try {
            const postId = Router.getCurrentPost().id;
            this.allComments = await API.getPostComments(postId);
            this.displayComments(this.allComments);
        } catch (error) {
            commentsContainer.innerHTML = '<div class="error">Ошибка загрузки комментариев</div>';
        }
    },

    displayComments(comments) {
        const commentsContainer = document.querySelector('.comments-container');
        if (!commentsContainer) return;

        const searchValue = Search.getSearchValue().toLowerCase();
        const filtered = searchValue
            ? comments.filter(comment => 
                comment.name.toLowerCase().includes(searchValue) || 
                comment.body.toLowerCase().includes(searchValue)
            )
            : comments;

        commentsContainer.innerHTML = '';

        if (filtered.length === 0) {
            commentsContainer.innerHTML = '<div class="empty">Комментарии не найдены</div>';
            return;
        }

        filtered.forEach(comment => {
            const card = builder.createCard('', 'comment-card');
            
            const name = builder.createElement('h4', { className: 'comment-name' }, {}, comment.name);
            const email = builder.createElement('p', { className: 'comment-email' }, {}, comment.email);
            const body = builder.createElement('p', { className: 'comment-body' }, {}, comment.body);
            
            card.appendChild(name);
            card.appendChild(email);
            card.appendChild(body);
            commentsContainer.appendChild(card);
        });
    }
};

// Компонент поиска
const Search = {
    searchValue: '',
    searchType: '',

    render(type) {
        this.searchType = type;
        const container = document.getElementById('search-container');
        if (!container) return;

        container.innerHTML = '';
        const input = builder.createInput('text', 'Поиск...', 'search-input', API.debounce((e) => {
            this.searchValue = e.target.value;
            this.updateHandler();
        }, 300));

        container.appendChild(input);
    },

    getSearchValue() {
        const input = document.querySelector('.search-input');
        return input ? input.value : '';
    },

    updateHandler() {
        const hash = window.location.hash;
        if (hash === '#users') {
            UsersScreen.displayUsers(UsersScreen.allUsers);
        } else if (hash === '#users#todos') {
            TodosScreen.displayTodos(TodosScreen.allTodos);
        } else if (hash === '#users#posts') {
            PostsScreen.displayPosts(PostsScreen.allPosts);
        } else if (hash === '#users#posts#comments') {
            CommentsScreen.displayComments(CommentsScreen.allComments);
        }
    }
};

