// =================== КОНФИГУРАЦИЯ ===================
// 🔑 ВАЖНО: Получите бесплатный API ключ на https://imgbb.com
const IMGBB_API_KEY = '999f279e12b84980f83c884eac429182'; // Пример ключа, замените на свой

// Ключи для хранения данных
const STORAGE_KEYS = {
    PRODUCTS: 'fashionhub_shared_products',
    CART: 'fashionhub_cart',
    FAVORITES: 'fashionhub_favorites',
    OUTFITS: 'fashionhub_outfits',
    ORDERS: 'fashionhub_orders'
};

// =================== КЛАСС ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ===================
class ImageUploader {
    static async uploadImage(file, type = 'product') {
        console.log(`Начинаем загрузку ${type} изображения...`);
        
        // Показываем прогресс
        app.showUploadProgress();
        
        try {
            // Конвертируем файл в base64
            const base64 = await this.fileToBase64(file);
            
            // Создаем FormData
            const formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64.split(',')[1]); // Убираем data:image/... префикс
            
            // Настройки для ImgBB
            formData.append('name', `fashion_${type}_${Date.now()}`);
            formData.append('expiration', '600'); // 10 минут
            
            console.log('Отправляем запрос к ImgBB...');
            
            // Отправляем на ImgBB
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Ответ от ImgBB:', data);
            
            if (data.success && data.data && data.data.url) {
                app.hideUploadProgress();
                console.log('Изображение успешно загружено:', data.data.url);
                
                return {
                    url: data.data.url,
                    thumbnail: data.data.thumb.url || data.data.url,
                    medium: data.data.medium?.url || data.data.url,
                    deleteUrl: data.data.delete_url,
                    isExternal: true
                };
            } else {
                throw new Error(data.error?.message || 'Ошибка загрузки изображения');
            }
            
        } catch (error) {
            app.hideUploadProgress();
            console.error('Ошибка загрузки:', error);
            
            // Fallback: используем Data URL
            console.log('Используем локальное сохранение...');
            const base64 = await this.fileToBase64(file);
            
            return {
                url: base64,
                thumbnail: base64,
                isExternal: false,
                isLocal: true
            };
        }
    }
    
    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
    
    // Сжимаем изображение для оптимизации
    static async compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            // Если файл меньше 500KB, не сжимаем
            if (file.size < 500 * 1024) {
                resolve(file);
                return;
            }
            
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                
                // Сохраняем пропорции
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Рисуем изображение на canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Конвертируем в Blob
                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        console.log(`Сжатие: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB`);
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => resolve(file); // Fallback
            img.src = URL.createObjectURL(file);
        });
    }
    
    // Создаем миниатюру
    static createThumbnailUrl(url, width = 300) {
        if (url.includes('imgbb.com')) {
            // Для ImgBB используем параметры URL
            return url.replace(/\/$/, '') + `?width=${width}`;
        } else if (url.startsWith('data:')) {
            // Для Data URL возвращаем как есть
            return url;
        } else {
            // Для других URL
            return url;
        }
    }
}

// =================== СИНХРОНИЗАЦИЯ ДАННЫХ ===================
class DataManager {
    // Сохраняем продукты
    static saveProducts(products) {
        try {
            const data = {
                products: products,
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                totalProducts: products.length
            };
            
            // Сохраняем в localStorage
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
            
            // Пытаемся синхронизировать между вкладками
            this.syncAcrossTabs('products_updated', data);
            
            console.log(`✅ Сохранено ${products.length} товаров`);
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            return false;
        }
    }
    
