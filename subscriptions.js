class SubscriptionsManager {
    constructor() {
        this.api = window.apiClient;
        this.following = [];
        this.followers = [];
        this.suggestions = [];
        this.trending = [];
        this.searchResults = [];
        this.searchTimeout = null;
        this.activeTab = 'following';
        this.init();
    }

    async init() {
        await Promise.all([
            this.loadFollowing(),
            this.loadFollowers(),
            this.loadSuggestions()
        ]);
        this.loadTrendingChefs();
        this.setupEventListeners();
        this.setupTabs();
        this.updateStats();
    }

    async loadFollowing() {
        try {
            const following = await this.api.getFollowing();
            this.following = Array.isArray(following) ? following : [];
            this.renderFollowing(this.following);
            this.updateStats();
        } catch (error) {
            console.error('Error loading following:', error);
        }
    }

    async loadFollowers() {
        try {
            const followers = await this.api.getFollowers();
            this.followers = Array.isArray(followers) ? followers : [];
            this.renderFollowers(this.followers);
            this.updateStats();
        } catch (error) {
            console.error('Error loading followers:', error);
        }
    }

    async loadSuggestions() {
        try {
            const suggestions = await this.api.getUserSuggestions();
            this.suggestions = Array.isArray(suggestions) ? suggestions : [];
            this.renderSuggestions(this.suggestions);
            this.updateStats();
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    async loadTrendingChefs() {
        try {
            const topAuthors = await this.api.getTopAuthors();
            this.trending = Array.isArray(topAuthors) ? topAuthors.slice(0, 4) : [];
            this.renderTrendingChefs(this.trending);
        } catch (error) {
            console.error('Error loading trending chefs:', error);
        }
    }

    updateStats() {
        const followingCount = this.following.length;
        const followersCount = this.followers.length;
        const suggestionsCount = this.suggestions.length;

        const statsFollowing = document.getElementById('statsFollowing');
        const statsFollowers = document.getElementById('statsFollowers');
        const statsSuggestions = document.getElementById('statsSuggestions');

        if (statsFollowing) statsFollowing.textContent = followingCount;
        if (statsFollowers) statsFollowers.textContent = followersCount;
        if (statsSuggestions) statsSuggestions.textContent = suggestionsCount;
    }

    renderFollowing(users) {
        const container = document.getElementById('followingList');
        const emptyState = document.getElementById('emptyFollowing');

        if (!container) return;

        if (!users || users.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        container.innerHTML = users.map(user => this.renderUserCard(user, {
            context: 'following',
            isSubscribed: true
        })).join('');

        if (emptyState) emptyState.style.display = 'none';
    }

    renderFollowers(users) {
        const container = document.getElementById('followersList');
        const emptyState = document.getElementById('emptyFollowers');

        if (!container) return;

        if (!users || users.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        container.innerHTML = users.map(user => this.renderUserCard(user, {
            context: 'followers',
            isSubscribed: Boolean(user.isSubscribed)
        })).join('');

        if (emptyState) emptyState.style.display = 'none';
    }

    renderSuggestions(users) {
        const container = document.getElementById('suggestionsList');
        if (!container) return;

        if (!users || users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-compass fa-3x"></i>
                    <h3>Nav ieteikumu</h3>
                    <p>Turpiniet pievienot receptes un sekot citiem autoriem, lai saņemtu precīzākus ieteikumus.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = users.map(user => this.renderUserCard(user, {
            context: 'suggestions',
            isSubscribed: this.isFollowing(user.id)
        })).join('');
    }

    renderTrendingChefs(authors) {
        const container = document.getElementById('trendingChefs');
        if (!container) return;

        if (!authors || authors.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Vēl nav trendīgu autoru. Apskati ieteikumus vai pievieno savas receptes!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = authors.map(author => {
            const avatar = author.avatar || 'images/avatar.jpg';
            const cover = author.cover || 'images/spaghetti.jpg';
            return `
                <article class="trending-chef-card">
                    <div class="chef-info">
                        <img src="${avatar}" alt="${author.name}" class="chef-avatar" onerror="this.src='images/avatar.jpg'">
                        <div class="chef-meta">
                            <strong>${author.name}</strong>
                            <span>${author.specialization || 'Kulinārijas entuziasts'}</span>
                        </div>
                    </div>
                    <div class="chef-stats">
                        <span><i class="fas fa-star"></i> ${author.averageRating}</span>
                        <span><i class="fas fa-book-open"></i> ${author.recipeCount} receptes</span>
                        <span><i class="fas fa-users"></i> ${author.totalSubscribers} sekotāji</span>
                    </div>
                    <div class="chef-actions">
                        <a href="profile-public.html?id=${author.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                        <button class="subscribe-btn ${this.isFollowing(author.id) ? 'subscribed' : ''}" data-user-id="${author.id}">
                            ${this.isFollowing(author.id) ? 'Atsekot' : 'Sekot'}
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    renderUserCard(user, { context, isSubscribed }) {
    const cover = user.cover || 'images/spaghetti.jpg';
        const avatar = user.avatar || 'images/avatar.jpg';
        const bio = this.formatBio(user.bio);
        const specialization = user.specialization || 'Kulinārijas entuziasts';
        const recipesCount = user.stats?.recipesCount ?? 0;
        const followersCount = user.stats?.subscribersCount ?? 0;
        const buttonLabel = isSubscribed ? 'Atsekot' : 'Sekot';
        const buttonClass = `subscribe-btn ${isSubscribed ? 'subscribed' : ''}`;
        const ariaPressed = isSubscribed ? 'true' : 'false';
        const pill = context === 'following' ? '<span class="user-pill"><i class="fas fa-heart"></i> Sekoju</span>' : '';

        return `
            <article class="user-card">
                <div class="user-card-header">
                    <img src="${cover}" alt="${user.fullName}" class="user-cover" onerror="this.src='images/spaghetti.jpg'">
                    <div class="user-avatar-container">
                        <img src="${avatar}" alt="${user.fullName}" class="user-avatar-large" onerror="this.src='images/avatar.jpg'">
                        ${user.isVerified ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </div>
                    ${pill}
                </div>
                <div class="user-card-body">
                    <div class="user-card-top">
                        <div>
                            <h4>${user.fullName}</h4>
                            <p class="user-specialization">${specialization}</p>
                        </div>
                        <button class="${buttonClass}" data-user-id="${user.id}" aria-pressed="${ariaPressed}">
                            ${buttonLabel}
                        </button>
                    </div>
                    <p class="user-bio">${bio}</p>
                    <div class="user-stats">
                        <div class="user-stat">
                            <strong>${recipesCount}</strong>
                            <span>Receptes</span>
                        </div>
                        <div class="user-stat">
                            <strong class="subscribers-count" data-subscribers-for="${user.id}">${followersCount}</strong>
                            <span>Sekotāji</span>
                        </div>
                    </div>
                    <div class="user-actions">
                        <a href="profile-public.html?id=${user.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                    </div>
                </div>
            </article>
        `;
    }

    formatBio(bio) {
        if (!bio) return 'Nav apraksta';
        const trimmed = bio.trim();
        return trimmed.length > 110 ? `${trimmed.slice(0, 107)}…` : trimmed;
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.subscriptions-tabs .tab-btn');
        const tabContents = document.querySelectorAll('.subscriptions-shell .tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                if (!tabName || tabName === this.activeTab) return;
                this.activeTab = tabName;

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(content => {
                    content.classList.toggle('active', content.id === `${tabName}Tab`);
                });
            });
        });
    }

    setupEventListeners() {
        const searchInput = document.getElementById('userSearchInput');
        const clearButton = document.getElementById('clearSearchResults');

        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                clearTimeout(this.searchTimeout);
                const value = event.target.value.trim();
                this.searchTimeout = setTimeout(() => {
                    this.handleSearch(value);
                }, 250);
            });
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                const input = document.getElementById('userSearchInput');
                if (input) input.value = '';
                this.hideSearchResults();
            });
        }

        // Delegate clicks on subscribe buttons so this manager works even if main.js isn't present
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest && e.target.closest('.subscribe-btn');
            if (!btn) return;
            e.preventDefault();
            const userId = btn.dataset.userId || btn.getAttribute('data-user-id');
            if (!userId) return;
            // Require authentication before toggling subscription
            if (!this.api?.isAuthenticated?.()) {
                // Prefer app-level auth manager if available
                if (window.authManager && typeof window.authManager.requireAuth === 'function') {
                    window.authManager.requireAuth();
                } else {
                    alert('Lai sekotu autoram, lūdzu, pieslēdzieties.');
                }
                return;
            }
            try {
                const result = await this.api.toggleSubscription(parseInt(userId));
                // update button appearance for all buttons targeting this user
                const allButtons = document.querySelectorAll(`.subscribe-btn[data-user-id="${userId}"]`);
                allButtons.forEach(b => {
                    if (result.isSubscribed) {
                        b.classList.add('subscribed');
                        b.textContent = 'Atsekot';
                        b.setAttribute('aria-pressed', 'true');
                    } else {
                        b.classList.remove('subscribed');
                        b.textContent = 'Sekot';
                        b.setAttribute('aria-pressed', 'false');
                    }
                });

                // update subscribers count elements
                const counters = document.querySelectorAll(`.subscribers-count[data-subscribers-for="${userId}"]`);
                counters.forEach(c => c.textContent = result.subscribersCount ?? this.api.getSubscribersCount(userId));

                // let other managers react via the global event dispatched by ApiClient
            } catch (err) {
                console.error('Subscription toggle failed', err);
            }
        });

        document.addEventListener('subscription:updated', async () => {
            await Promise.all([
                this.loadFollowing(),
                this.loadFollowers()
            ]);
            this.updateStats();
        });
    }

    async handleSearch(query) {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }

        try {
            const results = await this.api.searchUsers(query);
            this.searchResults = Array.isArray(results) ? results : [];
            if (this.searchResults.length > 0) {
                this.showSearchResults(this.searchResults);
            } else {
                this.showSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    showSearchResults(results) {
        const section = document.getElementById('userSearchResults');
        const list = document.getElementById('searchResultsList');
        if (!section || !list) return;

        section.style.display = 'block';

        if (!results || results.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <p>Meklēšanas rezultāti netika atrasti. Pamēģini citu atslēgvārdu.</p>
                </div>
            `;
            return;
        }

        list.innerHTML = results.map(user => this.renderUserCard(user, {
            context: 'search',
            isSubscribed: this.isFollowing(user.id)
        })).join('');
    }

    hideSearchResults() {
        const section = document.getElementById('userSearchResults');
        const list = document.getElementById('searchResultsList');
        if (section) section.style.display = 'none';
        if (list) list.innerHTML = '';
    }

    isFollowing(userId) {
        return this.following.some(user => user.id === userId || user.id === Number(userId));
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionsManager = new SubscriptionsManager();
});
