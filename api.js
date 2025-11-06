class ApiClient {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.initDefaultData();
    }

    // Инициализация расширенных тестовых данных
    initDefaultData() {
        // Базовая структура пользователей с расширенными полями
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    username: "janisb",
                    email: "janis@example.com",
                    fullName: "Jānis Bērziņš",
                    bio: "Ēdam mīlu, dzīvoju ar garšu! 💫",
                    specialization: "Itāļu virtuve",
                    avatar: "images/avatar.jpg",
                    cover: "images/spaghetti.jpg",
                    stats: {
                        recipesCount: 12,
                        subscribersCount: 45,
                        rating: 4.8,
                        totalViews: 1250
                    },
                    achievements: ["first_recipe", "popular_author"],
                    subscriptions: [2, 3],
                    level: "expert",
                    joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: true
                },
                {
                    id: 2,
                    username: "annal",
                    email: "anna@example.com",
                    fullName: "Anna Liepa",
                    bio: "Desertu māksliniece ar mīlestību šokolādē 🍫",
                    specialization: "Deserti un konditoreja",
                    avatar: "images/avatar.jpg",
                    cover: "images/cake.jpg",
                    stats: {
                        recipesCount: 8,
                        subscribersCount: 32,
                        rating: 4.7,
                        totalViews: 890
                    },
                    achievements: ["first_recipe", "sweet_tooth"],
                    subscriptions: [1],
                    level: "advanced",
                    joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: false
                },
                {
                    id: 3,
                    username: "marisk",
                    email: "maris@example.com",
                    fullName: "Māris Kalniņš",
                    bio: "Veganu ēdienu entuziasts 🌱",
                    specialization: "Veganu ēdieni",
                    avatar: "images/avatar.jpg",
                    cover: "images/salad.jpg",
                    stats: {
                        recipesCount: 6,
                        subscribersCount: 28,
                        rating: 4.5,
                        totalViews: 670
                    },
                    achievements: ["first_recipe"],
                    subscriptions: [1, 2],
                    level: "intermediate",
                    joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    isVerified: false
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Рецепты с расширенными полями
        if (!localStorage.getItem('recipes')) {
            const defaultRecipes = [
                {
                    id: 1,
                    title: "Spageti Karbonāra",
                    description: "Autentiska itāļu klasika ar speķi un sieru",
                    category_id: 1,
                    category_name: "Galvenais ēdiens",
                    difficulty: "medium",
                    prep_time: 15,
                    cook_time: 15,
                    portions: 4,
                    ingredients: [
                        { id: 1, name: "400g spageti" },
                        { id: 2, name: "200g guančale speķa" },
                        { id: 3, name: "3 olu dzeltenumi" },
                        { id: 4, name: "100g Pecorino Romano siera" },
                        { id: 5, name: "Sāls un pipari" }
                    ],
                    instructions: [
                        { step_number: 1, instruction_text: "Vārēt spageti sāļā ūdenī al dente" },
                        { step_number: 2, instruction_text: "Sasmalcināt speķi un apcept līdz krokantam" },
                        { step_number: 3, instruction_text: "Samaisīt olu dzeltenumus ar sieru" },
                        { step_number: 4, instruction_text: "Apvienot visas sastāvdaļas" }
                    ],
                    author_id: 1,
                    author_name: "Jānis Bērziņš",
                    average_rating: 4.8,
                    ratings_count: 15,
                    favorites_count: 12,
                    views_count: 156,
                    image_url: "images/recipes/spaghetti-carbonara.jpg",
                    collections: [1],
                    tags: ["itāļu", "pasta", "speķis"],
                    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    is_featured: true
                },
                {
                    id: 2,
                    title: "Šokolādes fondāns",
                    description: "Izplūstošs šokolādes deserts ar šķidro kodolu",
                    category_id: 2,
                    category_name: "Deserti", 
                    difficulty: "medium",
                    prep_time: 25,
                    cook_time: 12,
                    portions: 6,
                    ingredients: [
                        { id: 1, name: "200g tumšās šokolādes" },
                        { id: 2, name: "150g sviesta" },
                        { id: 3, name: "2 olas" },
                        { id: 4, name: "100g cukura" },
                        { id: 5, name: "60g miltu" }
                    ],
                    instructions: [
                        { step_number: 1, instruction_text: "Kausēt šokolādi ar sviestu" },
                        { step_number: 2, instruction_text: "Samaisīt olas ar cukuru" },
                        { step_number: 3, instruction_text: "Apvienot visas sastāvdaļas" },
                        { step_number: 4, instruction_text: "Cept 12 minūtes 200°C" }
                    ],
                    author_id: 2,
                    author_name: "Anna Liepa",
                    average_rating: 4.9,
                    ratings_count: 22,
                    favorites_count: 18,
                    views_count: 234,
                    image_url: "images/recipes/chocolate-fondant.jpg",
                    collections: [2],
                    tags: ["šokolāde", "deserts", "cepes"],
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    is_featured: true
                },
                {
                    id: 3,
                    title: "Avokado salāti",
                    description: "Veganu salāti ar avokado un svaigiem dārzeņiem",
                    category_id: 3,
                    category_name: "Salāti",
                    difficulty: "easy",
                    prep_time: 10,
                    cook_time: 0,
                    portions: 2,
                    ingredients: [
                        { id: 1, name: "2 gardie avokado" },
                        { id: 2, name: "1 tomāts" },
                        { id: 3, name: "1 gurķis" },
                        { id: 4, name: "Svaigi spināti" },
                        { id: 5, name: "Citronu sula" }
                    ],
                    instructions: [
                        { step_number: 1, instruction_text: "Sagriezt visus dārzeņus" },
                        { step_number: 2, instruction_text: "Samaisīt bļodā" },
                        { step_number: 3, instruction_text: "Pārliet ar citronu sulu" }
                    ],
                    author_id: 3,
                    author_name: "Māris Kalniņš",
                    average_rating: 4.6,
                    ratings_count: 8,
                    favorites_count: 6,
                    views_count: 89,
                    image_url: "images/recipes/avocado-salad.jpg",
                    collections: [3],
                    tags: ["veganu", "salāti", "avokado"],
                    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    is_featured: false
                }
            ];
            localStorage.setItem('recipes', JSON.stringify(defaultRecipes));
        }

        // Коллекции рецептов
        if (!localStorage.getItem('collections')) {
            const defaultCollections = [
                {
                    id: 1,
                    title: "Itāļu gardumi",
                    description: "Labākās itāļu virtuves receptes",
                    author_id: 1,
                    author_name: "Jānis Bērziņš",
                    recipe_ids: [1],
                    cover: "images/collections/italian.jpg",
                    is_public: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "Šokolādes brīnumi",
                    description: "Deserti, kas iepriecinās katru saldummīlu",
                    author_id: 2,
                    author_name: "Anna Liepa",
                    recipe_ids: [2],
                    cover: "images/collections/chocolate.jpg",
                    is_public: true,
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    title: "Veganu veselība",
                    description: "Garšīgi un veselīgi veganu ēdieni",
                    author_id: 3,
                    author_name: "Māris Kalniņš",
                    recipe_ids: [3],
                    cover: "images/collections/vegan.jpg",
                    is_public: true,
                    created_at: new Date().toISOString()
                }
            ];
            localStorage.setItem('collections', JSON.stringify(defaultCollections));
        }

        // Подписки
        if (!localStorage.getItem('subscriptions')) {
            const defaultSubscriptions = [
                { id: 1, follower_id: 2, following_id: 1, created_at: new Date().toISOString() },
                { id: 2, follower_id: 3, following_id: 1, created_at: new Date().toISOString() },
                { id: 3, follower_id: 3, following_id: 2, created_at: new Date().toISOString() },
                { id: 4, follower_id: 1, following_id: 2, created_at: new Date().toISOString() }
            ];
            localStorage.setItem('subscriptions', JSON.stringify(defaultSubscriptions));
        }

        // Блог посты
        if (!localStorage.getItem('blogPosts')) {
    const defaultPosts = [
        {
            id: 1,
            title: "Kā izvēlēties labākos ingredientus",
            excerpt: "Padomi par labāko ingredientu izvēli jebkurai receptei",
            content: "<p>Kvalitatīvi ingredienti ir jebkuras gardas receptes pamatā. Šajā rakstā es dalīšos ar padomiem, kā izvēlēties labākos produktus...</p><p>Pirmkārt, vienmēr izvēlieties svaigus, sezonas produktus. Otrkārt, pievērsiet uzmanību izcelsmes vietai...</p>",
            category: "tips",
            author_id: 1,
            author_name: "Jānis Bērziņš",
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "images/blog/ingredients.jpg",
            is_featured: true,
            views: 156,
            likes: 23
        },
        {
            id: 2,
            title: "5 vienkārši deserti 30 minūtēs",
            excerpt: "Ātri un garšīgi deserti, kurus var pagatavot īsā laikā",
            content: "<p>Nevienam nav daudz laika, bet tas nenozīmē, ka jāatsakās no gardiem desertiem...</p>",
            category: "techniques",
            author_id: 2,
            author_name: "Anna Liepa", 
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "images/blog/desserts.jpg",
            is_featured: true,
            views: 89,
            likes: 15
        },
        {
            id: 3,
            title: "Veganu ēdienu gardumrades noslēpumi",
            excerpt: "Kā pagatavot garšīgus veganu ēdienus bez gaumes upura",
            content: "<p>Veganu uzturs var būt ārkārtīgi garšīgs un daudzveidīgs...</p>",
            category: "ingredients", 
            author_id: 3,
            author_name: "Māris Kalniņš",
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "images/blog/vegan.jpg",
            is_featured: false,
            views: 67,
            likes: 8
        }
    ];
    localStorage.setItem('blogPosts', JSON.stringify(defaultPosts));
}

        // Категории
        if (!localStorage.getItem('categories')) {
            const categories = [
                { id: 1, name: "Galvenais ēdiens", icon: "fa-utensils" },
                { id: 2, name: "Deserti", icon: "fa-ice-cream" },
                { id: 3, name: "Salāti", icon: "fa-leaf" },
                { id: 4, name: "Zupas", icon: "fa-bowl-food" }
            ];
            localStorage.setItem('categories', JSON.stringify(categories));
        }
    }

    // 🔄 ОБНОВЛЕННЫЕ МЕТОДЫ АУТЕНТИФИКАЦИИ
    async register(userData) {
        return new Promise((resolve, reject) => {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                // Проверка на существующего пользователя
                const existingUser = users.find(u => u.email === userData.email || u.username === userData.username);
                if (existingUser) {
                    reject(new Error("Lietotājs ar šādu e-pastu vai lietotājvārdu jau eksistē"));
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    ...userData,
                    bio: "",
                    specialization: "Kulinārijas entuziasts",
                    avatar: "images/avatar.jpg",
                    cover: "images/spaghetti.jpg",
                    stats: {
                        recipesCount: 0,
                        subscribersCount: 0,
                        rating: 0,
                        totalViews: 0
                    },
                    achievements: [],
                    subscriptions: [],
                    level: "beginner",
                    joinDate: new Date().toISOString(),
                    isVerified: false
                };
                
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                
                resolve({ 
                    message: "Reģistrācija veiksmīga",
                    user: newUser 
                });
            } catch (error) {
                reject(new Error("Reģistrācijas kļūda"));
            }
        });
    }

    async login(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const user = users.find(u => u.email === credentials.email);
                    
                    if (!user) {
                        reject(new Error("Nepareizs e-pasts vai parole"));
                        return;
                    }
                    
                    this.token = 'demo-token-' + user.id;
                    localStorage.setItem('authToken', this.token);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    resolve({ 
                        token: this.token,
                        user: user
                    });
                } catch (error) {
                    reject(new Error("Pieteikšanās kļūda"));
                }
            }, 500);
        });
    }

    // 👥 НОВЫЕ МЕТОДЫ ДЛЯ ПУБЛИЧНЫХ ПРОФИЛЕЙ
    async getUserProfile(userId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.id === parseInt(userId));
                
                if (user) {
                    // Получаем рецепты пользователя
                    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                    const userRecipes = recipes.filter(r => r.author_id === user.id);
                    
                    // Получаем подписчиков и подписки
                    const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                    const subscribers = subscriptions.filter(s => s.following_id === user.id);
                    const userSubscriptions = subscriptions.filter(s => s.follower_id === user.id);
                    
                    resolve({
                        ...user,
                        recipes: userRecipes,
                        subscribers: subscribers,
                        subscriptions: userSubscriptions
                    });
                } else {
                    reject(new Error("Lietotājs nav atrasts"));
                }
            }, 200);
        });
    }

    async updateUserProfile(userId, profileData) {
        return new Promise((resolve, reject) => {
            try {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userIndex = users.findIndex(u => u.id === parseInt(userId));
                
                if (userIndex > -1) {
                    users[userIndex] = { ...users[userIndex], ...profileData };
                    localStorage.setItem('users', JSON.stringify(users));
                    
                    // Обновляем текущего пользователя
                    const currentUser = this.getCurrentUser();
                    if (currentUser && currentUser.id === parseInt(userId)) {
                        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
                    }
                    
                    resolve({ message: "Profils atjaunināts veiksmīgi" });
                } else {
                    reject(new Error("Lietotājs nav atrasts"));
                }
            } catch (error) {
                reject(new Error("Neizdevās atjaunināt profilu"));
            }
        });
    }

    // 🔔 СИСТЕМА ПОДПИСОК
    async toggleSubscription(followingId) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.getCurrentUser();
                if (!user) {
                    reject(new Error("Lietotajam jabut pierakstitam"));
                    return;
                }

                const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                const existingSubscription = subscriptions.find(s => 
                    s.follower_id === user.id && s.following_id === parseInt(followingId)
                );

                if (existingSubscription) {
                    const updatedSubscriptions = subscriptions.filter(s => s.id !== existingSubscription.id);
                    localStorage.setItem('subscriptions', JSON.stringify(updatedSubscriptions));

                    this.updateSubscribersCount(followingId, -1);
                    const updatedCount = this.getSubscribersCount(followingId);

                    // notify other parts of the app that subscriptions changed
                    try {
                        document.dispatchEvent(new CustomEvent('subscription:updated', {
                            detail: {
                                followingId: parseInt(followingId),
                                isSubscribed: false,
                                subscribersCount: updatedCount
                            }
                        }));
                    } catch (e) {
                        // ignore if environment doesn't support CustomEvent
                    }

                    resolve({ 
                        isSubscribed: false, 
                        message: "Veiksmīgi atrakstījies", 
                        subscribersCount: updatedCount 
                    });
                } else {
                    const newSubscription = {
                        id: Date.now(),
                        follower_id: user.id,
                        following_id: parseInt(followingId),
                        created_at: new Date().toISOString()
                    };

                    subscriptions.push(newSubscription);
                    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

                    this.updateSubscribersCount(followingId, 1);
                    const updatedCount = this.getSubscribersCount(followingId);

                    // notify other parts of the app that subscriptions changed
                    try {
                        document.dispatchEvent(new CustomEvent('subscription:updated', {
                            detail: {
                                followingId: parseInt(followingId),
                                isSubscribed: true,
                                subscribersCount: updatedCount
                            }
                        }));
                    } catch (e) {
                        // ignore if environment doesn't support CustomEvent
                    }

                    resolve({ 
                        isSubscribed: true, 
                        message: "Veiksmīgi pierakstījies", 
                        subscribersCount: updatedCount 
                    });
                }
            } catch (error) {
                reject(new Error("Neizdevas atjauninat abonementu"));
            }
        });
    }

    updateSubscribersCount(userId, change) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === parseInt(userId));
        
        if (userIndex > -1) {
            const stats = users[userIndex].stats || {};
            const current = Number(stats.subscribersCount) || 0;
            stats.subscribersCount = Math.max(0, current + change);
            users[userIndex].stats = stats;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    getSubscribersCount(userId) {
        const targetId = parseInt(userId);
        if (Number.isNaN(targetId)) {
            return 0;
        }
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        return subscriptions.filter(sub => sub.following_id === targetId).length;
    }

    isSubscribed(userId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return false;
        }
        const targetId = parseInt(userId);
        if (Number.isNaN(targetId)) {
            return false;
        }
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        return subscriptions.some(sub => sub.follower_id === currentUser.id && sub.following_id === targetId);
    }

    async getSubscriptions(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                const userSubscriptions = subscriptions.filter(s => s.follower_id === parseInt(userId));
                
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const followingUsers = userSubscriptions.map(sub => 
                    users.find(u => u.id === sub.following_id)
                ).filter(Boolean);
                
                resolve(followingUsers);
            }, 200);
        });
    }

    // Convenience wrapper used by subscriptions.js
    async getFollowing(userId = null) {
        // if userId is not provided, use current user
        const user = this.getCurrentUser();
        if (!user && !userId) return [];
        const targetId = userId ? parseInt(userId) : user.id;
        try {
            return await this.getSubscriptions(targetId);
        } catch (err) {
            return [];
        }
    }

    // Convenience wrapper used by subscriptions.js
    async getFollowers(userId = null) {
        const user = this.getCurrentUser();
        if (!user && !userId) return [];
        const targetId = userId ? parseInt(userId) : user.id;
        try {
            return await this.getSubscribers(targetId);
        } catch (err) {
            return [];
        }
    }

    // Alias for recommendations used by subscriptions.js
    async getUserSuggestions() {
        try {
            return await this.getRecommendedUsers();
        } catch (err) {
            return [];
        }
    }

    async getSubscribers(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                const userSubscribers = subscriptions.filter(s => s.following_id === parseInt(userId));
                
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const subscriberUsers = userSubscribers.map(sub => 
                    users.find(u => u.id === sub.follower_id)
                ).filter(Boolean);
                
                resolve(subscriberUsers);
            }, 200);
        });
    }

    // 📰 ЛЕНТА ПОДПИСОК
    async getSubscriptionFeed() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                if (!user) {
                    resolve([]);
                    return;
                }

                const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                const userSubscriptions = subscriptions.filter(s => s.follower_id === user.id);
                const followingIds = userSubscriptions.map(s => s.following_id);

                const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                const feedRecipes = recipes.filter(r => followingIds.includes(r.author_id))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                resolve(feedRecipes);
            }, 300);
        });
    }

    // 📚 КОЛЛЕКЦИИ РЕЦЕПТОВ
    async getUserCollections(userId = null) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
                    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                    const viewer = this.getCurrentUser();

                    let targetUserId;
                    if (userId !== null && userId !== undefined) {
                        targetUserId = parseInt(userId);
                        if (Number.isNaN(targetUserId)) {
                            resolve([]);
                            return;
                        }
                    } else {
                        if (!viewer) {
                            reject(new Error("Lietotājam jābūt pierakstītam"));
                            return;
                        }
                        targetUserId = viewer.id;
                    }

                    const userCollections = collections.filter(collection => collection.author_id === targetUserId);

                    const enrichedCollections = userCollections.map(collection => {
                        const recipeIds = Array.isArray(collection.recipe_ids) ? collection.recipe_ids : [];
                        const collectionRecipes = recipes.filter(recipe => recipeIds.includes(recipe.id));
                        const previewImages = collectionRecipes
                            .slice(0, 4)
                            .map(recipe => recipe.image_url || 'images/cake.jpg');

                        return {
                            ...collection,
                            recipe_ids: recipeIds,
                            visibility: collection.visibility || 'private',
                            recipesCount: collectionRecipes.length,
                            previewImages,
                            isOwner: viewer ? viewer.id === targetUserId : false
                        };
                    });

                    resolve(enrichedCollections);
                } catch (error) {
                    reject(new Error("Neizdevās ielādēt kolekcijas"));
                }
            }, 200);
        });
    }

    async getCollections(userId = null) {
        return this.getUserCollections(userId);
    }

    async getCollectionById(collectionId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    const id = parseInt(collectionId);
                    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
                    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                    const users = JSON.parse(localStorage.getItem('users') || '[]');
                    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');

                    const collection = collections.find(c => c.id === id);
                    if (!collection) {
                        reject(new Error("Kolekcija nav atrasta"));
                        return;
                    }

                    const recipeIds = Array.isArray(collection.recipe_ids) ? collection.recipe_ids : [];
                    const collectionRecipes = recipes.filter(recipe => recipeIds.includes(recipe.id));
                    const currentUser = this.getCurrentUser();
                    const author = users.find(u => u.id === collection.author_id) || null;

                    const difficultyMap = { easy: 1, medium: 2, hard: 3 };
                    const totalTime = collectionRecipes.reduce((sum, recipe) => {
                        const prep = parseInt(recipe.prep_time) || 0;
                        const cook = parseInt(recipe.cook_time) || 0;
                        return sum + prep + cook;
                    }, 0);
                    const totalPrep = collectionRecipes.reduce((sum, recipe) => sum + (parseInt(recipe.prep_time) || 0), 0);
                    const averageRating = collectionRecipes.length > 0 ?
                        collectionRecipes.reduce((sum, recipe) => sum + (parseFloat(recipe.average_rating) || 0), 0) / collectionRecipes.length : 0;
                    const averageDifficultyValue = collectionRecipes.length > 0 ?
                        collectionRecipes.reduce((sum, recipe) => sum + (difficultyMap[recipe.difficulty] || 2), 0) / collectionRecipes.length : 0;
                    const difficultyLabel = averageDifficultyValue <= 1.5 ? 'easy' : averageDifficultyValue <= 2.2 ? 'medium' : 'hard';

                    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
                    collectionRecipes.forEach(recipe => {
                        const key = recipe.difficulty || 'medium';
                        if (difficultyBreakdown[key] !== undefined) {
                            difficultyBreakdown[key] += 1;
                        }
                    });

                    const tags = new Set();
                    collectionRecipes.forEach(recipe => {
                        (recipe.tags || []).forEach(tag => tags.add(tag));
                    });

                    const relatedCollections = collections
                        .filter(c => c.author_id === collection.author_id && c.id !== id)
                        .slice(0, 3)
                        .map(item => ({
                            id: item.id,
                            name: item.name,
                            cover: item.cover || 'images/collections/default.jpg',
                            recipesCount: item.recipe_ids ? item.recipe_ids.length : 0
                        }));

                    const recipeRatings = ratings.filter(r => recipeIds.includes(r.recipe_id));

                    resolve({
                        ...collection,
                        recipes: collectionRecipes,
                        author,
                        stats: {
                            recipesCount: collectionRecipes.length,
                            totalTime,
                            averagePrepTime: collectionRecipes.length > 0 ? Math.round(totalPrep / collectionRecipes.length) : 0,
                            averageRating: parseFloat(averageRating.toFixed(1)),
                            averageDifficulty: difficultyLabel,
                            difficultyBreakdown,
                            totalRatings: recipeRatings.length,
                            updatedAt: collection.updated_at || collection.created_at
                        },
                        tags: Array.from(tags),
                        relatedCollections,
                        isOwner: currentUser ? currentUser.id === collection.author_id : false
                    });
                } catch (error) {
                    reject(new Error("Neizdevās ielādēt kolekciju"));
                }
            }, 200);
        });
    }

    async createCollection(collectionData) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.getCurrentUser();
                if (!user) {
                    reject(new Error("Lietotājam jābūt pierakstītam"));
                    return;
                }

                const name = (collectionData.name || '').trim();
                if (!name) {
                    reject(new Error("Kolekcijas nosaukums ir obligāts"));
                    return;
                }

                const collections = JSON.parse(localStorage.getItem('collections') || '[]');
                const newCollection = {
                    id: Date.now(),
                    name,
                    description: (collectionData.description || '').trim(),
                    visibility: collectionData.visibility === 'public' ? 'public' : 'private',
                    author_id: user.id,
                    author_name: user.fullName,
                    recipe_ids: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                collections.push(newCollection);
                localStorage.setItem('collections', JSON.stringify(collections));
                
                resolve({ 
                    collectionId: newCollection.id,
                    message: "Kolekcija veiksmīgi izveidota"
                });
                try {
                    document.dispatchEvent(new CustomEvent('collection:created', { detail: { collection: newCollection } }));
                } catch (e) {
                    // ignore in non-browser or if CustomEvent unsupported
                }
            } catch (error) {
                reject(new Error("Neizdevās izveidot kolekciju"));
            }
        });
    }

    async updateCollection(collectionId, updates) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.getCurrentUser();
                if (!user) {
                    reject(new Error("Lietotājam jābūt pierakstītam"));
                    return;
                }

                const collections = JSON.parse(localStorage.getItem('collections') || '[]');
                const index = collections.findIndex(collection => collection.id === parseInt(collectionId));

                if (index === -1) {
                    reject(new Error("Kolekcija nav atrasta"));
                    return;
                }

                if (collections[index].author_id !== user.id) {
                    reject(new Error("Nav tiesību rediģēt šo kolekciju"));
                    return;
                }

                const sanitizedUpdates = { ...updates };
                if (sanitizedUpdates.name !== undefined) {
                    sanitizedUpdates.name = (sanitizedUpdates.name || '').trim();
                }
                if (sanitizedUpdates.description !== undefined) {
                    sanitizedUpdates.description = (sanitizedUpdates.description || '').trim();
                }
                if (sanitizedUpdates.visibility !== undefined) {
                    sanitizedUpdates.visibility = sanitizedUpdates.visibility === 'public' ? 'public' : 'private';
                }

                collections[index] = {
                    ...collections[index],
                    ...sanitizedUpdates,
                    updated_at: new Date().toISOString()
                };

                localStorage.setItem('collections', JSON.stringify(collections));

                resolve({
                    message: "Kolekcija veiksmīgi atjaunināta",
                    collection: collections[index]
                });
                try {
                    document.dispatchEvent(new CustomEvent('collection:updated', { detail: { collection: collections[index] } }));
                } catch (e) {
                    // ignore
                }
            } catch (error) {
                reject(new Error("Neizdevās atjaunināt kolekciju"));
            }
        });
    }

    async deleteCollection(collectionId) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.getCurrentUser();
                if (!user) {
                    reject(new Error("Lietotājam jābūt pierakstītam"));
                    return;
                }

                const collections = JSON.parse(localStorage.getItem('collections') || '[]');
                const index = collections.findIndex(collection => collection.id === parseInt(collectionId));

                if (index === -1) {
                    reject(new Error("Kolekcija nav atrasta"));
                    return;
                }

                if (collections[index].author_id !== user.id) {
                    reject(new Error("Nav tiesību dzēst šo kolekciju"));
                    return;
                }

                collections.splice(index, 1);
                localStorage.setItem('collections', JSON.stringify(collections));

                resolve({ message: "Kolekcija veiksmīgi dzēsta" });
                try {
                    document.dispatchEvent(new CustomEvent('collection:deleted', { detail: { collectionId: parseInt(collectionId) } }));
                } catch (e) {
                    // ignore
                }
            } catch (error) {
                reject(new Error("Neizdevās dzēst kolekciju"));
            }
        });
    }

    async addRecipeToCollection(collectionId, recipeId) {
        return new Promise((resolve, reject) => {
            try {
                const collections = JSON.parse(localStorage.getItem('collections') || '[]');
                const collectionIndex = collections.findIndex(c => c.id === parseInt(collectionId));
                
                if (collectionIndex > -1) {
                    const collection = collections[collectionIndex];
                    const parsedRecipeId = parseInt(recipeId);

                    if (!Array.isArray(collection.recipe_ids)) {
                        collection.recipe_ids = [];
                    }

                    if (!collection.recipe_ids.includes(parsedRecipeId)) {
                        collection.recipe_ids.push(parsedRecipeId);
                        collection.updated_at = new Date().toISOString();
                        localStorage.setItem('collections', JSON.stringify(collections));
                        resolve({ message: "Recepte pievienota kolekcijai" });
                        try {
                            document.dispatchEvent(new CustomEvent('collection:recipe-added', { detail: { collectionId: collection.id, recipeId: parsedRecipeId } }));
                        } catch (e) {
                            // ignore
                        }
                    } else {
                        resolve({ message: "Recepte jau atrodas šajā kolekcijā" });
                    }
                } else {
                    reject(new Error("Kolekcija nav atrasta"));
                }
            } catch (error) {
                reject(new Error("Neizdevās pievienot recepti kolekcijai"));
            }
        });
    }

    async sendMessage(recipientId, subject, text) {
        return new Promise((resolve, reject) => {
            try {
                const sender = this.getCurrentUser();
                if (!sender) {
                    reject(new Error("Lietotājam jābūt pierakstītam"));
                    return;
                }

                const trimmedSubject = (subject || '').trim();
                const trimmedText = (text || '').trim();

                if (!trimmedSubject || !trimmedText) {
                    reject(new Error("Ziņai jābūt ar tēmu un saturu"));
                    return;
                }

                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const recipient = users.find(user => user.id === parseInt(recipientId));

                if (!recipient) {
                    reject(new Error("Adresāts nav atrasts"));
                    return;
                }

                const messages = JSON.parse(localStorage.getItem('messages') || '[]');
                const newMessage = {
                    id: Date.now(),
                    sender_id: sender.id,
                    sender_name: sender.fullName || sender.username,
                    recipient_id: recipient.id,
                    recipient_name: recipient.fullName || recipient.username,
                    subject: trimmedSubject,
                    text: trimmedText,
                    created_at: new Date().toISOString(),
                    status: 'sent'
                };

                messages.push(newMessage);
                localStorage.setItem('messages', JSON.stringify(messages));

                resolve({
                    messageId: newMessage.id,
                    message: "Ziņa veiksmīgi nosūtīta"
                });
            } catch (error) {
                reject(new Error("Neizdevās nosūtīt ziņu"));
            }
        });
    }

    // 🏆 СИСТЕМА ДОСТИЖЕНИЙ (обновленная)
    getAchievementsConfig() {
        return {
            recipes: {
                bronze: { target: 1, title: "Pirmais solis", description: "Publicējiet pirmo recepti", icon: "fa-utensils", color: "bronze", points: 10 },
                silver: { target: 5, title: "Aktīvais autors", description: "Publicējiet 5 receptes", icon: "fa-utensils", color: "silver", points: 25 },
                gold: { target: 15, title: "Šefpavārs", description: "Publicējiet 15 receptes", icon: "fa-utensils", color: "gold", points: 50 },
                platinum: { target: 30, title: "Kulinārijas meistars", description: "Publicējiet 30 receptes", icon: "fa-utensils", color: "platinum", points: 100 }
            },
            ratings: {
                bronze: { target: 10, title: "Populārs autors", description: "Saņemiet 10 vērtējumus", icon: "fa-star", color: "bronze", points: 15 },
                silver: { target: 25, title: "Atzīts kulīnārijs", description: "Saņemiet 25 vērtējumus", icon: "fa-star", color: "silver", points: 35 },
                gold: { target: 50, title: "Platformas zvaigzne", description: "Saņemiet 50 vērtējumus", icon: "fa-star", color: "gold", points: 75 },
                platinum: { target: 100, title: "Garšas ikona", description: "Saņemiet 100 vērtējumus", icon: "fa-star", color: "platinum", points: 150 }
            },
            subscribers: {
                bronze: { target: 10, title: "Augoša popularitāte", description: "Pievelciet 10 sekotājus", icon: "fa-users", color: "bronze", points: 20 },
                silver: { target: 25, title: "Viedokļu līderis", description: "Pievelciet 25 sekotājus", icon: "fa-users", color: "silver", points: 45 },
                gold: { target: 50, title: "Kulinārā slavenība", description: "Pievelciet 50 sekotājus", icon: "fa-users", color: "gold", points: 80 },
                platinum: { target: 100, title: "Superzvaigzne", description: "Pievelciet 100 sekotājus", icon: "fa-users", color: "platinum", points: 150 }
            },
            collections: {
                bronze: { target: 1, title: "Kolekcionārs", description: "Izveidojiet pirmo kolekciju", icon: "fa-folder", color: "bronze", points: 10 },
                silver: { target: 3, title: "Organizators", description: "Izveidojiet 3 kolekcijas", icon: "fa-folder", color: "silver", points: 25 },
                gold: { target: 5, title: "Kurators", description: "Izveidojiet 5 kolekcijas", icon: "fa-folder", color: "gold", points: 50 }
            }
        };
    }

    calculateUserStats(userId) {
        const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
        const collections = JSON.parse(localStorage.getItem('collections') || '[]');
        const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        let targetUserId = parseInt(userId);
        if (Number.isNaN(targetUserId)) {
            const current = this.getCurrentUser();
            if (!current) {
                return {
                    recipes: 0,
                    ratings: 0,
                    subscribers: 0,
                    collections: 0,
                    comments: 0
                };
            }
            targetUserId = current.id;
        }

        const userRecord = users.find(u => u.id === targetUserId);
        const userFullName = userRecord?.fullName;

        const userRecipes = recipes.filter(recipe => recipe.author_id === targetUserId);
        const userRecipeIds = userRecipes.map(r => r.id);

        return {
            recipes: userRecipes.length,
            ratings: ratings.filter(rating => userRecipeIds.includes(rating.recipe_id)).length,
            subscribers: subscriptions.filter(sub => sub.following_id === targetUserId).length,
            collections: collections.filter(collection => collection.author_id === targetUserId).length,
            comments: comments.filter(comment => comment.user_id === targetUserId || (userFullName && comment.full_name === userFullName)).length
        };
    }

    // 📊 ОБНОВЛЕННЫЕ МЕТОДЫ ДЛЯ ТОПА
    async getTopAuthors() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
                const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                
                const authorsWithStats = users.map(user => {
                    const userRecipes = recipes.filter(recipe => recipe.author_id === user.id);
                    const userRecipeIds = userRecipes.map(r => r.id);
                    const userRatings = ratings.filter(rating => userRecipeIds.includes(rating.recipe_id));
                    const userSubscribers = subscriptions.filter(sub => sub.following_id === user.id);
                    
                    const avgRating = userRatings.length > 0 ? 
                        (userRatings.reduce((sum, r) => sum + r.overall_rating, 0) / userRatings.length) : 0;
                    
                    const engagementScore = 
                        (avgRating * 20) + 
                        (userRecipes.length * 5) + 
                        (userSubscribers.length * 3) +
                        (userRatings.length * 2);
                    
                    return {
                        ...user,
                        recipeCount: userRecipes.length,
                        averageRating: avgRating.toFixed(1),
                        totalRatings: userRatings.length,
                        totalSubscribers: userSubscribers.length,
                        engagementScore: engagementScore
                    };
                });
                
                const topAuthors = authorsWithStats
                    .filter(author => author.recipeCount > 0)
                    .sort((a, b) => b.engagementScore - a.engagementScore)
                    .slice(0, 5);
                
                resolve(topAuthors);
            }, 300);
        });
    }

    async getTopRecipes() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const comments = JSON.parse(localStorage.getItem('comments') || '[]');
                
                const recipeStats = recipes.map(recipe => {
                    const recipeRatings = ratings.filter(r => r.recipe_id === recipe.id);
                    const recipeFavorites = favorites.filter(f => f.recipe_id === recipe.id);
                    const recipeComments = comments.filter(c => c.recipe_id === recipe.id);
                    
                    const averageRating = recipeRatings.length > 0 ? 
                        (recipeRatings.reduce((sum, r) => sum + r.overall_rating, 0) / recipeRatings.length) : 0;
                    
                    const popularityScore = 
                        (averageRating * 25) + 
                        (recipeRatings.length * 5) + 
                        (recipeFavorites.length * 3) +
                        (recipeComments.length * 2) +
                        (recipe.views_count || 0 * 0.1);
                    
                    return {
                        ...recipe,
                        averageRating: averageRating.toFixed(1),
                        ratingsCount: recipeRatings.length,
                        favoritesCount: recipeFavorites.length,
                        commentsCount: recipeComments.length,
                        popularityScore: popularityScore
                    };
                });
                
                const topRecipes = recipeStats
                    .filter(recipe => recipe.ratingsCount > 0)
                    .sort((a, b) => b.popularityScore - a.popularityScore)
                    .slice(0, 5);
                
                resolve(topRecipes);
            }, 300);
        });
    }

    // 🔍 ПОИСК И РЕКОМЕНДАЦИИ
    async searchUsers(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const filteredUsers = users.filter(user => 
                    user.fullName.toLowerCase().includes(query.toLowerCase()) ||
                    user.specialization.toLowerCase().includes(query.toLowerCase()) ||
                    user.bio.toLowerCase().includes(query.toLowerCase())
                );
                resolve(filteredUsers);
            }, 200);
        });
    }

    async getRecommendedUsers() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.getCurrentUser();
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
                
                if (!user) {
                    resolve(users.slice(0, 5));
                    return;
                }
                
                const userSubscriptions = subscriptions.filter(s => s.follower_id === user.id);
                const subscribedIds = userSubscriptions.map(s => s.following_id);
                
                const recommendedUsers = users
                    .filter(u => u.id !== user.id && !subscribedIds.includes(u.id))
                    .sort((a, b) => b.stats.subscribersCount - a.stats.subscribersCount)
                    .slice(0, 5);
                
                resolve(recommendedUsers);
            }, 300);
        });
    }

    // 📱 СУЩЕСТВУЮЩИЕ МЕТОДЫ (обновленные)
    async getRecipes(filters = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                
                if (filters.search) {
                    recipes = recipes.filter(recipe => 
                        recipe.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                        recipe.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                        recipe.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
                    );
                }
                
                if (filters.category && filters.category !== 'all') {
                    recipes = recipes.filter(recipe => 
                        recipe.category_id === parseInt(filters.category)
                    );
                }
                
                if (filters.difficulty && filters.difficulty !== 'all') {
                    recipes = recipes.filter(recipe => 
                        recipe.difficulty === filters.difficulty
                    );
                }
                
                if (filters.author) {
                    recipes = recipes.filter(recipe => 
                        recipe.author_id === parseInt(filters.author)
                    );
                }
                
                resolve({ recipes });
            }, 300);
        });
    }

    async createRecipe(recipeData) {
        return new Promise((resolve, reject) => {
            try {
                const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                const user = this.getCurrentUser();
                
                const newRecipe = {
                    id: Date.now(),
                    ...recipeData,
                    author_id: user?.id,
                    author_name: user?.fullName || 'Anonīms lietotājs',
                    created_at: new Date().toISOString(),
                    average_rating: 0,
                    ratings_count: 0,
                    favorites_count: 0,
                    views_count: 0,
                    comments: [],
                    tags: recipeData.tags || [],
                    collections: [],
                    image_url: recipeData.image_url || 'images/cake.jpg'
                };
                
                recipes.push(newRecipe);
                localStorage.setItem('recipes', JSON.stringify(recipes));
                
                // Обновляем статистику пользователя
                this.updateUserRecipeCount(user.id, 1);
                
                resolve({ 
                    recipeId: newRecipe.id,
                    message: "Recepte veiksmīgi pievienota"
                });
            } catch (error) {
                reject(new Error("Neizdevās pievienot recepti"));
            }
        });
    }

    updateUserRecipeCount(userId, change) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === parseInt(userId));
        
        if (userIndex > -1) {
            users[userIndex].stats.recipesCount += change;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    // Остальные существующие методы остаются с небольшими улучшениями...
    async getRecipe(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
                const recipe = recipes.find(r => r.id === parseInt(id));
                
                if (recipe) {
                    // Увеличиваем счетчик просмотров
                    this.incrementRecipeViews(recipe.id);
                    
                    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
                    recipe.comments = comments.filter(c => c.recipe_id === parseInt(id));
                    resolve(recipe);
                } else {
                    reject(new Error("Recepte nav atrasta"));
                }
            }, 200);
        });
    }

    incrementRecipeViews(recipeId) {
        const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
        const recipeIndex = recipes.findIndex(r => r.id === parseInt(recipeId));
        
        if (recipeIndex > -1) {
            recipes[recipeIndex].views_count = (recipes[recipeIndex].views_count || 0) + 1;
            localStorage.setItem('recipes', JSON.stringify(recipes));
        }
    }

    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.token = null;
    }

    isAuthenticated() {
        return !!this.token;
    }

    // Достижения (обновленные методы остаются)
    async checkForNewAchievements() {
        try {
            const newAchievements = this.checkAchievements();
            return newAchievements;
        } catch (error) {
            console.error('Error checking achievements:', error);
            return [];
        }
    }

    checkAchievements() {
        const user = this.getCurrentUser();
        if (!user) return [];

        const stats = this.calculateUserStats(user.id);
        const config = this.getAchievementsConfig();
        const achievements = JSON.parse(localStorage.getItem('userAchievements') || '{}');
        
        const unlocked = [];

        Object.keys(config).forEach(category => {
            Object.keys(config[category]).forEach(level => {
                const achievement = config[category][level];
                const achievementKey = `${category}_${level}`;
                
                if (!achievements[achievementKey]) {
                    const current = stats[category] || 0;
                    const target = achievement.target;
                    
                    if (current >= target) {
                        achievements[achievementKey] = {
                            unlockedAt: new Date().toISOString(),
                            progress: 100
                        };
                        unlocked.push({
                            ...achievement,
                            category,
                            level,
                            current,
                            target
                        });
                    }
                }
            });
        });

        if (unlocked.length > 0) {
            localStorage.setItem('userAchievements', JSON.stringify(achievements));
        }

        return unlocked;
    }

    getUserAchievements() {
        const user = this.getCurrentUser();
        if (!user) return [];

        const stats = this.calculateUserStats(user.id);
        const config = this.getAchievementsConfig();
        const achievementsData = JSON.parse(localStorage.getItem('userAchievements') || '{}');
        
        const allAchievements = [];

        Object.keys(config).forEach(category => {
            Object.keys(config[category]).forEach(level => {
                const achievementConfig = config[category][level];
                const achievementKey = `${category}_${level}`;
                const isUnlocked = !!achievementsData[achievementKey];
                const current = stats[category] || 0;
                const target = achievementConfig.target;
                const progress = Math.min((current / target) * 100, 100);

                allAchievements.push({
                    ...achievementConfig,
                    key: achievementKey,
                    category,
                    level,
                    current,
                    target,
                    progress,
                    isUnlocked,
                    unlockedAt: achievementsData[achievementKey]?.unlockedAt
                });
            });
        });

        const filteredAchievements = this.filterCurrentAchievements(allAchievements);
        
        return filteredAchievements;
    }

    filterCurrentAchievements(allAchievements) {
        const currentAchievements = [];
        const categories = ['recipes', 'ratings', 'subscribers', 'collections'];
        
        categories.forEach(category => {
            const categoryAchievements = allAchievements
                .filter(a => a.category === category)
                .sort((a, b) => a.target - b.target);
            
            const unlockedAchievements = categoryAchievements.filter(a => a.isUnlocked);
            const highestUnlocked = unlockedAchievements.length > 0 ? 
                unlockedAchievements.reduce((highest, current) => 
                    current.target > highest.target ? current : highest
                ) : null;
            
            let nextToUnlock = null;
            if (highestUnlocked) {
                nextToUnlock = categoryAchievements.find(a => 
                    !a.isUnlocked && a.target > highestUnlocked.target
                );
            } else {
                nextToUnlock = categoryAchievements.find(a => !a.isUnlocked);
            }
            
            if (highestUnlocked) {
                currentAchievements.push(highestUnlocked);
            }
            if (nextToUnlock) {
                currentAchievements.push(nextToUnlock);
            }
        });
        
        return currentAchievements.sort((a, b) => b.progress - a.progress);
    }
    // ДОБАВЛЯЕМ В КЛАСС ApiClient после существующих методов:

