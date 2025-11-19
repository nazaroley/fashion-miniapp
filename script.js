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
                female: "https://placehold.co/300x500/8b5cf6/ffffff?text=Футболка+на+модели",
                male: "https://placehold.co/300x500/8b5cf6/ffffff?text=Футболка+на+модели"
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
                female: "https://placehold.co/300x500/06b6d4/ffffff?text=Джинсы+на+модели",
                male: "https://placehold.co/300x500/06b6d4/ffffff?text=Джинсы+на+модели"
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
        },
        {
            id: 3,
            name: "Красное платье Миди",
            description: "Элегантное платье миди длины для особых случаев.",
            price: 5999,
            oldPrice: 6999,
            category: "dresses",
            images: ["https://placehold.co/400x500/dc2626/ffffff?text=Red+Dress"],
            modelImages: {
                female: "https://placehold.co/300x500/ec4899/ffffff?text=Платье+на+модели",
                male: "https://placehold.co/300x500/ec4899/ffffff?text=Платье+на+модели"
            },
            sizes: ["XS", "S", "M", "L"],
            colors: ["Красный", "Черный", "Синий"],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            tags: ["платье", "миди", "вечернее"],
            material: "Полиэстер",
            care: "Химчистка",
            fitting: {
                type: "dresses",
                layer: "dress"
            }
        },
        {
            id: 4,
            name: "Кроссовки Спортивные",
            description: "Удобные спортивные кроссовки для активного образа жизни.",
            price: 3999,
            oldPrice: null,
            category: "shoes",
            images: ["https://placehold.co/400x500/475569/ffffff?text=Sneakers"],
            modelImages: {
                female: "https://placehold.co/300x500/f59e0b/ffffff?text=Кроссовки+на+модели",
                male: "https://placehold.co/300x500/f59e0b/ffffff?text=Кроссовки+на+модели"
            },
            sizes: ["36", "37", "38", "39", "40", "41", "42"],
            colors: ["Белый", "Черный", "Серый"],
            inStock: true,
            isNew: false,
            isSale: false,
            isHot: true,
            tags: ["кроссовки", "спортивные", "повседневные"],
            material: "Текстиль, резина",
            care: "Мыть вручную",
            fitting: {
                type: "shoes",
                layer: "shoes"
            }
        }
    ],
    adminUsers: [447355860]
};

// Базовая модель
const MODEL_BASES = {
    female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
    male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
};

// Простой класс для трансформации одежды
// Простой класс для трансформации одежды
class ClothingTransformer {
    constructor(layerElement, layerType) {
        this.layerElement = layerElement;
        this.layerType = layerType;
        this.scale = 1.0;
        this.translateX = 0;
        this.translateY = 0;
        this.rotation = 0;
        
        this.init();
    }

    init() {
        const image = this.layerElement.querySelector('.clothing-image');
        if (!image) return;

        // Делаем изображение перетаскиваемым
        image.style.cursor = 'grab';
        image.style.touchAction = 'none';
        image.style.userSelect = 'none';
        image.style.pointerEvents = 'auto';
        
        // Создаем простые контролы
        this.createSimpleControls();
        
        // Биндим события
        this.bindEvents();
        
        // Активируем этот слой
        this.activate();
    }

