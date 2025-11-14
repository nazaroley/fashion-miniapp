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
        },
        {
            id: 3,
            name: "Красное вечернее платье",
            description: "Элегантное вечернее платье для особых случаев. Роскошный атлас.",
            price: 7999,
            oldPrice: 9999,
            category: "dresses",
            images: ["https://placehold.co/400x500/dc2626/ffffff?text=Red+Dress"],
            modelImages: {
                female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
                male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
            },
            sizes: ["XS", "S", "M", "L"],
            colors: ["Красный", "Бордовый"],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            tags: ["вечернее", "атлас", "элегантное"],
            material: "100% атлас",
            care: "Только химчистка",
            fitting: {
                type: "dresses",
                layer: "dress"
            }
        },
        {
            id: 4,
            name: "Черные кожаные кроссовки",
            description: "Стильные кожаные кроссовки для повседневной носки.",
            price: 5999,
            oldPrice: 6999,
            category: "shoes",
            images: ["https://placehold.co/400x500/000000/ffffff?text=Black+Shoes"],
            modelImages: {
                female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
                male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
            },
            sizes: ["38", "39", "40", "41", "42", "43"],
            colors: ["Черный", "Белый", "Коричневый"],
            inStock: true,
            isNew: true,
            isSale: false,
            isHot: true,
            tags: ["кожаные", "повседневные"],
            material: "Натуральная кожа",
            care: "Протирать влажной тканью",
            fitting: {
                type: "shoes",
                layer: "shoes"
            }
        },
        {
            id: 5,
            name: "Зеленая рубашка",
            description: "Классическая рубашка из хлопка.",
            price: 3499,
            oldPrice: 3999,
            category: "tops",
            images: ["https://placehold.co/400x500/00ff00/ffffff?text=Green+Shirt"],
            modelImages: {
                female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
                male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
            },
            sizes: ["S", "M", "L", "XL"],
            colors: ["Зеленый", "Голубой", "Белый"],
            inStock: true,
            isNew: true,
            isSale: false,
            isHot: false,
            tags: ["рубашка", "хлопок"],
            material: "100% хлопок",
            care: "Машинная стирка при 30°C",
            fitting: {
                type: "tops",
                layer: "top"
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

        this.init();
    }

    async init() {
        try {
            console.log('Initializing FashionApp...');
            this.initTelegram();
            await this.loadData();
            this.initUI();
            this.bindEvents();
            this.initImageUpload();
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
            
            this.setTelegramTheme();
        } else {
            console.log('Running in standalone browser');
            this.tg = {
                showAlert: (msg) => alert(msg),
                MainButton: { 
                    setText: () => {}, 
                    onClick: () => {}, 
                    show: () => {},
                    hide: () => {},
                    setParams: () => {}
                },
                initDataUnsafe: { 
                    user: { 
                        id: Math.floor(Math.random() * 1000000000), 
                        first_name: 'Пользователь',
                        last_name: 'Тестовый',
                        username: 'testuser'
                    } 
                },
                sendData: (data) => console.log('Data sent:', data),
                expand: () => console.log('Expanded'),
                enableClosingConfirmation: () => console.log('Closing confirmation enabled'),
                ready: () => console.log('Ready'),
                platform: 'unknown',
                colorScheme: 'light',
                viewportHeight: window.innerHeight,
                viewportStableHeight: window.innerHeight
            };
        }
    }

    setTelegramTheme() {
        if (!this.tg || !this.tg.colorScheme) return;
        
        const isDark = this.tg.colorScheme === 'dark';
        document.body.style.backgroundColor = isDark ? '#1a1a1a' : '#ffffff';
        document.body.style.color = isDark ? '#ffffff' : '#1f2937';
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
                    console.log('Data loaded successfully:', this.state.products.length, 'products');
                    resolve();
                } catch (error) {
                    console.error('Error loading data:', error);
                    // Fallback to base products
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
        this.setupMainButton();
        this.fixViewportHeight();
    }

    fixViewportHeight() {
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', setVH);
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
        const shareOutfit = document.getElementById('shareOutfit');
        
        if (fittingBack) fittingBack.addEventListener('click', () => this.closeFittingRoom());
        if (fittingProceed) fittingProceed.addEventListener('click', () => this.showFittingView());
        if (fittingBackToSelection) fittingBackToSelection.addEventListener('click', () => this.showFittingSelection());
        if (fittingReset) fittingReset.addEventListener('click', () => this.resetFitting());
        if (saveOutfit) saveOutfit.addEventListener('click', () => this.saveOutfit());
        if (shareOutfit) shareOutfit.addEventListener('click', () => this.shareOutfit());

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
        const productForm = document.getElementById('productForm');
        const removeImageBtn = document.getElementById('removeImageBtn');
        const removeModelImageBtn = document.getElementById('removeModelImageBtn');
        
        if (adminBtn) adminBtn.addEventListener('click', () => this.showAdminPanel());
        if (adminBack) adminBack.addEventListener('click', () => this.hideAdminPanel());
        if (productForm) productForm.addEventListener('submit', (e) => this.addNewProduct(e));
        if (removeImageBtn) removeImageBtn.addEventListener('click', () => this.removeImage());
        if (removeModelImageBtn) removeModelImageBtn.addEventListener('click', () => this.removeModelImage());
        
        // Табы админки
        document.querySelectorAll('.admin-tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.dataset.tab);
            });
        });

        // Предотвращение zoom на мобильных устройствах
        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    }

    handleTouchStart(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }

    handleTouchMove(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }

    // Загрузка изображений
    initImageUpload() {
        this.setupImageUpload('productImageFile', 'uploadArea', 'imagePreview', 'previewImage');
        this.setupImageUpload('productModelImageFile', 'uploadModelArea', 'modelImagePreview', 'previewModelImage');
    }

    setupImageUpload(inputId, areaId, previewId, previewImageId) {
        const fileInput = document.getElementById(inputId);
        const uploadArea = document.getElementById(areaId);
        const preview = document.getElementById(previewId);
        const previewImage = document.getElementById(previewImageId);

        if (!fileInput || !uploadArea) return;

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageSelect(files[0], preview, previewImage, uploadArea);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageSelect(e.target.files[0], preview, previewImage, uploadArea);
            }
        });
    }

    handleImageSelect(file, preview, previewImage, uploadArea) {
        if (!file.type.startsWith('image/')) {
            this.showAlert('Пожалуйста, выберите изображение');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            preview.classList.remove('hidden');
            uploadArea.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        document.getElementById('productImageFile').value = '';
        document.getElementById('imagePreview').classList.add('hidden');
        document.getElementById('uploadArea').classList.remove('hidden');
    }

    removeModelImage() {
        document.getElementById('productModelImageFile').value = '';
        document.getElementById('modelImagePreview').classList.add('hidden');
        document.getElementById('uploadModelArea').classList.remove('hidden');
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
                         onerror="this.src='https://placehold.co/400x300/64748b/ffffff?text=Image+Error'">
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
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px; align-items: start;">
                <div>
                    <img src="${product.images[0]}" alt="${product.name}" 
                         style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                </div>
                <div>
                    <h2 style="margin-bottom: 12px; color: var(--text);">${product.name}</h2>
                    <p style="color: var(--text-light); margin-bottom: 20px; line-height: 1.5;">${product.description}</p>
                    
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
                                <span style="padding: 6px 12px; background: var(--surface-light); border-radius: 8px; font-size: 14px;">
                                    ${size}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">Цвета:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.colors.map(color => `
                                <span style="padding: 6px 12px; background: var(--surface-light); border-radius: 8px; font-size: 14px;">
                                    ${color}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="app.addToCart(${product.id}); app.closeModal()" 
                                style="padding: 15px; background: var(--primary); color: white; border: none; border-radius: 12px; 
                                       font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;"
                                onmouseover="this.style.background='var(--primary-dark)'" 
                                onmouseout="this.style.background='var(--primary)'">
                            Добавить в корзину
                        </button>
                        <button onclick="app.openFittingRoom(${product.id})" 
                                style="padding: 15px; background: var(--surface); color: var(--primary); border: 2px solid var(--primary); 
                                       border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;
                                       transition: all 0.2s ease;"
                                onmouseover="this.style.background='var(--primary)'; this.style.color='white'" 
                                onmouseout="this.style.background='var(--surface)'; this.style.color='var(--primary)'">
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
                    <p>Добавьте товары из каталога</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image"
                     onerror="this.src='https://placehold.co/150x150/64748b/ffffff?text=Image+Error'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-options">
                        <span class="cart-item-size">Размер: ${item.size}</span>
                        <span class="cart-item-color">Цвет: ${item.color}</span>
                    </div>
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
        this.showAlert(`👤 Профиль:\nИмя: ${user?.first_name || 'Неизвестно'}\n❤️ Избранных: ${this.state.favorites.length}\n🛒 В корзине: ${this.state.cart.length}`);
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
        
        // Сбрасываем выбранные вещи
        this.state.currentOutfit = {
            tops: null,
            bottoms: null, 
            dresses: null,
            shoes: null
        };
        
        // Если передан товар, добавляем его автоматически
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
        // Проверяем, есть ли выбранные вещи
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        if (!hasItems) {
            this.showAlert('Выберите хотя бы одну вещь для примерки');
            return;
        }

        document.getElementById('fittingSelection').classList.add('hidden');
        document.getElementById('fittingView').classList.remove('hidden');
        
        // Обновляем отображение модели
        this.updateModelView();
        this.renderOutfitItems();
    }

    // Добавление товара в примерку
    addToFitting(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product || !product.fitting) {
            console.error('Product not found:', productId);
            return;
        }

        const category = product.fitting.type;
        
        // Для платьев снимаем верх и низ
        if (category === 'dresses') {
            this.state.currentOutfit.tops = null;
            this.state.currentOutfit.bottoms = null;
        }
        // Если добавляем верх или низ - снимаем платье
        else if (category === 'tops' || category === 'bottoms') {
            this.state.currentOutfit.dresses = null;
        }
        
        // Если товар уже выбран, снимаем его, иначе добавляем
        if (this.state.currentOutfit[category]?.id === product.id) {
            this.state.currentOutfit[category] = null;
        } else {
            this.state.currentOutfit[category] = product;
        }

        this.renderSelectedItems();
        this.updateProceedButton();
        
        // Обновляем отображение товаров в активной вкладке
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.renderFittingProducts(activeTab.dataset.category);
        }
    }

    removeFromFitting(category) {
        this.state.currentOutfit[category] = null;
        this.renderSelectedItems();
        this.updateProceedButton();
        
        // Обновляем отображение товаров в активной вкладке
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.renderFittingProducts(activeTab.dataset.category);
        }
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
                <img src="${product.images[0]}" alt="${product.name}" 
                     onerror="this.src='https://placehold.co/60x60/64748b/ffffff?text=IMG'">
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
                <img src="${product.images[0]}" alt="${product.name}" 
                     onerror="this.src='https://placehold.co/60x60/64748b/ffffff?text=IMG'">
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
        
        if (hasItems) {
            proceedButton.style.opacity = '1';
            proceedButton.style.cursor = 'pointer';
        } else {
            proceedButton.style.opacity = '0.5';
            proceedButton.style.cursor = 'not-allowed';
        }
    }

    // Обновление отображения модели
    updateModelView() {
        const modelBase = document.getElementById('modelBase');
        const clothingLayers = document.getElementById('clothingLayers');
        
        if (!modelBase || !clothingLayers) return;

        // Устанавливаем базовую модель
        modelBase.innerHTML = `
            <img src="${MODEL_BASES[this.state.currentModel]}" alt="${this.state.currentModel === 'female' ? 'Женская модель' : 'Мужская модель'}" 
                 class="model-base-image"
                 onerror="this.src='https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель'">
        `;

        // Очищаем слои одежды
        clothingLayers.innerHTML = '';

        // Добавляем слои одежды в правильном порядке
        const layersOrder = ['dresses', 'tops', 'bottoms', 'shoes'];
        
        layersOrder.forEach(layerType => {
            const product = this.state.currentOutfit[layerType];
            if (product && product.modelImages && product.modelImages[this.state.currentModel]) {
                const layer = document.createElement('div');
                layer.className = `clothing-layer ${layerType}-layer`;
                layer.innerHTML = `
                    <img src="${product.modelImages[this.state.currentModel]}" 
                         alt="${product.name}" 
                         class="clothing-image"
                         onerror="this.src='https://placehold.co/300x500/64748b/ffffff?text=Одежда'">
                `;
                clothingLayers.appendChild(layer);
            }
        });
    }

    // Смена модели
    changeModel(modelType) {
        this.state.currentModel = modelType;
        
        // Обновляем активную кнопку
        document.querySelectorAll('.model-btn[data-model]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.model === modelType);
        });
        
        // Обновляем отображение
        this.updateModelView();
    }

    setActiveFittingTab(category) {
        // Обновляем кнопки табов
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        // Рендерим товары для выбранной категории
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
                    <p>Добавьте товары в эту категорию</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const isSelected = this.state.currentOutfit[product.fitting.type]?.id === product.id;
            return `
                <div class="fitting-product ${isSelected ? 'selected' : ''}" 
                     onclick="app.addToFitting(${product.id})">
                    <img src="${product.images[0]}" alt="${product.name}" 
                         onerror="this.src='https://placehold.co/150x150/64748b/ffffff?text=IMG'">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                </div>
            `;
        }).join('');
    }

    // Сброс примерки
    resetFitting() {
        // Сбрасываем выбранные вещи
        this.state.currentOutfit = {
            tops: null,
            bottoms: null,
            dresses: null,
            shoes: null
        };
        
        this.renderSelectedItems();
        this.renderOutfitItems();
        this.updateProceedButton();
        this.updateModelView();
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
            model: this.state.currentModel,
            createdAt: new Date().toISOString()
        };
        
        savedOutfits.push(newOutfit);
        localStorage.setItem('fashionhub_outfits', JSON.stringify(savedOutfits));
        
        this.showAlert('Образ сохранен!');
    }

    // Поделиться образом
    shareOutfit() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        
        if (!hasItems) {
            this.showAlert('Добавьте товары для создания образа');
            return;
        }

        this.showAlert('Функция "Поделиться" скоро будет доступна!');
    }

    handleFittingTabChange(category) {
        this.setActiveFittingTab(category);
    }

    // Админка
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
        
        const tabContent = document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        const tabButton = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (tabContent) tabContent.classList.add('active');
        if (tabButton) tabButton.classList.add('active');
    }

    loadAdminProducts() {
        const container = document.getElementById('adminProductsList');
        if (!container) return;

        const products = Storage.getProducts();

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-admin">
                    <p>Нет товаров</p>
                    <button class="btn btn-primary" onclick="app.switchAdminTab('add')" style="margin-top: 15px;">
                        Добавить первый товар
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-item">
                <img src="${product.images[0]}" alt="${product.name}" class="admin-product-image"
                     onerror="this.src='https://placehold.co/150x150/64748b/ffffff?text=Image+Error'">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <div class="admin-product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="admin-product-category">${this.getCategoryName(product.category)}</div>
                    <div class="admin-product-badges">
                        ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
                        ${product.isHot ? '<span class="badge hot">HOT</span>' : ''}
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="admin-btn admin-btn-delete" onclick="app.deleteProduct(${product.id})">
                        Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadOrders() {
        const container = document.getElementById('adminOrdersList');
        if (!container) return;

        const orders = Storage.getOrders();

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-admin">
                    <p>Нет заказов</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="admin-product-item">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>Заказ #${order.id}</h4>
                    <span style="padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        Новый
                    </span>
                </div>
                <div style="color: var(--text-light); margin-bottom: 10px;">
                    <div>Сумма: <strong style="color: var(--primary);">${order.total.toLocaleString()} ₽</strong></div>
                    <div>Товаров: ${order.items.length} шт.</div>
                    <div>Дата: ${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }

    addNewProduct(e) {
        e.preventDefault();
        
        const mainImageFile = document.getElementById('productImageFile')?.files[0];
        const modelImageFile = document.getElementById('productModelImageFile')?.files[0];

        if (!mainImageFile) {
            this.showAlert('Пожалуйста, выберите основное изображение товара');
            return;
        }

        // Читаем изображения
        Promise.all([
            this.readFileAsDataURL(mainImageFile),
            modelImageFile ? this.readFileAsDataURL(modelImageFile) : Promise.resolve(null)
        ]).then(([mainImageData, modelImageData]) => {
            const product = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseInt(document.getElementById('productPrice').value),
                oldPrice: document.getElementById('productOldPrice').value ? 
                    parseInt(document.getElementById('productOldPrice').value) : null,
                category: document.getElementById('productCategory').value,
                images: [mainImageData],
                modelImages: modelImageData ? {
                    female: modelImageData,
                    male: modelImageData
                } : {
                    female: "https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель",
                    male: "https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель"
                },
                sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
                colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
                inStock: true,
                isNew: document.getElementById('productIsNew')?.checked || false,
                isSale: document.getElementById('productIsSale')?.checked || false,
                isHot: document.getElementById('productIsHot')?.checked || false,
                fitting: this.getFittingConfig(document.getElementById('productCategory').value)
            };

            const products = Storage.getProducts();
            products.push(product);
            Storage.saveProducts(products);
            
            this.state.products = products;
            this.state.filteredProducts = products;
            this.renderProducts();
            this.showAlert('Товар успешно добавлен!');
            
            // Сбрасываем форму
            e.target.reset();
            this.removeImage();
            this.removeModelImage();
        }).catch(error => {
            this.showAlert('Ошибка при добавлении товара: ' + error.message);
        });
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    getFittingConfig(category) {
        const configs = {
            'tops': { type: 'tops', layer: 'top' },
            'bottoms': { type: 'bottoms', layer: 'bottom' },
            'dresses': { type: 'dresses', layer: 'dress' },
            'shoes': { type: 'shoes', layer: 'shoes' }
        };
        return configs[category] || { type: category, layer: category };
    }

    deleteProduct(productId) {
        if (!confirm('Удалить этот товар?')) return;
        
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

    setupMainButton() {
        if (this.tg && this.tg.MainButton) {
            this.tg.MainButton.setText("🛍️ Открыть каталог");
            this.tg.MainButton.onClick(() => {
                this.showMainApp();
            });
            this.tg.MainButton.show();
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