// Метод для добавления рейтинга
async addRating(recipeId, ratingData) {
    return new Promise((resolve, reject) => {
        try {
            const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
            const user = this.getCurrentUser();
            
            if (!user) {
                reject(new Error("Lietotājam jābūt pierakstītam"));
                return;
            }
            
            // По умолчанию добавляем новую оценку (не перезаписываем предыдущие)
            // Это позволяет "складывать" оценки (увеличивать количество оценок),
            // а средний рейтинг будет пересчитан в updateRecipeRating.
            const newRating = {
                id: Date.now(),
                recipe_id: parseInt(recipeId),
                user_id: user.id,
                overall_rating: parseInt(ratingData.overall),
                taste_rating: parseInt(ratingData.taste || ratingData.overall),
                comment: ratingData.comment || '',
                created_at: new Date().toISOString()
            };

            // Всегда добавляем новую запись — это увеличивает счетчик оценок и суммарно влияет на среднее
            ratings.push(newRating);
            localStorage.setItem('ratings', JSON.stringify(ratings));

            // Обновляем средний рейтинг рецепта
            this.updateRecipeRating(recipeId);

            resolve({ message: "Vērtējums veiksmīgi pievienots" });
            
        } catch (error) {
            reject(new Error("Neizdevās pievienot vērtējumu"));
        }
    });
}

