// Базовые данные
const BASE_PRODUCTS = {
    products: [
        {
            id: 1,
            name: "Белая футболка Oversize",
            description: "Стильная футболка oversize из премиального хлопка",
            price: 2499,
            oldPrice: 2999,
            category: "tops",
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
            modelImages: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300"],
            sizes: ["S", "M", "L", "XL"],
            colors: ["Белый", "Черный"],
            inStock: true,
            isNew: true,
            isSale: true,
            fitting: { type: "tops", layer: "top-layer" }
        },
        {
            id: 2,
            name: "Синие джинсы Slim Fit",
            description: "Классические джинсы slim fit с современным кроем",
            price: 4599,
            oldPrice: null,
            category: "bottoms",
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
            modelImages: ["https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300"],
            sizes: ["28", "30", "32", "34"],
            colors: ["Синий", "Черный"],
            inStock: true,
            isNew: false,
            isSale: false,
            fitting: { type: "bottoms", layer: "bottom-layer" }
        }
    ],
    adminUsers: [447355860]
};

// Хранилище
const Storage = {
    KEYS: {
        PRODUCTS: 'fashionhub_products',
        CART: 'fashionhub_cart',
        FAVORITES: 'fashionhub_favorites',
        ORDERS: 'fashionhub_orders'
    },

    getProducts() {
        const stored = localStorage.getItem(this.KEYS.PRODUCTS);
        return stored ? JSON.parse(stored) : BASE_PRODUCTS.products;
    },

    saveProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    },

    getCart() {
        const stored = localStorage.getItem(this.KEYS.CART);
        return stored ? JSON.parse(stored) : [];
    },

    saveCart(cart) {
        localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
    },

    getFavorites() {
        const stored = localStorage.getItem(this.KEYS.FAVORITES);
        return stored ? JSON.parse(stored) : [];
    },

    saveFavorites(favorites) {
        localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
    },

    getOrders() {
        const stored = localStorage.getItem(this.KEYS.ORDERS);
        return stored ? JSON.parse(stored) : [];
    },

    saveOrder(order) {
        const orders = this.getOrders();
        order.id = orders.length + 1;
        order.createdAt = new Date().toISOString();
        orders.push(order);
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
    }
};

// Главное приложение
class FashionApp {
    constructor() {
        this.state = {
            products: [],
            filteredProducts: [],
            cart: [],
            favorites: [],
            currentCategory: 'all',
            searchQuery: '',
            currentModel: 'female',
            currentOutfit: { top: null, bottom: null, dress: null, shoes: null }
        };
        
        this.init();
    }

    init() {
        this.initTelegram();
        this.loadData();
        this.initUI();
        this.bindEvents();
        this.hideLoading();
    }

    initTelegram() {
        if (window.Telegram?.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.ready();
        } else {
            this.tg = {
                showAlert: (msg) => alert(msg),
                MainButton: { setText: () => {}, onClick: () => {}, show: () => {} },
                initDataUnsafe: { user: { id: 123456789, first_name: 'Test' } },
                sendData: () => {}
            };
        }
    }

    loadData() {
        this.state.products = Storage.getProducts();
        this.state.filteredProducts = this.state.products;
        this.state.cart = Storage.getCart();
        this.state.favorites = Storage.getFavorites();
        this.updateCategoryCounts();
    }

    initUI() {
        this.renderProducts();
        this.updateCartBadge();
    }