    // Загружаем продукты
    static loadProducts() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '{}');
            
            if (data.products && Array.isArray(data.products) && data.products.length > 0) {
                console.log(`📦 Загружено ${data.products.length} товаров из хранилища`);
                return data.products;
            }
            
            // Если нет сохраненных товаров, возвращаем базовые
            console.log('📦 Используем базовые товары');
            return this.getDefaultProducts();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            return this.getDefaultProducts();
        }
    }
    
    // Базовые товары
    static getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Белая футболка Oversize",
                description: "Стильная футболка oversize из премиального хлопка. Идеальна для повседневной носки.",
                price: 2499,
                oldPrice: 2999,
                category: "tops",
                images: ["https://i.ibb.co/0jqWY4p/tshirt.jpg"],
                modelImages: {
                    female: "https://i.ibb.co/0jqWY4p/tshirt.jpg",
                    male: "https://i.ibb.co/0jqWY4p/tshirt.jpg"
                },
                sizes: ["S", "M", "L", "XL"],
                colors: ["Белый", "Черный", "Серый"],
                inStock: true,
                isNew: true,
                isSale: true,
                isHot: false,
                material: "100% хлопок",
                care: "Машинная стирка при 30°C",
                fitting: { type: "tops", layer: "top" }
            },
            {
                id: 2,
                name: "Синие джинсы Slim Fit",
                description: "Классические джинсы slim fit с современным кроем. 98% хлопок, 2% эластан.",
                price: 4599,
                oldPrice: null,
                category: "bottoms",
                images: ["https://i.ibb.co/4JvLZtC/jeans.jpg"],
                modelImages: {
                    female: "https://i.ibb.co/4JvLZtC/jeans.jpg",
                    male: "https://i.ibb.co/4JvLZtC/jeans.jpg"
                },
                sizes: ["28", "30", "32", "34", "36"],
                colors: ["Синий", "Черный", "Светло-синий"],
                inStock: true,
                isNew: false,
                isSale: false,
                isHot: true,
                material: "98% хлопок, 2% эластан",
                care: "Машинная стирка при 30°C",
                fitting: { type: "bottoms", layer: "bottom" }
            }
        ];
    }
    
    // Синхронизация между вкладками
    static syncAcrossTabs(event, data) {
        try {
            localStorage.setItem('fashionhub_sync_event', JSON.stringify({
                event: event,
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.log('Синхронизация между вкладками не поддерживается');
        }
    }
    
    // Загрузка корзины
    static loadCart() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
        } catch {
            return [];
        }
    }
    
    // Сохранение корзины
    static saveCart(cart) {
        try {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
        }
    }
    
    // Загрузка избранного
    static loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
        } catch {
            return [];
        }
    }
    
    // Сохранение избранного
    static saveFavorites(favorites) {
        try {
            localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        } catch (error) {
            console.error('Ошибка сохранения избранного:', error);
        }
    }
}

// =================== МОДЕЛИ ДЛЯ ПРИМЕРОЧНОЙ ===================
const MODEL_BASES = {
    female: "https://i.ibb.co/7QYfVW2/female-model.png",
    male: "https://i.ibb.co/4Srk2Jz/male-model.png"
};

