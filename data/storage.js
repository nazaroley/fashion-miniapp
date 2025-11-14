// Работа с localStorage
const Storage = {
    // Ключи для хранения данных
    KEYS: {
        PRODUCTS: 'fashionhub_products',
        ORDERS: 'fashionhub_orders',
        CART: 'fashionhub_cart',
        FAVORITES: 'fashionhub_favorites',
        SETTINGS: 'fashionhub_settings'
    },

    // Получить все товары (из localStorage + базовые)
    getProducts() {
        const stored = localStorage.getItem(this.KEYS.PRODUCTS);
        if (stored) {
            return JSON.parse(stored);
        }
        // Если нет в хранилище, возвращаем базовые товары
        return BASE_PRODUCTS.products;
    },

    // Сохранить товары
    saveProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },

    // Добавить новый товар
    addProduct(product) {
        const products = this.getProducts();
        // Генерируем ID (макс ID + 1)
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        product.id = maxId + 1;
        product.createdAt = new Date().toISOString();
        
        products.push(product);
        this.saveProducts(products);
        return product;
    },

    // Обновить товар
    updateProduct(productId, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates };
            this.saveProducts(products);
            return true;
        }
        return false;
    },

    // Удалить товар
    deleteProduct(productId) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== productId);
        this.saveProducts(filtered);
        return filtered;
    },

    // Получить заказы
    getOrders() {
        const stored = localStorage.getItem(this.KEYS.ORDERS);
        return stored ? JSON.parse(stored) : [];
    },

    // Сохранить заказ
    saveOrder(order) {
        const orders = this.getOrders();
        order.id = orders.length + 1;
        order.createdAt = new Date().toISOString();
        order.status = 'new';
        orders.push(order);
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
        return order;
    },

    // Обновить статус заказа
    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
            return true;
        }
        return false;
    },

    // Корзина
    getCart() {
        const stored = localStorage.getItem(this.KEYS.CART);
        return stored ? JSON.parse(stored) : [];
    },

    saveCart(cart) {
        localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
    },

    // Избранное
    getFavorites() {
        const stored = localStorage.getItem(this.KEYS.FAVORITES);
        return stored ? JSON.parse(stored) : [];
    },

    saveFavorites(favorites) {
        localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
    },

    // Настройки
    getSettings() {
        const stored = localStorage.getItem(this.KEYS.SETTINGS);
        return stored ? JSON.parse(stored) : {};
    },

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    }
};
