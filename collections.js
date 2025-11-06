class CollectionsManager {
    constructor() {
        this.api = window.apiClient;
        this.collections = [];
        this.filteredCollections = [];
        this.activeFilter = 'all';
        this.searchTerm = '';
        this.activeCollectionId = null;
        this.availableRecipes = [];
        this.recipeSearchTerm = '';
        this.themes = this.buildThemes();
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
        this.loadThemedIdeas();
        this.setupEventListeners();
    }

    buildThemes() {
        return [
            {
                key: 'quick-dinner',
                title: 'Ātrās vakariņas',
                description: 'Gatavojams 30 minūtēs vai mazāk, lai vakara maltīte būtu gatava acumirklī.',
                predicate: recipe => (Number(recipe.prep_time) || 0) + (Number(recipe.cook_time) || 0) <= 30
            },
            {
                key: 'sweet-life',
                title: 'Saldie mirkļi',
                description: 'Desertu iedvesma svētkiem un ikdienai.',
                predicate: recipe => (recipe.tags || []).some(tag => ['deserts', 'sokolade', 'saldi'].includes(tag.toLowerCase()))
            },
            {
                key: 'green-bowl',
                title: 'Zaļās izvēles',
                description: 'Vegāniskas un veģetāras receptes rāmam prātam.',
                predicate: recipe => (recipe.tags || []).some(tag => ['veganu', 'salati', 'vegetariskas'].includes(tag.toLowerCase()))
            },
            {
                key: 'italian-dream',
                title: 'Itāļu klasika',
                description: 'Pastas, aromātiskas mērces un Vidusjūras noskaņas.',
                predicate: recipe => (recipe.tags || []).some(tag => ['italu', 'pasta'].includes(tag.toLowerCase()))
            }
        ];
    }

    showLoginPrompt() {
        const container = document.getElementById('collectionsContainer');
        const emptyState = document.getElementById('emptyCollections');
        const heroStats = document.getElementById('collectionsStats');

        const loginHTML = `
            <div class="empty-state">
                <i class="fas fa-sign-in-alt fa-3x"></i>
                <h3>Pieslēdzieties, lai redzētu kolekcijas</h3>
                <p>Lai izmantotu kolekcijas, jums jāpieslēdzas savam kontam.</p>
                <a href="login.html" class="btn btn-primary">Pieteikties</a>
            </div>
        `;

        if (container) container.innerHTML = loginHTML;
        if (heroStats) heroStats.innerHTML = '';
        if (emptyState) emptyState.style.display = 'none';
    }

    async loadCollections() {
        try {
            const collections = await this.api.getUserCollections();
            this.collections = Array.isArray(collections) ? collections : [];
            this.applyFilters();
            this.updateStats();
        } catch (error) {
            console.error('Error loading collections:', error);
            window.mainApp?.showError?.('Kļūda ielādējot kolekcijas');
            this.renderFallbackCollections();
        }
    }

    async loadThemedIdeas() {
        try {
            const recipes = await this.api.getTopRecipes();
            const ideas = this.themes.map(theme => {
                const matches = recipes.filter(theme.predicate).slice(0, 3);
                return { ...theme, recipes: matches };
            }).filter(theme => theme.recipes.length > 0);
            this.renderThemedIdeas(ideas);
        } catch (error) {
            console.error('Error loading themed ideas:', error);
        }
    }

    updateStats() {
        const totalCollections = this.collections.length;
        const publicCollections = this.collections.filter(collection => (collection.visibility || 'private') === 'public').length;
        const totalRecipes = this.collections.reduce((sum, collection) => sum + (collection.recipesCount || 0), 0);

        const totalEl = document.getElementById('collectionsCount');
        const publicEl = document.getElementById('collectionsPublic');
        const recipesEl = document.getElementById('collectionsRecipes');

        if (totalEl) totalEl.textContent = totalCollections;
        if (publicEl) publicEl.textContent = publicCollections;
        if (recipesEl) recipesEl.textContent = totalRecipes;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('collectionSearchInput');
        const filterContainer = document.querySelector('.collections-toolbar__filters');
        const collectionsShell = document.querySelector('.collections-shell');
        const ideasContainer = document.getElementById('themedIdeas');

        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                this.searchTerm = event.target.value.trim().toLowerCase();
                this.applyFilters();
            });
        }

        if (filterContainer) {
            filterContainer.addEventListener('click', (event) => {
                const chip = event.target.closest('.chip');
                if (!chip) return;
                const filter = chip.dataset.filter || 'all';
                this.activeFilter = filter;
                filterContainer.querySelectorAll('.chip').forEach(button => button.classList.toggle('active', button === chip));
                this.applyFilters();
            });
        }

        if (collectionsShell) {
            collectionsShell.addEventListener('click', (event) => {
                const addButton = event.target.closest('.collection-add-recipe');
                if (!addButton) {
                    return;
                }
                event.preventDefault();
                const collectionId = Number(addButton.dataset.collectionId);
                if (!Number.isNaN(collectionId)) {
                    this.openAddRecipeModal(collectionId);
                }
            });
        }

        if (ideasContainer) {
            ideasContainer.addEventListener('click', (event) => {
                const addBtn = event.target.closest('.idea-add-btn');
                const viewBtn = event.target.closest('.idea-view-btn');
                if (addBtn) {
                    const recipeId = addBtn.dataset.recipeId;
                    if (recipeId) {
                        window.mainApp?.showAddToCollectionModal?.(recipeId);
                    }
                }
                if (viewBtn) {
                    const recipeId = viewBtn.dataset.recipeId;
                    if (recipeId) {
                        window.location.href = `recipe.html?id=${recipeId}`;
                    }
                }
            });
        }

        document.addEventListener('collection:deleted', () => this.loadCollections());
        document.addEventListener('collection:created', () => this.loadCollections());
        document.addEventListener('collection:updated', () => this.loadCollections());
        document.addEventListener('collection:recipe-added', () => this.loadCollections());

        // Remove the call to setupRecipeModalHandlers since it's handled by mainApp now
    }

    applyFilters() {
        let list = [...this.collections];

        if (this.searchTerm) {
            list = list.filter(collection => {
                const haystack = `${collection.name} ${collection.description || ''}`.toLowerCase();
                return haystack.includes(this.searchTerm);
            });
        }

        if (this.activeFilter === 'public') {
            list = list.filter(collection => (collection.visibility || 'private') === 'public');
        } else if (this.activeFilter === 'private') {
            list = list.filter(collection => (collection.visibility || 'private') === 'private');
        } else if (this.activeFilter === 'recent') {
            list = list.slice().sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
        }

        this.filteredCollections = list;
        this.renderCollections(list);
    }

    renderCollections(collections) {
        const container = document.getElementById('collectionsContainer');
        const emptyState = document.getElementById('emptyCollections');

        if (!container) return;

        if (!collections || collections.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open fa-2x"></i>
                    <p>Nepastāv kolekcijas ar šādiem kritērijiem. Pamēģini citu filtru vai izveido jaunu kolekciju.</p>
                </div>
            `;
            if (emptyState) emptyState.style.display = this.collections.length === 0 ? 'block' : 'none';
            return;
        }

        container.innerHTML = collections.map(collection => this.renderCollectionCard(collection)).join('');
        if (emptyState) emptyState.style.display = 'none';
    }

    renderCollectionCard(collection) {
        const previewImages = Array.isArray(collection.previewImages) ? collection.previewImages : [];
    const coverImage = collection.cover || previewImages[0] || 'images/cake.jpg';
        const isPublic = (collection.visibility || 'private') === 'public';
        const updatedAt = collection.updated_at || collection.created_at;
        const formattedDate = updatedAt ? new Date(updatedAt).toLocaleDateString('lv-LV') : '';

        return `
            <article class="collection-card" data-collection-id="${collection.id}">
                <div class="collection-cover">
                    <img src="${coverImage}" alt="${collection.name}">
                </div>
                <div class="collection-content">
                    <div class="collection-meta">
                        <span class="badge">${isPublic ? 'Publiska' : 'Privāta'}</span>
                        <span><i class="fas fa-book-open"></i> ${collection.recipesCount ?? 0} receptes</span>
                        ${formattedDate ? `<span><i class="far fa-clock"></i> Atjaunots ${formattedDate}</span>` : ''}
                    </div>
                    <h3>${collection.name}</h3>
                    <p class="collection-description">${collection.description || 'Nav apraksta'}</p>
                    <div class="collection-footer">
                        <div class="collection-actions">
                            <button class="btn btn-outline btn-small" onclick="collectionsManager.openCollection(${collection.id})">
                                <i class="fas fa-eye"></i> Atvērt
                            </button>
                            <button class="btn btn-outline btn-small collection-add-recipe" data-collection-id="${collection.id}">
                                <i class="fas fa-plus"></i> Pievienot recepti
                            </button>
                            <button class="btn btn-outline btn-small" onclick="collectionsManager.editCollection(${collection.id})">
                                <i class="fas fa-pen"></i> Rediģēt
                            </button>
                            <button class="btn btn-danger btn-small" onclick="collectionsManager.deleteCollection(${collection.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    renderFallbackCollections() {
        const container = document.getElementById('collectionsContainer');
        if (!container) return;

        container.innerHTML = `
            <article class="collection-card">
                <div class="collection-cover">
                    <img src="images/cake.jpg" alt="Demo kolekcija">
                </div>
                <div class="collection-content">
                    <div class="collection-meta">
                        <span class="badge">Publiska</span>
                        <span><i class="fas fa-book-open"></i> 3 receptes</span>
                    </div>
                    <h3>Demo kolekcija</h3>
                    <p class="collection-description">Šī ir demo kolekcija piemēram un inspo.</p>
                    <div class="collection-footer">
                        <div class="collection-actions">
                            <button class="btn btn-outline btn-small">Atvērt</button>
                            <button class="btn btn-outline btn-small">Rediģēt</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    renderThemedIdeas(ideas) {
        const container = document.getElementById('themedIdeas');
        if (!container) return;

        if (!ideas || ideas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Šobrīd nav tematisku ideju. Apskati populārākos autorus un atklāj jaunas receptes!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(theme => `
            <article class="idea-card">
                <h3>${theme.title}</h3>
                <p>${theme.description}</p>
                <div class="idea-recipes">
                    ${theme.recipes.map(recipe => `
                        <span><i class="fas fa-check"></i>${recipe.title}</span>
                    `).join('')}
                </div>
                <div class="idea-actions">
                    <button class="btn btn-outline btn-small idea-view-btn" data-recipe-id="${theme.recipes[0].id}">
                        <i class="fas fa-eye"></i> Skatīt recepti
                    </button>
                    <button class="btn btn-primary btn-small idea-add-btn" data-recipe-id="${theme.recipes[0].id}">
                        <i class="fas fa-plus"></i> Pievienot kolekcijai
                    </button>
                </div>
            </article>
        `).join('');
    }

    openCollection(collectionId) {
        window.location.href = `collection.html?id=${collectionId}`;
    }

    showCreateCollectionModal(collection = null) {
        if (!window.mainApp?.showCreateCollectionModal) {
            window.mainApp?.showNotification?.('Kolekciju logs nav pieejams šajā lapā', 'error');
            return;
        }
        window.mainApp.showCreateCollectionModal(collection);
    }

    editCollection(collectionId) {
        const id = Number(collectionId);
        if (Number.isNaN(id)) return;

        const collection = this.collections.find(item => item.id === id);
        if (!collection) {
            window.mainApp?.showNotification?.('Kolekcija netika atrasta', 'error');
            return;
        }
        this.showCreateCollectionModal(collection);
    }

    async deleteCollection(collectionId) {
        const id = Number(collectionId);
        if (Number.isNaN(id)) return;

        if (!this.api?.isAuthenticated?.()) {
            window.mainApp?.showNotification?.('Lai dzēstu kolekcijas, jāpieslēdzas', 'error');
            return;
        }

        if (!window.confirm('Vai tiešām vēlaties dzēst šo kolekciju?')) return;

        try {
            await this.api.deleteCollection(id);
            window.mainApp?.showNotification?.('Kolekcija dzēsta', 'success');
            document.dispatchEvent(new CustomEvent('collection:deleted', { detail: { collectionId: id } }));
            await this.loadCollections();
        } catch (error) {
            const message = error?.message || 'Neizdevās dzēst kolekciju';
            window.mainApp?.showNotification?.(message, 'error');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.collectionsManager = new CollectionsManager();

    // Add event listeners for buttons that were previously using onclick
    const searchButton = document.getElementById('searchButton');
    if (searchButton && window.mainApp) {
        searchButton.addEventListener('click', () => window.mainApp.searchRecipes());
    }

    const newCollectionBtn = document.getElementById('newCollectionBtn');
    if (newCollectionBtn && window.mainApp) {
        newCollectionBtn.addEventListener('click', () => window.mainApp.showCreateCollectionModal());
    }

    const createCollectionBtn = document.getElementById('createCollectionBtn');
    if (createCollectionBtn && window.mainApp) {
        createCollectionBtn.addEventListener('click', () => window.mainApp.showCreateCollectionModal());
    }
});
