// Базовые данные
const BASE_PRODUCTS = {
    products: [
        {
            id: 1,
            name: "Белая футболка Oversize",
            description: "Стильная футболка oversize из премиального хлопка.",
            price: 2499,
            oldPrice: 2999,
            category: "tops",
            images: ["https://placehold.co/400x500/ffffff/333333?text=White+T-Shirt"],
            sizes: ["S", "M", "L", "XL"],
            colors: ["Белый", "Черный", "Серый"],
            inStock: true,
            isNew: true,
            isSale: true,
            fitting: {
                type: "tops",
                layer: "top"
            }
        }
    ]
};

// Хранилище
const Storage = {
    KEYS: {
        PRODUCTS: 'fashionhub_products',
        CART: 'fashionhub_cart'
    },

    getProducts() {
        try {
            const stored = localStorage.getItem(this.KEYS.PRODUCTS);
            return stored ? JSON.parse(stored) : BASE_PRODUCTS.products;
        } catch (error) {
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
            return [];
        }
    },

    saveCart(cart) {
        try {
            localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }
};

// ПРОСТОЙ И РАБОЧИЙ УДАЛИТЕЛЬ ФОНА
class BackgroundRemover {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Основной метод удаления фона
    async removeBackground(imageFile) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    try {
                        // Устанавливаем размеры canvas
                        this.canvas.width = img.width;
                        this.canvas.height = img.height;

                        // Рисуем изображение
                        this.ctx.drawImage(img, 0, 0);

                        // Получаем данные пикселей
                        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                        const data = imageData.data;

                        // ПРОСТОЙ АЛГОРИТМ УДАЛЕНИЯ ФОНА
                        this.removeSimpleBackground(imageData);

                        // Возвращаем обработанное изображение
                        this.ctx.putImageData(imageData, 0, 0);
                        resolve(this.canvas.toDataURL('image/png'));
                    } catch (error) {
                        reject(error);
                    }
                };
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(imageFile);
        });
    }

    // ПРОСТОЙ И ЭФФЕКТИВНЫЙ АЛГОРИТМ УДАЛЕНИЯ БЕЛОГО ФОНА
    removeSimpleBackground(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Определяем, является ли пиксель фоном
            if (this.isBackgroundPixel(r, g, b)) {
                // Делаем пиксель прозрачным
                data[i + 3] = 0;
            }
        }
    }

    // Определяем фон по нескольким критериям
    isBackgroundPixel(r, g, b) {
        // 1. Белый фон (RGB близко к 255,255,255)
        const isWhite = r > 240 && g > 240 && b > 240;
        
        // 2. Светлые оттенки
        const isLight = (r + g + b) > 700; // 255*3 = 765
        
        // 3. Проверка на однородность цвета (фон обычно однородный)
        const colorDiff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
        const isUniform = colorDiff < 30;
        
        return isWhite || (isLight && isUniform);
    }

    // Альтернативный метод для цветного фона
    async removeColoredBackground(imageFile, targetColor = [255, 255, 255], tolerance = 60) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    this.ctx.drawImage(img, 0, 0);

                    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];

                        // Сравниваем с целевым цветом фона
                        const diff = Math.sqrt(
                            Math.pow(r - targetColor[0], 2) +
                            Math.pow(g - targetColor[1], 2) +
                            Math.pow(b - targetColor[2], 2)
                        );

                        if (diff < tolerance) {
                            data[i + 3] = 0; // Прозрачность
                        }
                    }

                    this.ctx.putImageData(imageData, 0, 0);
                    resolve(this.canvas.toDataURL('image/png'));
                };
                img.src = e.target.result;
            };

            reader.readAsDataURL(imageFile);
        });
    }
}

