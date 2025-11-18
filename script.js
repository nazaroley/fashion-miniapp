// Базовые данные
const BASE_PRODUCTS = {
    products: [
        {
            id: 1,
            name: "Белая футболка Oversize",
            description: "Стильная футболка oversize из премиального хлопка. Идеальна для повседневной носки.",
            price: 2499,
            oldPrice: 2999,
            category: "tops",
            images: ["https://placehold.co/400x500/ffffff/333333?text=White+T-Shirt"],
            modelImages: {
                female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
                male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
            },
            sizes: ["S", "M", "L", "XL"],
            colors: ["Белый", "Черный", "Серый"],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            tags: ["oversize", "хлопок", "повседневная"],
            material: "100% хлопок",
            care: "Машинная стирка при 30°C",
            fitting: {
                type: "tops",
                layer: "top"
            }
        },
        {
            id: 2,
            name: "Синие джинсы Slim Fit",
            description: "Классические джинсы slim fit с современным кроем. 98% хлопок, 2% эластан.",
            price: 4599,
            oldPrice: null,
            category: "bottoms",
            images: ["https://placehold.co/400x500/1e3a8a/ffffff?text=Blue+Jeans"],
            modelImages: {
                female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
                male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
            },
            sizes: ["28", "30", "32", "34", "36"],
            colors: ["Синий", "Черный", "Светло-синий"],
            inStock: true,
            isNew: false,
            isSale: false,
            isHot: true,
            tags: ["slim fit", "джинсы", "базовые"],
            material: "98% хлопок, 2% эластан",
            care: "Машинная стирка при 30°C",
            fitting: {
                type: "bottoms",
                layer: "bottom"
            }
        }
    ],
    adminUsers: [447355860]
};

// Базовая модель
const MODEL_BASES = {
    female: "female.png",
    male: "male.png"
};

