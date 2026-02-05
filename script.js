// =================== КОНФИГУРАЦИЯ ===================
const IMGBB_API_KEY = '999f279e12b84980f83c884eac429182';

const STORAGE_KEYS = {
    PRODUCTS: 'stylevault_products',
    CART: 'stylevault_cart',
    FAVORITES: 'stylevault_favorites',
    OUTFITS: 'stylevault_outfits'
};

// =================== КЛАСС ДЛЯ ЗАГРУЗКИ ИЗОБРАЖЕНИЙ ===================
class ImageUploader {
    static async uploadImage(file, type = 'product') {
        try {
            const base64 = await this.fileToBase64(file);
            const formData = new FormData();
            formData.append('key', IMGBB_API_KEY);
            formData.append('image', base64.split(',')[1]);
            formData.append('name', `style_${type}_${Date.now()}`);
            
            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success && data.data && data.data.url) {
                return {
                    url: data.data.url,
                    thumbnail: data.data.thumb.url || data.data.url,
                    isExternal: true
                };
            } else {
                throw new Error('Ошибка загрузки изображения');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
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
    
    static async compressImage(file, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
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
                
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => resolve(file);
            img.src = URL.createObjectURL(file);
        });
    }
}

// =================== СИНХРОНИЗАЦИЯ ДАННЫХ ===================
class DataManager {
    static saveProducts(products) {
        try {
            const data = {
                products: products,
                lastUpdated: new Date().toISOString(),
                version: '1.0',
                totalProducts: products.length
            };
            
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
            this.syncAcrossTabs('products_updated', data);
            
            console.log(`✅ Сохранено ${products.length} товаров`);
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            return false;
        }
    }
    