// Метод для добавления комментария
async addComment(recipeId, commentText) {
    return new Promise((resolve, reject) => {
        try {
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            const user = this.getCurrentUser();
            
            if (!user) {
                reject(new Error("Lietotājam jābūt pierakstītam"));
                return;
            }
            
            const newComment = {
                id: Date.now(),
                recipe_id: parseInt(recipeId),
                user_id: user.id,
                full_name: user.fullName || 'Anonīms lietotājs',
                comment_text: commentText,
                created_at: new Date().toISOString(),
                avatar_url: user.avatar || 'images/avatar.jpg'
            };
            
            comments.push(newComment);
            localStorage.setItem('comments', JSON.stringify(comments));
            
            resolve({ message: "Komentārs veiksmīgi pievienots" });
            
        } catch (error) {
            reject(new Error("Neizdevās pievienot komentāru"));
        }
    });
}

// Метод для избранного (уже есть, но проверим)
async toggleFavorite(recipeId) {
    return new Promise((resolve, reject) => {
        try {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const user = this.getCurrentUser();
            
            if (!user) {
                reject(new Error("Lietotājam jābūt pierakstītam"));
                return;
            }
            
            const existingIndex = favorites.findIndex(f => 
                f.recipe_id === parseInt(recipeId) && f.user_id === user.id
            );
            
            if (existingIndex > -1) {
                // Удаляем из избранного
                favorites.splice(existingIndex, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                resolve({ 
                    isFavorited: false, 
                    message: "Noņemts no izlūkiem" 
                });
            } else {
                // Добавляем в избранное
                favorites.push({
                    id: Date.now(),
                    recipe_id: parseInt(recipeId),
                    user_id: user.id,
                    added_at: new Date().toISOString()
                });
                localStorage.setItem('favorites', JSON.stringify(favorites));
                resolve({ 
                    isFavorited: true, 
                    message: "Pievienots izlūkiem" 
                });
            }
        } catch (error) {
            reject(new Error("Neizdevās atjaunināt izlūkus"));
        }
    });
}
// Добавьте этот метод в класс ApiClient после существующих методов
async getUserRecipes(userId = null) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
            let userRecipes;
            
            if (userId) {
                // Получаем рецепты конкретного пользователя
                userRecipes = recipes.filter(recipe => recipe.author_id === parseInt(userId));
            } else {
                // Получаем рецепты текущего пользователя
                const user = this.getCurrentUser();
                if (user) {
                    userRecipes = recipes.filter(recipe => recipe.author_id === user.id);
                } else {
                    userRecipes = [];
                }
            }
            
            resolve(userRecipes);
        }, 200);
    });
}
// Метод для получения рецептов пользователя (уже добавили выше)
// Добавьте также эти вспомогательные методы:

async getUserFavorites() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = this.getCurrentUser();
            if (!user) {
                resolve([]);
                return;
            }
            
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            const userFavorites = favorites.filter(f => f.user_id === user.id);
            
            const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
            const favoriteRecipes = recipes.filter(recipe => 
                userFavorites.some(fav => fav.recipe_id === recipe.id)
            );
            
            resolve(favoriteRecipes);
        }, 200);
    });
}

async getUserComments() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = this.getCurrentUser();
            if (!user) {
                resolve([]);
                return;
            }
            
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            const userComments = comments.filter(comment => 
                comment.user_id === user.id || comment.full_name === user.fullName
            );
            
            resolve(userComments);
        }, 200);
    });
}
// Метод для получения блог постов
async getBlogPosts(filters = {}) {
    return new Promise((resolve) => {
        setTimeout(() => {
            let posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            
            // Фильтрация по категории
            if (filters.category && filters.category !== 'all') {
                posts = posts.filter(post => post.category === filters.category);
            }
            
            // Поиск
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                posts = posts.filter(post => 
                    post.title.toLowerCase().includes(searchTerm) ||
                    post.excerpt.toLowerCase().includes(searchTerm) ||
                    post.content.toLowerCase().includes(searchTerm)
                );
            }
            
            // Сортировка по дате (новые сначала)
            posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            resolve(posts);
        }, 200);
    });
}

