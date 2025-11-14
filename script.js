// Главный файл приложения
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
                top: null,
                bottom: null,
                dress: null,
                shoes: null
            }
        };

        this.init();
    }

    async init() {
        // Инициализация Telegram Web App
        this.tg = window.Telegram.WebApp;
        this.tg.expand();
        this.tg.enableClosingConfirmation();
        this.tg.ready();

        // Загрузка данных
        await this.loadData();
        
        // Инициализация интерфейса
        this.initUI();
        this.bindEvents();
        
        // Скрываем загрузку
        this.hideLoading();
    }

    async loadData() {
        // Имитация загрузки данных
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.state.products = ProductsAPI.getAllProducts();
        this.state.filteredProducts = this.state.products;
        
        // Загрузка из localStorage
        this.loadFromStorage();
    }

    initUI() {
        this.renderProducts();
        this.updateCartBadge();
        this.setupMainButton();
    }

    bindEvents() {
        // Навигация по категориям
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

        // Нижняя навигация
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

        // Табы в примерочной
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFittingTabChange(e.target.dataset.category);
            });
        });
    }

    // Рендер товаров
    renderProducts() {
        const grid = document.getElementById('productsGrid');
        const emptyState = document.getElementById('emptyState');

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
                            В корзину
                        </button>
                        <button class="action-btn btn-secondary" onclick="event.stopPropagation(); app.toggleFavorite(${product.id})">
                            ❤️
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Модальное окно товара
    openProductModal(productId) {
        const product = ProductsAPI.getProductById(productId);
        if (!product) return;

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="product-modal">
                <div class="product-modal-images">
                    <img src="${product.images[0]}" alt="${product.name}" class="modal-main-image">
                    <div class="product-modal-thumbnails">
                        ${product.images.map((img, index) => `
                            <img src="${img}" alt="${product.name}" class="thumbnail ${index === 0 ? 'active' : ''}">
                        `).join('')}
                    </div>
                </div>
                <div class="product-modal-details">
                    <h2>${product.name}</h2>
                    <p class="product-modal-description">${product.description}</p>
                    
                    <div class="product-modal-price">
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                    </div>

                    <div class="product-modal-options">
                        <div class="option-group">
                            <label>Размер:</label>
                            <div class="sizes-selector">
                                ${product.sizes.map(size => `
                                    <button class="size-option" data-size="${size}">${size}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="option-group">
                            <label>Цвет:</label>
                            <div class="colors-selector">
                                ${product.colors.map(color => `
                                    <button class="color-option" data-color="${color}" style="background-color: ${this.getColorHex(color)}">
                                        ${color}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="product-modal-info">
                        <div class="info-item">
                            <strong>Материал:</strong> ${product.material}
                        </div>
                        <div class="info-item">
                            <strong>Уход:</strong> ${product.care}
                        </div>
                    </div>

                    <div class="product-modal-actions">
                        <button class="btn-primary large" onclick="app.addToCart(${product.id})">
                            Добавить в корзину
                        </button>
                        ${product.fitting ? `
                            <button class="btn-secondary" onclick="app.openFittingRoom(${product.id})">
                                👗 Примерка
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        // Биндинг событий для модального окна
        this.bindModalEvents(product);
        this.showModal();
    }

    bindModalEvents(product) {
        // Выбор размера
        document.querySelectorAll('.size-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Выбор цвета
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Миниатюры
        const mainImage = document.querySelector('.modal-main-image');
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                mainImage.src = product.images[index];
            });
        });
    }

    // Виртуальная примерочная
    openFittingRoom(productId = null) {
        this.closeModal();
        
        if (productId) {
            const product = ProductsAPI.getProductById(productId);
            this.tryOnProduct(product);
        }

        this.showFittingRoom();
        this.renderFittingProducts('tops');
    }

    renderFittingProducts(category) {
        const products = ProductsAPI.getFittingProducts(category);
        const container = document.getElementById('fittingProducts');

        container.innerHTML = products.map(product => `
            <div class="fitting-product ${this.state.currentOutfit[category]?.id === product.id ? 'active' : ''}" 
                 onclick="app.tryOnProduct(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="product-title">${product.name}</div>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
            </div>
        `).join('');
    }

    tryOnProduct(product) {
        if (!product || !product.fitting) return;

        const layer = document.getElementById(product.fitting.layer);
        layer.style.backgroundImage = `url('${product.modelImages[0]}')`;
        layer.style.opacity = '0.9';

        // Обновляем текущий образ
        this.state.currentOutfit[product.fitting.type] = product;

        // Обновляем активный товар в списке
        this.renderFittingProducts(product.fitting.type);
    }

    resetFitting() {
        // Сбрасываем все слои
        ['top-layer', 'bottom-layer', 'dress-layer', 'shoes-layer'].forEach(layerId => {
            const layer = document.getElementById(layerId);
            layer.style.backgroundImage = '';
            layer.style.opacity = '0';
        });

        // Сбрасываем состояние
        this.state.currentOutfit = {
            top: null,
            bottom: null,
            dress: null,
            shoes: null
        };

        // Обновляем список товаров
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.renderFittingProducts(activeTab.dataset.category);
        }
    }

    changeModel() {
        this.state.currentModel = this.state.currentModel === 'female' ? 'male' : 'female';
        const model = ProductsAPI.getModels().find(m => m.id === this.state.currentModel);
        
        if (model) {
            document.getElementById('modelBase').src = model.baseImage;
            this.resetFitting(); // Сбрасываем примерку при смене модели
        }
    }

    saveOutfit() {
        const outfit = this.state.currentOutfit;
        const hasItems = Object.values(outfit).some(item => item !== null);
        
        if (!hasItems) {
            this.showAlert('Добавьте товары для сохранения образа');
            return;
        }

        this.showAlert('Образ сохранен! Вы можете поделиться им с друзьями.');
        // Здесь можно добавить логику сохранения образа
    }

    // Корзина
    addToCart(productId, size = null, color = null) {
        const product = ProductsAPI.getProductById(productId);
        if (!product) return;

        const cartItem = {
            id: Date.now(),
            product: product,
            size: size || product.sizes[0],
            color: color || product.colors[0],
            quantity: 1
        };

        this.state.cart.push(cartItem);
        this.saveToStorage();
        this.updateCartBadge();
        this.showAlert('Товар добавлен в корзину!');
        
        if (document.getElementById('cartSidebar').classList.contains('active')) {
            this.renderCartItems();
        }
    }

    removeFromCart(itemId) {
        this.state.cart = this.state.cart.filter(item => item.id !== itemId);
        this.saveToStorage();
        this.updateCartBadge();
        this.renderCartItems();
    }

    updateCartQuantity(itemId, quantity) {
        const item = this.state.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveToStorage();
            this.renderCartItems();
        }
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        document.getElementById('cartTotalPrice').textContent = `${total.toLocaleString()} ₽`;

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
                <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-options">
                        <span class="cart-item-size">Размер: ${item.size}</span>
                        <span class="cart-item-color">Цвет: ${item.color}</span>
                    </div>
                    <div class="cart-item-price">${(item.product.price * item.quantity).toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="app.updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
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
        const message = `Заказ на сумму ${total.toLocaleString()} ₽\n\nТовары:\n${this.state.cart.map(item => 
            `• ${item.product.name} (${item.size}, ${item.color}) - ${item.quantity} шт.`
        ).join('\n')}`;

        // Отправка данных в Telegram
        this.tg.showConfirm(message, (confirmed) => {
            if (confirmed) {
                this.tg.sendData(JSON.stringify({
                    type: 'order',
                    cart: this.state.cart,
                    total: total
                }));
                this.state.cart = [];
                this.saveToStorage();
                this.updateCartBadge();
                this.closeCart();
                this.showAlert('Заказ оформлен! Менеджер свяжется с вами.');
            }
        });
    }

    // Поиск и фильтрация
    handleCategoryChange(category) {
        this.state.currentCategory = category;
        this.state.filteredProducts = ProductsAPI.getProductsByCategory(category);
        
        // Обновляем активную кнопку
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.renderProducts();
    }

    handleSearch(query) {
        this.state.searchQuery = query;
        
        if (query.trim() === '') {
            this.state.filteredProducts = ProductsAPI.getProductsByCategory(this.state.currentCategory);
        } else {
            this.state.filteredProducts = ProductsAPI.searchProducts(query);
        }
        
        this.renderProducts();
    }

    // Навигация
    handleNavigation(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        switch (page) {
            case 'catalog':
                this.showMainApp();
                break;
            case 'fitting':
                this.openFittingRoom();
                break;
            case 'favorites':
                this.showFavorites();
                break;
            case 'profile':
                this.showProfile();
                break;
        }
    }

    // Утилиты
    getColorHex(color) {
        const colors = {
            'Белый': '#ffffff',
            'Черный': '#000000',
            'Серый': '#808080',
            'Синий': '#0000ff',
            'Красный': '#ff0000',
            'Зеленый': '#008000',
            'Желтый': '#ffff00',
            'Коричневый': '#a52a2a',
            'Бежевый': '#f5f5dc',
            'Бордовый': '#800000',
            'Розовый': '#ffc0cb',
            'Оливковый': '#808000',
            'Светло-синий': '#add8e6'
        };
        return colors[color] || '#ccc';
    }

    showAlert(message) {
        this.tg.showAlert(message);
    }

    setupMainButton() {
        this.tg.MainButton.setText("🛍️ Открыть каталог");
        this.tg.MainButton.onClick(() => {
            this.showMainApp();
        });
        this.tg.MainButton.show();
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
        document.getElementById('fittingRoom').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    closeFittingRoom() {
        document.getElementById('fittingRoom').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    toggleSearch() {
        const searchContainer = document.getElementById('searchContainer');
        searchContainer.classList.toggle('hidden');
        
        if (!searchContainer.classList.contains('hidden')) {
            document.getElementById('searchInput').focus();
        }
    }

    showMainApp() {
        document.getElementById('fittingRoom').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    showFavorites() {
        // Заглушка для избранного
        this.showAlert('Раздел "Избранное" скоро будет доступен!');
    }

    showProfile() {
        // Заглушка для профиля
        this.showAlert('Раздел "Профиль" скоро будет доступен!');
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    handleFittingTabChange(category) {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        this.renderFittingProducts(category);
    }

    // LocalStorage
    saveToStorage() {
        localStorage.setItem('fashionhub_cart', JSON.stringify(this.state.cart));
        localStorage.setItem('fashionhub_favorites', JSON.stringify(this.state.favorites));
    }

    loadFromStorage() {
        const cart = localStorage.getItem('fashionhub_cart');
        const favorites = localStorage.getItem('fashionhub_favorites');
        
        if (cart) {
            this.state.cart = JSON.parse(cart);
        }
        if (favorites) {
            this.state.favorites = JSON.parse(favorites);
        }
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
        this.saveToStorage();
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FashionApp();
});