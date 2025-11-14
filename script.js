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
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
            modelImages: ["https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300"],
            sizes: ["S", "M", "L", "XL"],
            colors: ["Белый", "Черный", "Серый"],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            fitting: {
                type: "tops",
                layer: "top-layer",
                position: { x: 50, y: 25, scale: 0.8 }
            }
        },
        {
            id: 2,
            name: "Синие джинсы Slim Fit",
            description: "Классические джинсы slim fit с современным кроем. 98% хлопок, 2% эластан.",
            price: 4599,
            oldPrice: null,
            category: "bottoms",
            images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
            modelImages: ["https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300"],
            sizes: ["28", "30", "32", "34", "36"],
            colors: ["Синий", "Черный", "Светло-синий"],
            inStock: true,
            isNew: false,
            isSale: false,
            isHot: true,
            fitting: {
                type: "bottoms",
                layer: "bottom-layer",
                position: { x: 50, y: 65, scale: 0.9 }
            }
        }
    ],
    adminUsers: [447355860] // ЗАМЕНИТЕ НА ВАШ TELEGRAM ID
};

// Анализатор изображений
class GarmentAnalyzer {
    async analyzeImage(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const analysis = this.analyzeGarment(img);
                    resolve(analysis);
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
            img.src = URL.createObjectURL(imageFile);
        });
    }

    analyzeGarment(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Анализ общего аспекта
        const overallAspect = img.width / img.height;
        
        // Находим объект (не-фон)
        const bounds = this.findObjectBounds(data, img.width, img.height);
        const objectAspect = bounds.width / bounds.height;
        
        // Определяем категорию по пропорциям
        const category = this.categorizeGarment(objectAspect, overallAspect);
        
        // Определяем настройки для примерочной
        const fittingConfig = this.getFittingConfig(category);
        
        console.log('Анализ изображения:', {
            overallAspect: overallAspect.toFixed(2),
            objectAspect: objectAspect.toFixed(2),
            objectSize: `${bounds.width}x${bounds.height}`,
            detectedCategory: category
        });

        return {
            type: category,
            layer: fittingConfig.layer,
            position: fittingConfig.position,
            autoDetected: true
        };
    }

    findObjectBounds(data, width, height) {
        // Определяем предполагаемый фон (цветы по углам)
        const backgroundColors = this.getCornerColors(data, width, height);
        const backgroundColor = this.averageColor(backgroundColors);
        
        let minX = width, minY = height, maxX = 0, maxY = 0;
        let objectPixels = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const pixelColor = [data[i], data[i+1], data[i+2]];
                
                // Если пиксель не похож на фон - это часть объекта
                if (!this.isBackgroundPixel(pixelColor, backgroundColor)) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    objectPixels++;
                }
            }
        }

        // Если объект не найден, используем все изображение
        if (minX >= maxX || minY >= maxY) {
            return { width: width, height: height, x: 0, y: 0 };
        }

        return {
            width: maxX - minX,
            height: maxY - minY,
            x: minX,
            y: minY
        };
    }

    getCornerColors(data, width, height) {
        const corners = [
            [0, 0], [width-1, 0], [0, height-1], [width-1, height-1], // Углы
            [width/2, 0], [0, height/2], [width-1, height/2], [width/2, height-1] // Края
        ];

        return corners.map(([x, y]) => {
            const i = (Math.floor(y) * width + Math.floor(x)) * 4;
            return [data[i], data[i+1], data[i+2]];
        });
    }

    averageColor(colors) {
        const sum = [0, 0, 0];
        colors.forEach(color => {
            sum[0] += color[0];
            sum[1] += color[1];
            sum[2] += color[2];
        });
        return sum.map(c => Math.round(c / colors.length));
    }

    isBackgroundPixel(pixelColor, backgroundColor, threshold = 50) {
        const diff = Math.abs(pixelColor[0] - backgroundColor[0]) +
                    Math.abs(pixelColor[1] - backgroundColor[1]) +
                    Math.abs(pixelColor[2] - backgroundColor[2]);
        return diff < threshold;
    }

    categorizeGarment(objectAspect, overallAspect) {
        // Высокие и узкие - обувь или аксессуары
        if (objectAspect < 0.5) return 'shoes';
        
        // Широкие и низкие - верхняя одежда
        if (objectAspect > 1.8) return 'tops';
        
        // Квадратные - платья или верх
        if (objectAspect > 1.2 && objectAspect <= 1.8) return 'tops';
        
        // Умеренные пропорции - низ
        if (objectAspect >= 0.8 && objectAspect <= 1.2) return 'bottoms';
        
        // Все остальное - платья
        return 'dresses';
    }

    getFittingConfig(category) {
        const configs = {
            'tops': {
                layer: 'top-layer',
                position: { x: 50, y: 25, scale: 0.8 }
            },
            'bottoms': {
                layer: 'bottom-layer',
                position: { x: 50, y: 65, scale: 0.9 }
            },
            'dresses': {
                layer: 'dress-layer',
                position: { x: 50, y: 40, scale: 0.85 }
            },
            'shoes': {
                layer: 'shoes-layer',
                position: { x: 50, y: 85, scale: 0.7 }
            }
        };
        
        return configs[category] || configs.tops;
    }
}

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
        const stored = localStorage.getItem(this.KEYS.PRODUCTS);
        return stored ? JSON.parse(stored) : BASE_PRODUCTS.products;
    },

    saveProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
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

    deleteProduct(productId) {
        const products = this.getProducts();
        const filtered = products.filter(p => p.id !== productId);
        this.saveProducts(filtered);
        return filtered;
    },

    getOrders() {
        const stored = localStorage.getItem(this.KEYS.ORDERS);
        return stored ? JSON.parse(stored) : [];
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
    }
};

