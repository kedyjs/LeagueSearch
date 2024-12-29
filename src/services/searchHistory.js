class SearchHistory {
    constructor() {
        // userId -> { searches: [{riotId, timestamp}], lastUpdate }
        this.history = new Map();
        this.MAX_HISTORY = 5; // Her kullanıcı için maksimum kayıt
    }

    addSearch(userId, riotId) {
        if (!this.history.has(userId)) {
            this.history.set(userId, {
                searches: [],
                lastUpdate: Date.now()
            });
        }

        const userHistory = this.history.get(userId);
        
        // Aynı aramayı tekrar etme
        const existingIndex = userHistory.searches.findIndex(s => s.riotId === riotId);
        if (existingIndex !== -1) {
            userHistory.searches.splice(existingIndex, 1);
        }

        // Yeni aramayı başa ekle
        userHistory.searches.unshift({
            riotId,
            timestamp: Date.now()
        });

        // Maksimum kayıt sayısını kontrol et
        if (userHistory.searches.length > this.MAX_HISTORY) {
            userHistory.searches = userHistory.searches.slice(0, this.MAX_HISTORY);
        }

        userHistory.lastUpdate = Date.now();
    }

    getSearches(userId) {
        if (!this.history.has(userId)) {
            return [];
        }
        return this.history.get(userId).searches;
    }

    // 24 saatten eski kayıtları temizle
    cleanup() {
        const DAY_IN_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();

        for (const [userId, data] of this.history.entries()) {
            if (now - data.lastUpdate > DAY_IN_MS) {
                this.history.delete(userId);
            }
        }
    }
}

module.exports = new SearchHistory(); 