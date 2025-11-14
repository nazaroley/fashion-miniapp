// Главный файл приложения
console.log('🚀 FashionApp loading...');

class FashionApp {
    constructor() {
        console.log('🎯 FashionApp constructor');
        this.state = {
            products: [],
            filteredProducts: [],
            cart: [],
            favorites: [],
            currentCategory: 'all',
            searchQuery: '',
            currentModel: 'female',
            currentOutfit: {
                top: null,
                bottom: null,
                dress: null,
                shoes: null
            },
            isLoading: false
        };

        this.init();
    }

    async init() {
        console.log('🔧 FashionApp init started');
        
        try {
            // Инициализация Telegram Web App
            if (window.Telegram && window.Telegram.WebApp) {
                this.tg = window.Telegram.WebApp;
                this.tg.expand();
                this.tg.enableClosingConfirmation();
                this.tg.ready();
                console.log('✅ Telegram WebApp initialized');
            } else {
                console.warn('⚠️ Telegram WebApp not available');
                this.tg = {
                    showAlert: (msg) => alert(msg),
                    MainButton: {
                        setText: () => {},
                        onClick: () => {},
                        show: () => {},
                        hide: () => {}
                    },
                    initDataUnsafe: { user: null },
                    sendData: () => {}
                };
            }

            // Отложенная инициализация админ-панели
            setTimeout(() => {
                if (typeof AdminPanel !== 'undefined') {
                    this.admin = new AdminPanel(this);
                    console.log('✅ AdminPanel initialized');
                } else {
                    console.warn('⚠️ AdminPanel not available');
                }
            }, 100);
            
            // Загрузка данных
            await this.loadData();
            
            // Инициализация интерфейса
            this.initUI();
            this.bindEvents();
            
            // Скрываем загрузку
            this.hideLoading();
            console.log('✅ FashionApp initialized successfully');
            
        } catch (error) {
            console.error('❌ FashionApp init failed:', error);
            this.showError('Ошибка инициализации приложения');
        }
    }

    async loadData() {
        console.log('📥 Loading data...');
        
        if (this.state.isLoading) {
            console.log('⏳ Data loading already in progress');
            return;
        }
        
        this.state.isLoading = true;
        
        try {
            // Добавляем небольшую задержку для стабильности
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Загрузка данных из localStorage
            this.state.products = Storage.getProducts();
            console.log('📦 Products loaded:', this.state.products.length);
            
            this.state.filteredProducts = this.state.products;
            this.state.cart = Storage.getCart();
            this.state.favorites = Storage.getFavorites();
            
            this.updateCategoryCounts();
            console.log('✅ Data loading completed');
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.state.products = [];
            this.state.filteredProducts = [];
        } finally {
            this.state.isLoading = false;
        }
    }

    initUI() {
        console.log('🎨 Initializing UI...');
        this.renderProducts();
        this.updateCartBadge();
        this.setupMainButton();
    }

    bindEvents() {
        console.log('🔗 Binding events...');
        
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

        // Примерочная
        const fittingBack = document.getElementById('fittingBack');
        const fittingReset = document.getElementById('fittingReset');
        const changeModel = document.getElementById('changeModel');
        const saveOutfit = document.getElementById('saveOutfit');
        
        if (fittingBack) fittingBack.addEventListener('click', () => this.closeFittingRoom());
        if (fittingReset) fittingReset.addEventListener('click', () => this.resetFitting());
        if (changeModel) changeModel.addEventListener('click', () => this.changeModel());
        if (saveOutfit) saveOutfit.addEventListener('click', () => this.saveOutfit());

        // Табы в примерочной
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFittingTabChange(e.target.dataset.category);
            });
        });
        
        console.log('✅ Events bound successfully');
    }

    // Рендер товаров
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid || !emptyState) {
            console.error('❌ Required DOM elements not found');
            return;
        }

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
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300'">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
                        ${product.isHot ? '<span class="badge hot">HOT</span>' : ''}
                        ${!product.inStock ? '<span class="badge out-of-stock">НЕТ</span>' : ''}
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
                        <button class="action-btn btn-primary" onclick="event.stopPropagation(); app.addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                            ${product.inStock ? 'В корзину' : 'Нет в наличии'}
                        </button>
                        <button class="action-btn btn-secondary" onclick="event.stopPropagation(); app.toggleFavorite(${product.id})">
                            ${this.state.favorites.includes(product.id) ? '💔' : '❤️'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        console.log('✅ Products rendered:', this.state.filteredProducts.length);
    }

    // ... остальные методы остаются без изменений, но добавьте console.log для отладки

    showError(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: white; padding: 20px;">
                    <h3>Ошибка загрузки</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: white; border: none; border-radius: 8px; cursor: pointer;">Перезагрузить</button>
                </div>
            `;
        }
    }

    // Управление видимостью
    hideLoading() {
        const loading = document.getElementById('loading');
        const mainApp = document.getElementById('main-app');
        
        if (loading) loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
        
        console.log('✅ Loading hidden, main app shown');
    }

    // ... остальные методы без изменений
}

// Инициализация приложения
let app;

function initializeApp() {
    console.log('🎬 Initializing application...');
    
    try {
        // Проверяем готовность DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                app = new FashionApp();
            });
        } else {
            app = new FashionApp();
        }
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        
        // Показываем ошибку пользователю
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: white; padding: 20px;">
                    <h3>Ошибка загрузки приложения</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
                        Перезагрузить
                    </button>
                </div>
            `;
        }
    }
}

// Запускаем инициализацию
setTimeout(initializeApp, 100);
