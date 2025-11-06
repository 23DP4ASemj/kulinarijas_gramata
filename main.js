class MainApp {
    constructor() {
        this.api = window.apiClient;
        this.activeCollectionRecipeId = null;
        this.isSavingCollection = false;
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadPageFunctionality();
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Glob?lie apstr?d?t?ji jaunaj?m funkcij?m
        this.setupSubscriptionHandlers();
        this.setupCollectionHandlers();
        this.setupUserProfileHandlers();
        this.updateSubscriptionCounters();
    }

    setupSubscriptionHandlers() {
        // Обработчик для кнопок подписки
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.subscribe-btn') || e.target.closest('[onclick*="toggleSubscription"]')) {
                e.preventDefault();
                const button = e.target.closest('.subscribe-btn') || e.target.closest('[onclick*="toggleSubscription"]');
                const userId = button.dataset.userId;
                
                if (userId) {
                    await this.toggleSubscription(userId, button);
                }
            }
        });
    }

    setupCollectionHandlers() {
        // Обработчик для создания коллекций
        document.addEventListener('submit', async (e) => {
            if (e.target.id === 'createCollectionForm') {
                e.preventDefault();
                await this.handleCreateCollection(e.target);
            }
        });

        // Обработчик для добавления рецептов в коллекции
        document.addEventListener('click', async (e) => {
            const addButton = e.target.closest('.add-to-collection-btn');
            if (addButton) {
                e.preventDefault();
                const recipeId = addButton.dataset.recipeId;
                await this.showAddToCollectionModal(recipeId);
                return;
            }

            const collectionAddBtn = e.target.closest('.collection-add-btn');
            if (collectionAddBtn) {
                e.preventDefault();
                const collectionId = collectionAddBtn.dataset.collectionId;
                if (collectionId) {
                    await this.addRecipeToCollection(collectionId);
                }
                return;
            }

            const createFromModalBtn = e.target.closest('.create-collection-from-modal');
            if (createFromModalBtn) {
                e.preventDefault();
                this.closeAddToCollectionModal();
                this.showCreateCollectionModal();
            }
        });
    }

    setupUserProfileHandlers() {
        // Обработчик для переключения между публичными профилями
        document.addEventListener('click', async (e) => {
            if (e.target.closest('.user-profile-link')) {
                e.preventDefault();
                const link = e.target.closest('.user-profile-link');
                const userId = link.dataset.userId;
                if (userId) {
                    window.location.href = `profile-public.html?id=${userId}`;
                }
            }
        });
    }

    showCreateCollectionModal(collection = null) {
        if (!this.api?.isAuthenticated?.()) {
            this.showNotification('Lai izveidotu kolekcijas, jāpieslēdzas', 'error');
            window.authManager?.requireAuth?.();
            return;
        }

        const modal = document.getElementById('createCollectionModal');
        const form = document.getElementById('createCollectionForm');

        if (!modal || !form) {
            this.showNotification('Kolekciju logs nav pieejams šajā lapā', 'error');
            return;
        }

        const titleEl = modal.querySelector('.modal-header h3');
        const nameInput = form.querySelector('#collectionName');
        const descriptionInput = form.querySelector('#collectionDescription');
        const visibilitySelect = form.querySelector('#collectionVisibility');

        form.reset();
        delete form.dataset.collectionId;

        if (collection) {
            if (titleEl) titleEl.textContent = 'Rediģēt kolekciju';
            if (nameInput) nameInput.value = collection.name || '';
            if (descriptionInput) descriptionInput.value = collection.description || '';
            if (visibilitySelect) visibilitySelect.value = collection.visibility || 'private';
            form.dataset.collectionId = collection.id;
        } else {
            if (titleEl) titleEl.textContent = 'Izveidot jaunu kolekciju';
            if (visibilitySelect) visibilitySelect.value = 'private';
        }

        modal.style.display = 'block';
    }

    closeCreateCollectionModal() {
        const modal = document.getElementById('createCollectionModal');
        const form = document.getElementById('createCollectionForm');

        if (form) {
            form.reset();
            delete form.dataset.collectionId;
        }

        if (modal) {
            const titleEl = modal.querySelector('.modal-header h3');
            if (titleEl) titleEl.textContent = 'Izveidot jaunu kolekciju';
            modal.style.display = 'none';
        }

        this.isSavingCollection = false;
    }

    async handleCreateCollection(form) {
        if (!form || form.id !== 'createCollectionForm') {
            return;
        }

        if (!this.api?.isAuthenticated?.()) {
            this.showNotification('Lai izveidotu kolekcijas, jāpieslēdzas', 'error');
            window.authManager?.requireAuth?.();
            return;
        }

        if (this.isSavingCollection) {
            return;
        }
        this.isSavingCollection = true;

        const formData = new FormData(form);
        const name = (formData.get('name') || '').trim();
        const description = (formData.get('description') || '').trim();
        const visibility = formData.get('visibility') || 'private';

        if (!name) {
            this.showNotification('Kolekcijas nosaukums ir obligāts', 'warning');
            this.isSavingCollection = false;
            return;
        }

        const collectionPayload = {
            name,
            description,
            visibility
        };

        const collectionId = form.dataset.collectionId ? Number(form.dataset.collectionId) : null;

        try {
            if (collectionId) {
                const result = await this.api.updateCollection(collectionId, collectionPayload);
                this.showNotification(result.message || 'Kolekcija atjaunināta', 'success');
                document.dispatchEvent(new CustomEvent('collection:updated', { detail: { collectionId } }));
            } else {
                const result = await this.api.createCollection(collectionPayload);
                this.showNotification(result.message || 'Kolekcija izveidota', 'success');
                document.dispatchEvent(new CustomEvent('collection:created', { detail: { collectionId: result.collectionId } }));
            }

            form.reset();
            delete form.dataset.collectionId;
            this.closeCreateCollectionModal();
            window.collectionsManager?.loadCollections();
        } catch (error) {
            const message = error?.message || 'Neizdevās saglabāt kolekciju';
            this.showNotification(message, 'error');
        } finally {
            this.isSavingCollection = false;
        }
    }

    async showAddToCollectionModal(recipeId) {
        if (!this.api?.isAuthenticated?.()) {
            this.showNotification('Lai izmantotu kolekcijas, jāpieslēdzas', 'error');
            window.authManager?.requireAuth?.();
            return;
        }

        const modal = document.getElementById('addToCollectionModal');
        const listContainer = document.getElementById('collectionsList');

        if (!modal || !listContainer) {
            this.showNotification('Kolekciju izvēlne nav pieejama šajā lapā', 'error');
            return;
        }

        const recipeIdNumber = Number(recipeId);
        if (Number.isNaN(recipeIdNumber)) {
            this.showNotification('Nav norādīta recepte, ko pievienot', 'error');
            return;
        }

        this.activeCollectionRecipeId = recipeIdNumber;
        listContainer.innerHTML = '<p class="loading">Notiek kolekciju ielāde...</p>';

        try {
            const collections = await this.api.getUserCollections();
            if (!collections || collections.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder-open fa-2x"></i>
                        <p>Jums vēl nav nevienas kolekcijas.</p>
                        <button type="button" class="btn btn-primary create-collection-from-modal">Izveidot kolekciju</button>
                    </a>
                `;
            } else {
                listContainer.innerHTML = collections.map(collection => {
                    const recipeIds = Array.isArray(collection.recipe_ids) ? collection.recipe_ids : [];
                    const alreadyAdded = recipeIds.includes(recipeIdNumber);
                    return `
                        <div class="collection-option">
                            <div class="collection-option__info">
                                <h4>${collection.name}</h4>
                                <p>${collection.description || 'Nav apraksta'}</p>
                                <small>${collection.recipesCount ?? 0} receptes</small>
                            </div>
                            <button type="button"
                                class="btn btn-primary collection-add-btn"
                                data-collection-id="${collection.id}"
                                ${alreadyAdded ? 'disabled' : ''}>
                                ${alreadyAdded ? 'Jau pievienota' : 'Pievienot'}
                            </button>
                        </div>
                    `;
                }).join('');
            }

            modal.style.display = 'block';
        } catch (error) {
            const message = error?.message || 'Neizdevās ielādēt kolekcijas';
            listContainer.innerHTML = `<p class="error-text">${message}</p>`;
            this.showNotification(message, 'error');
        }
    }

    closeAddToCollectionModal() {
        const modal = document.getElementById('addToCollectionModal');
        const listContainer = document.getElementById('collectionsList');

        if (modal) {
            modal.style.display = 'none';
        }
        if (listContainer) {
            listContainer.innerHTML = '';
        }

        this.activeCollectionRecipeId = null;
    }

    async addRecipeToCollection(collectionId) {
        if (!this.api?.isAuthenticated?.()) {
            this.showNotification('Lai izmantotu kolekcijas, jāpieslēdzas', 'error');
            window.authManager?.requireAuth?.();
            return;
        }

        const recipeId = this.activeCollectionRecipeId;
        if (!recipeId) {
            this.showNotification('Nav atlasīta recepte pievienošanai', 'error');
            return;
        }

        const id = Number(collectionId);
        if (Number.isNaN(id)) {
            this.showNotification('Nepareizs kolekcijas identifikators', 'error');
            return;
        }

        try {
            const result = await this.api.addRecipeToCollection(id, recipeId);
            const message = result.message || 'Recepte pievienota kolekcijai';
            const isDuplicate = message.toLowerCase().includes('jau');
            this.showNotification(message, isDuplicate ? 'info' : 'success');
            document.dispatchEvent(new CustomEvent('collection:recipe-added', { detail: { collectionId: id, recipeId } }));
            this.closeAddToCollectionModal();
        } catch (error) {
            const message = error?.message || 'Neizdevās pievienot recepti kolekcijai';
            this.showNotification(message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.authManager && window.authManager.showNotification) {
            window.authManager.showNotification(message, type);
        } else {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">×</button>
            `;
            
            if (!document.querySelector('#notification-styles')) {
                const styles = document.createElement('style');
                styles.id = 'notification-styles';
                styles.textContent = `
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 15px 20px;
                        border-radius: 8px;
                        color: white;
                        z-index: 1000;
                        max-width: 300px;
                        animation: slideIn 0.3s ease;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .notification.success { background: var(--success-color); }
                    .notification.error { background: var(--error-color); }
                    .notification.info { background: var(--primary-color); }
                    .notification.warning { background: var(--warning-color); }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(styles);
            }

            document.body.appendChild(notification);
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    loadPageFunctionality() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';

        switch(page) {
            case 'index.html':
                this.initHomePage();
                break;
            case 'recipe.html':
                this.initRecipePage();
                break;
            case 'add-recipe.html':
                this.initAddRecipePage();
                break;
            case 'blog.html':
                this.initBlogPage();
                break;
            case 'profile.html':
                this.initProfilePage();
                break;
            case 'profile-public.html':
                this.initPublicProfilePage();
                break;
            case 'collections.html':
                this.initCollectionsPage();
                break;
            case 'subscriptions.html':
                this.initSubscriptionsPage();
                break;
        }
    }

    // 🏠 ОБНОВЛЕННАЯ ГЛАВНАЯ СТРАНИЦА
    async initHomePage() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const filters = {
                search: urlParams.get('search'),
                category: urlParams.get('category') || 'all',
                difficulty: urlParams.get('difficulty') || 'all'
            };

            // Загружаем данные параллельно для лучшей производительности
            const [recipesData, topAuthors, topRecipes, subscriptionFeed, recommendedUsers] = await Promise.all([
                this.api.getRecipes(filters),
                this.api.getTopAuthors(),
                this.api.getTopRecipes(),
                this.api.getSubscriptionFeed(),
                this.api.getRecommendedUsers()
            ]);

            this.renderRecipes(recipesData.recipes);
            this.setupRecipeFilters(filters);
            
            // Обновляем все секции
            this.renderTopAuthors(topAuthors);
            this.renderTopRecipes(topRecipes);
            this.renderSubscriptionFeed(subscriptionFeed);
            this.renderRecommendedUsers(recommendedUsers);
            
            await this.loadTopData();
            this.startTopAutoRefresh();

        } catch (error) {
            console.error('Error loading home page:', error);
            this.showError('Kļūda ielādējot datus');
        }
    }

    // 📰 ЛЕНТА ПОДПИСОК
    async renderSubscriptionFeed(recipes) {
        const container = document.getElementById('subscriptionFeed');
        if (!container) return;

        if (!recipes || recipes.length === 0) {
            const currentUser = this.api.getCurrentUser();
            if (currentUser) {
                container.innerHTML = `
                    <div class="empty-feed">
                        <i class="fas fa-users fa-3x"></i>
                        <h3>Vēl nav aktivitāšu</h3>
                        <p>Izpēti un seko citiem lietotājiem, lai redzētu viņu receptes šeit</p>
                        <a href="explore.html" class="btn btn-primary">Atklāt autorus</a>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="empty-feed">
                        <i class="fas fa-sign-in-alt fa-3x"></i>
                        <h3>Pieslēdzies, lai redzētu lentu</h3>
                        <p>Pieslēdzieties, lai redzētu receptes no autoriem, kuriem sekojat</p>
                        <a href="login.html" class="btn btn-primary">Pieteikties</a>
                    </div>
                `;
            }
            return;
        }

        container.innerHTML = `
            <div class="feed-header">
                <h3><i class="fas fa-newspaper"></i> Jūsu abonēto autoru receptes</h3>
                <span class="feed-count">${recipes.length} receptes</span>
            </div>
            <div class="feed-recipes">
                ${recipes.map(recipe => this.renderFeedRecipe(recipe)).join('')}
            </div>
        `;
    }

    renderFeedRecipe(recipe) {
        return `
            <div class="feed-recipe-card">
                <div class="feed-recipe-header">
                    <a href="profile-public.html?id=${recipe.author_id}" class="author-info user-profile-link" data-user-id="${recipe.author_id}">
                        <img src="${this.getUserAvatar(recipe.author_id)}" alt="${recipe.author_name}" class="author-avatar">
                        <div class="author-details">
                            <strong>${recipe.author_name}</strong>
                            <span class="post-time">${this.getTimeAgo(recipe.created_at)}</span>
                        </div>
                    </a>
                    <button class="subscribe-btn ${this.isSubscribed(recipe.author_id) ? 'subscribed' : ''}" 
                            data-user-id="${recipe.author_id}">
                        ${this.isSubscribed(recipe.author_id) ? 'Atsekot' : 'Sekot'}
                    </button>
                </div>
                <div class="feed-recipe-content">
                    <div class="recipe-image">
                        <img src="${recipe.image_url || 'images/cake.jpg'}" alt="${recipe.title}">
                    </div>
                    <div class="recipe-info">
                        <h4>${recipe.title}</h4>
                        <p class="recipe-description">${recipe.description}</p>
                        <div class="recipe-meta">
                            <span class="recipe-time">${recipe.prep_time} min</span>
                            <span class="recipe-difficulty difficulty-${recipe.difficulty}">
                                ${this.getDifficultyText(recipe.difficulty)}
                            </span>
                            <span class="recipe-rating">
                                <i class="fas fa-star"></i> ${recipe.average_rating || '0'}
                            </span>
                        </div>
                        <a href="recipe.html?id=${recipe.id}" class="btn btn-outline btn-small">Skatīt recepti</a>
                    </div>
                </div>
            </div>
        `;
    }

    // 👥 РЕКОМЕНДОВАННЫЕ ПОЛЬЗОВАТЕЛИ
    async renderRecommendedUsers(users) {
        const container = document.getElementById('recommendedUsers');
        if (!container) return;

        if (!users || users.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="recommended-users-section">
                <h3><i class="fas fa-user-plus"></i> Ieteicamie autori</h3>
                <div class="users-grid">
                    ${users.map(user => this.renderRecommendedUser(user)).join('')}
                </div>
            </div>
        `;
        this.updateSubscriptionCounters();
    }

    renderRecommendedUser(user) {
        const isSubscribed = this.isSubscribed(user.id);
        
        return `
            <div class="user-card">
                <div class="user-card-header">
                    <img src="${user.cover || 'images/spaghetti.jpg'}" alt="${user.fullName}" class="user-cover" onerror="this.src='images/avatar.jpg'">
                    <div class="user-avatar-container">
                        <img src="${user.avatar || 'images/avatar.jpg'}" alt="${user.fullName}" class="user-avatar-large">
                        ${user.isVerified ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </div>
                </div>
                <div class="user-card-body">
                    <h4>${user.fullName}</h4>
                    <p class="user-specialization">${user.specialization}</p>
                    <p class="user-bio">${user.bio || 'Nav apraksta'}</p>
                    <div class="user-stats">
                        <div class="user-stat">
                            <strong>${user.stats.recipesCount}</strong>
                            <span>Receptes</span>
                        </div>
                        <div class="user-stat">
                            <strong class="subscribers-count" data-subscribers-for="${user.id}">${user.stats.subscribersCount}</strong>
                            <span>Sekotāji</span>
                        </div>
                        <div class="user-stat">
                            <strong>${user.stats.rating}</strong>
                            <span>Vērtējums</span>
                        </div>
                    </div>
                    <div class="user-actions">
                        <a href="profile-public.html?id=${user.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                        <button class="subscribe-btn ${isSubscribed ? 'subscribed' : ''}" 
                                data-user-id="${user.id}">
                            ${isSubscribed ? 'Atsekot' : 'Sekot'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 🔔 СИСТЕМА ПОДПИСОК
    async toggleSubscription(userId, button) {
        if (!this.api.isAuthenticated()) {
            this.showNotification('Lai sekotu lietotajiem, japiesledzas', 'error');
            return;
        }
        const targetUserId = Number.parseInt(userId, 10);
        try {
            const result = await this.api.toggleSubscription(userId);
            const buttons = document.querySelectorAll(`.subscribe-btn[data-user-id="${userId}"]`);
            buttons.forEach(btn => {
                if (result.isSubscribed) {
                    btn.classList.add('subscribed');
                    btn.textContent = 'Atsekot';
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.classList.remove('subscribed');
                    btn.textContent = 'Sekot';
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
            this.showNotification(result.message, 'success');
            this.updateSubscriptionCounters(userId, result.subscribersCount);
            document.dispatchEvent(new CustomEvent('subscription:updated', {
                detail: {
                    userId: Number.isNaN(targetUserId) ? userId : targetUserId,
                    isSubscribed: result.isSubscribed,
                    subscribersCount: result.subscribersCount
                }
            }));
            if (window.location.pathname.includes('index.html')) {
                const recommendedUsers = await this.api.getRecommendedUsers();
                this.renderRecommendedUsers(recommendedUsers);
                const subscriptionFeed = await this.api.getSubscriptionFeed();
                this.renderSubscriptionFeed(subscriptionFeed);
            }
            return result;
        } catch (error) {
            this.showNotification('Kluda: ' + error.message, 'error');
        }
    }

    updateSubscriptionCounters(targetUserId = null, overrideCount = null) {
        const counters = document.querySelectorAll('[data-subscribers-for]');
        if (!counters.length) {
            return;
        }
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        const countsMap = new Map();
        subscriptions.forEach(sub => {
            const current = countsMap.get(sub.following_id) || 0;
            countsMap.set(sub.following_id, current + 1);
        });
        if (targetUserId !== null && typeof overrideCount === 'number') {
            countsMap.set(parseInt(targetUserId, 10), overrideCount);
        }
        counters.forEach(counter => {
            const id = parseInt(counter.dataset.subscribersFor, 10);
            if (Number.isNaN(id)) {
                return;
            }
            const value = countsMap.get(id) || 0;
            counter.textContent = value;
        });
    }
    isSubscribed(userId) {

        return this.api.isSubscribed(userId);

    }

    isSubscribed(userId) {
        const user = this.api.getCurrentUser();
        if (!user) return false;
        
        // В реальном приложении здесь была бы проверка подписки
        // Для демо возвращаем false
        return false;
    }

    // 🏆 ОБНОВЛЕННЫЕ ТОП-СЕКЦИИ
    async loadTopData() {
    try {
        const [topAuthors, topRecipes] = await Promise.all([
            this.api.getTopAuthors(),
            this.api.getTopRecipes()
        ]);
        
        this.renderTopAuthors(topAuthors);
        this.renderTopRecipes(topRecipes);
        this.highlightTopUpdates();
        
    } catch (error) {
        console.error('Error loading top data:', error);
        this.renderFallbackTopData();
    }
}

    renderTopAuthors(authors) {
        const container = document.getElementById('topAuthorsList');
        if (!container) return;

        if (authors.length === 0) {
            container.innerHTML = '<div class="no-data">Vēl nav autoru ar vērtējumiem</div>';
            return;
        }

        container.innerHTML = authors.map((author, index) => `
            <div class="author-item" data-author="${author.name}">
                <div class="author-rank">${index + 1}</div>
                <div class="author-info">
                    <a href="profile-public.html?id=${author.id}" class="author-header user-profile-link" data-user-id="${author.id}">
                        <img src="${author.avatar || 'images/avatar.jpg'}" alt="${author.name}" class="author-avatar-small">
                        <div class="author-details">
                            <span class="author-name">${author.name}</span>
                            <span class="author-specialization">${author.specialization || 'Kulinārijas entuziasts'}</span>
                        </div>
                        ${author.isVerified ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </div>
                    <div class="author-rating">
                        <i class="fas fa-star"></i> ${author.averageRating}
                        <small>(${author.totalRatings} vērtējumi)</small>
                    </div>
                    <div class="author-stats">
                        ${author.recipeCount} receptes &bull; ${author.totalSubscribers} sekotāji
                    </div>
                    <div class="author-actions">
                        <a href="profile-public.html?id=${author.id}" class="btn btn-outline btn-small">Profils</a>
                        <button class="subscribe-btn ${this.isSubscribed(author.id) ? 'subscribed' : ''}" 
                                data-user-id="${author.id}">
                            ${this.isSubscribed(author.id) ? 'Seko' : 'Sekot'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTopRecipes(recipes) {
        const container = document.getElementById('topRecipesList');
        if (!container) return;

        if (recipes.length === 0) {
            container.innerHTML = '<div class="no-data">Vēl nav receptu ar vērtējumiem</div>';
            return;
        }

        container.innerHTML = recipes.map((recipe, index) => `
            <div class="top-recipe-item" data-recipe-id="${recipe.id}">
                <div class="recipe-rank">${index + 1}</div>
                <div class="recipe-info">
                    <div class="recipe-header">
                        <span class="recipe-name">${recipe.title}</span>
                        <span class="recipe-author">by ${recipe.author_name}</span>
                    </div>
                    <div class="recipe-details">
                        <span class="recipe-rating">
                            <i class="fas fa-star"></i> ${recipe.averageRating}
                            <small>(${recipe.ratingsCount} vērtējumi)</small>
                        </span>
                        <span class="recipe-meta">
                            <i class="far fa-clock"></i> ${recipe.prep_time} min • 
                            ${this.getDifficultyText(recipe.difficulty)} •
                            ${recipe.favoritesCount} ❤️
                        </span>
                    </div>
                </div>
            </div>
        `).join('');

        this.addTopRecipeClickHandlers();
    }

    // 📱 ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    getUserAvatar(userId) {
        // В реальном приложении здесь был бы запрос к API
        return 'images/avatar.jpg';
    }

    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'tikko';
        if (diffMins < 60) return `pirms ${diffMins} min`;
        if (diffHours < 24) return `pirms ${diffHours} h`;
        if (diffDays < 7) return `pirms ${diffDays} d`;
        return date.toLocaleDateString('lv-LV');
    }

    getDifficultyText(difficulty) {
        const difficulties = {
            'easy': 'Viegli',
            'medium': 'Vidēji', 
            'hard': 'Grūti'
        };
        return difficulties[difficulty] || difficulty;
    }

    // 📄 СУЩЕСТВУЮЩИЕ МЕТОДЫ (обновленные)
    setupAddRecipeForm() {
        const form = document.getElementById('addRecipeForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddRecipe();
        });

        this.loadCategories();
        
        // Добавляем поле для тегов
        this.setupTagsInput();
    }

    setupTagsInput() {
        const tagsContainer = document.getElementById('tagsContainer');
        if (!tagsContainer) return;

        const tagsInput = document.createElement('div');
        tagsInput.className = 'form-group';
        tagsInput.innerHTML = `
            <label for="recipeTags">Atslēgas vārdi (atdalīti ar komatu)</label>
            <input type="text" id="recipeTags" name="tags" placeholder="piemēram, itāļu, pasta, ātri">
            <small>Palīdzēs citiem atrast jūsu recepti</small>
        `;
        
        tagsContainer.appendChild(tagsInput);
    }

    async handleAddRecipe() {
        if (!this.api.isAuthenticated()) {
            this.showNotification('Lai pievienotu recepti, jāpieslēdzas', 'error');
            return;
        }

        const formData = new FormData(document.getElementById('addRecipeForm'));
        
        try {
            const tags = formData.get('tags') ? 
                formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            const recipeData = {
                title: formData.get('title'),
                description: formData.get('description'),
                category_id: parseInt(formData.get('category')),
                difficulty: formData.get('difficulty'),
                prep_time: parseInt(formData.get('prepTime')),
                cook_time: parseInt(formData.get('cookTime') || 0),
                portions: parseInt(formData.get('portions') || 1),
                image_url: formData.get('image_url') || 'images/cake.jpg',
                ingredients: this.getIngredientsFromForm(),
                instructions: this.getInstructionsFromForm(),
                tags: tags
            };

            const result = await this.api.createRecipe(recipeData);
            this.showNotification('Recepte veiksmīgi pievienota!', 'success');
            
            const newAchievements = await this.api.checkForNewAchievements();
            if (newAchievements.length > 0) {
                newAchievements.forEach(achievement => {
                    this.showNotification(`🏆 Jauns sasniegums: ${achievement.title}`, 'success');
                });
            }
            
            if (window.profilePage && typeof window.profilePage.updateAchievementDisplay === 'function') {
                setTimeout(() => {
                    window.profilePage.updateAchievementDisplay();
                }, 500);
            }
            
            await this.loadTopData();
            
            setTimeout(() => {
                window.location.href = `recipe.html?id=${result.recipeId}`;
            }, 2000);

        } catch (error) {
            this.showNotification('Kļūda pievienojot recepti: ' + error.message, 'error');
        }
    }

    // 🎨 НОВЫЕ СТРАНИЦЫ
    async initPublicProfilePage() {
        // Инициализация публичного профиля
        console.log('Initializing public profile page...');
    }

    async initCollectionsPage() {
        // Инициализация страницы коллекций
        console.log('Initializing collections page...');
    }

    async initSubscriptionsPage() {
        // Инициализация страницы подписок
        console.log('Initializing subscriptions page...');
    }

    // Остальные существующие методы остаются с улучшениями...
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        console.log('Setting theme:', savedTheme);
        
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(savedTheme + '-theme');
        
        this.updateThemeIcons(savedTheme);
    }

    updateThemeIcons(theme) {
        const themeIcons = document.querySelectorAll('.theme-toggle i');
        themeIcons.forEach(icon => {
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    toggleTheme() {
        const body = document.body;
        const isCurrentlyDark = body.classList.contains('dark-theme');
        
        body.classList.remove('light-theme', 'dark-theme');
        
        if (isCurrentlyDark) {
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }

        this.updateThemeIcons(localStorage.getItem('theme'));
    }

    setupNavigation() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navigation = document.querySelector('.navigation');
        
        if (mobileToggle && navigation) {
            mobileToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navigation.classList.toggle('active');
                document.body.style.overflow = navigation.classList.contains('active') ? 'hidden' : '';
            });
        }
        
        // Close menu when clicking on links
        const navLinks = document.querySelectorAll('.navigation a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navigation.classList.contains('active')) {
                    navigation.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navigation && navigation.classList.contains('active') && 
                !navigation.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                navigation.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navigation && navigation.classList.contains('active')) {
                navigation.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    setupEventListeners() {
        const themeToggles = document.querySelectorAll('.theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleTheme());
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchRecipes();
                }
            });
        }

        // Новые обработчики для расширенного поиска
        const userSearchInput = document.getElementById('userSearchInput');
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => {
                this.debouncedSearchUsers(e.target.value);
            });
        }
    }

    // Поиск пользователей с дебаунсингом
    debouncedSearchUsers = this.debounce(async (query) => {
        if (query.length < 2) return;
        
        try {
            const users = await this.api.searchUsers(query);
            this.renderUserSearchResults(users);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }, 300);

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
    }

    // Остальные методы остаются...
    getIngredientsFromForm() {
        const ingredients = [];
        const inputs = document.querySelectorAll('[name="ingredients[]"]');
        inputs.forEach(input => {
            if (input.value.trim()) {
                ingredients.push({
                    name: input.value.trim(),
                    id: Date.now() + Math.random()
                });
            }
        });
        return ingredients;
    }

    getInstructionsFromForm() {
        const instructions = [];
        const inputs = document.querySelectorAll('[name="instructions[]"]');
        inputs.forEach((input, index) => {
            if (input.value.trim()) {
                instructions.push({
                    step_number: index + 1,
                    instruction_text: input.value.trim(),
                    id: Date.now() + Math.random()
                });
            }
        });
        return instructions;
    }

    renderRecipes(recipes) {
    const grid = document.getElementById('recipesGrid');
    if (!grid) return;

    if (recipes.length === 0) {
        grid.innerHTML = '<p class="no-recipes">Receptes netika atrastas</p>';
        return;
    }

    grid.innerHTML = recipes.map(recipe => {
        const isFavorited = window.apiClient.isRecipeFavorited(recipe.id);
        
        return `
            <div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-image">
                    <img src="${recipe.image_url || 'images/cake.jpg'}" alt="${recipe.title}">
                    <button class="favorite-btn ${isFavorited ? 'active' : ''}" onclick="mainApp.toggleFavorite(${recipe.id})">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="recipe-info">
                    <div class="recipe-meta">
                        <span class="recipe-time"><i class="far fa-clock"></i> ${recipe.prep_time} min</span>
                        <span class="recipe-difficulty difficulty-${recipe.difficulty}">
                            ${this.getDifficultyText(recipe.difficulty)}
                        </span>
                    </div>
                    <h3>${recipe.title}</h3>
                    <div class="recipe-author">
                        <img src="${this.getUserAvatar(recipe.author_id)}" alt="${recipe.author_name}" class="author-avatar-xs">
                        <span>${recipe.author_name}</span>
                    </div>
                    <div class="rating">
                        <div class="stars">${this.generateStars(recipe.average_rating)}</div>
                        <span class="rating-value">${recipe.average_rating || '0'}</span>
                        <span class="rating-count">(${recipe.ratings_count || 0})</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-footer">
                        <a href="recipe.html?id=${recipe.id}" class="btn btn-outline">Skatīt recepti</a>
                        <div class="recipe-stats">
                            <span><i class="far fa-eye"></i> ${recipe.views_count || 0}</span>
                            <span><i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${recipe.favorites_count || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

    generateStars(rating) {
        if (!rating) return '<i class="far fa-star"></i>'.repeat(5);
        
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        let stars = '';

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && halfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }

    setupRecipeFilters(filters) {
        const categoryFilter = document.getElementById('categoryFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const searchInput = document.getElementById('searchInput');

        if (categoryFilter) categoryFilter.value = filters.category;
        if (difficultyFilter) difficultyFilter.value = filters.difficulty;
        if (searchInput) searchInput.value = filters.search || '';

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    applyFilters() {
        const category = document.getElementById('categoryFilter')?.value || 'all';
        const difficulty = document.getElementById('difficultyFilter')?.value || 'all';
        const search = document.getElementById('searchInput')?.value || '';

        const params = new URLSearchParams();
        if (category !== 'all') params.set('category', category);
        if (difficulty !== 'all') params.set('difficulty', difficulty);
        if (search) params.set('search', search);

        window.location.href = `index.html?${params.toString()}`;
    }

    searchRecipes() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (searchTerm) {
            window.location.href = `index.html?search=${encodeURIComponent(searchTerm)}`;
        }
    }

    async toggleFavorite(recipeId) {
    if (!this.api.isAuthenticated()) {
        this.showNotification('Lai pievienotu izlūkiem, jāpieslēdzas', 'error');
        return;
    }

    try {
        const result = await this.api.toggleFavorite(recipeId);
        
        // Обновляем все кнопки избранного для этого рецепта
        const favoriteBtns = document.querySelectorAll(`[data-id="${recipeId}"] .favorite-btn, #favoriteBtn`);
        favoriteBtns.forEach(btn => {
            if (result.isFavorited) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
                if (btn.id === 'favoriteBtn') {
                    btn.innerHTML = '<i class="fas fa-heart"></i> Noņemt no izlūkiem';
                }
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
                if (btn.id === 'favoriteBtn') {
                    btn.innerHTML = '<i class="far fa-heart"></i> Pievienot izlūkiem';
                }
            }
        });

        // Обновляем счетчики
        this.updateRecipeCounters(recipeId, result.isFavorited ? 1 : -1);
        
        this.showNotification(result.message, 'success');
        await this.loadTopData(); // Обновляем топ
        
    } catch (error) {
        this.showNotification('Kļūda pievienojot izlūkiem: ' + error.message, 'error');
    }
}
updateRecipeCounters(recipeId, change) {
    const recipeCards = document.querySelectorAll(`[data-id="${recipeId}"]`);
    recipeCards.forEach(card => {
        const favoritesCountEl = card.querySelector('.recipe-stats span:nth-child(2)');
        if (favoritesCountEl) {
            const currentCount = parseInt(favoritesCountEl.textContent) || 0;
            favoritesCountEl.textContent = currentCount + change;
        }
    });
}
    highlightTopUpdates() {
        const items = document.querySelectorAll('.top-recipe-item, .author-item');
        items.forEach(item => {
            item.classList.add('recipe-updated');
            setTimeout(() => {
                item.classList.remove('recipe-updated');
            }, 2000);
        });
    }

    startTopAutoRefresh() {
        setInterval(async () => {
            if (document.visibilityState === 'visible') {
                await this.loadTopData();
            }
        }, 30000);
    }

    renderFallbackTopData() {
        const fallbackAuthors = [
            { id: 1, name: "Jānis Bērziņš", averageRating: "4.8", recipeCount: 12, totalRatings: 45, totalSubscribers: 23, specialization: "Itāļu virtuve", avatar: "images/avatar1.jpg", isVerified: true },
            { id: 2, name: "Anna Liepa", averageRating: "4.7", recipeCount: 8, totalRatings: 32, totalSubscribers: 18, specialization: "Deserti", avatar: "images/avatar2.jpg", isVerified: false },
            { id: 3, name: "Māris Kalniņš", averageRating: "4.5", recipeCount: 6, totalRatings: 28, totalSubscribers: 15, specialization: "Veganu ēdieni", avatar: "images/avatar3.jpg", isVerified: false }
        ];
        
        const fallbackRecipes = [
            { 
                id: 1,
                title: "Šokolādes kūka", 
                author_name: "Anna Liepa",
                averageRating: "4.9", 
                ratingsCount: 15,
                favoritesCount: 12,
                prep_time: 30,
                difficulty: "easy"
            },
            { 
                id: 2,
                title: "Grieķu salāti", 
                author_name: "Māris Kalniņš",
                averageRating: "4.8", 
                ratingsCount: 12,
                favoritesCount: 8,
                prep_time: 15,
                difficulty: "easy"
            },
            { 
                id: 3,
                title: "Spageti Karbonāra", 
                author_name: "Jānis Bērziņš",
                averageRating: "4.7", 
                ratingsCount: 10,
                favoritesCount: 6,
                prep_time: 25,
                difficulty: "medium"
            }
        ];
        
        this.renderTopAuthors(fallbackAuthors);
        this.renderTopRecipes(fallbackRecipes);
    }

    addTopRecipeClickHandlers() {
        document.querySelectorAll('.top-recipe-item').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', (e) => {
                const recipeId = item.dataset.recipeId;
                if (recipeId) {
                    window.location.href = `recipe.html?id=${recipeId}`;
                }
            });
        });
    }
    // В класс MainApp добавьте этот метод после initPublicProfilePage()
        async initProfilePage() {
            console.log('Initializing profile page...');
            // Профильная страница инициализируется своим собственным скриптом
            // Этот метод нужен только чтобы избежать ошибки
        }
        // В класс MainApp добавьте этот метод после initRecipePage()