    createSimpleControls() {
        const controls = document.createElement('div');
        controls.className = 'simple-controls';
        controls.innerHTML = `
            <button class="control-btn" data-action="scaleUp">➕</button>
            <button class="control-btn" data-action="scaleDown">➖</button>
            <button class="control-btn" data-action="rotateLeft">↶</button>
            <button class="control-btn" data-action="rotateRight">↷</button>
            <button class="control-btn" data-action="reset">🔄</button>
        `;
        
        this.layerElement.appendChild(controls);

        // Биндим события контролов
        controls.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = btn.dataset.action;
                this[action]();
            });
        });
    }

    bindEvents() {
        const image = this.layerElement.querySelector('.clothing-image');
        if (!image) return;

        let isDragging = false;
        let startX, startY;

        const startDrag = (clientX, clientY) => {
            isDragging = true;
            startX = clientX;
            startY = clientY;
            image.style.cursor = 'grabbing';
            this.activate();
            
            // Предотвращаем скролл страницы
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        };

        const doDrag = (clientX, clientY) => {
            if (!isDragging) return;
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            this.translateX += dx;
            this.translateY += dy;
            
            startX = clientX;
            startY = clientY;
            
            this.applyTransform();
        };

        const endDrag = () => {
            isDragging = false;
            image.style.cursor = 'grab';
            
            // Возвращаем скролл страницы
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };

        // Мышь
        image.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
        });

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            doDrag(e.clientX, e.clientY);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', endDrag);

        // Тач
        image.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                e.stopPropagation();
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        const handleTouchMove = (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            e.preventDefault();
            doDrag(e.touches[0].clientX, e.touches[0].clientY);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', endDrag);

        // Клик для активации
        image.addEventListener('click', (e) => {
            e.stopPropagation();
            this.activate();
        });
    }

    activate() {
        // Поднимаем этот слой
        this.layerElement.style.zIndex = '100';
        
        // Опускаем все остальные
        document.querySelectorAll('.clothing-layer').forEach(layer => {
            if (layer !== this.layerElement) {
                layer.style.zIndex = '10';
            }
        });
        
        // Показываем контролы только у активного
        document.querySelectorAll('.simple-controls').forEach(controls => {
            controls.style.display = 'none';
        });
        
        const myControls = this.layerElement.querySelector('.simple-controls');
        if (myControls) {
            myControls.style.display = 'flex';
        }
    }

    applyTransform() {
        const image = this.layerElement.querySelector('.clothing-image');
        if (!image) return;

        // УВЕЛИЧЕННЫЕ границы перемещения (почти весь экран примерочной)
        const maxMoveX = 120;  // Большая область по горизонтали
        const maxMoveY = 175;  // Большая область по вертикали
        
        this.scale = Math.max(0.3, Math.min(3, this.scale));
        this.translateX = Math.max(-maxMoveX, Math.min(maxMoveX, this.translateX));
        this.translateY = Math.max(-maxMoveY, Math.min(maxMoveY, this.translateY));

        image.style.transform = `
            translate(${this.translateX}px, ${this.translateY}px)
            scale(${this.scale})
            rotate(${this.rotation}deg)
        `;
    }

    scaleUp() {
        this.scale *= 1.2;
        this.applyTransform();
    }

    scaleDown() {
        this.scale /= 1.2;
        this.applyTransform();
    }

    rotateLeft() {
        this.rotation -= 15;
        this.applyTransform();
    }

    rotateRight() {
        this.rotation += 15;
        this.applyTransform();
    }

    reset() {
        this.scale = 1.0;
        this.translateX = 0;
        this.translateY = 0;
        this.rotation = 0;
        this.applyTransform();
    }

    destroy() {
        const controls = this.layerElement.querySelector('.simple-controls');
        if (controls) controls.remove();
    }
}