// Метод для получения блог поста по ID
async getBlogPost(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            const post = posts.find(p => p.id === parseInt(postId));
            
            if (post) {
                // Увеличиваем счетчик просмотров
                this.incrementBlogPostViews(post.id);
                resolve(post);
            } else {
                reject(new Error("Bloga ieraksts nav atrasts"));
            }
        }, 200);
    });
}

// Метод для увеличения счетчика просмотров блог поста
incrementBlogPostViews(postId) {
    const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
    const postIndex = posts.findIndex(p => p.id === parseInt(postId));
    
    if (postIndex > -1) {
        posts[postIndex].views = (posts[postIndex].views || 0) + 1;
        localStorage.setItem('blogPosts', JSON.stringify(posts));
    }
}

// Метод для создания блог поста
async createBlogPost(postData) {
    return new Promise((resolve, reject) => {
        try {
            const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            const user = this.getCurrentUser();
            
            if (!user) {
                reject(new Error("Lietotājam jābūt pierakstītam"));
                return;
            }
            
            const newPost = {
                id: Date.now(),
                ...postData,
                author_id: user.id,
                author_name: user.fullName,
                created_at: new Date().toISOString(),
                views: 0,
                likes: 0,
                comments: []
            };
            
            posts.push(newPost);
            localStorage.setItem('blogPosts', JSON.stringify(posts));
            
            resolve({ 
                postId: newPost.id,
                message: "Bloga ieraksts veiksmīgi izveidots"
            });
            
        } catch (error) {
            reject(new Error("Neizdevās izveidot bloga ierakstu"));
        }
    });
}