async initAddRecipePage() {
    console.log('Initializing add recipe page...');
    this.setupAddRecipeForm();
    this.loadCategories();
}

// Метод для загрузки категорий
async loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        this.renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Метод для отображения категорий в форме
renderCategories(categories) {
    const categorySelect = document.getElementById('recipeCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Izvēlieties kategoriju</option>' +
        categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
}

// Метод для настройки формы добавления рецепта (уже есть, но проверьте)
setupAddRecipeForm() {
    const form = document.getElementById('addRecipeForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAddRecipe();
    });

    // Добавляем динамические поля для ингредиентов и инструкций
    this.setupDynamicFields();
}

// Метод для настройки динамических полей
setupDynamicFields() {
    const addIngredientBtn = document.getElementById('addIngredient');
    const addInstructionBtn = document.getElementById('addInstruction');
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    const instructionsContainer = document.getElementById('instructionsContainer');

    if (addIngredientBtn && ingredientsContainer) {
        addIngredientBtn.addEventListener('click', () => {
            this.addIngredientField(ingredientsContainer);
        });
    }

    if (addInstructionBtn && instructionsContainer) {
        addInstructionBtn.addEventListener('click', () => {
            this.addInstructionField(instructionsContainer);
        });
    }

    // Добавляем начальные поля
    this.addIngredientField(ingredientsContainer);
    this.addInstructionField(instructionsContainer);
}