// Главное приложение
class FashionApp {
    constructor() {
        this.analyzer = new GarmentAnalyzer();
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

    init() {
        this.initTelegram();
        this.loadData();
        this.initUI();
        this.bindEvents();
        this.initImageUpload();
        this.hideLoading();
    }

    initTelegram() {
        if (window.Telegram?.WebApp) {
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.ready();
        } else {
            this.tg = {
                showAlert: (msg) => alert(msg),
                MainButton: { 
                    setText: () => {}, 
                    onClick: () => {}, 
                    show: () => {},
                    hide: () => {}
                },
                initDataUnsafe: { 
                    user: { 
                        id: 123456789, 
                        first_name: 'Test',
                        last_name: 'User'
                    } 
                },
                sendData: () => console.log('Data sent')
            };
        }

        // Временно показываем админ-панель всем для тестирования
        document.getElementById('adminBtn').classList.remove('hidden');
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

        // Клик по области
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop
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

        // Выбор файла
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

        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
                <div>
                    <img src="${product.images[0]}" alt="${product.name}" 
                         style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                </div>
                <div>
                    <h2 style="margin-bottom: 12px; color: #1f2937;">${product.name}</h2>
                    <p style="color: #6b7280; margin-bottom: 20px; line-height: 1.5;">${product.description}</p>
                    
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                        <span style="font-size: 24px; font-weight: 700; color: #6366f1;">
                            ${product.price.toLocaleString()} ₽
                        </span>
                        ${product.oldPrice ? `
                            <span style="font-size: 16px; color: #9ca3af; text-decoration: line-through;">
                                ${product.oldPrice.toLocaleString()} ₽
                            </span>
                        ` : ''}
                    </div>

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">Размеры:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.sizes.map(size => `
                                <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 8px; font-size: 14px;">
                                    ${size}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">Цвета:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.colors.map(color => `
                                <span style="padding: 6px 12px; background: #f3f4f6; border-radius: 8px; font-size: 14px;">
                                    ${color}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="app.addToCart(${product.id}); app.closeModal()" 
                                style="padding: 15px; background: #6366f1; color: white; border: none; border-radius: 12px; 
                                       font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;"
                                onmouseover="this.style.background='#4f46e5'" 
                                onmouseout="this.style.background='#6366f1'">
                            Добавить в корзину
                        </button>
                        ${product.modelImages && product.modelImages.length > 0 ? `
                            <button onclick="app.openFittingRoom(${product.id})" 
                                    style="padding: 15px; background: #f8fafc; color: #6366f1; border: 2px solid #6366f1; 
                                           border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;
                                           transition: all 0.2s ease;"
                                    onmouseover="this.style.background='#6366f1'; this.style.color='white'" 
                                    onmouseout="this.style.background='#f8fafc'; this.style.color='#6366f1'">
                                👗 Примерка
                            </button>
                        ` : ''}
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
        const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        document.getElementById('cartTotalPrice').textContent = total.toLocaleString() + ' ₽';

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
                     onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=150&h=150&fit=crop'">
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
        const products = this.state.products.filter(p => p.fitting?.type === category && p.modelImages && p.modelImages.length > 0);
        const container = document.getElementById('fittingProducts');

        if (products.length === 0) {
            container.innerHTML = `
                <div class="fitting-empty">
                    <div class="empty-icon">👗</div>
                    <h3>Нет товаров для примерки</h3>
                    <p>Добавьте товары с фото на модели в категорию "${this.getCategoryName(category)}"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="fitting-product ${this.state.currentOutfit[category]?.id === product.id ? 'active' : ''}" 
                 onclick="app.tryOnProduct(${product.id})">
                <img src="${product.images[0]}" alt="${product.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=150&h=150&fit=crop'">
                <div class="product-title">${product.name}</div>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
            </div>
        `).join('');
    }

    tryOnProduct(product) {
        if (!product || !product.fitting || !product.modelImages) return;

        const productObj = typeof product === 'number' 
            ? this.state.products.find(p => p.id === product)
            : product;

        if (!productObj) return;

        const layer = document.getElementById(productObj.fitting.layer);
        if (layer && productObj.modelImages[0]) {
            layer.style.backgroundImage = `url('${productObj.modelImages[0]}')`;
            layer.style.backgroundSize = 'contain';
            layer.style.backgroundPosition = 'center';
            layer.style.backgroundRepeat = 'no-repeat';
            layer.classList.add('active');
        }

        // Обновляем текущий образ
        this.state.currentOutfit[productObj.fitting.type] = productObj;

        // Обновляем активный товар в списке
        this.renderFittingProducts(productObj.fitting.type);
    }

    resetFitting() {
        // Сбрасываем все слои
        ['top-layer', 'bottom-layer', 'dress-layer', 'shoes-layer'].forEach(layerId => {
            const layer = document.getElementById(layerId);
            if (layer) {
                layer.style.backgroundImage = '';
                layer.classList.remove('active');
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
        
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    loadAdminProducts() {
        const container = document.getElementById('adminProductsList');
        const products = Storage.getProducts();

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-admin">
                    <p>Нет товаров</p>
                    <button class="btn-primary" onclick="app.switchAdminTab('add')" style="margin-top: 15px;">
                        Добавить первый товар
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-card">
                <img src="${product.images[0]}" alt="${product.name}" class="admin-product-image"
                     onerror="this.src='https://images.unsplash.com/photo-1566206091558-7f218b696731?w=150&h=150&fit=crop'">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <div class="admin-product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="admin-product-category">${this.getCategoryName(product.category)}</div>
                    <div class="admin-product-badges">
                        ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
                        ${product.isHot ? '<span class="badge hot">HOT</span>' : ''}
                        ${product.fitting?.autoDetected ? '<span class="badge" style="background: #06b6d4;">AI</span>' : ''}
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-small btn-danger" onclick="app.deleteProduct(${product.id})">
                        Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadOrders() {
        const container = document.getElementById('adminOrdersList');
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
            <div class="order-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <h4>Заказ #${order.id}</h4>
                    <span style="padding: 4px 12px; background: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        Новый
                    </span>
                </div>
                <div style="color: #6b7280; margin-bottom: 10px;">
                    <div>Сумма: <strong style="color: #6366f1;">${order.total.toLocaleString()} ₽</strong></div>
                    <div>Товаров: ${order.items.length} шт.</div>
                    <div>Дата: ${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
    }

    async addNewProduct(e) {
        e.preventDefault();
        
        const mainImageFile = document.getElementById('productImageFile').files[0];
        if (!mainImageFile) {
            this.showAlert('Пожалуйста, выберите изображение товара');
            return;
        }

        try {
            // Показываем уведомление об анализе
            this.showAlert('🔍 Анализируем изображение...');

            // Анализируем изображение для автоматической настройки примерочной
            const analysis = await this.analyzer.analyzeImage(mainImageFile);
            
            // Читаем основное изображение
            const mainImageData = await this.readFileAsDataURL(mainImageFile);
            
            // Читаем изображение на модели (если есть)
            const modelImageFile = document.getElementById('productModelImageFile').files[0];
            const modelImageData = modelImageFile ? await this.readFileAsDataURL(modelImageFile) : null;

            const product = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseInt(document.getElementById('productPrice').value),
                oldPrice: document.getElementById('productOldPrice').value ? 
                    parseInt(document.getElementById('productOldPrice').value) : null,
                category: document.getElementById('productCategory').value,
                images: [mainImageData],
                modelImages: modelImageData ? [modelImageData] : [],
                sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
                colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
                inStock: true,
                isNew: document.getElementById('productIsNew')?.checked || false,
                isSale: document.getElementById('productIsSale')?.checked || false,
                isHot: document.getElementById('productIsHot')?.checked || false,
                fitting: {
                    type: analysis.type,
                    layer: analysis.layer,
                    position: analysis.position,
                    autoDetected: true
                }
            };

            const products = Storage.getProducts();
            products.push(product);
            Storage.saveProducts(products);
            
            this.state.products = products;
            this.state.filteredProducts = products;
            this.renderProducts();
            
            this.showAlert(`✅ Товар добавлен!\n\n🤖 Автоматически определено: ${this.getCategoryName(analysis.type)}\n📍 Слой: ${analysis.layer}\n🎯 Позиция: x${analysis.position.x}, y${analysis.position.y}`);
            
            // Сбрасываем форму
            e.target.reset();
            this.removeImage();
            this.removeModelImage();
            
        } catch (error) {
            console.error('Error adding product:', error);
            this.showAlert('❌ Ошибка при добавлении товара: ' + error.message);
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Ошибка чтения файла'));
            reader.readAsDataURL(file);
        });
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
        this.tg.showAlert(message);
    }

    // Управление видимостью
    hideLoading() {
        const loading = document.getElementById('loading');
        const mainApp = document.getElementById('main-app');
        if (loading) loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
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