// =================== КЛАСС ДЛЯ ТРАНСФОРМАЦИИ ОДЕЖДЫ ===================
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

        // Настройки изображения
        image.style.cursor = 'grab';
        image.style.touchAction = 'none';
        image.style.userSelect = 'none';
        image.style.pointerEvents = 'auto';
        
        // Создаем контролы
        this.createControls();
        
        // Назначаем события
        this.bindEvents();
        
        // Активируем слой
        this.activate();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'simple-controls';
        controls.innerHTML = `
            <button class="control-btn" data-action="scaleUp" title="Увеличить">➕</button>
            <button class="control-btn" data-action="scaleDown" title="Уменьшить">➖</button>
            <button class="control-btn" data-action="rotateLeft" title="Повернуть влево">↶</button>
            <button class="control-btn" data-action="rotateRight" title="Повернуть вправо">↷</button>
            <button class="control-btn reset" data-action="reset" title="Сбросить">🔄</button>
        `;
        
        this.layerElement.appendChild(controls);

        // События контролов
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
            
            // Предотвращаем скролл
            document.body.style.overflow = 'hidden';
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
            document.body.style.overflow = '';
        };

        // Мышь
        image.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            doDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', endDrag);

        // Тач
        image.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                e.stopPropagation();
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            e.preventDefault();
            doDrag(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

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
        
        // Опускаем остальные
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

        // Границы перемещения
        const maxMoveX = 150;
        const maxMoveY = 200;
        
        // Ограничиваем значения
        this.scale = Math.max(0.3, Math.min(3, this.scale));
        this.translateX = Math.max(-maxMoveX, Math.min(maxMoveX, this.translateX));
        this.translateY = Math.max(-maxMoveY, Math.min(maxMoveY, this.translateY));

        // Применяем трансформацию
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

// =================== ГЛАВНОЕ ПРИЛОЖЕНИЕ ===================
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

        this.imageUploader = ImageUploader;
        this.dataManager = DataManager;
        this.clothingTransformers = {};
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Запуск Fashion Shop...');
            this.initTelegram();
            await this.loadData();
            this.initUI();
            this.bindEvents();
            this.hideLoading();
            console.log('✅ Приложение запущено!');
        } catch (error) {
            console.error('❌ Ошибка запуска:', error);
            this.hideLoading();
        }
    }

    initTelegram() {
        if (window.Telegram?.WebApp) {
            console.log('📱 Запущено в Telegram Web App');
            this.tg = window.Telegram.WebApp;
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.tg.ready();
        } else {
            console.log('🌐 Запущено в браузере');
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
                // Загружаем данные
                this.state.products = this.dataManager.loadProducts();
                this.state.filteredProducts = this.state.products;
                this.state.cart = this.dataManager.loadCart();
                this.state.favorites = this.dataManager.loadFavorites();
                
                this.updateCategoryCounts();
                console.log(`📦 Загружено ${this.state.products.length} товаров`);
                resolve();
            }, 500);
        });
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
        document.getElementById('searchBtn')?.addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchClose')?.addEventListener('click', () => this.toggleSearch());
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Корзина
        document.getElementById('cartBtn')?.addEventListener('click', () => this.openCart());
        document.getElementById('cartClose')?.addEventListener('click', () => this.closeCart());
        document.getElementById('checkoutBtn')?.addEventListener('click', () => this.checkout());

        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavigation(e.currentTarget.dataset.page);
            });
        });

        // Модальное окно
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        document.getElementById('productModal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Примерочная
        document.getElementById('fittingBack')?.addEventListener('click', () => this.closeFittingRoom());
        document.getElementById('fittingProceed')?.addEventListener('click', () => this.showFittingView());
        document.getElementById('fittingBackToSelection')?.addEventListener('click', () => this.showFittingSelection());
        document.getElementById('fittingReset')?.addEventListener('click', () => this.resetFitting());
        document.getElementById('saveOutfit')?.addEventListener('click', () => this.saveOutfit());

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
        document.getElementById('adminBtn')?.addEventListener('click', () => this.showAdminPanel());
        document.getElementById('adminBack')?.addEventListener('click', () => this.hideAdminPanel());
        
        // Форма добавления товара
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }
        
        // Предпросмотр изображений
        const productImageFile = document.getElementById('productImageFile');
        const modelImageFile = document.getElementById('productModelImageFile');
        
        if (productImageFile) {
            productImageFile.addEventListener('change', (e) => this.showImagePreview(e, 'product'));
        }
        
        if (modelImageFile) {
            modelImageFile.addEventListener('change', (e) => this.showImagePreview(e, 'model'));
        }
        
        // Слушаем события синхронизации
        window.addEventListener('storage', (e) => {
            if (e.key === 'fashionhub_sync_event') {
                this.handleSyncEvent(e);
            }
        });
    }

    // =================== ОБРАБОТКА ТОВАРОВ ===================
    async handleAddProduct(event) {
        event.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Загружаем...';
        submitBtn.disabled = true;
        
        try {
            // Проверяем заполнение полей
            const requiredFields = ['productName', 'productDescription', 'productPrice', 'productCategory', 'productSizes', 'productColors'];
            for (const fieldId of requiredFields) {
                const field = document.getElementById(fieldId);
                if (!field.value.trim()) {
                    throw new Error(`Заполните поле: ${field.previousElementSibling?.textContent || fieldId}`);
                }
            }
            
            // Проверяем изображение
            const imageFile = document.getElementById('productImageFile').files[0];
            if (!imageFile) {
                throw new Error('Выберите изображение товара');
            }
            
            // Проверяем размер файла
            if (imageFile.size > 5 * 1024 * 1024) {
                throw new Error('Изображение должно быть меньше 5MB');
            }
            
            // Собираем данные товара
            const productData = {
                id: Date.now(),
                name: document.getElementById('productName').value.trim(),
                description: document.getElementById('productDescription').value.trim(),
                price: parseInt(document.getElementById('productPrice').value),
                oldPrice: parseInt(document.getElementById('productOldPrice').value) || null,
                category: document.getElementById('productCategory').value,
                sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s),
                colors: document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c),
                isNew: document.getElementById('productIsNew').checked,
                isSale: document.getElementById('productIsSale').checked,
                isHot: document.getElementById('productIsHot').checked,
                inStock: true,
                createdAt: new Date().toISOString(),
                fitting: this.getFittingData(document.getElementById('productCategory').value)
            };
            
            // Сжимаем и загружаем основное изображение
            console.log('Сжимаем основное изображение...');
            const compressedFile = await this.imageUploader.compressImage(imageFile);
            console.log('Загружаем на ImgBB...');
            const mainImage = await this.imageUploader.uploadImage(compressedFile, 'product');
            
            productData.images = [mainImage.url];
            productData.thumbnail = mainImage.thumbnail || mainImage.url;
            
            // Загружаем изображение на модели (если есть)
            const modelImageFile = document.getElementById('productModelImageFile').files[0];
            if (modelImageFile) {
                console.log('Сжимаем изображение модели...');
                const compressedModelFile = await this.imageUploader.compressImage(modelImageFile);
                console.log('Загружаем модель на ImgBB...');
                const modelImage = await this.imageUploader.uploadImage(compressedModelFile, 'model');
                
                productData.modelImages = {
                    female: modelImage.url,
                    male: modelImage.url
                };
            } else {
                // Используем основное изображение
                productData.modelImages = {
                    female: mainImage.url,
                    male: mainImage.url
                };
            }
            
            // Добавляем товар в список
            this.state.products.push(productData);
            
            // Сохраняем
            this.dataManager.saveProducts(this.state.products);
            
            // Обновляем UI
            this.state.filteredProducts = this.state.products;
            this.renderProducts();
            this.updateCategoryCounts();
            this.renderAdminProducts();
            
            // Уведомление
            this.showAlert('✅ Товар успешно добавлен! Изображения загружены.');
            
            // Сброс формы
            event.target.reset();
            this.removeImagePreview('product');
            this.removeImagePreview('model');
            
            // Переключаем на вкладку товаров
            this.showAdminTab('products');
            
        } catch (error) {
            console.error('❌ Ошибка добавления товара:', error);
            this.showAlert(`❌ Ошибка: ${error.message}`);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    getFittingData(category) {
        const mapping = {
            'tops': { type: 'tops', layer: 'top' },
            'bottoms': { type: 'bottoms', layer: 'bottom' },
            'dresses': { type: 'dresses', layer: 'dress' },
            'shoes': { type: 'shoes', layer: 'shoes' }
        };
        return mapping[category] || { type: category, layer: 'top' };
    }

    // =================== РЕНДЕР ТОВАРОВ ===================
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
                    <img src="${product.thumbnail || product.images[0]}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400/8b5cf6/ffffff?text=${encodeURIComponent(product.name.substring(0, 20))}'">
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

    // =================== МОДАЛЬНОЕ ОКНО ТОВАРА ===================
    openProductModal(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        const modalBody = document.getElementById('modalBody');
        if (!modalBody) return;

        modalBody.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                <div>
                    <img src="${product.images[0]}" 
                         alt="${product.name}" 
                         style="width: 100%; border-radius: 12px;"
                         onerror="this.src='https://via.placeholder.com/400x500/8b5cf6/ffffff?text=${encodeURIComponent(product.name)}'">
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

                    <div style="margin-bottom: 20px;">
                        <div style="font-weight: 600; margin-bottom: 8px;">Цвета:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.colors.map(color => `
                                <span style="padding: 6px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;">
                                    ${color}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button onclick="app.addToCart(${product.id}); app.closeModal()" 
                                style="padding: 15px; background: var(--gradient); color: white; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600;">
                            🛒 Добавить в корзину
                        </button>
                        <button onclick="app.openFittingRoom(${product.id}); app.closeModal()" 
                                style="padding: 15px; background: var(--surface); color: var(--text); border: 2px solid var(--primary); border-radius: 12px; font-size: 16px; cursor: pointer; font-weight: 600;">
                            👗 2D Примерка
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal();
    }

    // =================== КОРЗИНА ===================
    addToCart(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        // Проверяем, есть ли уже в корзине
        const existingIndex = this.state.cart.findIndex(item => item.product.id === productId);
        
        if (existingIndex > -1) {
            this.state.cart[existingIndex].quantity += 1;
        } else {
            this.state.cart.push({
                id: Date.now(),
                product: product,
                quantity: 1,
                addedAt: new Date().toISOString()
            });
        }

        this.dataManager.saveCart(this.state.cart);
        this.updateCartBadge();
        this.showAlert('🛒 Товар добавлен в корзину!');
    }

    removeFromCart(itemId) {
        this.state.cart = this.state.cart.filter(item => item.id !== itemId);
        this.dataManager.saveCart(this.state.cart);
        this.updateCartBadge();
        this.renderCartItems();
    }

    renderCartItems() {
        const container = document.getElementById('cartItems');
        if (!container) return;

        const total = this.state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        document.getElementById('cartTotalPrice').textContent = total.toLocaleString() + ' ₽';

        if (this.state.cart.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-icon">🛒</div>
                    <h3>Корзина пуста</h3>
                    <p style="color: var(--text-light); margin-top: 10px;">Добавьте товары из каталога</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.thumbnail || item.product.images[0]}" 
                     alt="${item.product.name}" 
                     class="cart-item-image"
                     onerror="this.src='https://via.placeholder.com/100x100/8b5cf6/ffffff?text=Товар'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-price">${(item.product.price * item.quantity).toLocaleString()} ₽</div>
                    <div style="font-size: 13px; color: var(--text-light); margin-top: 4px;">
                        Количество: ${item.quantity}
                    </div>
                </div>
                <div class="cart-item-controls">
                    <button class="remove-btn" onclick="app.removeFromCart(${item.id})" title="Удалить">🗑️</button>
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
        const orderDetails = this.state.cart.map(item => 
            `• ${item.product.name} x${item.quantity} - ${(item.product.price * item.quantity).toLocaleString()} ₽`
        ).join('\n');
        
        const message = `✅ Заказ оформлен!\n\n📦 Товары:\n${orderDetails}\n\n💰 Итого: ${total.toLocaleString()} ₽\n\nС вами свяжется менеджер для подтверждения заказа.`;
        
        this.showAlert(message);
        
        // Очищаем корзину
        this.state.cart = [];
        this.dataManager.saveCart(this.state.cart);
        this.updateCartBadge();
        this.closeCart();
    }

    // =================== ПОИСК И КАТЕГОРИИ ===================
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
        this.state.searchQuery = query.toLowerCase().trim();
        
        if (this.state.searchQuery === '') {
            this.handleCategoryChange(this.state.currentCategory);
        } else {
            this.state.filteredProducts = this.state.products.filter(product => 
                product.name.toLowerCase().includes(this.state.searchQuery) ||
                product.description.toLowerCase().includes(this.state.searchQuery) ||
                product.colors.some(color => color.toLowerCase().includes(this.state.searchQuery))
            );
        }
        
        this.renderProducts();
    }

    // =================== НАВИГАЦИЯ ===================
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
            this.showAlert('❤️ Нет избранных товаров');
            return;
        }
        
        this.state.filteredProducts = favorites;
        this.renderProducts();
        this.showAlert(`❤️ Показано ${favorites.length} избранных товаров`);
    }

    showProfile() {
        const user = this.tg.initDataUnsafe.user;
        const message = user ? 
            `👤 Профиль\nИмя: ${user.first_name || 'Не указано'}\nID: ${user.id}` :
            '👤 Гость\nВойдите через Telegram';
        
        this.showAlert(message);
    }

    toggleFavorite(productId) {
        const index = this.state.favorites.indexOf(productId);
        
        if (index > -1) {
            this.state.favorites.splice(index, 1);
            this.showAlert('💔 Удалено из избранного');
        } else {
            this.state.favorites.push(productId);
            this.showAlert('❤️ Добавлено в избранное');
        }
        
        this.dataManager.saveFavorites(this.state.favorites);
        this.renderProducts();
    }

    // =================== 2D ПРИМЕРОЧНАЯ ===================
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

    addToFitting(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product || !product.fitting) return;

        const category = product.fitting.type;
        
        // Если выбрано платье, снимаем верх и низ
        if (category === 'dresses') {
            this.state.currentOutfit.tops = null;
            this.state.currentOutfit.bottoms = null;
        }
        // Если выбран верх или низ, снимаем платье
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
                <img src="${product.thumbnail || product.images[0]}" 
                     alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/30x30/8b5cf6/ffffff?text=IMG'">
                <span>${this.getCategoryName(category)}: ${product.name}</span>
                <button class="remove-item" onclick="app.removeFromFitting('${category}')" title="Удалить">✕</button>
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
                <img src="${product.thumbnail || product.images[0]}" 
                     alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/50x50/8b5cf6/ffffff?text=IMG'">
                <div class="outfit-item-info">
                    <div class="outfit-item-name">${product.name}</div>
                    <div class="outfit-item-category">${this.getCategoryName(category)}</div>
                    <div class="outfit-item-price">${product.price.toLocaleString()} ₽</div>
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

    updateModelView() {
        const modelBase = document.getElementById('modelBase');
        const clothingLayers = document.getElementById('clothingLayers');
        
        if (!modelBase || !clothingLayers) return;

        // Удаляем старые трансформаторы
        Object.values(this.clothingTransformers || {}).forEach(transformer => {
            if (transformer && typeof transformer.destroy === 'function') {
                transformer.destroy();
            }
        });

        // Устанавливаем базовое изображение модели
        const baseImage = MODEL_BASES[this.state.currentModel];
        
        modelBase.innerHTML = `
            <img src="${baseImage}" alt="Модель" class="model-base-image"
                 onerror="this.src='https://via.placeholder.com/300x500/94a3b8/ffffff?text=Модель'">
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
                         class="clothing-image ${layerType}-image"
                         onerror="this.src='https://via.placeholder.com/200x300/8b5cf6/ffffff?text=Одежда'">
                `;
                clothingLayers.appendChild(layer);

                // Создаем трансформатор для этого слоя
                this.clothingTransformers[layerType] = new ClothingTransformer(layer, layerType);
            }
        });
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
                    <h3>Нет товаров в этой категории</h3>
                    <p style="color: var(--text-light); margin-top: 8px;">Добавьте товары через админку</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const isSelected = this.state.currentOutfit[product.fitting.type]?.id === product.id;
            return `
                <div class="fitting-product ${isSelected ? 'selected' : ''}" 
                     onclick="app.addToFitting(${product.id})">
                    <img src="${product.thumbnail || product.images[0]}" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/100x100/8b5cf6/ffffff?text=IMG'">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                    ${isSelected ? '<div style="font-size: 11px; color: var(--primary); margin-top: 4px;">✔ Выбрано</div>' : ''}
                </div>
            `;
        }).join('');
    }

    resetFitting() {
        this.state.currentOutfit = {
            tops: null,
            bottoms: null,
            dresses: null,
            shoes: null
        };
        
        // Удаляем трансформаторы
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

    saveOutfit() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        
        if (!hasItems) {
            this.showAlert('Добавьте товары для сохранения образа');
            return;
        }

        // Собираем информацию о трансформациях
        const transformations = {};
        Object.keys(this.clothingTransformers || {}).forEach(layerType => {
            if (this.clothingTransformers[layerType] && this.state.currentOutfit[layerType]) {
                const transformer = this.clothingTransformers[layerType];
                transformations[layerType] = {
                    scale: transformer.scale,
                    translateX: transformer.translateX,
                    translateY: transformer.translateY,
                    rotation: transformer.rotation
                };
            }
        });

        // Сохраняем образ
        const outfits = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTFITS) || '[]');
        const newOutfit = {
            id: Date.now(),
            outfit: { ...this.state.currentOutfit },
            transformations: transformations,
            model: this.state.currentModel,
            createdAt: new Date().toISOString()
        };
        
        outfits.push(newOutfit);
        localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits));
        
        this.showAlert('💾 Образ сохранен!');
    }

    handleFittingTabChange(category) {
        this.setActiveFittingTab(category);
    }

    // =================== АДМИНКА ===================
    showAdminPanel() {
        this.showPanel('adminPanel');
        this.renderAdminProducts();
    }

    hideAdminPanel() {
        this.hidePanel('adminPanel');
    }

    showAdminTab(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Показываем выбранную вкладку
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`)?.classList.add('active');
        document.querySelector(`.admin-tab-btn[data-tab="${tabName}"]`)?.classList.add('active');
    }

    renderAdminProducts() {
        const container = document.getElementById('adminProductsList');
        if (!container) return;

        if (this.state.products.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <h3 style="margin-bottom: 8px; color: var(--text);">Нет товаров</h3>
                    <p>Добавьте первый товар через вкладку "Добавить"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.products.map(product => `
            <div class="admin-product-item">
                <img src="${product.thumbnail || product.images[0]}" 
                     alt="${product.name}" 
                     class="admin-product-image"
                     onerror="this.src='https://via.placeholder.com/60x60/8b5cf6/ffffff?text=IMG'">
                <div class="admin-product-info">
                    <div class="admin-product-name">${product.name}</div>
                    <div class="admin-product-category">${this.getCategoryName(product.category)} • ${product.price.toLocaleString()} ₽</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                        ${product.isNew ? '🆕 ' : ''}${product.isSale ? '💰 ' : ''}${product.isHot ? '🔥 ' : ''}
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="admin-btn admin-btn-edit" onclick="app.editProduct(${product.id})">
                        ✏️
                    </button>
                    <button class="admin-btn admin-btn-delete" onclick="app.deleteProduct(${product.id})">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    editProduct(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) return;

        // Заполняем форму
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productOldPrice').value = product.oldPrice || '';
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSizes').value = product.sizes.join(', ');
        document.getElementById('productColors').value = product.colors.join(', ');
        document.getElementById('productIsNew').checked = product.isNew;
        document.getElementById('productIsSale').checked = product.isSale;
        document.getElementById('productIsHot').checked = product.isHot;
        
        // Показываем превью изображений
        if (product.images && product.images[0]) {
            document.getElementById('previewImage').src = product.images[0];
            document.getElementById('imagePreview').classList.remove('hidden');
        }
        
        // Переключаем на вкладку добавления
        this.showAdminTab('add');
        
        this.showAlert('✏️ Редактирование товара. Измените данные и нажмите "Обновить".');
    }

    deleteProduct(productId) {
        if (!confirm('Удалить этот товар?')) return;
        
        this.state.products = this.state.products.filter(p => p.id !== productId);
        this.dataManager.saveProducts(this.state.products);
        
        this.renderProducts();
        this.renderAdminProducts();
        this.updateCategoryCounts();
        
        this.showAlert('🗑️ Товар удален');
    }

    // =================== УТИЛИТЫ ===================
    showUploadProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) progress.classList.add('active');
    }

    hideUploadProgress() {
        const progress = document.getElementById('uploadProgress');
        if (progress) progress.classList.remove('active');
    }

    showImagePreview(event, type = 'product') {
        const file = event.target.files[0];
        if (!file) return;

        // Проверяем размер
        if (file.size > 5 * 1024 * 1024) {
            this.showAlert('❌ Файл слишком большой. Максимум 5MB');
            event.target.value = '';
            return;
        }

        // Проверяем тип
        if (!file.type.match('image.*')) {
            this.showAlert('❌ Выберите изображение (JPG, PNG, GIF, WEBP)');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewId = type === 'product' ? 'previewImage' : 'previewModelImage';
            const containerId = type === 'product' ? 'imagePreview' : 'modelImagePreview';
            
            const img = document.getElementById(previewId);
            const container = document.getElementById(containerId);
            
            img.src = e.target.result;
            container.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    removeImagePreview(type = 'product') {
        const inputId = type === 'product' ? 'productImageFile' : 'productModelImageFile';
        const containerId = type === 'product' ? 'imagePreview' : 'modelImagePreview';
        
        document.getElementById(inputId).value = '';
        document.getElementById(containerId).classList.add('hidden');
    }

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
            const name = this.getCategoryName(category);
            btn.textContent = `${name} (${count})`;
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

    // =================== УПРАВЛЕНИЕ ВИДИМОСТЬЮ ===================
    hideLoading() {
        const loading = document.getElementById('loading');
        const mainApp = document.getElementById('main-app');
        
        if (loading) loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }

    showModal() {
        document.getElementById('productModal')?.classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('productModal')?.classList.add('hidden');
    }

    openCart() {
        this.renderCartItems();
        document.getElementById('cartSidebar')?.classList.add('active');
    }

    closeCart() {
        document.getElementById('cartSidebar')?.classList.remove('active');
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
        document.getElementById('main-app')?.classList.add('hidden');
        document.getElementById(panelId)?.classList.remove('hidden');
    }

    hidePanel(panelId) {
        document.getElementById(panelId)?.classList.add('hidden');
        document.getElementById('main-app')?.classList.remove('hidden');
    }

    toggleSearch() {
        const search = document.getElementById('searchContainer');
        if (search) {
            search.classList.toggle('hidden');
            if (!search.classList.contains('hidden')) {
                document.getElementById('searchInput')?.focus();
            } else {
                this.handleSearch('');
            }
        }
    }

    handleSyncEvent(event) {
        try {
            const data = JSON.parse(event.newValue);
            if (data.event === 'products_updated') {
                console.log('🔄 Получены обновленные товары');
                this.state.products = data.data.products || [];
                this.state.filteredProducts = this.state.products;
                this.renderProducts();
                this.updateCategoryCounts();
                this.renderAdminProducts();
            }
        } catch (error) {
            console.log('Ошибка синхронизации:', error);
        }
    }
}

// =================== ЗАПУСК ПРИЛОЖЕНИЯ ===================
let app;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM загружен, запускаем приложение...');
    app = new FashionApp();
});

// Фолбэк: скрываем загрузку через 3 секунды
setTimeout(() => {
    const loading = document.getElementById('loading');
    const mainApp = document.getElementById('main-app');
    
    if (loading && !loading.classList.contains('hidden')) {
        console.log('⏰ Принудительное скрытие загрузки...');
        loading.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');
    }
}, 3000);

window.app = app;