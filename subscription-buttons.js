// Lightweight global subscription button manager
(function(){
    // Get API client instance
    const api = window.apiClient;
    
    // Update all subscribe buttons for a given user ID
    function updateButtons(userId, isSubscribed, subscribersCount) {
        // Update all buttons targeting this user
        document.querySelectorAll(`.subscribe-btn[data-user-id="${userId}"]`).forEach(btn => {
            btn.classList.toggle('subscribed', isSubscribed);
            btn.textContent = isSubscribed ? 'Atsekot' : 'Sekot';
            btn.setAttribute('aria-pressed', isSubscribed ? 'true' : 'false');
        });

        // Update subscriber count displays
        document.querySelectorAll(`[data-subscribers-for="${userId}"]`).forEach(counter => {
            counter.textContent = subscribersCount;
        });
    }

    // Handle subscription toggle
    async function handleSubscriptionClick(e) {
        const btn = e.target.closest('.subscribe-btn');
        if (!btn) return;
        
        e.preventDefault();
        e.stopPropagation();

        const userId = btn.dataset.userId;
        if (!userId) return;

        if (!api?.isAuthenticated?.()) {
            if (window.mainApp?.showNotification) {
                window.mainApp.showNotification('Lai sekotu lietotājiem, jāpieslēdzas', 'error');
            }
            return;
        }

        try {
            const result = await api.toggleSubscription(userId);
            updateButtons(userId, result.isSubscribed, result.subscribersCount);
            
            if (window.mainApp?.showNotification) {
                window.mainApp.showNotification(result.message, 'success');
            }
        } catch (error) {
            if (window.mainApp?.showNotification) {
                window.mainApp.showNotification(error.message || 'Neizdevās mainīt abonementu', 'error');
            }
        }
    }

    // Listen for clicks globally
    document.addEventListener('click', handleSubscriptionClick);
        
    // Listen for subscription updates from other sources
    document.addEventListener('subscription:updated', (e) => {
        const { followingId, isSubscribed, subscribersCount } = e.detail;
        updateButtons(followingId, isSubscribed, subscribersCount);
    });
})();