// Метод для добавления поля ингредиента
addIngredientField(container) {
    if (!container) return;
    
    const fieldCount = container.querySelectorAll('.ingredient-field').length;
    const field = document.createElement('div');
    field.className = 'ingredient-field form-group';
    field.innerHTML = `
        <div class="field-with-actions">
            <input type="text" name="ingredients[]" placeholder="Piemēram: 2 ēdamkarotes olīvu eļļas" required>
            <button type="button" class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(field);
}

// Метод для добавления поля инструкции
addInstructionField(container) {
    if (!container) return;
    
    const fieldCount = container.querySelectorAll('.instruction-field').length;
    const field = document.createElement('div');
    field.className = 'instruction-field form-group';
    field.innerHTML = `
        <div class="field-with-actions">
            <textarea name="instructions[]" placeholder="Aprakstiet soļus detalizēti..." rows="2" required></textarea>
            <button type="button" class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(field);
}

// Метод для обработки добавления рецепта (уже есть, но проверьте)
async handleAddRecipe() {
    if (!this.api.isAuthenticated()) {
        this.showNotification('Lai pievienotu recepti, jāpieslēdzas', 'error');
        return;
    }

    const formData = new FormData(document.getElementById('addRecipeForm'));
    
    try {
        const ingredients = this.getIngredientsFromForm();
        const instructions = this.getInstructionsFromForm();

        if (ingredients.length === 0) {
            this.showNotification('Lūdzu, pievienojiet vismaz vienu ingredientu', 'error');
            return;
        }

        if (instructions.length === 0) {
            this.showNotification('Lūdzu, pievienojiet vismaz vienu instrukciju', 'error');
            return;
        }

        const recipeData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category_id: parseInt(formData.get('category')),
            difficulty: formData.get('difficulty'),
            prep_time: parseInt(formData.get('prepTime')),
            cook_time: parseInt(formData.get('cookTime') || 0),
            portions: parseInt(formData.get('portions') || 1),
            image_url: formData.get('image_url') || 'images/cake.jpg',
            ingredients: ingredients,
            instructions: instructions,
            tags: formData.get('tags') ? 
                formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };

        const result = await this.api.createRecipe(recipeData);
        this.showNotification('Recepte veiksmīgi pievienota!', 'success');
        
        // Перенаправляем на страницу рецепта
        setTimeout(() => {
            window.location.href = `recipe.html?id=${result.recipeId}`;
        }, 1500);

    } catch (error) {
        this.showNotification('Kļūda pievienojot recepti: ' + error.message, 'error');
    }
}

