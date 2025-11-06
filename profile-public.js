class ProfilePublic {
    constructor() {
        this.api = window.apiClient;
        this.userId = this.getUserIdFromUrl();
        this.achievementCatalog = this.buildAchievementCatalog();
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.setupTabs();
    }

    buildAchievementCatalog() {
        return {
            first_recipe: {
                title: 'Pirm�? recepte',
                description: 'Public�?ja pirmo recepti platform�?',
                icon: 'fa-seedling'
            },
            popular_author: {
                title: 'Popul�?rs autors',
                description: 'Sasniedza iev�?rojamu sekot�?ju skaitu',
                icon: 'fa-fire'
            },
            sweet_tooth: {
                title: 'Saldumu meistars',
                description: 'Kolekcija ar izcil�?m desertu recept�?m',
                icon: 'fa-ice-cream'
            }
        };
    }

    getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadUserProfile() {
        if (!this.userId) {
            window.mainApp?.showError('Lietotājs netika atrasts');
            return;
        }

        try {
            const userProfile = await this.api.getUserProfile(this.userId);
            this.renderUserProfile(userProfile);
            this.loadUserRecipes();
            this.loadUserCollections();
        } catch (error) {
            console.error('Error loading user profile:', error);
            window.mainApp?.showError('Kļūda ielādējot lietotāja profilu');
        }
    }

    renderUserProfile(profile) {
        if (!profile) {
            window.mainApp?.showError('Profila dati nav pieejami');
            return;
        }

        if (profile.id !== undefined && profile.id !== null) {
            this.userId = String(profile.id);
        }

        const fullNameEl = document.getElementById('userFullName');
        if (fullNameEl) {
            fullNameEl.textContent = profile.fullName || 'Lietotājs';
        }

        const specializationEl = document.getElementById('userSpecialization');
        if (specializationEl) {
            specializationEl.textContent = profile.specialization || 'Kulinārijas entuziasts';
        }

        const bioEl = document.getElementById('userBio');
        if (bioEl) {
            bioEl.textContent = profile.bio || 'Šim lietotājam vēl nav apraksta.';
        }
        
        const stats = profile.stats || {};
        const recipesCountEl = document.getElementById('recipesCount');
        if (recipesCountEl) {
            recipesCountEl.textContent = stats.recipesCount ?? 0;
        }

        const subscribersCountEl = document.getElementById('subscribersCount');
        const subscriberTotal = stats.subscribersCount ?? 0;
        if (subscribersCountEl) {
            subscribersCountEl.textContent = subscriberTotal;
            const numericId = Number(profile.id ?? this.userId);
            if (!Number.isNaN(numericId)) {
                subscribersCountEl.dataset.subscribersFor = numericId;
            }
        }

        const userRatingEl = document.getElementById('userRating');
        if (userRatingEl) {
            const ratingValue = typeof stats.rating === 'number' ? stats.rating : parseFloat(stats.rating || 0);
            userRatingEl.textContent = ratingValue ? ratingValue.toFixed(1) : '0.0';
        }

        const avatar = document.getElementById('userAvatar');
        if (avatar && profile.avatar) {
            avatar.src = profile.avatar;
        }

        const cover = document.getElementById('userCover');
        if (cover && profile.cover) {
            cover.src = profile.cover;
        }

        const subscribeBtn = document.getElementById('subscribeBtn');
        if (subscribeBtn) {
            const viewer = this.api?.getCurrentUser();
            const targetId = Number(profile.id ?? this.userId);
            const resolvedId = Number.isNaN(targetId) ? Number(this.userId) : targetId;
            const isOwnProfile = viewer && !Number.isNaN(resolvedId) && viewer.id === resolvedId;
            if (isOwnProfile) {
                subscribeBtn.style.display = 'none';
            } else {
                subscribeBtn.style.display = '';
                if (!Number.isNaN(resolvedId)) {
                    subscribeBtn.dataset.userId = String(resolvedId);
                }
                const isSubscribed = typeof profile.isSubscribed === 'boolean'
                    ? profile.isSubscribed
                    : (this.api?.isSubscribed?.(resolvedId) ?? (window.mainApp?.isSubscribed ? window.mainApp.isSubscribed(resolvedId) : false));
                subscribeBtn.classList.toggle('subscribed', !!isSubscribed);
                subscribeBtn.textContent = isSubscribed ? 'Atsekot' : 'Sekot';
                subscribeBtn.setAttribute('aria-pressed', isSubscribed ? 'true' : 'false');
            }
        }

        this.renderAchievements(profile.achievements || []);
    }

    async loadUserRecipes() {
        try {
            const recipes = await this.api.getUserRecipes(this.userId);
            this.renderUserRecipes(recipes);
        } catch (error) {
            console.error('Error loading user recipes:', error);
        }
    }

    renderUserRecipes(recipes = []) {
        const container = document.getElementById('userRecipesGrid');
        if (!container) return;

        const recipeList = Array.isArray(recipes) ? recipes : [];
        const mainApp = window.mainApp;

        if (recipeList.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils fa-3x"></i>
                    <h3>Vēl nav receptu</h3>
                    <p>Šis lietotājs vēl nav publicējis receptes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recipeList.map(recipe => {
            const difficultyText = mainApp?.getDifficultyText ? mainApp.getDifficultyText(recipe.difficulty) : (recipe.difficulty || '');
            const stars = mainApp?.generateStars ? mainApp.generateStars(recipe.average_rating) : '';
            const prepTime = recipe.prep_time ? `${recipe.prep_time} min` : '';
            const ratingValue = typeof recipe.average_rating === 'number' ? recipe.average_rating.toFixed(1) : (recipe.average_rating || '0');
            const favoritesCount = recipe.favorites_count ?? 0;
            const viewsCount = recipe.views_count ?? 0;
            const isFavorited = this.api?.isRecipeFavorited ? this.api.isRecipeFavorited(recipe.id) : false;

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
                            <span class="recipe-time"><i class="far fa-clock"></i> ${prepTime}</span>
                            <span class="recipe-difficulty difficulty-${recipe.difficulty || 'easy'}">
                                ${difficultyText}
                            </span>
                        </div>
                        <h3>${recipe.title}</h3>
                        <div class="rating">
                            <div class="stars">${stars}</div>
                            <span class="rating-value">${ratingValue}</span>
                        </div>
                        <p class="recipe-description">${recipe.description || ''}</p>
                        <div class="recipe-footer">
                            <a href="recipe.html?id=${recipe.id}" class="btn btn-outline">Skatīt recepti</a>
                            <div class="recipe-stats">
                                <span><i class="far fa-eye"></i> ${viewsCount}</span>
                                <span><i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${favoritesCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async loadUserCollections() {
        try {
            const collections = await this.api.getUserCollections(this.userId);
            this.renderUserCollections(Array.isArray(collections) ? collections : []);
        } catch (error) {
            console.error('Error loading user collections:', error);
            window.mainApp?.showNotification?.('Neizdevās ielādēt kolekcijas', 'error');
        }
    }

    renderUserCollections(collections) {
        const container = document.getElementById('userCollections');
        if (!container) return;

        const collectionList = Array.isArray(collections) ? collections : [];
        const publicCollections = collectionList.filter(collection => (collection.visibility || 'private') === 'public');

        if (publicCollections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open fa-3x"></i>
                    <h3>Nav publisku kolekciju</h3>
                    <p>Šim lietotājam nav publiski pieejamu kolekciju</p>
                </div>
            `;
            return;
        }

        container.innerHTML = publicCollections.map(collection => `
            <div class="collection-card">
                <div class="collection-header">
                    <h4>${collection.name}</h4>
                    <span class="collection-count">${collection.recipesCount ?? 0} receptes</span>
                </div>
                <p class="collection-description">${collection.description || 'Nav apraksta'}</p>
                <div class="collection-recipes-preview">
                    ${(Array.isArray(collection.previewImages) ? collection.previewImages : []).map(img => 
                        `<img src="${img}" alt="Recipe preview">`
                    ).join('')}
                </div>
                <button class="btn btn-outline btn-small" onclick="window.location.href='collection.html?id=${collection.id}'">
                    Skatīt kolekciju
                </button>
            </div>
        `).join('');
    }

    renderAchievements(achievements) {
        const container = document.getElementById('userAchievements');
        if (!container) return;

        const normalized = (Array.isArray(achievements) ? achievements : [])
            .map(achievement => this.normalizeAchievement(achievement))
            .filter(Boolean);

        if (normalized.length === 0) {
            container.innerHTML = '<p>Vēl nav sasniegumu</p>';
            return;
        }

        container.innerHTML = normalized.map(achievement => {
            const unlockedText = achievement.unlocked
                ? (achievement.unlockedAt ? `Iegūts: ${new Date(achievement.unlockedAt).toLocaleDateString('lv-LV')}` : 'Iegūts')
                : 'Nav iegūts';

            return `
                <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <div class="achievement-info">
                        <h5>${achievement.title}</h5>
                        <p>${achievement.description}</p>
                        <small>${unlockedText}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    normalizeAchievement(achievement) {
        if (!achievement) return null;

        if (typeof achievement === 'string') {
            const meta = this.achievementCatalog[achievement] || {
                title: achievement,
                description: '',
                icon: 'fa-award'
            };
            return {
                ...meta,
                unlocked: true,
                unlockedAt: null
            };
        }

        if (typeof achievement === 'object') {
            const key = achievement.key || achievement.id || achievement.slug;
            const catalogMeta = key ? this.achievementCatalog[key] : null;

            return {
                title: achievement.title || catalogMeta?.title || 'Sasniegums',
                description: achievement.description || catalogMeta?.description || '',
                icon: achievement.icon || catalogMeta?.icon || 'fa-award',
                unlocked: achievement.unlocked ?? achievement.isUnlocked ?? true,
                unlockedAt: achievement.unlockedAt || achievement.obtainedAt || null
            };
        }

        return null;
    }

    setupEventListeners() {
        const subscribeBtn = document.getElementById('subscribeBtn');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const button = e.currentTarget;
                const result = await window.mainApp.toggleSubscription(this.userId, button);
                if (result && typeof result.subscribersCount === 'number') {
                    this.updateSubscribersDisplay(result.subscribersCount);
                }
            });
        }

        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update buttons
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update contents
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabName + 'Tab') {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    async sendMessage() {
        if (!this.api?.isAuthenticated?.()) {
            window.mainApp?.showNotification?.('Lai sūtītu ziņas, jāpieslēdzas', 'error');
            return;
        }

        const subjectInput = document.getElementById('messageSubject');
        const textInput = document.getElementById('messageText');

        if (!subjectInput || !textInput) {
            return;
        }

        const subject = subjectInput.value.trim();
        const text = textInput.value.trim();

        if (!subject || !text) {
            window.mainApp?.showNotification?.('Lūdzu aizpildiet visus laukus pirms sūtīšanas', 'warning');
            return;
        }

        try {
            await this.api.sendMessage(this.userId, subject, text);
            window.mainApp?.showNotification?.('Ziņa nosūtīta!', 'success');
            this.closeMessageModal();
        } catch (error) {
            const message = error?.message || 'Neizdevās nosūtīt ziņu';
            window.mainApp?.showNotification?.('Kļūda sūtot ziņu: ' + message, 'error');
        }
    }

    showMessageModal() {
        if (!this.api?.isAuthenticated?.()) {
            window.mainApp?.showNotification?.('Lai sūtītu ziņas, jāpieslēdzas', 'error');
            return;
        }

        const modal = document.getElementById('messageModal');
        if (!modal) {
            window.mainApp?.showNotification?.('Ziņu logs nav pieejams šajā lapā', 'error');
            return;
        }

        modal.style.display = 'block';
    }

    closeMessageModal() {
        const modal = document.getElementById('messageModal');
        if (modal) {
            modal.style.display = 'none';
        }

        const form = document.getElementById('messageForm');
        if (form) {
            form.reset();
        }
    }

    updateSubscribersDisplay(count) {
        const countEl = document.getElementById('subscribersCount');
        if (countEl) {
            countEl.textContent = count;
        }
    }

    sortUserRecipes() {
        const sortBy = document.getElementById('sortRecipes').value;
        // Implementation for sorting recipes
        console.log('Sorting by:', sortBy);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.publicProfile = new ProfilePublic();
});