// Хранилище
const Storage = {
    KEYS: {
        PRODUCTS: 'fashionhub_products',
        ORDERS: 'fashionhub_orders',
        CART: 'fashionhub_cart',
        FAVORITES: 'fashionhub_favorites',
        SETTINGS: 'fashionhub_settings'
    },

    getProducts() {
        try {
            const stored = localStorage.getItem(this.KEYS.PRODUCTS);
            return stored ? JSON.parse(stored) : BASE_PRODUCTS.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return BASE_PRODUCTS.products;
        }
    },

    saveProducts(products) {
        try {
            localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
        } catch (error) {
            console.error('Error saving products:', error);
        }
    },

    addProduct(product) {
        const products = this.getProducts();
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        product.id = maxId + 1;
        product.createdAt = new Date().toISOString();
        
        products.push(product);
        this.saveProducts(products);
        return product;
    },

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

    deleteProduct(productId) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== productId);
        this.saveProducts(filtered);
        return filtered;
    },

    getOrders() {
        try {
            const stored = localStorage.getItem(this.KEYS.ORDERS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading orders:', error);
            return [];
        }
    },

    saveOrder(order) {
        const orders = this.getOrders();
        order.id = orders.length + 1;
        order.createdAt = new Date().toISOString();
        order.status = 'new';
        orders.push(order);
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
        return order;
    },

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

    getCart() {
        try {
            const stored = localStorage.getItem(this.KEYS.CART);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    },

    saveCart(cart) {
        try {
            localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    },

    getFavorites() {
        try {
            const stored = localStorage.getItem(this.KEYS.FAVORITES);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    },

    saveFavorites(favorites) {
        try {
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    },

    getSettings() {
        try {
            const stored = localStorage.getItem(this.KEYS.SETTINGS);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
};

// Главное приложение
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
            currentOutfit: {
                tops: null,
                bottoms: null,
                dresses: null,
                shoes: null
            }
        };

        this.clothingTransformations = {
            tops: { scale: 1, x: 0, y: 0 },
            bottoms: { scale: 1, x: 0, y: 0 },
            dresses: { scale: 1, x: 0, y: 0 },
            shoes: { scale: 1, x: 0, y: 0 }
        };
        
        this.currentlyEditing = null;
        this.isEditingMode = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing FashionApp...');
            this.initTelegram();
            await this.checkLocalModels();
            await this.loadData();
            this.initUI();
            this.bindEvents();
            this.hideLoading();
            console.log('FashionApp initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.hideLoading();
        }
    }

    // Проверка доступности локальных моделей
    async checkLocalModels() {
        try {
            const femaleResponse = await fetch('female.png');
            const maleResponse = await fetch('male.png');
            
            if (!femaleResponse.ok) {
                MODEL_BASES.female = 'https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель';
            }
            
            if (!maleResponse.ok) {
                MODEL_BASES.male = 'https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель';
            }
        } catch (error) {
            MODEL_BASES.female = 'https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель';
            MODEL_BASES.male = 'https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель';
        }
    }

    initTelegram() {
        if (window.Telegram?.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.ready();
        } else {
            this.tg = {
                showAlert: (msg) => alert(msg),
                initDataUnsafe: { 
                    user: { 
                        id: 1, 
                        first_name: 'Пользователь'
                    } 
                }
            };
        }
    }

    async loadData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.state.products = Storage.getProducts();
                this.state.filteredProducts = this.state.products;
                this.state.cart = Storage.getCart();
                this.state.favorites = Storage.getFavorites();
                this.updateCategoryCounts();
                resolve();
            }, 500);
        });
    }

    initUI() {
        this.renderProducts();
        this.updateCartBadge();
    }

    bindEvents() {
        // Навигация по категориям
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryChange(e.target.dataset.category);
            });
        });

        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Корзина
        const cartBtn = document.getElementById('cartBtn');
        const cartClose = document.getElementById('cartClose');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (cartBtn) cartBtn.addEventListener('click', () => this.openCart());
        if (cartClose) cartClose.addEventListener('click', () => this.closeCart());
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.checkout());

        // Нижняя навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget.dataset.page);
            });
        });

        // 2D Примерочная
        const fittingBack = document.getElementById('fittingBack');
        const fittingProceed = document.getElementById('fittingProceed');
        const fittingBackToSelection = document.getElementById('fittingBackToSelection');
        const fittingReset = document.getElementById('fittingReset');
        const saveOutfit = document.getElementById('saveOutfit');
        
        if (fittingBack) fittingBack.addEventListener('click', () => this.closeFittingRoom());
        if (fittingProceed) fittingProceed.addEventListener('click', () => this.showFittingView());
        if (fittingBackToSelection) fittingBackToSelection.addEventListener('click', () => this.showFittingSelection());
        if (fittingReset) fittingReset.addEventListener('click', () => this.resetFitting());
        if (saveOutfit) saveOutfit.addEventListener('click', () => this.saveOutfit());

        // Табы в примерочной
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFittingTabChange(e.target.dataset.category);
            });
        });

        // Выбор модели
        document.querySelectorAll('.model-btn[data-model]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeModel(e.target.dataset.model);
            });
        });

        // Админка
        const adminBtn = document.getElementById('adminBtn');
        const adminBack = document.getElementById('adminBack');
        
        if (adminBtn) adminBtn.addEventListener('click', () => this.showAdminPanel());
        if (adminBack) adminBack.addEventListener('click', () => this.hideAdminPanel());
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
            <div class="product-card" onclick="app.openProductModal(${product.id})">
                <div class="product-image-container">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
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

        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                <div>
                    <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: 12px;">
                </div>
                <div>
                    <h2 style="margin-bottom: 12px;">${product.name}</h2>
                    <p style="margin-bottom: 20px;">${product.description}</p>
                    
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <span style="font-size: 24px; font-weight: 700; color: var(--primary);">
                            ${product.price.toLocaleString()} ₽
                        </span>
                        ${product.oldPrice ? `
                            <span style="font-size: 16px; color: var(--text-muted); text-decoration: line-through;">
                                ${product.oldPrice.toLocaleString()} ₽
                            </span>
                        ` : ''}
                    </div>

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">Размеры:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.sizes.map(size => `
                                <span style="padding: 6px 12px; background: var(--surface-light); border-radius: 8px;">
                                    ${size}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="app.addToCart(${product.id}); app.closeModal()" 
                                style="padding: 15px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600;">
                            Добавить в корзину
                        </button>
                        <button onclick="app.openFittingRoom(${product.id})" 
                                style="padding: 15px; background: var(--surface); color: var(--primary); border: 2px solid var(--primary); border-radius: 12px; font-size: 16px; font-weight: 600;">
                            👗 2D Примерка
                        </button>
                    </div>
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
        if (!container) return;

        const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        const cartTotalPrice = document.getElementById('cartTotalPrice');
        if (cartTotalPrice) {
            cartTotalPrice.textContent = total.toLocaleString() + ' ₽';
        }

        if (this.state.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">🛒</div>
                    <h3>Корзина пуста</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-price">${(item.product.price * item.quantity).toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="remove-btn" onclick="app.removeFromCart(${item.id})">🗑️</button>
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
        this.showAlert(`Заказ оформлен! Сумма: ${total.toLocaleString()} ₽`);
    }

    // Поиск и фильтрация
    handleCategoryChange(category) {
        this.state.currentCategory = category;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        if (category === 'all') {
            this.state.filteredProducts = this.state.products;
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
                product.name.toLowerCase().includes(lowerQuery)
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
        }
    }

    toggleFavorite(productId) {
        const index = this.state.favorites.indexOf(productId);
        if (index > -1) {
            this.state.favorites.splice(index, 1);
        } else {
            this.state.favorites.push(productId);
        }
        Storage.saveFavorites(this.state.favorites);
        this.renderProducts();
    }

    // 2D ПРИМЕРОЧНАЯ
    openFittingRoom(productId = null) {
        this.showFittingRoom();
        this.showFittingSelection();
        
        this.state.currentOutfit = {
            tops: null,
            bottoms: null, 
            dresses: null,
            shoes: null
        };
        
        this.clothingTransformations = {
            tops: { scale: 1, x: 0, y: 0 },
            bottoms: { scale: 1, x: 0, y: 0 },
            dresses: { scale: 1, x: 0, y: 0 },
            shoes: { scale: 1, x: 0, y: 0 }
        };
        
        this.isEditingMode = false;
        this.currentlyEditing = null;
        
        if (productId) {
            const product = this.state.products.find(p => p.id === productId);
            if (product) {
                this.addToFitting(product.id);
            }
        }
        
        this.renderSelectedItems();
        this.setActiveFittingTab('tops');
    }

    showFittingSelection() {
        document.getElementById('fittingSelection').classList.remove('hidden');
        document.getElementById('fittingView').classList.add('hidden');
    }

    showFittingView() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        if (!hasItems) {
            this.showAlert('Выберите хотя бы одну вещь для примерки');
            return;
        }

        document.getElementById('fittingSelection').classList.add('hidden');
        document.getElementById('fittingView').classList.remove('hidden');
        
        this.updateModelView();
        this.addEditingControls();
    }

    // Добавление товара в примерку
    addToFitting(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product || !product.fitting) return;

        const category = product.fitting.type;
        
        if (category === 'dresses') {
            this.state.currentOutfit.tops = null;
            this.state.currentOutfit.bottoms = null;
        }
        else if (category === 'tops' || category === 'bottoms') {
            this.state.currentOutfit.dresses = null;
        }
        
        if (this.state.currentOutfit[category]?.id === product.id) {
            this.state.currentOutfit[category] = null;
        } else {
            this.state.currentOutfit[category] = product;
        }

        this.renderSelectedItems();
        
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.renderFittingProducts(activeTab.dataset.category);
        }
    }

    removeFromFitting(category) {
        this.state.currentOutfit[category] = null;
        this.renderSelectedItems();
    }

    renderSelectedItems() {
        const container = document.getElementById('selectedItemsList');
        if (!container) return;

        const selectedItems = Object.entries(this.state.currentOutfit)
            .filter(([_, product]) => product !== null)
            .map(([category, product]) => ({ category, product }));

        if (selectedItems.length === 0) {
            container.innerHTML = '<div class="empty-selection">Выберите вещи для примерки</div>';
            return;
        }

        container.innerHTML = selectedItems.map(({ category, product }) => `
            <div class="selected-item">
                <img src="${product.images[0]}" alt="${product.name}">
                <span>${this.getCategoryName(category)}: ${product.name}</span>
                <button class="remove-item" onclick="app.removeFromFitting('${category}')">✕</button>
            </div>
        `).join('');
    }

    // Обновление отображения модели
    updateModelView() {
        const modelBase = document.getElementById('modelBase');
        const clothingLayers = document.getElementById('clothingLayers');
        
        if (!modelBase || !clothingLayers) return;

        const baseImage = MODEL_BASES[this.state.currentModel];
        
        modelBase.innerHTML = `
            <img src="${baseImage}" alt="Модель" class="model-base-image">
        `;

        clothingLayers.innerHTML = '';

        const layersOrder = ['dresses', 'tops', 'bottoms', 'shoes'];
        
        layersOrder.forEach(layerType => {
            const product = this.state.currentOutfit[layerType];
            if (product) {
                const layer = document.createElement('div');
                layer.className = `clothing-layer ${layerType}-layer`;
                
                const modelImage = product.modelImages?.[this.state.currentModel] || product.images[0];
                
                layer.innerHTML = `
                    <img src="${modelImage}" 
                         alt="${product.name}" 
                         class="clothing-image ${layerType}-image"
                         data-category="${layerType}">
                `;
                clothingLayers.appendChild(layer);
                
                // ПРОСТОЙ обработчик кликов
                const img = layer.querySelector('.clothing-image');
                img.addEventListener('click', () => {
                    if (this.isEditingMode) {
                        this.selectElementForEditing(layerType);
                    }
                });

                // ПРОСТОЙ обработчик перетаскивания
                this.setupSimpleDrag(img, layerType);
                
                this.updateClothingElement(layerType);
            }
        });
    }

    // ПРОСТОЙ обработчик перетаскивания
    setupSimpleDrag(element, category) {
        let isDragging = false;
        let startX, startY;

        element.addEventListener('mousedown', (e) => {
            if (!this.isEditingMode) return;
            e.preventDefault();
            this.selectElementForEditing(category);
            isDragging = true;
            startX = e.clientX - this.clothingTransformations[category].x;
            startY = e.clientY - this.clothingTransformations[category].y;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.isEditingMode) return;
            
            this.clothingTransformations[category].x = e.clientX - startX;
            this.clothingTransformations[category].y = e.clientY - startY;
            
            this.updateClothingElement(category);
            this.updateSliders();
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        element.addEventListener('touchstart', (e) => {
            if (!this.isEditingMode) return;
            e.preventDefault();
            this.selectElementForEditing(category);
            isDragging = true;
            startX = e.touches[0].clientX - this.clothingTransformations[category].x;
            startY = e.touches[0].clientY - this.clothingTransformations[category].y;
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || !this.isEditingMode) return;
            
            this.clothingTransformations[category].x = e.touches[0].clientX - startX;
            this.clothingTransformations[category].y = e.touches[0].clientY - startY;
            
            this.updateClothingElement(category);
            this.updateSliders();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Смена модели
    changeModel(modelType) {
        this.state.currentModel = modelType;
        
        document.querySelectorAll('.model-btn[data-model]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === modelType);
        });
        
        this.updateModelView();
    }

    setActiveFittingTab(category) {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        this.renderFittingProducts(category);
    }

    // Рендеринг товаров в примерочной
    renderFittingProducts(category) {
        const container = document.getElementById('fittingProducts');
        if (!container) return;

        const products = this.state.products.filter(p => p.fitting?.type === category);

        if (products.length === 0) {
            container.innerHTML = `
                <div class="fitting-empty">
                    <div class="empty-icon">👗</div>
                    <h3>Нет товаров для примерки</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const isSelected = this.state.currentOutfit[product.fitting.type]?.id === product.id;
            return `
                <div class="fitting-product ${isSelected ? 'selected' : ''}" 
                     onclick="app.addToFitting(${product.id})">
                    <img src="${product.images[0]}" alt="${product.name}">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                </div>
            `;
        }).join('');
    }

    // Сброс примерки
    resetFitting() {
        this.state.currentOutfit = {
            tops: null,
            bottoms: null,
            dresses: null,
            shoes: null
        };
        
        this.clothingTransformations = {
            tops: { scale: 1, x: 0, y: 0 },
            bottoms: { scale: 1, x: 0, y: 0 },
            dresses: { scale: 1, x: 0, y: 0 },
            shoes: { scale: 1, x: 0, y: 0 }
        };
        
        this.isEditingMode = false;
        this.currentlyEditing = null;
        
        this.renderSelectedItems();
        this.updateModelView();
        this.hideEditingControls();
        
        this.showAlert('Примерка сброшена');
    }

    // Сохранение образа
    saveOutfit() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        
        if (!hasItems) {
            this.showAlert('Добавьте товары для сохранения образа');
            return;
        }

        const savedOutfits = JSON.parse(localStorage.getItem('fashionhub_outfits') || '[]');
        const newOutfit = {
            id: Date.now(),
            outfit: { ...this.state.currentOutfit },
            transformations: { ...this.clothingTransformations },
            model: this.state.currentModel,
            createdAt: new Date().toISOString()
        };
        
        savedOutfits.push(newOutfit);
        localStorage.setItem('fashionhub_outfits', JSON.stringify(savedOutfits));
        
        this.showAlert('Образ сохранен!');
    }

    handleFittingTabChange(category) {
        this.setActiveFittingTab(category);
    }

    // РЕДАКТИРОВАНИЕ ОДЕЖДЫ - ПРОСТОЙ ВАРИАНТ
    addEditingControls() {
        const modelControls = document.querySelector('.model-controls');
        if (!modelControls) return;

        const editButton = document.createElement('button');
        editButton.className = 'model-btn';
        editButton.innerHTML = this.isEditingMode ? '✅ Завершить' : '✏️ Редактировать';
        editButton.onclick = () => this.toggleEditMode();
        
        modelControls.appendChild(editButton);
    }

    toggleEditMode() {
        this.isEditingMode = !this.isEditingMode;
        this.showAlert(this.isEditingMode ? 
            'Режим редактирования: кликайте на одежду и перетаскивайте' : 
            'Режим редактирования выключен');
    }

    selectElementForEditing(category) {
        if (!this.isEditingMode) return;
        
        this.currentlyEditing = category;
        this.showAlert(`Выбран: ${this.getCategoryName(category)}`);
    }

    // Обновляем отображение элемента одежды
    updateClothingElement(category) {
        const layer = document.querySelector(`.${category}-layer`);
        if (!layer) return;

        const transformation = this.clothingTransformations[category];
        const image = layer.querySelector('.clothing-image');
        
        if (image) {
            image.style.transform = `scale(${transformation.scale}) translate(${transformation.x}px, ${transformation.y}px)`;
        }
    }

    // Увеличить
    zoomIn() {
        if (!this.currentlyEditing) return;
        this.clothingTransformations[this.currentlyEditing].scale += 0.2;
        this.updateClothingElement(this.currentlyEditing);
    }

    // Уменьшить
    zoomOut() {
        if (!this.currentlyEditing) return;
        this.clothingTransformations[this.currentlyEditing].scale -= 0.2;
        this.updateClothingElement(this.currentlyEditing);
    }

    // Сброс
    resetTransformation() {
        if (!this.currentlyEditing) return;
        this.clothingTransformations[this.currentlyEditing] = { scale: 1, x: 0, y: 0 };
        this.updateClothingElement(this.currentlyEditing);
        this.showAlert('Трансформации сброшены');
    }

    updateSliders() {
        // Простой метод для обновления слайдеров
    }

    // Утилиты
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

    updateCategoryCounts() {
        // Простой метод
    }

    updateCartBadge() {
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }

    showAlert(message) {
        if (this.tg && this.tg.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    hideEditingControls() {
        // Простой метод
    }

    // Управление видимостью
    hideLoading() {
        const loading = document.getElementById('loading');
        const mainApp = document.getElementById('main-app');
        if (loading) loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }

    showModal() {
        const modal = document.getElementById('productModal');
        if (modal) modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('productModal');
        if (modal) modal.classList.add('hidden');
    }

    openCart() {
        this.renderCartItems();
        const cart = document.getElementById('cartSidebar');
        if (cart) cart.classList.add('active');
    }

    closeCart() {
        const cart = document.getElementById('cartSidebar');
        if (cart) cart.classList.remove('active');
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
        const mainApp = document.getElementById('main-app');
        const panel = document.getElementById(panelId);
        if (mainApp) mainApp.classList.add('hidden');
        if (panel) panel.classList.remove('hidden');
    }

    hidePanel(panelId) {
        const panel = document.getElementById(panelId);
        const mainApp = document.getElementById('main-app');
        if (panel) panel.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }

    showAdminPanel() {
        this.showPanel('adminPanel');
    }

    hideAdminPanel() {
        this.hidePanel('adminPanel');
    }
}

// Запуск приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app...');
    app = new FashionApp();
});

// Принудительное скрытие загрузки через 5 секунд на случай ошибки
setTimeout(() => {
    const loading = document.getElementById('loading');
    const mainApp = document.getElementById('main-app');
    
    if (loading && !loading.classList.contains('hidden')) {
        console.log('Forcing loading screen hide after timeout');
        loading.classList.add('hidden');
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
    }
}, 5000);

window.app = app;
