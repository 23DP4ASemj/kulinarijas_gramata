class CollectionsManager {
    constructor() {
        this.api = window.apiClient;
        if (!this.api) {
            console.error('API client not found');
            return;
        }
        this.init();
    }

    init() {
        if (!this.api.isAuthenticated()) {
            this.showLoginPrompt();
            return;
        }
        this.loadCollections();
        this.setupEventListeners();
    }

    showLoginPrompt() {
        const container = document.getElementById('collectionsContainer');
        const emptyState = document.getElementById('emptyCollections');
        
        const loginHTML = `
            <div class="empty-state">
                <i class="fas fa-sign-in-alt fa-3x"></i>
                <h3>Pieslēdzieties, lai redzētu kolekcijas</h3>
                <p>Lai izmantotu kolekcijas, jums jāpieslēdzas savā kontā</p>
                <a href="login.html" class="btn btn-primary">Pieteikties</a>
            </div>
        `;
        
        if (container) {
            container.innerHTML = loginHTML;
        }
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    async loadCollections() {
        try {
            console.log('Loading collections...');
            const collections = await this.api.getUserCollections();
            console.log('Collections loaded:', collections);
            this.renderCollections(collections);
        } catch (error) {
            console.error('Error loading collections:', error);
            window.mainApp.showError('Kļūda ielādējot kolekcijas');
            this.renderFallbackCollections();
        }
    }

    renderCollections(collections) {
        const container = document.getElementById('collectionsContainer');
        const emptyState = document.getElementById('emptyCollections');

        if (!container) {
            console.error('Collections container not found');
            return;
        }

        if (!collections || collections.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        container.innerHTML = collections.map(collection => `
            <div class="collection-card" data-collection-id="${collection.id}">
                <div class="collection-header">
                    <h3>${collection.name}</h3>
                    <span class="collection-count">${collection.recipesCount} receptes</span>
                </div>
                <p class="collection-description">${collection.description || 'Nav apraksta'}</p>
                
                <div class="collection-recipes-preview">
                    ${collection.previewImages && collection.previewImages.length > 0 ? 
                        collection.previewImages.slice(0, 3).map(img => 
                            `<img src="${img}" alt="Recipe preview">`
                        ).join('') :
                        '<div class="no-preview">Nav receptu</div>'
                    }
                </div>
                
                <div class="collection-actions">
                    <button class="btn btn-outline btn-small" onclick="collectionsManager.openCollection(${collection.id})">
                        Atvērt
                    </button>
                    <button class="btn btn-outline btn-small" onclick="collectionsManager.editCollection(${collection.id})">
                        Rediģēt
                    </button>
                    <button class="btn btn-danger btn-small" onclick="collectionsManager.deleteCollection(${collection.id})">
                        Dzēst
                    </button>
                </div>
            </div>
        `).join('');

        if (emptyState) emptyState.style.display = 'none';
    }

    renderFallbackCollections() {
        const container = document.getElementById('collectionsContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="collection-card">
                <div class="collection-header">
                    <h3>Demo kolekcija</h3>
                    <span class="collection-count">3 receptes</span>
                </div>
                <p class="collection-description">Šī ir demo kolekcija, kas rādīta testēšanas nolūkos</p>
                <div class="collection-recipes-preview">
                    <img src="images/placeholder.jpg" alt="Demo">
                    <img src="images/placeholder.jpg" alt="Demo">
                    <img src="images/placeholder.jpg" alt="Demo">
                </div>
                <div class="collection-actions">
                    <button class="btn btn-outline btn-small">Atvērt</button>
                    <button class="btn btn-outline btn-small">Rediģēt</button>
                </div>
            </div>
        `;
    }

    openCollection(collectionId) {
        window.location.href = `collection.html?id=${collectionId}`;
    }

    // ... остальные методы остаются такими же, но добавьте проверки на api
    async showCreateCollectionModal() {
        if (!this.api || !this.api.isAuthenticated()) {
            window.mainApp.showNotification('Lai izveidotu kolekcijas, jāpieslēdzas', 'error');
            return;
        }
        document.getElementById('createCollectionModal').style.display = 'block';
    }

    // ... остальной код методов
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.collectionsManager = new CollectionsManager();
});