class SubscriptionsManager {
    constructor() {
        this.api = window.apiClient;
        this.init();
    }

    init() {
        this.loadFollowing();
        this.loadFollowers();
        this.loadSuggestions();
        this.setupEventListeners();
        this.setupTabs();
    }

    async loadFollowing() {
        try {
            const following = await this.api.getFollowing();
            this.renderFollowing(following);
        } catch (error) {
            console.error('Error loading following:', error);
        }
    }

    renderFollowing(users) {
        const container = document.getElementById('followingList');
        const emptyState = document.getElementById('emptyFollowing');

        if (!users || users.length === 0) {
            if (container) container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (container) {
            container.innerHTML = users.map(user => `
                <div class="user-card">
                    <div class="user-card-header">
                        <img src="${user.cover || 'images/cover-default.jpg'}" alt="${user.fullName}" class="user-cover">
                        <div class="user-avatar-container">
                            <img src="${user.avatar || 'images/avatar.jpg'}" alt="${user.fullName}" class="user-avatar-large">
                            ${user.isVerified ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                        </div>
                    </div>
                    <div class="user-card-body">
                        <h4>${user.fullName}</h4>
                        <p class="user-specialization">${user.specialization}</p>
                        <p class="user-bio">${user.bio ? user.bio.substring(0, 100) + '...' : 'Nav apraksta'}</p>
                        <div class="user-stats">
                            <div class="user-stat">
                                <strong>${user.stats.recipesCount}</strong>
                                <span>Receptes</span>
                            </div>
                            <div class="user-stat">
                                <strong>${user.stats.subscribersCount}</strong>
                                <span>Sekotāji</span>
                            </div>
                        </div>
                        <div class="user-actions">
                            <a href="profile-public.html?id=${user.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                            <button class="subscribe-btn subscribed" 
                                    data-user-id="${user.id}"
                                    onclick="window.mainApp.toggleSubscription('${user.id}', this)">
                                Seko
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        if (emptyState) emptyState.style.display = 'none';
    }

    async loadFollowers() {
        try {
            const followers = await this.api.getFollowers();
            this.renderFollowers(followers);
        } catch (error) {
            console.error('Error loading followers:', error);
        }
    }

    renderFollowers(users) {
        const container = document.getElementById('followersList');
        const emptyState = document.getElementById('emptyFollowers');

        if (!users || users.length === 0) {
            if (container) container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (container) {
            container.innerHTML = users.map(user => `
                <div class="user-card">
                    <div class="user-card-header">
                        <img src="${user.cover || 'images/cover-default.jpg'}" alt="${user.fullName}" class="user-cover">
                        <div class="user-avatar-container">
                            <img src="${user.avatar || 'images/avatar.jpg'}" alt="${user.fullName}" class="user-avatar-large">
                        </div>
                    </div>
                    <div class="user-card-body">
                        <h4>${user.fullName}</h4>
                        <p class="user-specialization">${user.specialization}</p>
                        <div class="user-stats">
                            <div class="user-stat">
                                <strong>${user.stats.recipesCount}</strong>
                                <span>Receptes</span>
                            </div>
                            <div class="user-stat">
                                <strong>${user.stats.subscribersCount}</strong>
                                <span>Sekotāji</span>
                            </div>
                        </div>
                        <div class="user-actions">
                            <a href="profile-public.html?id=${user.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                            <button class="subscribe-btn ${user.isSubscribed ? 'subscribed' : ''}" 
                                    data-user-id="${user.id}"
                                    onclick="window.mainApp.toggleSubscription('${user.id}', this)">
                                ${user.isSubscribed ? 'Seko' : 'Sekot'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        if (emptyState) emptyState.style.display = 'none';
    }

    async loadSuggestions() {
        try {
            const suggestions = await this.api.getUserSuggestions();
            this.renderSuggestions(suggestions);
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }

    renderSuggestions(users) {
        const container = document.getElementById('suggestionsList');
        if (!container) return;

        container.innerHTML = users.map(user => `
            <div class="user-card">
                <div class="user-card-header">
                    <img src="${user.cover || 'images/cover-default.jpg'}" alt="${user.fullName}" class="user-cover">
                    <div class="user-avatar-container">
                        <img src="${user.avatar || 'images/avatar.jpg'}" alt="${user.fullName}" class="user-avatar-large">
                    </div>
                </div>
                <div class="user-card-body">
                    <h4>${user.fullName}</h4>
                    <p class="user-specialization">${user.specialization}</p>
                    <p class="user-bio">${user.bio ? user.bio.substring(0, 100) + '...' : 'Nav apraksta'}</p>
                    <div class="user-stats">
                        <div class="user-stat">
                            <strong>${user.stats.recipesCount}</strong>
                            <span>Receptes</span>
                        </div>
                        <div class="user-stat">
                            <strong>${user.stats.subscribersCount}</strong>
                            <span>Sekotāji</span>
                        </div>
                    </div>
                    <div class="user-actions">
                        <a href="profile-public.html?id=${user.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                        <button class="subscribe-btn" 
                                data-user-id="${user.id}"
                                onclick="window.mainApp.toggleSubscription('${user.id}', this)">
                            Sekot
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // User search
        const searchInput = document.getElementById('userSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchUsers(e.target.value);
                }, 300);
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

                // Hide search results when switching tabs
                this.hideSearchResults();
            });
        });
    }

    async searchUsers(query) {
        if (!query.trim()) {
            this.hideSearchResults();
            return;
        }

        try {
            const results = await this.api.searchUsers(query);
            this.renderSearchResults(results);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    renderSearchResults(users) {
        const resultsContainer = document.getElementById('userSearchResults');
        const resultsList = document.getElementById('searchResultsList');

        if (!resultsContainer || !resultsList) return;

        if (users.length === 0) {
            resultsList.innerHTML = '<p class="no-results">Nav atrasts neviens lietotājs</p>';
        } else {
            resultsList.innerHTML = users.map(user => `
                <div class="user-card">
                    <div class="user-card-header">
                        <img src="${user.cover || 'images/cover-default.jpg'}" alt="${user.fullName}" class="user-cover">
                        <div class="user-avatar-container">
                            <img src="${user.avatar || 'images/avatar.jpg'}" alt="${user.fullName}" class="user-avatar-large">
                        </div>
                    </div>
                    <div class="user-card-body">
                        <h4>${user.fullName}</h4>
                        <p class="user-specialization">${user.specialization}</p>
                        <div class="user-stats">
                            <div class="user-stat">
                                <strong>${user.stats.recipesCount}</strong>
                                <span>Receptes</span>
                            </div>
                            <div class="user-stat">
                                <strong>${user.stats.subscribersCount}</strong>
                                <span>Sekotāji</span>
                            </div>
                        </div>
                        <div class="user-actions">
                            <a href="profile-public.html?id=${user.id}" class="btn btn-outline btn-small">Skatīt profilu</a>
                            <button class="subscribe-btn ${user.isSubscribed ? 'subscribed' : ''}" 
                                    data-user-id="${user.id}"
                                    onclick="window.mainApp.toggleSubscription('${user.id}', this)">
                                ${user.isSubscribed ? 'Seko' : 'Sekot'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        resultsContainer.style.display = 'block';
        
        // Hide other content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
    }

    hideSearchResults() {
        const resultsContainer = document.getElementById('userSearchResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        // Show active tab content
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.style.display = 'block';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.subscriptionsManager = new SubscriptionsManager();
});