// Главное приложение
class FashionApp {
    constructor() {
        this.state = {
            products: [],
            filteredProducts: [],
            cart: [],
            currentCategory: 'all',
            currentModel: 'female',
            currentOutfit: {
                tops: null,
                bottoms: null,
                dresses: null,
                shoes: null
            }
        };

        this.backgroundRemover = new BackgroundRemover();
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.initUI();
            this.bindEvents();
            this.initImageUpload();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.hideLoading();
        }
    }

    async loadData() {
        this.state.products = Storage.getProducts();
        this.state.filteredProducts = this.state.products;
        this.state.cart = Storage.getCart();
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

        // Корзина
        const cartBtn = document.getElementById('cartBtn');
        const cartClose = document.getElementById('cartClose');
        
        if (cartBtn) cartBtn.addEventListener('click', () => this.openCart());
        if (cartClose) cartClose.addEventListener('click', () => this.closeCart());

        // Примерочная
        const fittingBack = document.getElementById('fittingBack');
        const fittingProceed = document.getElementById('fittingProceed');
        const fittingBackToSelection = document.getElementById('fittingBackToSelection');
        const fittingReset = document.getElementById('fittingReset');
        
        if (fittingBack) fittingBack.addEventListener('click', () => this.closeFittingRoom());
        if (fittingProceed) fittingProceed.addEventListener('click', () => this.showFittingView());
        if (fittingBackToSelection) fittingBackToSelection.addEventListener('click', () => this.showFittingSelection());
        if (fittingReset) fittingReset.addEventListener('click', () => this.resetFitting());

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
        
        if (adminBtn) adminBtn.addEventListener('click', () => this.showAdminPanel());
        if (adminBack) adminBack.addEventListener('click', () => this.hideAdminPanel());
        if (productForm) productForm.addEventListener('submit', (e) => this.addNewProduct(e));
    }

    // ЗАГРУЗКА И ОБРАБОТКА ИЗОБРАЖЕНИЙ
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

        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                await this.handleImageSelect(
                    e.target.files[0], 
                    preview, 
                    previewImage, 
                    uploadArea,
                    fileInput
                );
            }
        });
    }

    async handleImageSelect(file, preview, previewImage, uploadArea, fileInput) {
        if (!file.type.startsWith('image/')) {
            this.showAlert('Пожалуйста, выберите изображение');
            return;
        }

        // Показываем индикатор обработки
        this.showProcessingIndicator();

        try {
            // УДАЛЯЕМ ФОН С ИЗОБРАЖЕНИЯ
            const processedImage = await this.backgroundRemover.removeBackground(file);
            
            // Сохраняем обработанное изображение в input
            const blob = await (await fetch(processedImage)).blob();
            const processedFile = new File([blob], file.name, { type: 'image/png' });
            
            // Создаем DataTransfer для обновления input file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(processedFile);
            fileInput.files = dataTransfer.files;

            // Показываем превью
            previewImage.src = processedImage;
            preview.classList.remove('hidden');
            uploadArea.classList.add('hidden');

            this.hideProcessingIndicator();
            this.showAlert('Фон успешно удален!');

        } catch (error) {
            this.hideProcessingIndicator();
            console.error('Error processing image:', error);
            this.showAlert('Ошибка при обработке изображения. Используется оригинал.');

            // Fallback - используем оригинальное изображение
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                preview.classList.remove('hidden');
                uploadArea.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    // ДОБАВЛЕНИЕ НОВОГО ТОВАРА
    async addNewProduct(e) {
        e.preventDefault();
        
        const mainImageFile = document.getElementById('productImageFile')?.files[0];
        const modelImageFile = document.getElementById('productModelImageFile')?.files[0];

        if (!mainImageFile) {
            this.showAlert('Пожалуйста, выберите основное изображение товара');
            return;
        }

        this.showProcessingIndicator();

        try {
            // Обрабатываем основное изображение (фон уже удален при загрузке)
            const mainImageUrl = await this.getImageUrl(mainImageFile);
            
            // Обрабатываем изображение для модели (если есть)
            let modelImageUrl = mainImageUrl; // По умолчанию используем основное
            if (modelImageFile) {
                modelImageUrl = await this.getImageUrl(modelImageFile);
            }

            const product = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseInt(document.getElementById('productPrice').value),
                oldPrice: document.getElementById('productOldPrice').value ? 
                    parseInt(document.getElementById('productOldPrice').value) : null,
                category: document.getElementById('productCategory').value,
                images: [mainImageUrl],
                modelImages: {
                    female: modelImageUrl,
                    male: modelImageUrl
                },
                sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()),
                colors: document.getElementById('productColors').value.split(',').map(c => c.trim()),
                inStock: true,
                isNew: document.getElementById('productIsNew')?.checked || false,
                isSale: document.getElementById('productIsSale')?.checked || false,
                isHot: document.getElementById('productIsHot')?.checked || false,
                fitting: this.getFittingConfig(document.getElementById('productCategory').value)
            };

            // Сохраняем товар
            const products = Storage.getProducts();
            products.push(product);
            Storage.saveProducts(products);
            
            this.state.products = products;
            this.state.filteredProducts = products;
            
            this.renderProducts();
            this.hideProcessingIndicator();
            this.showAlert('Товар успешно добавлен! Фон удален автоматически.');
            
            // Сбрасываем форму
            e.target.reset();
            this.removeImage();
            this.removeModelImage();

        } catch (error) {
            this.hideProcessingIndicator();
            this.showAlert('Ошибка при добавлении товара: ' + error.message);
        }
    }

    async getImageUrl(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
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
    }

    updateModelView() {
        const modelBase = document.getElementById('modelBase');
        const clothingLayers = document.getElementById('clothingLayers');
        
        if (!modelBase || !clothingLayers) return;

        // Базовая модель
        const baseImage = this.state.currentModel === 'female' 
            ? 'https://placehold.co/300x500/ffb6c1/ffffff?text=👩+Модель'
            : 'https://placehold.co/300x500/93c5fd/ffffff?text=👨+Модель';
        
        modelBase.innerHTML = `
            <img src="${baseImage}" alt="Модель" class="model-base-image">
        `;

        clothingLayers.innerHTML = '';

        // Добавляем одежду на модель
        const layersOrder = ['bottoms', 'tops', 'dresses', 'shoes'];
        
        layersOrder.forEach(layerType => {
            const product = this.state.currentOutfit[layerType];
            if (product) {
                const layer = document.createElement('div');
                layer.className = `clothing-layer ${layerType}-layer`;
                
                // Используем изображение с удаленным фоном
                const modelImage = product.modelImages[this.state.currentModel] || product.images[0];
                
                layer.innerHTML = `
                    <img src="${modelImage}" 
                         alt="${product.name}" 
                         class="clothing-image">
                `;
                clothingLayers.appendChild(layer);
            }
        });
    }

    addToFitting(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product || !product.fitting) return;

        const category = product.fitting.type;
        
        // Логика исключающих категорий
        if (category === 'dresses') {
            this.state.currentOutfit.tops = null;
            this.state.currentOutfit.bottoms = null;
        }
        else if (category === 'tops' || category === 'bottoms') {
            this.state.currentOutfit.dresses = null;
        }
        
        // Переключаем выбор
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

    // Остальные методы
    removeFromFitting(category) {
        this.state.currentOutfit[category] = null;
        this.renderSelectedItems();
        this.updateProceedButton();
    }

    updateProceedButton() {
        const proceedButton = document.getElementById('fittingProceed');
        if (!proceedButton) return;

        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        proceedButton.disabled = !hasItems;
    }

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

    resetFitting() {
        this.state.currentOutfit = { tops: null, bottoms: null, dresses: null, shoes: null };
        this.renderSelectedItems();
        this.updateProceedButton();
        this.updateModelView();
        this.showAlert('Примерка сброшена');
    }

    // Утилиты
    getFittingConfig(category) {
        const configs = {
            'tops': { type: 'tops', layer: 'top' },
            'bottoms': { type: 'bottoms', layer: 'bottom' },
            'dresses': { type: 'dresses', layer: 'dress' },
            'shoes': { type: 'shoes', layer: 'shoes' }
        };
        return configs[category];
    }

    getCategoryName(category) {
        const names = {
            'tops': 'Футболки', 'bottoms': 'Штаны', 'dresses': 'Платья', 'shoes': 'Обувь'
        };
        return names[category] || category;
    }

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

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        grid.innerHTML = this.state.filteredProducts.map(product => `
            <div class="product-card" onclick="app.openProductModal(${product.id})">
                <div class="product-image-container">
                    <img src="${product.images[0]}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    <div class="product-actions">
                        <button class="action-btn btn-primary" onclick="event.stopPropagation(); app.addToCart(${product.id})">
                            🛒 В корзину
                        </button>
                        <button class="action-btn btn-secondary" onclick="event.stopPropagation(); app.openFittingRoom(${product.id})">
                            👗 Примерка
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        const cartItem = { id: Date.now(), product: product, quantity: 1 };
        this.state.cart.push(cartItem);
        Storage.saveCart(this.state.cart);
        this.updateCartBadge();
        this.showAlert('Товар добавлен в корзину!');
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
        alert(message);
    }

    // Индикатор обработки
    showProcessingIndicator() {
        let overlay = document.getElementById('processingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'processingOverlay';
            overlay.className = 'processing-overlay';
            overlay.innerHTML = `
                <div class="processing-content">
                    <div class="processing-spinner"></div>
                    <div class="processing-text">Удаляем фон...</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    hideProcessingIndicator() {
        const overlay = document.getElementById('processingOverlay');
        if (overlay) overlay.remove();
    }

    // Навигация
    hideLoading() {
        const loading = document.getElementById('loading');
        const mainApp = document.getElementById('main-app');
        if (loading) loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }

    showFittingRoom() {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('fittingRoom').classList.remove('hidden');
    }

    closeFittingRoom() {
        document.getElementById('fittingRoom').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    showAdminPanel() {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
    }

    hideAdminPanel() {
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    openCart() {
        this.renderCartItems();
        document.getElementById('cartSidebar').classList.add('active');
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        if (!container) return;

        if (this.state.cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
            return;
        }

        container.innerHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.images[0]}" alt="${item.product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-price">${item.product.price.toLocaleString()} ₽</div>
                </div>
                <button class="remove-btn" onclick="app.removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');
    }

    removeFromCart(itemId) {
        this.state.cart = this.state.cart.filter(item => item.id !== itemId);
        Storage.saveCart(this.state.cart);
        this.updateCartBadge();
        this.renderCartItems();
    }

    handleFittingTabChange(category) {
        this.setActiveFittingTab(category);
    }
}

// Запуск приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FashionApp();
});

setTimeout(() => {
    const loading = document.getElementById('loading');
    const mainApp = document.getElementById('main-app');
    if (loading && !loading.classList.contains('hidden')) {
        loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }
}, 2000);

window.app = app;
