(function () {
    const FAVORITES_KEY = 'collectionFavorites';

    const state = {
        collection: null,
        recipes: [],
        sort: 'newest',
        isFavorited: false
    };

    const elements = {};

    const formatMinutes = (minutes) => {
        if (!minutes || minutes <= 0) {
            return '—';
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    const formatDate = (iso) => {
        if (!iso) {
            return '—';
        }
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) {
            return '—';
        }
        return date.toLocaleDateString('lv-LV', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const translateDifficulty = (value) => {
        switch ((value || '').toLowerCase()) {
            case 'easy':
                return 'Viegla';
            case 'hard':
                return 'Sarežģīta';
            default:
                return 'Vidēja';
        }
    };

    const getFavoritesMap = () => {
        try {
            return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}');
        } catch (error) {
            console.warn('Failed to read collection favorites', error);
            return {};
        }
    };

    const setFavoritesMap = (map) => {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(map));
    };

    const getCurrentUserId = () => {
        const user = window.apiClient.getCurrentUser();
        return user ? user.id : null;
    };

    const showNotification = (message, type = 'info') => {
        if (window.mainApp?.showNotification) {
            window.mainApp.showNotification(message, type);
        }
    };

    const renderLoadingState = () => {
        if (elements.title) {
            elements.title.textContent = 'Ielādē kolekciju...';
        }
        if (elements.description) {
            elements.description.textContent = 'Notiek datu ielāde...';
        }
    };

    const displayError = (message) => {
        if (elements.hero) {
            elements.hero.style.backgroundImage = 'linear-gradient(135deg, rgba(17, 24, 39, 0.85), rgba(30, 41, 59, 0.7))';
        }
        if (elements.visibility) {
            elements.visibility.innerHTML = '<i class="fas fa-lock"></i> Kolekcija nav pieejama';
        }
        if (elements.title) {
            elements.title.textContent = 'Kolekcija nav atrasta';
        }
        if (elements.description) {
            elements.description.textContent = message || 'Šī kolekcija netika atrasta vai arī tā ir privāta.';
        }
        if (elements.recipes) {
            elements.recipes.innerHTML = '';
        }
        if (elements.empty) {
            elements.empty.style.display = 'block';
            elements.empty.innerHTML = `<p>${message || 'Nav iespējams attēlot kolekciju.'}</p>`;
        }
        if (elements.sort) {
            elements.sort.disabled = true;
        }
        if (elements.authorCard) {
            elements.authorCard.innerHTML = '<div class="collection-card-title"><i class="fas fa-user"></i> Kolekcijas autors</div><p class="collection-placeholder">Autora informācija nav pieejama</p>';
        }
        if (elements.highlightsCard) {
            elements.highlightsCard.innerHTML = '<div class="collection-card-title"><i class="fas fa-bolt"></i> Kolekcijas galvenie rādītāji</div><p class="collection-placeholder">Statistika nav pieejama</p>';
        }
        if (elements.relatedCard) {
            elements.relatedCard.innerHTML = '<div class="collection-card-title"><i class="fas fa-folder-tree"></i> Citas kolekcijas</div><p class="collection-placeholder">Citas kolekcijas nav pieejamas</p>';
        }
        if (elements.shareBtn) {
            elements.shareBtn.disabled = true;
        }
        if (elements.followBtn) {
            elements.followBtn.disabled = true;
        }
        if (elements.editBtn) {
            elements.editBtn.disabled = true;
        }
    };

    const updateFavoriteButton = () => {
        if (!elements.followBtn || !state.collection) {
            return;
        }
        const userId = getCurrentUserId();
        const map = getFavoritesMap();
        state.isFavorited = Boolean(userId && map[userId]?.includes(state.collection.id));
        elements.followBtn.classList.toggle('active', state.isFavorited);
        elements.followBtn.innerHTML = state.isFavorited
            ? '<i class="fas fa-heart"></i> Saglabāts'
            : '<i class="fas fa-heart"></i> Saglabāt';
    };

    const toggleFavorite = () => {
        if (!state.collection) {
            return;
        }
        if (!window.apiClient.isAuthenticated()) {
            showNotification('Lai saglabātu kolekciju, lūdzu, piesakieties.', 'warning');
            window.authManager?.requireAuth?.();
            return;
        }
        const userId = getCurrentUserId();
        if (!userId) {
            return;
        }
        const map = getFavoritesMap();
        const list = map[userId] || [];
        if (state.isFavorited) {
            map[userId] = list.filter((id) => id !== state.collection.id);
            showNotification('Kolekcija noņemta no izlases.', 'info');
        } else {
            list.push(state.collection.id);
            map[userId] = Array.from(new Set(list));
            showNotification('Kolekcija saglabāta izlases sarakstā.', 'success');
        }
        setFavoritesMap(map);
        updateFavoriteButton();
    };

    const getSortedRecipes = () => {
        const recipes = [...state.recipes];
        switch (state.sort) {
            case 'popular':
                return recipes.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
            case 'rating':
                return recipes.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
            case 'time':
                return recipes.sort((a, b) => ((a.prep_time || 0) + (a.cook_time || 0)) - ((b.prep_time || 0) + (b.cook_time || 0)));
            case 'newest':
            default:
                return recipes.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }
    };

    const buildRecipeCard = (recipe) => {
        const difficultyText = window.mainApp?.getDifficultyText
            ? window.mainApp.getDifficultyText(recipe.difficulty)
            : translateDifficulty(recipe.difficulty);
        const totalTime = (parseInt(recipe.prep_time, 10) || 0) + (parseInt(recipe.cook_time, 10) || 0);
        const stars = window.mainApp?.generateStars
            ? window.mainApp.generateStars(recipe.average_rating)
            : '';
        const ratingValue = recipe.average_rating ? Number(recipe.average_rating).toFixed(1) : '0.0';
        const description = (recipe.description || '').slice(0, 140);
        return `<div class="recipe-card" data-id="${recipe.id}">
            <div class="recipe-image">
                <img src="${recipe.image_url || 'images/cake.jpg'}" alt="${recipe.title}">
            </div>
            <div class="recipe-info">
                <div class="recipe-meta">
                    <span class="recipe-time"><i class="far fa-clock"></i> ${formatMinutes(totalTime)}</span>
                    <span class="recipe-difficulty difficulty-${recipe.difficulty || 'medium'}">${difficultyText}</span>
                </div>
                <h3>${recipe.title}</h3>
                <div class="rating">
                    <div class="stars">${stars}</div>
                    <span class="rating-value">${ratingValue}</span>
                </div>
                <p class="recipe-description">${description}${description.length === 140 ? '…' : ''}</p>
                <div class="recipe-footer">
                    <a href="recipe.html?id=${recipe.id}" class="btn btn-outline">Skatīt recepti</a>
                    <div class="recipe-stats">
                        <span><i class="fas fa-heart"></i> ${recipe.favorites_count || 0}</span>
                        <span><i class="fas fa-eye"></i> ${recipe.views_count || 0}</span>
                    </div>
                </div>
            </div>
        </div>`;
    };

    const renderRecipes = () => {
        if (!elements.recipes) {
            return;
        }
        const sorted = getSortedRecipes();
        if (sorted.length === 0) {
            elements.recipes.innerHTML = '';
            if (elements.empty) {
                elements.empty.style.display = 'block';
            }
            return;
        }
        if (elements.empty) {
            elements.empty.style.display = 'none';
        }
        elements.recipes.innerHTML = sorted.map(buildRecipeCard).join('');
    };

    const renderTags = (tags) => {
        if (!elements.tags) {
            return;
        }
        if (!tags || tags.length === 0) {
            elements.tags.innerHTML = '';
            return;
        }
        elements.tags.innerHTML = tags.slice(0, 10)
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join('');
    };

    const renderMeta = (collection) => {
        const stats = collection.stats || {};
        if (elements.recipeCount) {
            elements.recipeCount.textContent = stats.recipesCount ?? state.recipes.length;
        }
        if (elements.averageRating) {
            const rating = stats.averageRating ?? 0;
            elements.averageRating.textContent = stats.recipesCount > 0 ? rating.toFixed(1) : '—';
        }
        if (elements.totalTime) {
            elements.totalTime.textContent = formatMinutes(stats.totalTime ?? 0);
        }
        if (elements.updated) {
            elements.updated.textContent = formatDate(stats.updatedAt || collection.updated_at || collection.created_at);
        }
        if (elements.visibility) {
            const isPublic = (collection.visibility || 'private') === 'public';
            elements.visibility.innerHTML = `<i class="${isPublic ? 'fas fa-earth-europe' : 'fas fa-lock'}"></i> ${isPublic ? 'Publiska kolekcija' : 'Privāta kolekcija'}`;
        }
    };

    const renderAuthor = (collection) => {
        if (!elements.authorCard) {
            return;
        }
        const author = collection.author;
        if (!author) {
            elements.authorCard.innerHTML = '<div class="collection-card-title"><i class="fas fa-user"></i> Kolekcijas autors</div><p class="collection-placeholder">Autors nav pieejams</p>';
            return;
        }
        const stats = author.stats || {};
        const isOwner = collection.isOwner;
        const isSubscribed = !isOwner && window.mainApp?.isSubscribed ? window.mainApp.isSubscribed(author.id) : false;
        const subscribeMarkup = isOwner ? '' : `<button type="button" class="btn btn-primary btn-small subscribe-btn" data-user-id="${author.id}"><i class="fas fa-${isSubscribed ? 'user-check' : 'user-plus'}"></i> ${isSubscribed ? 'Seko' : 'Sekot'}</button>`;
        elements.authorCard.innerHTML = `
            <div class="collection-card-title"><i class="fas fa-user"></i> Kolekcijas autors</div>
            <div class="author-header">
                <img src="${author.avatar || 'images/avatar.jpg'}" alt="${author.fullName || author.username}">
                <div class="author-meta">
                    <strong>${author.fullName || author.username}</strong>
                    <span>${author.specialization || 'Kulinārijas entuziasts'}</span>
                </div>
            </div>
            <div class="author-stats">
                <span><i class="fas fa-utensils"></i> ${stats.recipesCount ?? 0} receptes</span>
                <span><i class="fas fa-users"></i> ${stats.subscribersCount ?? 0} sekotāji</span>
            </div>
            <div class="author-actions">
                <a href="profile-public.html?id=${author.id}" class="btn btn-outline btn-small"><i class="fas fa-id-card"></i> Skatīt profilu</a>
                ${subscribeMarkup}
            </div>
        `;
        if (!isOwner && window.mainApp?.isSubscribed) {
            const subscribeBtn = elements.authorCard.querySelector('.subscribe-btn');
            if (subscribeBtn) {
                subscribeBtn.classList.toggle('subscribed', isSubscribed);
            }
        }
    };

    const renderHighlights = (collection) => {
        if (!elements.highlightsCard) {
            return;
        }
        const stats = collection.stats || {};
        const breakdown = stats.difficultyBreakdown || { easy: 0, medium: 0, hard: 0 };
        elements.highlightsCard.innerHTML = `
            <div class="collection-card-title"><i class="fas fa-bolt"></i> Kolekcijas galvenie rādītāji</div>
            <ul>
                <li><i class="fas fa-gauge-high"></i> <strong>${translateDifficulty(stats.averageDifficulty)}</strong> vidējā grūtība</li>
                <li><i class="fas fa-stopwatch"></i> <strong>${formatMinutes(stats.averagePrepTime)}</strong> sagatavošana vidēji</li>
                <li><i class="fas fa-trophy"></i> <strong>${stats.totalRatings ?? 0}</strong> vērtējumi kolekcijai</li>
                <li><i class="fas fa-layer-group"></i> <strong>${breakdown.easy}/${breakdown.medium}/${breakdown.hard}</strong> (vieglās / vidējās / sarežģītās)</li>
            </ul>
        `;
    };

    const renderRelated = (collection) => {
        if (!elements.relatedCard) {
            return;
        }
        const related = collection.relatedCollections || [];
        if (related.length === 0) {
            elements.relatedCard.innerHTML = '<div class="collection-card-title"><i class="fas fa-folder-tree"></i> Citas kolekcijas</div><p class="collection-placeholder">Autoram nav citu kolekciju.</p>';
            return;
        }
        const markup = related.map((item) => `
            <div class="related-item">
                <img src="${item.cover || 'images/collections/default.jpg'}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <span>${item.recipesCount} receptes</span>
                </div>
                <a href="collection.html?id=${item.id}" class="btn btn-outline btn-small"><i class="fas fa-arrow-right"></i></a>
            </div>
        `).join('');
        elements.relatedCard.innerHTML = '<div class="collection-card-title"><i class="fas fa-folder-tree"></i> Citas kolekcijas</div>' + markup;
    };

    const renderCollection = (collection) => {
        state.collection = collection;
        state.recipes = Array.isArray(collection.recipes) ? collection.recipes.slice() : [];

        if (elements.hero) {
            const cover = collection.cover || 'images/collections/default.jpg';
            elements.hero.style.backgroundImage = `linear-gradient(135deg, rgba(17, 24, 39, 0.75), rgba(30, 41, 59, 0.55)), url('${cover}')`;
        }

        if (elements.title) {
            elements.title.textContent = collection.name || 'Nezināma kolekcija';
            document.title = `${collection.name || 'Kolekcija'} - Kulinārijas grāmata`;
        }

        if (elements.description) {
            elements.description.textContent = collection.description || 'Šī kolekcija nav aprakstīta.';
        }

        renderMeta(collection);
        renderTags(collection.tags || []);
        renderAuthor(collection);
        renderHighlights(collection);
        renderRelated(collection);
        updateFavoriteButton();
        renderRecipes();

        if (elements.shareBtn) {
            elements.shareBtn.disabled = false;
        }

        if (elements.followBtn) {
            if (collection.isOwner) {
                elements.followBtn.style.display = 'none';
            } else {
                elements.followBtn.style.display = '';
                elements.followBtn.disabled = false;
            }
        }

        if (elements.editBtn) {
            if (collection.isOwner) {
                elements.editBtn.style.display = '';
                elements.editBtn.disabled = false;
                elements.editBtn.addEventListener('click', () => {
                    window.location.href = 'collections.html';
                });
            } else {
                elements.editBtn.style.display = 'none';
            }
        }
    };

    const attachEventListeners = () => {
        if (elements.sort) {
            elements.sort.addEventListener('change', (event) => {
                state.sort = event.target.value;
                renderRecipes();
            });
        }

        if (elements.shareBtn) {
            elements.shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    showNotification('Kolekcijas saite iekopēta starpliktuvē.', 'success');
                } catch (error) {
                    showNotification('Neizdevās kopēt saiti. Izmantojiet manuālo kopēšanu.', 'info');
                }
            });
        }

        if (elements.followBtn) {
            elements.followBtn.addEventListener('click', toggleFavorite);
        }
    };

    const loadCollection = async (collectionId) => {
        renderLoadingState();
        try {
            const data = await window.apiClient.getCollectionById(collectionId);
            renderCollection(data);
        } catch (error) {
            console.error('Failed to load collection:', error);
            displayError(error.message || 'Kolekciju neizdevās ielādēt.');
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        Object.assign(elements, {
            hero: document.getElementById('collectionHero'),
            visibility: document.getElementById('collectionVisibility'),
            title: document.getElementById('collectionTitle'),
            description: document.getElementById('collectionDescription'),
            recipeCount: document.getElementById('collectionRecipeCount'),
            averageRating: document.getElementById('collectionAverageRating'),
            totalTime: document.getElementById('collectionTotalTime'),
            updated: document.getElementById('collectionUpdated'),
            tags: document.getElementById('collectionTags'),
            recipes: document.getElementById('collectionRecipes'),
            empty: document.getElementById('collectionEmpty'),
            sort: document.getElementById('collectionSort'),
            shareBtn: document.getElementById('collectionShareBtn'),
            followBtn: document.getElementById('collectionFollowBtn'),
            editBtn: document.getElementById('collectionEditBtn'),
            authorCard: document.getElementById('collectionAuthor'),
            highlightsCard: document.getElementById('collectionHighlights'),
            relatedCard: document.getElementById('relatedCollections')
        });

        attachEventListeners();

        const params = new URLSearchParams(window.location.search);
        const idParam = params.get('id');
        const collectionId = idParam ? parseInt(idParam, 10) : NaN;
        if (!idParam || Number.isNaN(collectionId)) {
            displayError('Kolekcija nav atrasta.');
            return;
        }

        loadCollection(collectionId);
    });
})();