// Методы для получения данных из формы (уже есть)
        getIngredientsFromForm() {
            const ingredients = [];
            const inputs = document.querySelectorAll('[name="ingredients[]"]');
            inputs.forEach((input, index) => {
                if (input.value.trim()) {
                    ingredients.push({
                        id: index + 1,
                        name: input.value.trim()
                    });
                }
            });
            return ingredients;
        }

        getInstructionsFromForm() {
            const instructions = [];
            const inputs = document.querySelectorAll('[name="instructions[]"]');
            inputs.forEach((input, index) => {
                if (input.value.trim()) {
                    instructions.push({
                        step_number: index + 1,
                        instruction_text: input.value.trim()
                    });
                }
            });
            return instructions;
        }
        // В класс MainApp добавьте этот метод после initRecipePage()
async initAddRecipePage() {
    console.log('Initializing add recipe page...');
    this.setupAddRecipeForm();
    this.loadCategories();
}

// Метод для загрузки категорий
async loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        this.renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Метод для отображения категорий в форме
renderCategories(categories) {
    const categorySelect = document.getElementById('recipeCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Izvēlieties kategoriju</option>' +
        categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
}

// Метод для настройки формы добавления рецепта (уже есть, но проверьте)
setupAddRecipeForm() {
    const form = document.getElementById('addRecipeForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAddRecipe();
    });

    // Добавляем динамические поля для ингредиентов и инструкций
    this.setupDynamicFields();
}

