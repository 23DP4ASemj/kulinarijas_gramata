class AuthManager {
    constructor() {
        this.api = window.apiClient;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.setupProtectedContent();
    }

    checkAuthStatus() {
        const user = this.api.getCurrentUser();
        if (user) {
            this.showAuthenticatedUI(user);
            this.updateUserStats(); // Обновляем статистику при загрузке
        } else {
            this.showUnauthenticatedUI();
        }
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button will be added dynamically
    }

    setupProtectedContent() {
        // Показываем/скрываем защищенный контент на основе аутентификации
        this.toggleProtectedContent();
        
        // Добавляем обработчики для защищенных ссылок
        this.setupProtectedLinks();
    }

    toggleProtectedContent() {
        const isAuthenticated = this.api.isAuthenticated();
        const protectedElements = document.querySelectorAll('.protected');
        
        protectedElements.forEach(element => {
            if (isAuthenticated) {
                element.style.display = element.dataset.originalDisplay || 'block';
            } else {
                // Сохраняем оригинальное display значение
                if (!element.dataset.originalDisplay) {
                    element.dataset.originalDisplay = window.getComputedStyle(element).display;
                }
                element.style.display = 'none';
            }
        });

        // Обновляем навигацию
        this.updateNavigation(isAuthenticated);
    }

    setupProtectedLinks() {
        document.addEventListener('click', (e) => {
            const protectedLink = e.target.closest('a.protected');
            if (protectedLink && !this.api.isAuthenticated()) {
                e.preventDefault();
                this.showNotification('Lai piekļūtu šai lapai, jāpieslēdzas', 'error');
                // Перенаправляем на страницу входа с редиректом обратно
                const currentUrl = encodeURIComponent(window.location.href);
                window.location.href = `login.html?redirect=${currentUrl}`;
            }
        });
    }

    updateNavigation(isAuthenticated) {
        const navLinks = document.querySelectorAll('.navigation a');
        navLinks.forEach(link => {
            if (link.classList.contains('protected') && !isAuthenticated) {
                link.style.display = 'none';
            } else if (link.classList.contains('protected') && isAuthenticated) {
                link.style.display = 'flex';
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const result = await this.api.login({ email, password });
            this.showNotification('Pieteikšanās veiksmīga!', 'success');
            this.showAuthenticatedUI(result.user);
            
            // Проверяем новые достижения
            const newAchievements = await this.api.checkForNewAchievements();
            if (newAchievements.length > 0) {
                newAchievements.forEach(achievement => {
                    this.showNotification(`🏆 Jauns sasniegums: ${achievement.title}`, 'success');
                });
            }
            
            // Перенаправляем после 1 секунды
            setTimeout(() => {
                const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
                if (redirectUrl) {
                    window.location.href = decodeURIComponent(redirectUrl);
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);

        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const fullName = document.getElementById('registerFullName').value;

        // Базовая валидация
        if (!username || !email || !password || !fullName) {
            this.showNotification('Lūdzu, aizpildiet visus laukus', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Parolei jābūt vismaz 6 rakstzīmēm', 'error');
            return;
        }

        try {
            const result = await this.api.register({ 
                username, 
                email, 
                password, 
                fullName 
            });
            
            this.showNotification('Reģistrācija veiksmīga! Lūdzu, pieslēdzieties.', 'success');
            
            // Автоматически логиним пользователя после регистрации
            setTimeout(async () => {
                try {
                    const loginResult = await this.api.login({ email, password });
                    this.showAuthenticatedUI(loginResult.user);
                    window.location.href = 'profile.html';
                } catch (loginError) {
                    window.location.href = 'login.html';
                }
            }, 1500);

        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    handleLogout() {
        this.api.logout();
        this.showUnauthenticatedUI();
        this.showNotification('Izrakstīšanās veiksmīga', 'success');
        
        // Обновляем интерфейс
        this.toggleProtectedContent();
        
        // Перенаправляем на главную страницу
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    showAuthenticatedUI(user) {
        // Обновляем навигацию во всех местах
        const authLinks = document.querySelectorAll('.auth-links');
        authLinks.forEach(link => {
            link.innerHTML = `
                <div class="user-nav-section">
                    <a href="profile.html" class="user-info">
                        <img src="${user.avatar || 'images/avatar.jpg'}" alt="${user.fullName}" class="user-avatar">
                        <span class="user-name">${user.fullName}</span>
                        ${user.isVerified ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </a>
                    <div class="user-nav-dropdown">
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user"></i> Mans profils
                        </a>
                        <a href="profile.html?tab=recipes" class="dropdown-item">
                            <i class="fas fa-utensils"></i> Manas receptes
                        </a>
                        <a href="profile.html?tab=collections" class="dropdown-item">
                            <i class="fas fa-folder"></i> Manas kolekcijas
                        </a>
                        <div class="dropdown-divider"></div>
                        <button onclick="window.authManager.handleLogout()" class="dropdown-item logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Iziet
                        </button>
                    </div>
                </div>
            `;
        });

        // Показываем защищенный контент
        this.toggleProtectedContent();
        
        // Обновляем статистику пользователя
        this.updateUserStats();
        
        // Добавляем обработчики для выпадающего меню
        this.setupUserDropdown();
    }

    setupUserDropdown() {
        document.addEventListener('click', (e) => {
            const userInfo = e.target.closest('.user-info');
            const dropdown = document.querySelector('.user-nav-dropdown');
            
            if (userInfo && dropdown) {
                dropdown.classList.toggle('active');
            } else if (dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    updateUserStats() {
        const user = this.api.getCurrentUser();
        if (!user) return;

        // Обновляем счетчики в навигации, если есть такие элементы
        const recipeCountElements = document.querySelectorAll('.user-recipe-count');
        const subscriberCountElements = document.querySelectorAll('.user-subscriber-count');
        
        recipeCountElements.forEach(el => {
            el.textContent = user.stats.recipesCount;
        });
        
        subscriberCountElements.forEach(el => {
            el.textContent = user.stats.subscribersCount;
        });
    }

    showUnauthenticatedUI() {
        const authLinks = document.querySelectorAll('.auth-links');
        authLinks.forEach(link => {
            link.innerHTML = `
                <div class="auth-buttons">
                    <a href="login.html" class="btn btn-outline">
                        <i class="fas fa-sign-in-alt"></i> Pieteikties
                    </a>
                    <a href="register.html" class="btn btn-primary">
                        <i class="fas fa-user-plus"></i> Reģistrēties
                    </a>
                </div>
            `;
        });

        // Скрываем защищенный контент
        this.toggleProtectedContent();
    }

    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : ''}
                    ${type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : ''}
                    ${type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' : ''}
                    ${type === 'info' ? '<i class="fas fa-info-circle"></i>' : ''}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Добавляем стили если их нет
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    max-width: 400px;
                    animation: slideInRight 0.3s ease;
                    border-left: 4px solid;
                    overflow: hidden;
                }
                
                .notification.success {
                    border-left-color: #10b981;
                }
                
                .notification.error {
                    border-left-color: #ef4444;
                }
                
                .notification.info {
                    border-left-color: #3b82f6;
                }
                
                .notification.warning {
                    border-left-color: #f59e0b;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    gap: 0.75rem;
                }
                
                .notification-icon {
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }
                
                .notification.success .notification-icon {
                    color: #10b981;
                }
                
                .notification.error .notification-icon {
                    color: #ef4444;
                }
                
                .notification.info .notification-icon {
                    color: #3b82f6;
                }
                
                .notification.warning .notification-icon {
                    color: #f59e0b;
                }
                
                .notification-message {
                    flex: 1;
                    font-weight: 500;
                    color: #1f2937;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                
                .notification-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .dark-theme .notification {
                    background: #1f2937;
                }
                
                .dark-theme .notification-message {
                    color: #f9fafb;
                }
                
                .dark-theme .notification-close:hover {
                    background: #374151;
                }
                
                /* User dropdown styles */
                .user-nav-section {
                    position: relative;
                }
                
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    transition: all 0.3s;
                    text-decoration: none;
                    color: inherit;
                }
                
                .user-info:hover {
                    background: var(--hover-bg);
                }
                
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid var(--primary-color);
                }
                
                .user-name {
                    font-weight: 500;
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .verified-badge {
                    color: var(--primary-color);
                    font-size: 0.875rem;
                }
                
                .user-nav-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    min-width: 200px;
                    z-index: 1000;
                    display: none;
                    overflow: hidden;
                }
                
                .user-nav-dropdown.active {
                    display: block;
                    animation: slideDown 0.2s ease;
                }
                
                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    text-decoration: none;
                    color: var(--text-color);
                    transition: all 0.2s;
                    border: none;
                    background: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    font-size: 0.9rem;
                }
                
                .dropdown-item:hover {
                    background: var(--hover-bg);
                }
                
                .dropdown-item i {
                    width: 16px;
                    text-align: center;
                }
                
                .dropdown-divider {
                    height: 1px;
                    background: var(--border-color);
                    margin: 0.25rem 0;
                }
                
                .logout-btn {
                    color: #ef4444;
                }
                
                .logout-btn:hover {
                    background: #fef2f2;
                    color: #dc2626;
                }
                
                .dark-theme .logout-btn:hover {
                    background: #7f1d1d;
                }
                
                .auth-buttons {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (max-width: 768px) {
                    .auth-buttons {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                    
                    .user-name {
                        display: none;
                    }
                    
                    .user-nav-dropdown {
                        right: -50px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Удаляем предыдущие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach((notif, index) => {
            if (index > 2) {
                notif.remove();
            }
        });

        document.body.appendChild(notification);

        // Автоматически удаляем через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // Метод для показа ошибок
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Метод для показа успешных операций
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Проверка прав доступа к странице
    requireAuth(redirectUrl = null) {
        if (!this.api.isAuthenticated()) {
            const redirect = redirectUrl || encodeURIComponent(window.location.href);
            window.location.href = `login.html?redirect=${redirect}`;
            return false;
        }
        return true;
    }

    // Проверка является ли пользователь владельцем контента
    isContentOwner(authorId) {
        const user = this.api.getCurrentUser();
        return user && user.id === authorId;
    }

    // Получение уровня пользователя на основе статистики
    getUserLevel(stats) {
        const totalPoints = (stats.recipesCount * 5) + (stats.subscribersCount * 3) + Math.floor(stats.rating * 10);
        
        if (totalPoints >= 200) return 'expert';
        if (totalPoints >= 100) return 'advanced';
        if (totalPoints >= 50) return 'intermediate';
        return 'beginner';
    }

    // Обновление уровня пользователя
    updateUserLevel() {
        const user = this.api.getCurrentUser();
        if (!user) return;

        const newLevel = this.getUserLevel(user.stats);
        if (newLevel !== user.level) {
            // Обновляем уровень пользователя
            this.api.updateUserProfile(user.id, { level: newLevel })
                .then(() => {
                    this.showNotification(`Apsveicu! Tagad esat ${this.getLevelDisplayName(newLevel)}`, 'success');
                })
                .catch(error => {
                    console.error('Error updating user level:', error);
                });
        }
    }

    getLevelDisplayName(level) {
        const levels = {
            'beginner': 'Iesācējs',
            'intermediate': 'Vidēji pieredzējis',
            'advanced': 'Pieredzējis',
            'expert': 'Eksperts'
        };
        return levels[level] || level;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});