    bindEvents() {
        // Категории
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryChange(e.target.dataset.category);
            });
        });

        // Поиск
        document.getElementById('searchBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchClose').addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Корзина
        document.getElementById('cartBtn').addEventListener('click', () => this.openCart());
        document.getElementById('cartClose').addEventListener('click', () => this.closeCart());
        document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());

        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget.dataset.page);
            });
        });

        // Модальное окно
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Примерочная
        document.getElementById('fittingBack').addEventListener('click', () => this.closeFittingRoom());
        document.getElementById('fittingReset').addEventListener('click', () => this.resetFitting());
        document.getElementById('changeModel').addEventListener('click', () => this.changeModel());
        document.getElementById('saveOutfit').addEventListener('click', () => this.saveOutfit());

        // Табы примерочной
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFittingTabChange(e.target.dataset.category);
            });
        });

        // Админка
        document.getElementById('adminBtn').addEventListener('click', () => this.showAdminPanel());
        document.getElementById('adminBack').addEventListener('click', () => this.hideAdminPanel());
        document.getElementById('productForm').addEventListener('submit', (e) => this.addNewProduct(e));
        
        // Табы админки
        document.querySelectorAll('.admin-tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.dataset.tab);
            });
        });

        this.checkAdminAccess();
    }

    // Рендер товаров
    renderProducts() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!grid || !emptyState) return;

    if (this.state.filteredProducts.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = this.state.filteredProducts.map(product => `
        <div class="product-card fade-in" onclick="app.openProductModal(${product.id})">
            <div class="product-image-container">
                <img src="${product.images[0]}" alt="${product.name}" class="product-image" 
                     onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=400&h=300&fit=crop'">
                <div class="product-badges">
                    ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                    ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
                    ${product.isHot ? '<span class="badge hot">HOT</span>' : ''}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">${product.price.toLocaleString()} ₽</span>
                    ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="action-btn btn-primary" onclick="event.stopPropagation(); app.addToCart(${product.id})">
                        🛒 В корзину
                    </button>
                    <button class="action-btn btn-secondary" onclick="event.stopPropagation(); app.toggleFavorite(${product.id})">
                        ${this.state.favorites.includes(product.id) ? '💔' : '❤️'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

    // Модальное окно товара
    openProductModal(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('modalBody').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: 10px;">
                </div>
                <div>
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>
                    <div style="font-size: 24px; font-weight: bold; color: #667eea; margin: 15px 0;">
                        ${product.price} ₽
                    </div>
                    <div style="margin: 20px 0;">
                        <strong>Размеры:</strong> ${product.sizes.join(', ')}
                    </div>
                    <div style="margin: 20px 0;">
                        <strong>Цвета:</strong> ${product.colors.join(', ')}
                    </div>
                    <button onclick="app.addToCart(${product.id}); app.closeModal()" 
                            style="width: 100%; padding: 15px; background: #667eea; color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer;">
                        Добавить в корзину
                    </button>
                    ${product.modelImages ? `
                        <button onclick="app.openFittingRoom(${product.id})" 
                                style="width: 100%; padding: 15px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 10px; font-size: 16px; cursor: pointer; margin-top: 10px;">
                            👗 Примерка
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        this.showModal();
    }

    // Корзина
    addToCart(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        const cartItem = {
            id: Date.now(),
            product: product,
            size: product.sizes[0],
            color: product.colors[0],
            quantity: 1
        };

        this.state.cart.push(cartItem);
        Storage.saveCart(this.state.cart);
        this.updateCartBadge();
        this.showAlert('Товар добавлен в корзину!');
    }

    removeFromCart(itemId) {
        this.state.cart = this.state.cart.filter(item => item.id !== itemId);
        Storage.saveCart(this.state.cart);
        this.updateCartBadge();
        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        document.getElementById('cartTotalPrice').textContent = total + ' ₽';

        if (this.state.cart.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Корзина пуста</div>';
            return;
        }

        container.innerHTML = this.state.cart.map(item => `
            <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #eee;">
                <img src="${item.product.images[0]}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="margin-bottom: 5px;">${item.product.name}</h4>
                    <div style="color: #666; font-size: 14px; margin-bottom: 5px;">
                        ${item.size}, ${item.color}
                    </div>
                    <div style="font-weight: bold; color: #667eea;">${item.product.price} ₽</div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="app.removeFromCart(${item.id})" style="background: none; border: none; font-size: 18px; cursor: pointer;">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    checkout() {
        if (this.state.cart.length === 0) {
            this.showAlert('Корзина пуста');
            return;
        }

        const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const order = {
            items: this.state.cart,
            total: total,
            user: this.tg.initDataUnsafe.user,
            createdAt: new Date().toISOString()
        };

        Storage.saveOrder(order);
        this.state.cart = [];
        Storage.saveCart(this.state.cart);
        this.updateCartBadge();
        this.closeCart();
        this.showAlert('Заказ оформлен! Сумма: ' + total + ' ₽');
    }

    // Поиск и фильтрация
    handleCategoryChange(category) {
        this.state.currentCategory = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        if (category === 'all') {
            this.state.filteredProducts = this.state.products;
        } else if (category === 'new') {
            this.state.filteredProducts = this.state.products.filter(p => p.isNew);
        } else {
            this.state.filteredProducts = this.state.products.filter(p => p.category === category);
        }

        this.renderProducts();
    }

    handleSearch(query) {
        this.state.searchQuery = query;
        
        if (query.trim() === '') {
            this.handleCategoryChange(this.state.currentCategory);
        } else {
            const lowerQuery = query.toLowerCase();
            this.state.filteredProducts = this.state.products.filter(product => 
                product.name.toLowerCase().includes(lowerQuery) ||
                product.description.toLowerCase().includes(lowerQuery)
            );
        }
        
        this.renderProducts();
    }

    // Навигация
    handleNavigation(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        if (page === 'catalog') {
            this.showMainApp();
        } else if (page === 'fitting') {
            this.openFittingRoom();
        } else if (page === 'favorites') {
            this.showFavorites();
        } else if (page === 'profile') {
            this.showProfile();
        }
    }

    showFavorites() {
        const favorites = this.state.products.filter(p => this.state.favorites.includes(p.id));
        if (favorites.length === 0) {
            this.showAlert('Нет избранных товаров');
            return;
        }
        this.state.filteredProducts = favorites;
        this.renderProducts();
    }

    showProfile() {
        const user = this.tg.initDataUnsafe.user;
        this.showAlert(`Профиль:\nИмя: ${user?.first_name || 'Неизвестно'}\nИзбранных: ${this.state.favorites.length}\nВ корзине: ${this.state.cart.length}`);
    }

    toggleFavorite(productId) {
        const index = this.state.favorites.indexOf(productId);
        if (index > -1) {
            this.state.favorites.splice(index, 1);
            this.showAlert('Удалено из избранного');
        } else {
            this.state.favorites.push(productId);
            this.showAlert('Добавлено в избранное');
        }
        Storage.saveFavorites(this.state.favorites);
        this.renderProducts();
    }

    // Примерочная
    openFittingRoom(productId = null) {
        if (productId) {
            const product = this.state.products.find(p => p.id === productId);
            this.tryOnProduct(product);
        }
        this.showFittingRoom();
        this.renderFittingProducts('tops');
    }

    renderFittingProducts(category) {
        const products = this.state.products.filter(p => p.fitting?.type === category && p.modelImages);
        const container = document.getElementById('fittingProducts');

        container.innerHTML = products.map(product => `
            <div class="fitting-product ${this.state.currentOutfit[category]?.id === product.id ? 'active' : ''}" 
                 onclick="app.tryOnProduct(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}">
                <div>${product.name}</div>
                <div>${product.price} ₽</div>
            </div>
        `).join('');
    }

    tryOnProduct(product) {
        if (!product?.fitting) return;

        const layer = document.getElementById(product.fitting.layer);
        if (layer && product.modelImages) {
            layer.style.backgroundImage = `url('${product.modelImages[0]}')`;
        }

        this.state.currentOutfit[product.fitting.type] = product;
        this.renderFittingProducts(product.fitting.type);
    }

    resetFitting() {
        ['top-layer', 'bottom-layer', 'dress-layer', 'shoes-layer'].forEach(layerId => {
            const layer = document.getElementById(layerId);
            if (layer) layer.style.backgroundImage = '';
        });
        this.state.currentOutfit = { top: null, bottom: null, dress: null, shoes: null };
        this.renderFittingProducts('tops');
    }

    changeModel() {
        this.state.currentModel = this.state.currentModel === 'female' ? 'male' : 'female';
        const baseImage = this.state.currentModel === 'female' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
        document.getElementById('modelBase').src = baseImage;
        this.resetFitting();
    }

    saveOutfit() {
        this.showAlert('Образ сохранен!');
    }

    // Админка
    checkAdminAccess() {
        const userId = this.tg.initDataUnsafe.user?.id;
        if (userId && BASE_PRODUCTS.adminUsers.includes(userId)) {
            document.getElementById('adminBtn').classList.remove('hidden');
        }
    }

    showAdminPanel() {
        this.showPanel('adminPanel');
        this.loadAdminProducts();
        this.loadOrders();
    }

    hideAdminPanel() {
        this.hidePanel('adminPanel');
    }

    switchAdminTab(tabName) {
        document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    loadAdminProducts() {
        const container = document.getElementById('adminProductsList');
        const products = Storage.getProducts();

        container.innerHTML = products.map(product => `
            <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 10px; margin-bottom: 10px;">
                <img src="${product.images[0]}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4>${product.name}</h4>
                    <div>${product.price} ₽</div>
                </div>
                <button onclick="app.deleteProduct(${product.id})" style="background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;">Удалить</button>
            </div>
        `).join('');
    }

    loadOrders() {
        const container = document.getElementById('adminOrdersList');
        const orders = Storage.getOrders();

        container.innerHTML = orders.map(order => `
            <div style="padding: 15px; background: white; border-radius: 10px; margin-bottom: 10px;">
                <h4>Заказ #${order.id}</h4>
                <div>Сумма: ${order.total} ₽</div>
                <div>Товаров: ${order.items.length}</div>
                <div>Дата: ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    addNewProduct(e) {
        e.preventDefault();
        
        const product = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseInt(document.getElementById('productPrice').value),
            oldPrice: document.getElementById('productOldPrice').value ? parseInt(document.getElementById('productOldPrice').value) : null,
            category: document.getElementById('productCategory').value,
            images: [document.getElementById('productImage').value],
            sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
            colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
            inStock: true,
            isNew: true,
            fitting: { 
                type: document.getElementById('productCategory').value,
                layer: document.getElementById('productCategory').value + '-layer' 
            }
        };

        const products = Storage.getProducts();
        products.push(product);
        Storage.saveProducts(products);
        
        this.state.products = products;
        this.state.filteredProducts = products;
        this.renderProducts();
        this.showAlert('Товар добавлен!');
        e.target.reset();
    }

    deleteProduct(productId) {
        if (!confirm('Удалить товар?')) return;
        
        const products = Storage.getProducts().filter(p => p.id !== productId);
        Storage.saveProducts(products);
        
        this.state.products = products;
        this.state.filteredProducts = products;
        this.renderProducts();
        this.loadAdminProducts();
        this.showAlert('Товар удален');
    }

    // Утилиты
    updateCategoryCounts() {
        const categories = {
            'all': this.state.products.length,
            'new': this.state.products.filter(p => p.isNew).length,
            'tops': this.state.products.filter(p => p.category === 'tops').length,
            'bottoms': this.state.products.filter(p => p.category === 'bottoms').length,
            'dresses': this.state.products.filter(p => p.category === 'dresses').length,
            'shoes': this.state.products.filter(p => p.category === 'shoes').length
        };

        document.querySelectorAll('.category-btn').forEach(btn => {
            const category = btn.dataset.category;
            const count = categories[category] || 0;
            btn.textContent = `${this.getCategoryName(category)} (${count})`;
        });
    }

    getCategoryName(category) {
        const names = {
            'all': 'Все товары',
            'new': 'Новинки',
            'tops': 'Футболки',
            'bottoms': 'Штаны',
            'dresses': 'Платья',
            'shoes': 'Обувь'
        };
        return names[category] || category;
    }

    updateCartBadge() {
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cartBadge');
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    showAlert(message) {
        this.tg.showAlert(message);
    }

    // Управление видимостью
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    showModal() {
        document.getElementById('productModal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('productModal').classList.add('hidden');
    }

    openCart() {
        this.renderCartItems();
        document.getElementById('cartSidebar').classList.add('active');
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
    }

    showFittingRoom() {
        this.showPanel('fittingRoom');
    }

    closeFittingRoom() {
        this.hidePanel('fittingRoom');
    }

    showMainApp() {
        this.hidePanel('fittingRoom');
        this.hidePanel('adminPanel');
    }

    showPanel(panelId) {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById(panelId).classList.remove('hidden');
    }

    hidePanel(panelId) {
        document.getElementById(panelId).classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    toggleSearch() {
        const search = document.getElementById('searchContainer');
        search.classList.toggle('hidden');
        if (!search.classList.contains('hidden')) {
            document.getElementById('searchInput').focus();
        } else {
            this.handleSearch('');
        }
    }

    handleFittingTabChange(category) {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        this.renderFittingProducts(category);
    }
}

// Запуск приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FashionApp();
});