// Метод для настройки динамических полей
setupDynamicFields() {
    const addIngredientBtn = document.getElementById('addIngredient');
    const addInstructionBtn = document.getElementById('addInstruction');
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    const instructionsContainer = document.getElementById('instructionsContainer');

    if (addIngredientBtn && ingredientsContainer) {
        addIngredientBtn.addEventListener('click', () => {
            this.addIngredientField(ingredientsContainer);
        });
    }

    if (addInstructionBtn && instructionsContainer) {
        addInstructionBtn.addEventListener('click', () => {
            this.addInstructionField(instructionsContainer);
        });
    }

    // Добавляем начальные поля
    this.addIngredientField(ingredientsContainer);
    this.addInstructionField(instructionsContainer);
}

// Метод для добавления поля ингредиента
addIngredientField(container) {
    if (!container) return;
    
    const fieldCount = container.querySelectorAll('.ingredient-field').length;
    const field = document.createElement('div');
    field.className = 'ingredient-field form-group';
    field.innerHTML = `
        <div class="field-with-actions">
            <input type="text" name="ingredients[]" placeholder="Piemēram: 2 ēdamkarotes olīvu eļļas" required>
            <button type="button" class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(field);
}

// Метод для добавления поля инструкции
addInstructionField(container) {
    if (!container) return;
    
    const fieldCount = container.querySelectorAll('.instruction-field').length;
    const field = document.createElement('div');
    field.className = 'instruction-field form-group';
    field.innerHTML = `
        <div class="field-with-actions">
            <textarea name="instructions[]" placeholder="Aprakstiet soļus detalizēti..." rows="2" required></textarea>
            <button type="button" class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(field);
}

