class ProfilePublic {
    constructor() {
        this.api = window.apiClient;
        this.userId = this.getUserIdFromUrl();
        this.init();
    }

    init() {
        this.loadUserProfile();
        this.setupEventListeners();
        this.setupTabs();
    }

    getUserIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadUserProfile() {
        if (!this.userId) {
            window.mainApp.showError('Lietotājs netika atrasts');
            return;
        }

        try {
            const userProfile = await this.api.getUserProfile(this.userId);
            this.renderUserProfile(userProfile);
            this.loadUserRecipes();
            this.loadUserCollections();
        } catch (error) {
            console.error('Error loading user profile:', error);
            window.mainApp.showError('Kļūda ielādējot lietotāja profilu');
        }
    }

    renderUserProfile(profile) {
        // Update basic info
        document.getElementById('userFullName').textContent = profile.fullName;
        document.getElementById('userSpecialization').textContent = profile.specialization || 'Kulinārijas entuziasts';
        document.getElementById('userBio').textContent = profile.bio || 'Šim lietotājam vēl nav apraksta.';
        
        // Update stats
        document.getElementById('recipesCount').textContent = profile.stats.recipesCount;
        document.getElementById('subscribersCount').textContent = profile.stats.subscribersCount;
        document.getElementById('userRating').textContent = profile.stats.rating;

        // Update images
        const avatar = document.getElementById('userAvatar');
        const cover = document.getElementById('userCover');
        
        if (profile.avatar) avatar.src = profile.avatar;
        if (profile.cover) cover.src = profile.cover;

        // Update subscribe button
        const subscribeBtn = document.getElementById('subscribeBtn');
        if (subscribeBtn) {
            subscribeBtn.dataset.userId = this.userId;
            if (profile.isSubscribed) {
                subscribeBtn.classList.add('subscribed');
                subscribeBtn.textContent = 'Seko';
            } else {
                subscribeBtn.classList.remove('subscribed');
                subscribeBtn.textContent = 'Sekot';
            }
        }

        // Render achievements
        this.renderAchievements(profile.achievements);
    }

    async loadUserRecipes() {
        try {
            const recipes = await this.api.getUserRecipes(this.userId);
            this.renderUserRecipes(recipes);
        } catch (error) {
            console.error('Error loading user recipes:', error);
        }
    }

    renderUserRecipes(recipes) {
        const container = document.getElementById('userRecipesGrid');
        if (!container) return;

        if (recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils fa-3x"></i>
                    <h3>Vēl nav receptu</h3>
                    <p>Šis lietotājs vēl nav publicējis receptes</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" data-id="${recipe.id}">
                <div class="recipe-image">
                    <img src="${recipe.image_url || 'images/placeholder.jpg'}" alt="${recipe.title}">
                </div>
                <div class="recipe-info">
                    <div class="recipe-meta">
                        <span class="recipe-time"><i class="far fa-clock"></i> ${recipe.prep_time} min</span>
                        <span class="recipe-difficulty difficulty-${recipe.difficulty}">
                            ${window.mainApp.getDifficultyText(recipe.difficulty)}
                        </span>
                    </div>
                    <h3>${recipe.title}</h3>
                    <div class="rating">
                        <div class="stars">${window.mainApp.generateStars(recipe.average_rating)}</div>
                        <span class="rating-value">${recipe.average_rating || '0'}</span>
                    </div>
                    <p class="recipe-description">${recipe.description}</p>
                    <div class="recipe-footer">
                        <a href="recipe.html?id=${recipe.id}" class="btn btn-outline">Skatīt recepti</a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async loadUserCollections() {
        try {
            const collections = await this.api.getUserCollections(this.userId);
            this.renderUserCollections(collections);
        } catch (error) {
            console.error('Error loading user collections:', error);
        }
    }

    renderUserCollections(collections) {
        const container = document.getElementById('userCollections');
        if (!container) return;

        const publicCollections = collections.filter(collection => collection.visibility === 'public');

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
                    <span class="collection-count">${collection.recipesCount} receptes</span>
                </div>
                <p class="collection-description">${collection.description || 'Nav apraksta'}</p>
                <div class="collection-recipes-preview">
                    ${collection.previewImages.map(img => 
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

        if (achievements.length === 0) {
            container.innerHTML = '<p>Vēl nav sasniegumu</p>';
            return;
        }

        container.innerHTML = achievements.map(achievement => `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                    <small>${achievement.unlocked ? 'Iegūts: ' + new Date(achievement.unlockedAt).toLocaleDateString('lv-LV') : 'Nav iegūts'}</small>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Subscribe button
        document.getElementById('subscribeBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            window.mainApp.toggleSubscription(this.userId, e.target);
        });

        // Message form
        document.getElementById('messageForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
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
        if (!this.api.isAuthenticated()) {
            window.mainApp.showNotification('Lai sūtītu ziņas, jāpieslēdzas', 'error');
            return;
        }

        const subject = document.getElementById('messageSubject').value;
        const text = document.getElementById('messageText').value;

        try {
            await this.api.sendMessage(this.userId, subject, text);
            window.mainApp.showNotification('Ziņa nosūtīta!', 'success');
            this.closeMessageModal();
        } catch (error) {
            window.mainApp.showNotification('Kļūda sūtot ziņu: ' + error.message, 'error');
        }
    }

    showMessageModal() {
        if (!this.api.isAuthenticated()) {
            window.mainApp.showNotification('Lai sūtītu ziņas, jāpieslēdzas', 'error');
            return;
        }
        document.getElementById('messageModal').style.display = 'block';
    }

    closeMessageModal() {
        document.getElementById('messageModal').style.display = 'none';
        document.getElementById('messageForm').reset();
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