// Метод для получения категорий блога
getBlogCategories() {
    return [
        { id: 'tips', name: 'Padomi un triki', icon: 'fa-lightbulb' },
        { id: 'techniques', name: 'Kulinārijas paņēmieni', icon: 'fa-mortar-pestle' },
        { id: 'ingredients', name: 'Ingredienti', icon: 'fa-carrot' },
        { id: 'stories', name: 'Stāsti', icon: 'fa-book' },
        { id: 'reviews', name: 'Atsauksmes', icon: 'fa-star' }
    ];
}
// Метод для обновления рейтинга рецепта
updateRecipeRating(recipeId) {
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(recipeId));
    if (recipeIndex === -1) return;
    
    const recipeRatings = ratings.filter(r => r.recipe_id === parseInt(recipeId));
    
    if (recipeRatings.length > 0) {
        const averageRating = recipeRatings.reduce((sum, r) => sum + r.overall_rating, 0) / recipeRatings.length;
        recipes[recipeIndex].average_rating = parseFloat(averageRating.toFixed(1));
        recipes[recipeIndex].ratings_count = recipeRatings.length;
    } else {
        recipes[recipeIndex].average_rating = 0;
        recipes[recipeIndex].ratings_count = 0;
    }
    
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Метод для получения рейтинга рецепта от текущего пользователя
getUserRating(recipeId) {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    return ratings.find(r => r.recipe_id === parseInt(recipeId) && r.user_id === user.id);
}

// Метод для проверки, добавлен ли рецепт в избранное
isRecipeFavorited(recipeId) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.some(f => f.recipe_id === parseInt(recipeId) && f.user_id === user.id);
}

// Метод для получения комментариев рецепта
async getRecipeComments(recipeId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            const recipeComments = comments.filter(c => c.recipe_id === parseInt(recipeId))
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            resolve(recipeComments);
        }, 200);
    });
}

// Метод для обновления счетчика избранного
updateRecipeFavoritesCount(recipeId, change) {
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(recipeId));
    
    if (recipeIndex > -1) {
        recipes[recipeIndex].favorites_count = (recipes[recipeIndex].favorites_count || 0) + change;
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }
}
}

// Global API client instance
window.apiClient = new ApiClient();