// Хранилище
const Storage = {
    KEYS: {
        PRODUCTS: 'fashionhub_products',
        ORDERS: 'fashionhub_orders',
        CART: 'fashionhub_cart',
        FAVORITES: 'fashionhub_favorites',
        SETTINGS: 'fashionhub_settings',
        OUTFITS: 'fashionhub_outfits'
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

    getOutfits() {
        try {
            const stored = localStorage.getItem(this.KEYS.OUTFITS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading outfits:', error);
            return [];
        }
    },

    saveOutfits(outfits) {
        try {
            localStorage.setItem(this.KEYS.OUTFITS, JSON.stringify(outfits));
        } catch (error) {
            console.error('Error saving outfits:', error);
        }
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
            currentOutfit: {
                tops: null,
                bottoms: null,
                dresses: null,
                shoes: null
            }
        };

        this.clothingTransformers = {};
        this.init();
    }

    async init() {
        try {
            console.log('Initializing FashionApp...');
            this.initTelegram();
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

    initTelegram() {
        if (window.Telegram?.WebApp) {
            console.log('Running in Telegram Web App');
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.ready();
        } else {
            console.log('Running in standalone browser');
            this.tg = {
                showAlert: (msg) => alert(msg),
                initDataUnsafe: { 
                    user: { 
                        id: Math.floor(Math.random() * 1000000000), 
                        first_name: 'Пользователь'
                    } 
                }
            };
        }
    }

    async loadData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    this.state.products = Storage.getProducts();
                    this.state.filteredProducts = this.state.products;
                    this.state.cart = Storage.getCart();
                    this.state.favorites = Storage.getFavorites();
                    this.updateCategoryCounts();
                    console.log('Data loaded successfully');
                    resolve();
                } catch (error) {
                    console.error('Error loading data:', error);
                    this.state.products = BASE_PRODUCTS.products;
                    this.state.filteredProducts = BASE_PRODUCTS.products;
                    this.state.cart = [];
                    this.state.favorites = [];
                    resolve();
                }
            }, 1000);
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
        const searchBtn = document.getElementById('searchBtn');
        const searchClose = document.getElementById('searchClose');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) searchBtn.addEventListener('click', () => this.toggleSearch());
        if (searchClose) searchClose.addEventListener('click', () => this.toggleSearch());
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

        // Модальное окно
        const modalClose = document.getElementById('modalClose');
        const productModal = document.getElementById('productModal');
        
        if (modalClose) modalClose.addEventListener('click', () => this.closeModal());
        if (productModal) productModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
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
            <div class="product-card fade-in" onclick="app.openProductModal(${product.id})">
                <div class="product-image-container">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image">
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

        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                <div>
                    <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: 12px;">
                </div>
                <div>
                    <h2 style="margin-bottom: 12px;">${product.name}</h2>
                    <p style="color: var(--text-light); margin-bottom: 20px;">${product.description}</p>
                    
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
                                style="padding: 15px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer;">
                            Добавить в корзину
                        </button>
                        <button onclick="app.openFittingRoom(${product.id})" 
                                style="padding: 15px; background: var(--surface); color: var(--primary); border: 2px solid var(--primary); border-radius: 12px; font-size: 16px; cursor: pointer;">
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
        this.showAlert(`👤 Профиль:\nИмя: ${user?.first_name || 'Неизвестно'}`);
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
        
        if (productId) {
            const product = this.state.products.find(p => p.id === productId);
            if (product) {
                this.addToFitting(product.id);
            }
        }
        
        this.renderSelectedItems();
        this.setActiveFittingTab('tops');
        this.updateProceedButton();
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
        this.renderOutfitItems();
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
        this.updateProceedButton();
        
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.renderFittingProducts(activeTab.dataset.category);
        }
    }

    removeFromFitting(category) {
        this.state.currentOutfit[category] = null;
        this.renderSelectedItems();
        this.updateProceedButton();
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

    renderOutfitItems() {
        const container = document.getElementById('outfitItems');
        if (!container) return;

        const outfitItems = Object.entries(this.state.currentOutfit)
            .filter(([_, product]) => product !== null)
            .map(([category, product]) => ({ category, product }));

        if (outfitItems.length === 0) {
            container.innerHTML = '<div class="empty-selection">Нет выбранных вещей</div>';
            return;
        }

        container.innerHTML = outfitItems.map(({ category, product }) => `
            <div class="outfit-item">
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="outfit-item-info">
                    <div class="outfit-item-name">${product.name}</div>
                    <div class="outfit-item-category">${this.getCategoryName(category)}</div>
                </div>
            </div>
        `).join('');
    }

    updateProceedButton() {
        const proceedButton = document.getElementById('fittingProceed');
        if (!proceedButton) return;

        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        proceedButton.disabled = !hasItems;
    }

    // Обновление отображения модели с трансформациями
    updateModelView() {
        const modelBase = document.getElementById('modelBase');
        const clothingLayers = document.getElementById('clothingLayers');
        
        if (!modelBase || !clothingLayers) return;

        // Уничтожаем старые трансформаторы
        Object.values(this.clothingTransformers || {}).forEach(transformer => {
            if (transformer && typeof transformer.destroy === 'function') {
                transformer.destroy();
            }
        });

        const baseImage = MODEL_BASES[this.state.currentModel];
        
        modelBase.innerHTML = `
            <img src="${baseImage}" alt="Модель" class="model-base-image">
        `;

        clothingLayers.innerHTML = '';

        const layersOrder = ['dresses', 'tops', 'bottoms', 'shoes'];
        this.clothingTransformers = {};
        
        layersOrder.forEach(layerType => {
            const product = this.state.currentOutfit[layerType];
            if (product) {
                const layer = document.createElement('div');
                layer.className = `clothing-layer ${layerType}-layer`;
                layer.dataset.layerType = layerType;
                
                const modelImage = product.modelImages?.[this.state.currentModel] || product.images[0];
                
                layer.innerHTML = `
                    <img src="${modelImage}" 
                         alt="${product.name}" 
                         class="clothing-image ${layerType}-image">
                `;
                clothingLayers.appendChild(layer);

                // Создаем трансформатор
                this.clothingTransformers[layerType] = new ClothingTransformer(layer, layerType);
            }
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

        const products = this.state.products.filter(p => 
            p.fitting?.type === category
        );

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
        
        // Уничтожаем все трансформаторы
        Object.values(this.clothingTransformers || {}).forEach(transformer => {
            if (transformer && typeof transformer.destroy === 'function') {
                transformer.destroy();
            }
        });
        
        this.clothingTransformers = {};
        
        this.renderSelectedItems();
        this.renderOutfitItems();
        this.updateProceedButton();
        this.updateModelView();
        
        this.showAlert('Примерка сброшена');
    }

    // Сохранение образа с трансформациями
    saveOutfit() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        
        if (!hasItems) {
            this.showAlert('Добавьте товары для сохранения образа');
            return;
        }

        // Собираем трансформации для всех элементов
        const transformations = {};
        Object.keys(this.clothingTransformers || {}).forEach(layerType => {
            if (this.clothingTransformers[layerType] && this.state.currentOutfit[layerType]) {
                transformations[layerType] = {
                    scale: this.clothingTransformers[layerType].scale,
                    translateX: this.clothingTransformers[layerType].translateX,
                    translateY: this.clothingTransformers[layerType].translateY,
                    rotation: this.clothingTransformers[layerType].rotation
                };
            }
        });

        const savedOutfits = Storage.getOutfits();
        const newOutfit = {
            id: Date.now(),
            outfit: { ...this.state.currentOutfit },
            transformations: transformations,
            model: this.state.currentModel,
            createdAt: new Date().toISOString()
        };
        
        savedOutfits.push(newOutfit);
        Storage.saveOutfits(savedOutfits);
        
        this.showAlert('Образ сохранен!');
    }

    handleFittingTabChange(category) {
        this.setActiveFittingTab(category);
    }

    // Админка
    showAdminPanel() {
        this.showPanel('adminPanel');
    }

    hideAdminPanel() {
        this.hidePanel('adminPanel');
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

    toggleSearch() {
        const search = document.getElementById('searchContainer');
        if (search) {
            search.classList.toggle('hidden');
            if (!search.classList.contains('hidden')) {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.focus();
            } else {
                this.handleSearch('');
            }
        }
    }
}

// Запуск приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing app...');
    app = new FashionApp();
});

// Принудительное скрытие загрузки через 5 секунд
setTimeout(() => {
    const loading = document.getElementById('loading');
    const mainApp = document.getElementById('main-app');
    
    if (loading && !loading.classList.contains('hidden')) {
        loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }
}, 5000);

window.app = app;