// Метод для обработки добавления рецепта (уже есть, но проверьте)
async handleAddRecipe() {
    if (!this.api.isAuthenticated()) {
        this.showNotification('Lai pievienotu recepti, jāpieslēdzas', 'error');
        return;
    }

    const formData = new FormData(document.getElementById('addRecipeForm'));
    
    try {
        const ingredients = this.getIngredientsFromForm();
        const instructions = this.getInstructionsFromForm();

        if (ingredients.length === 0) {
            this.showNotification('Lūdzu, pievienojiet vismaz vienu ingredientu', 'error');
            return;
        }

        if (instructions.length === 0) {
            this.showNotification('Lūdzu, pievienojiet vismaz vienu instrukciju', 'error');
            return;
        }

        const recipeData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category_id: parseInt(formData.get('category')),
            difficulty: formData.get('difficulty'),
            prep_time: parseInt(formData.get('prepTime')),
            cook_time: parseInt(formData.get('cookTime') || 0),
            portions: parseInt(formData.get('portions') || 1),
            image_url: formData.get('image_url') || 'images/cake.jpg',
            ingredients: ingredients,
            instructions: instructions,
            tags: formData.get('tags') ? 
                formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };

        const result = await this.api.createRecipe(recipeData);
        this.showNotification('Recepte veiksmīgi pievienota!', 'success');
        
        // Перенаправляем на страницу рецепта
        setTimeout(() => {
            window.location.href = `recipe.html?id=${result.recipeId}`;
        }, 1500);

    } catch (error) {
        this.showNotification('Kļūda pievienojot recepti: ' + error.message, 'error');
    }
}

