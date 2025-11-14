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
            // Инициализация Telegram Web App с защитой
            this.initTelegram();
            
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
            this.showError('Ошибка инициализации приложения: ' + error.message);
        }
    }

    initTelegram() {
        // Проверяем, находимся ли мы в Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.ready();
            console.log('✅ Telegram WebApp initialized');
        } else {
            console.log('🌐 Running in browser mode (development)');
            // Создаем mock-объект для разработки
            this.tg = {
                showAlert: (msg) => {
                    console.log('Alert:', msg);
                    alert(msg);
                },
                MainButton: {
                    setText: (text) => console.log('MainButton text:', text),
                    onClick: (cb) => console.log('MainButton click handler set'),
                    show: () => console.log('MainButton shown'),
                    hide: () => console.log('MainButton hidden')
                },
                initDataUnsafe: { 
                    user: {
                        id: 123456789,
                        first_name: 'Test',
                        last_name: 'User',
                        username: 'testuser'
                    }
                },
                sendData: (data) => console.log('Data sent:', data),
                expand: () => console.log('WebApp expanded'),
                enableClosingConfirmation: () => console.log('Closing confirmation enabled'),
                ready: () => console.log('WebApp ready')
            };
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
            await new Promise(resolve => setTimeout(resolve, 100));
            
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
        
        try {
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
        } catch (error) {
            console.error('❌ Error binding events:', error);
        }
    }

    // Рендер товаров
    renderProducts() {
        try {
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
        } catch (error) {
            console.error('❌ Error rendering products:', error);
        }
    }

    // Модальное окно товара
    openProductModal(productId) {
        try {
            const product = this.state.products.find(p => p.id === productId);
            if (!product) return;

            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="product-modal">
                    <div class="product-modal-images">
                        <img src="${product.images[0]}" alt="${product.name}" class="modal-main-image" onerror="this.src='https://via.placeholder.com/300'">
                        <div class="product-modal-thumbnails">
                            ${product.images.map((img, index) => `
                                <img src="${img}" alt="${product.name}" class="thumbnail ${index === 0 ? 'active' : ''}" onerror="this.src='https://via.placeholder.com/60'">
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
                            <div class="info-item">
                                <strong>Категория:</strong> ${this.getCategoryName(product.category)}
                            </div>
                        </div>

                        <div class="product-modal-actions">
                            <button class="btn-primary large" onclick="app.addToCartFromModal(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                                ${product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
                            </button>
                            ${product.modelImages && product.modelImages.length > 0 ? `
                                <button class="btn-secondary" onclick="app.openFittingRoom(${product.id})">
                                    👗 Примерка
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            this.bindModalEvents(product);
            this.showModal();
        } catch (error) {
            console.error('❌ Error opening product modal:', error);
            this.showAlert('Ошибка при открытии товара');
        }
    }

    bindModalEvents(product) {
        try {
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

            // Выбираем первый размер и цвет по умолчанию
            const firstSize = document.querySelector('.size-option');
            const firstColor = document.querySelector('.color-option');
            
            if (firstSize) firstSize.classList.add('selected');
            if (firstColor) firstColor.classList.add('selected');
        } catch (error) {
            console.error('❌ Error binding modal events:', error);
        }
    }

    addToCartFromModal(productId) {
        try {
            const selectedSize = document.querySelector('.size-option.selected')?.dataset.size;
            const selectedColor = document.querySelector('.color-option.selected')?.dataset.color;
            
            this.addToCart(productId, selectedSize, selectedColor);
            this.closeModal();
        } catch (error) {
            console.error('❌ Error adding to cart from modal:', error);
        }
    }

    // Корзина
    addToCart(productId, size = null, color = null) {
        try {
            const product = this.state.products.find(p => p.id === productId);
            if (!product || !product.inStock) return;

            const selectedSize = size || product.sizes[0];
            const selectedColor = color || product.colors[0];

            // Проверяем, есть ли уже такой товар в корзине
            const existingItem = this.state.cart.find(item => 
                item.product.id === productId && 
                item.size === selectedSize && 
                item.color === selectedColor
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                const cartItem = {
                    id: Date.now(),
                    product: product,
                    size: selectedSize,
                    color: selectedColor,
                    quantity: 1
                };
                this.state.cart.push(cartItem);
            }

            Storage.saveCart(this.state.cart);
            this.updateCartBadge();
            this.showAlert('Товар добавлен в корзину!');
            
            if (document.getElementById('cartSidebar').classList.contains('active')) {
                this.renderCartItems();
            }
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            this.showAlert('Ошибка при добавлении в корзину');
        }
    }

    removeFromCart(itemId) {
        try {
            this.state.cart = this.state.cart.filter(item => item.id !== itemId);
            Storage.saveCart(this.state.cart);
            this.updateCartBadge();
            this.renderCartItems();
        } catch (error) {
            console.error('❌ Error removing from cart:', error);
        }
    }

    updateCartQuantity(itemId, quantity) {
        try {
            const item = this.state.cart.find(item => item.id === itemId);
            if (item) {
                item.quantity = Math.max(1, quantity);
                Storage.saveCart(this.state.cart);
                this.renderCartItems();
            }
        } catch (error) {
            console.error('❌ Error updating cart quantity:', error);
        }
    }

    renderCartItems() {
        try {
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
                    <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/60'">
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
        } catch (error) {
            console.error('❌ Error rendering cart items:', error);
        }
    }

    checkout() {
        try {
            if (this.state.cart.length === 0) {
                this.showAlert('Корзина пуста');
                return;
            }

            const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            
            // Формируем сообщение для заказа
            const orderItems = this.state.cart.map(item => 
                `• ${item.product.name} (${item.size}, ${item.color}) - ${item.quantity} шт. - ${(item.product.price * item.quantity).toLocaleString()} ₽`
            ).join('\n');

            const message = `🛍️ *Новый заказ!*\n\n📦 *Товары:*\n${orderItems}\n\n💰 *Итого:* ${total.toLocaleString()} ₽\n\n👤 *Клиент:* ${this.tg.initDataUnsafe.user?.first_name || 'Неизвестно'}`;

            // Создаем заказ
            const order = {
                items: [...this.state.cart],
                total: total,
                userInfo: this.tg.initDataUnsafe.user,
                createdAt: new Date().toISOString()
            };

            // Сохраняем заказ
            Storage.saveOrder(order);

            // Отправляем данные в Telegram (если в WebApp)
            if (window.Telegram && window.Telegram.WebApp) {
                this.tg.sendData(JSON.stringify({
                    type: 'order',
                    order: order,
                    message: message
                }));
            } else {
                console.log('Development mode - order created:', order);
            }

            // Очищаем корзину
            this.state.cart = [];
            Storage.saveCart(this.state.cart);
            this.updateCartBadge();
            this.closeCart();
            
            this.showAlert('Заказ оформлен! Менеджер свяжется с вами в ближайшее время.');
        } catch (error) {
            console.error('❌ Error during checkout:', error);
            this.showAlert('Ошибка при оформлении заказа');
        }
    }

    // Поиск и фильтрация
    handleCategoryChange(category) {
        try {
            this.state.currentCategory = category;
            
            if (category === 'all') {
                this.state.filteredProducts = this.state.products;
            } else if (category === 'new') {
                this.state.filteredProducts = this.state.products.filter(product => product.isNew);
            } else {
                this.state.filteredProducts = this.state.products.filter(product => product.category === category);
            }
            
            // Обновляем активную кнопку
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === category);
            });

            this.renderProducts();
        } catch (error) {
            console.error('❌ Error handling category change:', error);
        }
    }

    handleSearch(query) {
        try {
            this.state.searchQuery = query;
            
            if (query.trim() === '') {
                this.handleCategoryChange(this.state.currentCategory);
            } else {
                const lowerQuery = query.toLowerCase();
                this.state.filteredProducts = this.state.products.filter(product => 
                    product.name.toLowerCase().includes(lowerQuery) ||
                    product.description.toLowerCase().includes(lowerQuery) ||
                    (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
                );
            }
            
            this.renderProducts();
        } catch (error) {
            console.error('❌ Error handling search:', error);
        }
    }

    // Навигация
    handleNavigation(page) {
        try {
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
        } catch (error) {
            console.error('❌ Error handling navigation:', error);
        }
    }

    showFavorites() {
        try {
            const favoriteProducts = this.state.products.filter(product => 
                this.state.favorites.includes(product.id)
            );
            
            if (favoriteProducts.length === 0) {
                this.showAlert('У вас пока нет избранных товаров');
                return;
            }

            this.state.filteredProducts = favoriteProducts;
            this.renderProducts();
            this.showAlert(`Показаны ${favoriteProducts.length} избранных товаров`);
        } catch (error) {
            console.error('❌ Error showing favorites:', error);
        }
    }

    showProfile() {
        try {
            const user = this.tg.initDataUnsafe.user;
            const profileInfo = user ? `
👤 *Ваш профиль:*
• Имя: ${user.first_name || 'Не указано'}
• Фамилия: ${user.last_name || 'Не указано'}
• Username: @${user.username || 'Не указано'}

📊 *Статистика:*
• Избранных товаров: ${this.state.favorites.length}
• Товаров в корзине: ${this.state.cart.reduce((sum, item) => sum + item.quantity, 0)}
            ` : 'Информация о профиле недоступна';

            this.showAlert(profileInfo);
        } catch (error) {
            console.error('❌ Error showing profile:', error);
        }
    }

    toggleFavorite(productId) {
        try {
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
        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
        }
    }

    // Утилиты
    getColorHex(color) {
        const colors = {
            'Белый': '#ffffff', 'белый': '#ffffff',
            'Черный': '#000000', 'черный': '#000000',
            'Серый': '#808080', 'серый': '#808080',
            'Синий': '#0000ff', 'синий': '#0000ff',
            'Красный': '#ff0000', 'красный': '#ff0000',
            'Зеленый': '#008000', 'зеленый': '#008000',
            'Желтый': '#ffff00', 'желтый': '#ffff00',
            'Коричневый': '#a52a2a', 'коричневый': '#a52a2a',
            'Бежевый': '#f5f5dc', 'бежевый': '#f5f5dc',
            'Бордовый': '#800000', 'бордовый': '#800000',
            'Розовый': '#ffc0cb', 'розовый': '#ffc0cb',
            'Оливковый': '#808000', 'оливковый': '#808000',
            'Светло-синий': '#add8e6', 'светло-синий': '#add8e6',
            'Голубой': '#87ceeb', 'голубой': '#87ceeb'
        };
        return colors[color] || '#ccc';
    }

    getCategoryName(categoryId) {
        const categories = {
            'all': 'Все товары',
            'new': 'Новинки',
            'tops': 'Верхняя одежда',
            'bottoms': 'Брюки и юбки',
            'dresses': 'Платья',
            'outerwear': 'Верхняя одежда',
            'shoes': 'Обувь',
            'accessories': 'Аксессуары'
        };
        return categories[categoryId] || categoryId;
    }

    updateCategoryCounts() {
        try {
            const categories = {
                'all': this.state.products.length,
                'new': this.state.products.filter(p => p.isNew).length,
                'tops': this.state.products.filter(p => p.category === 'tops').length,
                'bottoms': this.state.products.filter(p => p.category === 'bottoms').length,
                'dresses': this.state.products.filter(p => p.category === 'dresses').length,
                'outerwear': this.state.products.filter(p => p.category === 'outerwear').length,
                'shoes': this.state.products.filter(p => p.category === 'shoes').length,
                'accessories': this.state.products.filter(p => p.category === 'accessories').length
            };

            // Обновляем кнопки категорий
            document.querySelectorAll('.category-btn').forEach(btn => {
                const category = btn.dataset.category;
                const count = categories[category] || 0;
                btn.textContent = `${this.getCategoryName(category)} (${count})`;
            });
        } catch (error) {
            console.error('❌ Error updating category counts:', error);
        }
    }

    showAlert(message) {
        try {
            this.tg.showAlert(message);
        } catch (error) {
            console.error('❌ Error showing alert:', error);
            alert(message);
        }
    }

    setupMainButton() {
        try {
            this.tg.MainButton.setText("🛍️ Открыть каталог");
            this.tg.MainButton.onClick(() => {
                this.showMainApp();
            });
            this.tg.MainButton.show();
        } catch (error) {
            console.error('❌ Error setting up main button:', error);
        }
    }

    // Управление видимостью
    hideLoading() {
        try {
            const loading = document.getElementById('loading');
            const mainApp = document.getElementById('main-app');
            
            if (loading) loading.classList.add('hidden');
            if (mainApp) mainApp.classList.remove('hidden');
            
            console.log('✅ Loading hidden, main app shown');
        } catch (error) {
            console.error('❌ Error hiding loading:', error);
        }
    }

    showModal() {
        try {
            document.getElementById('productModal').classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error showing modal:', error);
        }
    }

    closeModal() {
        try {
            document.getElementById('productModal').classList.add('hidden');
        } catch (error) {
            console.error('❌ Error closing modal:', error);
        }
    }

    openCart() {
        try {
            this.renderCartItems();
            document.getElementById('cartSidebar').classList.add('active');
        } catch (error) {
            console.error('❌ Error opening cart:', error);
        }
    }

    closeCart() {
        try {
            document.getElementById('cartSidebar').classList.remove('active');
        } catch (error) {
            console.error('❌ Error closing cart:', error);
        }
    }

    showFittingRoom() {
        try {
            document.getElementById('fittingRoom').classList.remove('hidden');
            document.getElementById('main-app').classList.add('hidden');
        } catch (error) {
            console.error('❌ Error showing fitting room:', error);
        }
    }

    closeFittingRoom() {
        try {
            document.getElementById('fittingRoom').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
        } catch (error) {
            console.error('❌ Error closing fitting room:', error);
        }
    }

    toggleSearch() {
        try {
            const searchContainer = document.getElementById('searchContainer');
            searchContainer.classList.toggle('hidden');
            
            if (!searchContainer.classList.contains('hidden')) {
                document.getElementById('searchInput').focus();
            } else {
                this.handleSearch('');
            }
        } catch (error) {
            console.error('❌ Error toggling search:', error);
        }
    }

    showMainApp() {
        try {
            document.getElementById('fittingRoom').classList.add('hidden');
            document.getElementById('adminPanel').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            this.handleCategoryChange('all');
        } catch (error) {
            console.error('❌ Error showing main app:', error);
        }
    }

    showAdminPanel() {
        try {
            if (this.admin && this.admin.isAdmin) {
                this.admin.showAdminPanel();
            } else {
                this.showAlert('Доступ только для администратора');
            }
        } catch (error) {
            console.error('❌ Error showing admin panel:', error);
        }
    }

    hideAdminPanel() {
        try {
            if (this.admin) {
                this.admin.hideAdminPanel();
            }
        } catch (error) {
            console.error('❌ Error hiding admin panel:', error);
        }
    }

    updateCartBadge() {
        try {
            const badge = document.getElementById('cartBadge');
            const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('❌ Error updating cart badge:', error);
        }
    }

    handleFittingTabChange(category) {
        try {
            document.querySelectorAll('.tab-btn').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.category === category);
            });
            this.renderFittingProducts(category);
        } catch (error) {
            console.error('❌ Error handling fitting tab change:', error);
        }
    }

    // Виртуальная примерочная
    openFittingRoom(productId = null) {
        try {
            this.closeModal();
            
            if (productId) {
                const product = this.state.products.find(p => p.id === productId);
                this.tryOnProduct(product);
            }

            this.showFittingRoom();
            this.renderFittingProducts('tops');
        } catch (error) {
            console.error('❌ Error opening fitting room:', error);
        }
    }

    renderFittingProducts(category) {
        try {
            const products = this.state.products.filter(product => 
                product.fitting && product.fitting.type === category && product.modelImages && product.modelImages.length > 0
            );
            const container = document.getElementById('fittingProducts');

            container.innerHTML = products.map(product => `
                <div class="fitting-product ${this.state.currentOutfit[category]?.id === product.id ? 'active' : ''}" 
                     onclick="app.tryOnProduct(${product.id})">
                    <img src="${product.images[0]}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/80'">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Error rendering fitting products:', error);
        }
    }

    tryOnProduct(product) {
        try {
            if (!product || !product.fitting || !product.modelImages) return;

            const layer = document.getElementById(product.fitting.layer);
            if (layer) {
                layer.style.backgroundImage = `url('${product.modelImages[0]}')`;
                layer.style.backgroundSize = 'contain';
                layer.style.backgroundPosition = 'center';
                layer.style.backgroundRepeat = 'no-repeat';
                layer.style.opacity = '0.9';
            }

            // Обновляем текущий образ
            this.state.currentOutfit[product.fitting.type] = product;

            // Обновляем активный товар в списке
            this.renderFittingProducts(product.fitting.type);
        } catch (error) {
            console.error('❌ Error trying on product:', error);
        }
    }

    resetFitting() {
        try {
            // Сбрасываем все слои
            ['top-layer', 'bottom-layer', 'dress-layer', 'shoes-layer'].forEach(layerId => {
                const layer = document.getElementById(layerId);
                if (layer) {
                    layer.style.backgroundImage = '';
                    layer.style.opacity = '0';
                }
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
        } catch (error) {
            console.error('❌ Error resetting fitting:', error);
        }
    }

    changeModel() {
        try {
            this.state.currentModel = this.state.currentModel === 'female' ? 'male' : 'female';
            const models = [
                {
                    id: "female",
                    baseImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                },
                {
                    id: "male", 
                    baseImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                }
            ];
            
            const model = models.find(m => m.id === this.state.currentModel);
            if (model) {
                const modelBase = document.getElementById('modelBase');
                if (modelBase) {
                    modelBase.src = model.baseImage;
                }
                this.resetFitting();
            }
        } catch (error) {
            console.error('❌ Error changing model:', error);
        }
    }

    saveOutfit() {
        try {
            const outfit = this.state.currentOutfit;
            const hasItems = Object.values(outfit).some(item => item !== null);
            
            if (!hasItems) {
                this.showAlert('Добавьте товары для сохранения образа');
                return;
            }

            // Сохраняем образ в localStorage
            const savedOutfits = JSON.parse(localStorage.getItem('fashionhub_outfits') || '[]');
            const newOutfit = {
                id: Date.now(),
                outfit: { ...outfit },
                createdAt: new Date().toISOString(),
                model: this.state.currentModel
            };
            
            savedOutfits.push(newOutfit);
            localStorage.setItem('fashionhub_outfits', JSON.stringify(savedOutfits));
            
            this.showAlert('Образ сохранен! Вы можете поделиться им с друзьями.');
        } catch (error) {
            console.error('❌ Error saving outfit:', error);
        }
    }

    // Обновление данных при изменении через админку
    refreshData() {
        try {
            this.state.products = Storage.getProducts();
            this.state.filteredProducts = this.state.products;
            this.updateCategoryCounts();
            this.renderProducts();
        } catch (error) {
            console.error('❌ Error refreshing data:', error);
        }
    }

    showError(message) {
        try {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.innerHTML = `
                    <div style="text-align: center; color: white; padding: 20px;">
                        <h3>Ошибка загрузки</h3>
                        <p>${message}</p>
                        <button onclick="location.reload()" style="padding: 10px 20px; background: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px;">
                            Перезагрузить
                        </button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Error showing error message:', error);
        }
    }
}

// Инициализация приложения
let app;

function initializeApp() {
    console.log('🎬 Initializing application...');
    
    try {
        app = new FashionApp();
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

// Запускаем инициализацию после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