    static loadProducts() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '{}');
            
            if (data.products && Array.isArray(data.products) && data.products.length > 0) {
                console.log(`📦 Загружено ${data.products.length} товаров из хранилища`);
                return data.products;
            }
            
            console.log('📦 Используем базовые товары');
            return this.getDefaultProducts();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки:', error);
            return this.getDefaultProducts();
        }
    }
    
    static getDefaultProducts() {
        return [
            {
                id: 1,
                name: "Неоновая футболка",
                description: "Футболка с неоновым принтом в ультрасовременном стиле. 100% хлопок.",
                price: 2999,
                oldPrice: 3499,
                category: "tshirt",
                images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop"
                },
                sizes: ["S", "M", "L", "XL"],
                colors: ["Черный", "Белый", "Неоновый"],
                inStock: true,
                isNew: true,
                isSale: true,
                isHot: true,
                material: "100% хлопок",
                care: "Машинная стирка 30°C",
                fitting: { type: "tshirt", layer: "top" }
            },
            {
                id: 2,
                name: "Оверсайз худи",
                description: "Максимально комфортное худи oversize с капюшоном. Премиум качество.",
                price: 5999,
                oldPrice: null,
                category: "hoodie",
                images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop"
                },
                sizes: ["M", "L", "XL", "XXL"],
                colors: ["Серый", "Черный", "Бежевый"],
                inStock: true,
                isNew: true,
                isSale: false,
                isHot: false,
                material: "Хлопок 80%, Полиэстер 20%",
                care: "Машинная стирка 30°C",
                fitting: { type: "hoodie", layer: "top" }
            },
            {
                id: 3,
                name: "Кашемировая кофта",
                description: "Роскошная кофта из кашемира. Идеально для холодных дней.",
                price: 8999,
                oldPrice: 10999,
                category: "sweater",
                images: ["https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=600&auto=format&fit=crop"
                },
                sizes: ["XS", "S", "M", "L"],
                colors: ["Бежевый", "Кремовый", "Серый"],
                inStock: true,
                isNew: false,
                isSale: true,
                isHot: true,
                material: "100% кашемир",
                care: "Ручная стирка",
                fitting: { type: "sweater", layer: "top" }
            },
            {
                id: 4,
                name: "Кожаная куртка",
                description: "Классическая кожаная куртка. Вечная классика в современном исполнении.",
                price: 14999,
                oldPrice: 17999,
                category: "jacket",
                images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop"
                },
                sizes: ["S", "M", "L", "XL"],
                colors: ["Черный", "Коричневый"],
                inStock: true,
                isNew: true,
                isSale: false,
                isHot: true,
                material: "Натуральная кожа",
                care: "Профессиональная чистка",
                fitting: { type: "jacket", layer: "outerwear" }
            },
            {
                id: 5,
                name: "Бейсболка с лого",
                description: "Стильная бейсболка с минималистичным логотипом.",
                price: 1999,
                oldPrice: 2499,
                category: "cap",
                images: ["https://ibb.co/Zz5y9s03"],
                modelImages: {
                    female: "https://ibb.co/Zz5y9s03",
                    male: "https://ibb.co/Zz5y9s03"
                },
                sizes: ["Один размер"],
                colors: ["Черный", "Белый", "Серый"],
                inStock: true,
                isNew: false,
                isSale: true,
                isHot: false,
                material: "Хлопок, Полиэстер",
                care: "Ручная стирка",
                fitting: { type: "cap", layer: "accessory" }
            },
            {
                id: 6,
                name: "Солнечные очки",
                description: "Стильные солнцезащитные очки с УФ-защитой.",
                price: 3999,
                oldPrice: null,
                category: "accessory",
                images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop"
                },
                sizes: ["Стандарт"],
                colors: ["Черный", "Золотой", "Серебряный"],
                inStock: true,
                isNew: true,
                isSale: false,
                isHot: true,
                material: "Ацетат, Металл",
                care: "Протирать специальной салфеткой",
                fitting: { type: "accessory", layer: "accessory" }
            },
            {
                id: 7,
                name: "Кроссовки Limited",
                description: "Ограниченная серия кроссовок с уникальным дизайном.",
                price: 12999,
                oldPrice: 14999,
                category: "shoes",
                images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop"
                },
                sizes: ["38", "39", "40", "41", "42", "43", "44"],
                colors: ["Белый", "Черный", "Серый"],
                inStock: true,
                isNew: true,
                isSale: true,
                isHot: true,
                material: "Кожа, Текстиль",
                care: "Протирать влажной тряпкой",
                fitting: { type: "shoes", layer: "shoes" }
            },
            {
                id: 8,
                name: "Карго штаны",
                description: "Ультрамодные карго штаны с множеством карманов.",
                price: 4999,
                oldPrice: 5999,
                category: "pants",
                images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop"
                },
                sizes: ["28", "30", "32", "34", "36"],
                colors: ["Черный", "Зеленый", "Бежевый"],
                inStock: true,
                isNew: false,
                isSale: true,
                isHot: true,
                material: "Хлопок, Полиэстер",
                care: "Машинная стирка 30°C",
                fitting: { type: "pants", layer: "bottom" }
            },
            {
                id: 9,
                name: "Футболка с граффити",
                description: "Эксклюзивная футболка с принтом в стиле уличного искусства.",
                price: 3499,
                oldPrice: 3999,
                category: "tshirt",
                images: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop"
                },
                sizes: ["S", "M", "L"],
                colors: ["Черный", "Белый"],
                inStock: true,
                isNew: true,
                isSale: false,
                isHot: false,
                material: "100% хлопок",
                care: "Машинная стирка 30°C",
                fitting: { type: "tshirt", layer: "top" }
            },
            {
                id: 10,
                name: "Зимнее худи",
                description: "Теплое худи для холодной погоды с флисовой подкладкой.",
                price: 6999,
                oldPrice: null,
                category: "hoodie",
                images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&auto=format&fit=crop"
                },
                sizes: ["M", "L", "XL"],
                colors: ["Черный", "Серый", "Темно-синий"],
                inStock: true,
                isNew: true,
                isSale: false,
                isHot: true,
                material: "Хлопок, Флис",
                care: "Машинная стирка 30°C",
                fitting: { type: "hoodie", layer: "top" }
            },
            {
                id: 11,
                name: "Вязаная кофта",
                description: "Стильная вязаная кофта ручной работы.",
                price: 7999,
                oldPrice: 8999,
                category: "sweater",
                images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop"
                },
                sizes: ["S", "M", "L"],
                colors: ["Бежевый", "Коричневый", "Кремовый"],
                inStock: true,
                isNew: false,
                isSale: true,
                isHot: false,
                material: "Шерсть, Акрил",
                care: "Ручная стирка",
                fitting: { type: "sweater", layer: "top" }
            },
            {
                id: 12,
                name: "Джинсовая куртка",
                description: "Классическая джинсовая куртка в современном крое.",
                price: 8999,
                oldPrice: 10999,
                category: "jacket",
                images: ["https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop"],
                modelImages: {
                    female: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop",
                    male: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop"
                },
                sizes: ["XS", "S", "M", "L"],
                colors: ["Синий", "Черный"],
                inStock: true,
                isNew: true,
                isSale: true,
                isHot: true,
                material: "100% хлопок (деним)",
                care: "Машинная стирка 30°C",
                fitting: { type: "jacket", layer: "outerwear" }
            }
        ];
    }
    
    static syncAcrossTabs(event, data) {
        try {
            localStorage.setItem('stylevault_sync_event', JSON.stringify({
                event: event,
                data: data,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.log('Синхронизация не поддерживается');
        }
    }
    
    static loadCart() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || [];
        } catch {
            return [];
        }
    }
    
    static saveCart(cart) {
        try {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
        } catch (error) {
            console.error('Ошибка сохранения корзины:', error);
        }
    }
    
    static loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
        } catch {
            return [];
        }
    }
    
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
    female: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&auto=format&fit=crop&crop=face",
    male: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&crop=face"
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

        image.style.cursor = 'grab';
        image.style.touchAction = 'none';
        image.style.userSelect = 'none';
        image.style.pointerEvents = 'auto';
        
        this.createControls();
        this.bindEvents();
        this.activate();
    }

    createControls() {
        const controls = document.createElement('div');
        controls.className = 'simple-controls';
        controls.innerHTML = `
            <button class="control-btn-small" data-action="scaleUp" title="Увеличить">
                <i class="fas fa-search-plus"></i>
            </button>
            <button class="control-btn-small" data-action="scaleDown" title="Уменьшить">
                <i class="fas fa-search-minus"></i>
            </button>
            <button class="control-btn-small" data-action="rotateLeft" title="Повернуть влево">
                <i class="fas fa-undo"></i>
            </button>
            <button class="control-btn-small" data-action="rotateRight" title="Повернуть вправо">
                <i class="fas fa-redo"></i>
            </button>
            <button class="control-btn-small reset" data-action="reset" title="Сбросить">
                <i class="fas fa-redo-alt"></i>
            </button>
        `;
        
        this.layerElement.appendChild(controls);

        controls.querySelectorAll('.control-btn-small').forEach(btn => {
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

        image.addEventListener('click', (e) => {
            e.stopPropagation();
            this.activate();
        });
    }

    activate() {
        this.layerElement.style.zIndex = '100';
        
        document.querySelectorAll('.clothing-layer').forEach(layer => {
            if (layer !== this.layerElement) {
                layer.style.zIndex = '10';
            }
        });
        
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

        const maxMoveX = 150;
        const maxMoveY = 200;
        
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

// =================== ГЛАВНОЕ ПРИЛОЖЕНИЕ ===================
class StyleVaultApp {
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
                tshirt: null,
                hoodie: null,
                sweater: null,
                jacket: null,
                cap: null,
                accessory: null,
                shoes: null,
                pants: null
            }
        };

        this.imageUploader = ImageUploader;
        this.dataManager = DataManager;
        this.clothingTransformers = {};
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Запуск Style Vault...');
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
                this.state.products = this.dataManager.loadProducts();
                this.state.filteredProducts = this.state.products;
                this.state.cart = this.dataManager.loadCart();
                this.state.favorites = this.dataManager.loadFavorites();
                
                this.updateCategoryCounts();
                console.log(`📦 Загружено ${this.state.products.length} товаров`);
                resolve();
            }, 800);
        });
    }

    initUI() {
        this.renderProducts();
        this.updateCartBadge();
    }

    bindEvents() {
        // Категории
        document.querySelectorAll('.cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryChange(e.currentTarget.dataset.category);
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
        document.querySelectorAll('.nav-btn').forEach(item => {
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
        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFittingTabChange(e.currentTarget.dataset.category);
            });
        });

        // Выбор модели
        document.querySelectorAll('.model-btn[data-model]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeModel(e.currentTarget.dataset.model);
            });
        });
        
        // Слушаем события синхронизации
        window.addEventListener('storage', (e) => {
            if (e.key === 'stylevault_sync_event') {
                this.handleSyncEvent(e);
            }
        });
    }

    // =================== ОБРАБОТКА ТОВАРОВ ===================
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
                <div class="product-image">
                    <img src="${product.images[0]}" 
                         alt="${product.name}" 
                         loading="lazy"
                         onerror="this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&auto=format&fit=crop'">
                    <div class="product-badges">
                        ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
                        ${product.isHot ? '<span class="badge hot">HOT</span>' : ''}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn-small btn-primary" onclick="event.stopPropagation(); app.addToCart(${product.id})">
                            <i class="fas fa-shopping-bag"></i>
                            В корзину
                        </button>
                        <button class="action-btn-small btn-secondary" onclick="event.stopPropagation(); app.toggleFavorite(${product.id})">
                            ${this.state.favorites.includes(product.id) ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}
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
            <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
                <div style="border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--dark-border);">
                    <img src="${product.images[0]}" 
                         alt="${product.name}" 
                         style="width: 100%; height: 300px; object-fit: cover;"
                         onerror="this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w-400&auto=format&fit=crop'">
                </div>
                <div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">${product.name}</h2>
                    <p style="color: var(--light-secondary); margin-bottom: 24px; line-height: 1.6;">${product.description}</p>
                    
                    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
                        <span style="font-size: 32px; font-weight: 800; background: var(--gradient-primary); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
                            ${product.price.toLocaleString()} ₽
                        </span>
                        ${product.oldPrice ? `
                            <span style="font-size: 20px; color: var(--light-muted); text-decoration: line-through;">
                                ${product.oldPrice.toLocaleString()} ₽
                            </span>
                        ` : ''}
                    </div>

                    <div style="margin-bottom: 24px;">
                        <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px;">Размеры:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.sizes.map(size => `
                                <span style="padding: 10px 16px; background: var(--gradient-card); border: 1px solid var(--dark-border); border-radius: var(--radius);">
                                    ${size}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px;">Цвета:</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${product.colors.map(color => `
                                <span style="padding: 10px 16px; background: var(--gradient-card); border: 1px solid var(--dark-border); border-radius: var(--radius);">
                                    ${color}
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button onclick="app.addToCart(${product.id}); app.closeModal()" 
                                style="padding: 18px; background: var(--gradient-primary); color: white; border: none; border-radius: var(--radius-md); font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px;">
                            <i class="fas fa-shopping-bag"></i>
                            Добавить в корзину
                        </button>
                        <button onclick="app.openFittingRoom(${product.id}); app.closeModal()" 
                                style="padding: 18px; background: var(--gradient-card); color: var(--light-text); border: 1px solid var(--neon-pink); border-radius: var(--radius-md); font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px;">
                            <i class="fas fa-tshirt"></i>
                            Виртуальная примерка
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
                    <div class="empty-cart-icon">
                        <i class="fas fa-shopping-bag"></i>
                    </div>
                    <h3>Корзина пуста</h3>
                    <p style="color: var(--light-muted); margin-top: 12px;">Добавьте товары из каталога</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.state.cart.map(item => `
            <div class="cart-item">
                <img src="${item.product.images[0]}" 
                     alt="${item.product.name}" 
                     class="cart-item-image"
                     onerror="this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=100&auto=format&fit=crop'">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.product.name}</h4>
                    <div class="cart-item-price">${(item.product.price * item.quantity).toLocaleString()} ₽</div>
                    <div class="cart-item-quantity">Количество: ${item.quantity}</div>
                </div>
                <button class="remove-item-btn" onclick="app.removeFromCart(${item.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
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
        
        this.state.cart = [];
        this.dataManager.saveCart(this.state.cart);
        this.updateCartBadge();
        this.closeCart();
    }

    // =================== ПОИСК И КАТЕГОРИИ ===================
    handleCategoryChange(category) {
        this.state.currentCategory = category;
        
        document.querySelectorAll('.cat-btn').forEach(btn => {
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
                product.colors.some(color => color.toLowerCase().includes(this.state.searchQuery)) ||
                product.category === this.state.searchQuery
            );
        }
        
        this.renderProducts();
    }

    // =================== НАВИГАЦИЯ ===================
    handleNavigation(page) {
        document.querySelectorAll('.nav-btn').forEach(item => {
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
            tshirt: null,
            hoodie: null,
            sweater: null,
            jacket: null,
            cap: null,
            accessory: null,
            shoes: null,
            pants: null
        };
        
        if (productId) {
            const product = this.state.products.find(p => p.id === productId);
            if (product) {
                this.addToFitting(product.id);
            }
        }
        
        this.renderSelectedItems();
        this.setActiveFittingTab('tshirt');
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
        
        if (this.state.currentOutfit[category]?.id === product.id) {
            this.state.currentOutfit[category] = null;
        } else {
            this.state.currentOutfit[category] = product;
        }

        this.renderSelectedItems();
        this.updateProceedButton();
        
        const activeTab = document.querySelector('.cat-tab.active');
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
                <img src="${product.images[0]}" 
                     alt="${product.name}"
                     onerror="this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=40&auto=format&fit=crop'">
                <span>${this.getCategoryName(category)}: ${product.name}</span>
                <button class="remove-selected" onclick="app.removeFromFitting('${category}')" title="Удалить">
                    <i class="fas fa-times"></i>
                </button>
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
                <img src="${product.images[0]}" 
                     alt="${product.name}"
                     onerror="this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=50&auto=format&fit=crop'">
                <div class="outfit-item-info">
                    <div class="outfit-item-name">${product.name}</div>
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

        Object.values(this.clothingTransformers || {}).forEach(transformer => {
            if (transformer && typeof transformer.destroy === 'function') {
                transformer.destroy();
            }
        });

        const baseImage = MODEL_BASES[this.state.currentModel];
        
        modelBase.innerHTML = `
            <img src="${baseImage}" alt="Модель" class="model-base-image"
                 onerror="this.src='https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&auto=format&fit=crop'">
        `;

        clothingLayers.innerHTML = '';

        const layersOrder = ['tshirt', 'hoodie', 'sweater', 'jacket', 'pants', 'shoes', 'cap', 'accessory'];
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
                         onerror="this.src='${product.images[0]}'">
                `;
                clothingLayers.appendChild(layer);

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
        document.querySelectorAll('.cat-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        this.renderFittingProducts(category);
    }

    renderFittingProducts(category) {
        const container = document.getElementById('fittingProducts');
        if (!container) return;

        const products = this.state.products.filter(p => p.category === category);

        if (products.length === 0) {
            container.innerHTML = `
                <div class="fitting-empty" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(67, 97, 238, 0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px; color: var(--neon-pink);">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <h4 style="font-size: 18px; margin-bottom: 8px;">Нет товаров</h4>
                    <p style="color: var(--light-muted); font-size: 14px;">Добавьте товары в эту категорию</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const isSelected = this.state.currentOutfit[product.category]?.id === product.id;
            return `
                <div class="fitting-product ${isSelected ? 'selected' : ''}" 
                     onclick="app.addToFitting(${product.id})">
                    <img src="${product.images[0]}" 
                         alt="${product.name}"
                         onerror="this.src='https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=120&auto=format&fit=crop'">
                    <div style="margin-top: 8px;">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${product.name}</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--neon-pink);">${product.price.toLocaleString()} ₽</div>
                        ${isSelected ? '<div style="font-size: 12px; color: var(--neon-pink); margin-top: 4px;"><i class="fas fa-check-circle"></i> Выбрано</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    resetFitting() {
        this.state.currentOutfit = {
            tshirt: null,
            hoodie: null,
            sweater: null,
            jacket: null,
            cap: null,
            accessory: null,
            shoes: null,
            pants: null
        };
        
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

    // =================== УТИЛИТЫ ===================
    getCategoryName(category) {
        const names = {
            'all': 'Все товары',
            'new': 'Новинки',
            'tshirt': 'Футболки',
            'hoodie': 'Худи',
            'sweater': 'Кофты',
            'jacket': 'Куртки',
            'cap': 'Кепки',
            'accessory': 'Аксессуары',
            'shoes': 'Обувь',
            'pants': 'Штаны'
        };
        return names[category] || category;
    }

    updateCategoryCounts() {
        const categories = {
            'all': this.state.products.length,
            'new': this.state.products.filter(p => p.isNew).length,
            'tshirt': this.state.products.filter(p => p.category === 'tshirt').length,
            'hoodie': this.state.products.filter(p => p.category === 'hoodie').length,
            'sweater': this.state.products.filter(p => p.category === 'sweater').length,
            'jacket': this.state.products.filter(p => p.category === 'jacket').length,
            'cap': this.state.products.filter(p => p.category === 'cap').length,
            'accessory': this.state.products.filter(p => p.category === 'accessory').length,
            'shoes': this.state.products.filter(p => p.category === 'shoes').length,
            'pants': this.state.products.filter(p => p.category === 'pants').length
        };

        document.querySelectorAll('.cat-btn').forEach(btn => {
            const category = btn.dataset.category;
            const count = categories[category] || 0;
            const nameElement = btn.querySelector('.cat-text');
            if (nameElement) {
                const baseName = nameElement.textContent.split(' ')[0];
                nameElement.textContent = count > 0 ? `${baseName} (${count})` : baseName;
            }
        });
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
        document.getElementById('cartSidebar')?.classList.remove('hidden');
    }

    closeCart() {
        document.getElementById('cartSidebar')?.classList.add('hidden');
    }

    showFittingRoom() {
        this.showPanel('fittingRoom');
    }

    closeFittingRoom() {
        this.hidePanel('fittingRoom');
    }

    showMainApp() {
        this.hidePanel('fittingRoom');
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
    app = new StyleVaultApp();
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