// Методы для получения данных из формы (уже есть)
getIngredientsFromForm() {
    const ingredients = [];
    const inputs = document.querySelectorAll('[name="ingredients[]"]');
    inputs.forEach((input, index) => {
        if (input.value.trim()) {
            ingredients.push({
                id: index + 1,
                name: input.value.trim()
            });
        }
    });
    return ingredients;
}

getInstructionsFromForm() {
    const instructions = [];
    const inputs = document.querySelectorAll('[name="instructions[]"]');
    inputs.forEach((input, index) => {
        if (input.value.trim()) {
            instructions.push({
                step_number: index + 1,
                instruction_text: input.value.trim()
            });
        }
    });
    return instructions;
}
// В класс MainApp добавьте этот метод после initRecipePage()
async initAddRecipePage() {
    console.log('Initializing add recipe page...');
    this.setupAddRecipeForm();
    this.loadCategories();
}

// Метод для загрузки категорий
async loadCategories() {
    try {
        const categories = JSON.parse(localStorage.getItem('categories') || '[]');
        this.renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Метод для отображения категорий в форме
renderCategories(categories) {
    const categorySelect = document.getElementById('recipeCategory');
    if (!categorySelect) return;

    categorySelect.innerHTML = '<option value="">Izvēlieties kategoriju</option>' +
        categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
}

// Метод для настройки формы добавления рецепта (уже есть, но проверьте)
setupAddRecipeForm() {
    const form = document.getElementById('addRecipeForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleAddRecipe();
    });

    // Добавляем динамические поля для ингредиентов и инструкций
    this.setupDynamicFields();
}

// Метод для настройки динамических полей
setupDynamicFields() {
    const addIngredientBtn = document.getElementById('addIngredient');
    const addInstructionBtn = document.getElementById('addInstruction');
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    const instructionsContainer = document.getElementById('instructionsContainer');

    if (addIngredientBtn && ingredientsContainer) {
        addIngredientBtn.addEventListener('click', () => {
            this.addIngredientField(ingredientsContainer);
        });
    }

    if (addInstructionBtn && instructionsContainer) {
        addInstructionBtn.addEventListener('click', () => {
            this.addInstructionField(instructionsContainer);
        });
    }

    // Добавляем начальные поля
    this.addIngredientField(ingredientsContainer);
    this.addInstructionField(instructionsContainer);
}

// Метод для добавления поля ингредиента
addIngredientField(container) {
    if (!container) return;
    
    const fieldCount = container.querySelectorAll('.ingredient-field').length;
    const field = document.createElement('div');
    field.className = 'ingredient-field form-group';
    field.innerHTML = `
        <div class="field-with-actions">
            <input type="text" name="ingredients[]" placeholder="Piemēram: 2 ēdamkarotes olīvu eļļas" required>
            <button type="button" class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(field);
}

// Метод для добавления поля инструкции
addInstructionField(container) {
    if (!container) return;
    
    const fieldCount = container.querySelectorAll('.instruction-field').length;
    const field = document.createElement('div');
    field.className = 'instruction-field form-group';
    field.innerHTML = `
        <div class="field-with-actions">
            <textarea name="instructions[]" placeholder="Aprakstiet soļus detalizēti..." rows="2" required></textarea>
            <button type="button" class="btn-remove-field" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(field);
}

// Метод для обработки добавления рецепта (уже есть, но проверьте)
async handleAddRecipe() {
    if (!this.api.isAuthenticated()) {
        this.showNotification('Lai pievienotu recepti, jāpieslēdzas', 'error');
        return;
    }

    const formData = new FormData(document.getElementById('addRecipeForm'));
    
    try {
        const ingredients = this.getIngredientsFromForm();
        const instructions = this.getInstructionsFromForm();

        if (ingredients.length === 0) {
            this.showNotification('Lūdzu, pievienojiet vismaz vienu ingredientu', 'error');
            return;
        }

        if (instructions.length === 0) {
            this.showNotification('Lūdzu, pievienojiet vismaz vienu instrukciju', 'error');
            return;
        }

        const recipeData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category_id: parseInt(formData.get('category')),
            difficulty: formData.get('difficulty'),
            prep_time: parseInt(formData.get('prepTime')),
            cook_time: parseInt(formData.get('cookTime') || 0),
            portions: parseInt(formData.get('portions') || 1),
            image_url: formData.get('image_url') || 'images/placeholder.jpg',
            ingredients: ingredients,
            instructions: instructions,
            tags: formData.get('tags') ? 
                formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : []
        };

        const result = await this.api.createRecipe(recipeData);
        this.showNotification('Recepte veiksmīgi pievienota!', 'success');
        
        // Перенаправляем на страницу рецепта
        setTimeout(() => {
            window.location.href = `recipe.html?id=${result.recipeId}`;
        }, 1500);

    } catch (error) {
        this.showNotification('Kļūda pievienojot recepti: ' + error.message, 'error');
    }
}

// Методы для получения данных из формы (уже есть)
getIngredientsFromForm() {
    const ingredients = [];
    const inputs = document.querySelectorAll('[name="ingredients[]"]');
    inputs.forEach((input, index) => {
        if (input.value.trim()) {
            ingredients.push({
                id: index + 1,
                name: input.value.trim()
            });
        }
    });
    return ingredients;
}

getInstructionsFromForm() {
    const instructions = [];
    const inputs = document.querySelectorAll('[name="instructions[]"]');
    inputs.forEach((input, index) => {
        if (input.value.trim()) {
            instructions.push({
                step_number: index + 1,
                instruction_text: input.value.trim()
            });
        }
    });
    return instructions;
}
// В класс MainApp добавьте этот метод после initAddRecipePage()
async initBlogPage() {
    console.log('Initializing blog page...');
    // Блог страница инициализируется своим собственным скриптом
    // Этот метод нужен только чтобы избежать ошибки
}
}

// Initialize main app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mainApp = new MainApp();
});
