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
            modelImages: ["https://i.imgur.com/y3QqP8c.png"],
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
                layer: "top-layer"
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
            modelImages: ["https://i.imgur.com/J5Qq3wR.png"],
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
                layer: "bottom-layer"
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
            modelImages: ["https://i.imgur.com/k5Qq9wS.png"],
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
                layer: "dress-layer"
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
            modelImages: ["https://i.imgur.com/m5Qq2wR.png"],
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
                layer: "shoes-layer"
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
            modelImages: ["https://i.imgur.com/n5Qq7wR.png"],
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
                layer: "top-layer"
            }
        }
    ],
    adminUsers: [447355860]
};

// УЛУЧШЕННАЯ 3D ПРИМЕРОЧНАЯ С АДАПТИВНЫМИ ТЕКСТУРАМИ
class ThreeJSFittingRoom {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.currentOutfit = {};
        this.isRotating = false;
        this.rotationSpeed = 0.01;
        this.textureLoader = new THREE.TextureLoader();
    }

    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        try {
            // Очищаем контейнер
            container.innerHTML = '';

            // Сцена
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x1e293b);

            // Камера
            this.camera = new THREE.PerspectiveCamera(45, 300/400, 0.1, 1000);
            this.camera.position.set(0, 1.2, 3.5);
            this.camera.lookAt(0, 1, 0);

            // Рендерер
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true 
            });
            this.renderer.setSize(300, 400);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(this.renderer.domElement);

            // Освещение
            this.setupLighting();

            // Создаем улучшенную модель человека
            this.createEnhancedModel();

            // Запускаем анимацию
            this.animate();

            console.log('Enhanced 3D Fitting Room initialized');

        } catch (error) {
            console.error('Error initializing 3D Fitting Room:', error);
            container.innerHTML = '<div class="loading-3d">Ошибка загрузки 3D</div>';
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(3, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-3, 5, -2);
        this.scene.add(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(0, 5, -5);
        this.scene.add(rimLight);
    }

    createEnhancedModel() {
        const group = new THREE.Group();

        // Тело (торс) - более анатомическая форма
        const bodyGroup = new THREE.Group();
        
        // Грудь/торс
        const torsoGeometry = new THREE.CylinderGeometry(0.22, 0.25, 0.6, 16);
        const torsoMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.9
        });
        const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
        torso.position.y = 0.9;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Таз
        const pelvisGeometry = new THREE.CylinderGeometry(0.25, 0.28, 0.2, 16);
        const pelvisMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.9
        });
        const pelvis = new THREE.Mesh(pelvisGeometry, pelvisMaterial);
        pelvis.position.y = 0.5;
        pelvis.castShadow = true;
        bodyGroup.add(pelvis);

        // Голова
        const headGeometry = new THREE.SphereGeometry(0.18, 32, 32);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.9
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        head.castShadow = true;
        bodyGroup.add(head);

        // Шея
        const neckGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8);
        const neckMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.9
        });
        const neck = new THREE.Mesh(neckGeometry, neckMaterial);
        neck.position.y = 1.35;
        neck.castShadow = true;
        bodyGroup.add(neck);

        // Ноги - более естественная форма
        const legGeometry = new THREE.CylinderGeometry(0.09, 0.07, 0.8, 12);
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.9
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.08, 0.1, 0);
        leftLeg.castShadow = true;
        bodyGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.08, 0.1, 0);
        rightLeg.castShadow = true;
        bodyGroup.add(rightLeg);

        // Руки - более естественная форма
        const armGeometry = new THREE.CylinderGeometry(0.06, 0.05, 0.7, 10);
        const armMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.9
        });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.28, 0.95, 0);
        leftArm.rotation.z = Math.PI / 5;
        leftArm.castShadow = true;
        bodyGroup.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.28, 0.95, 0);
        rightArm.rotation.z = -Math.PI / 5;
        rightArm.castShadow = true;
        bodyGroup.add(rightArm);

        group.add(bodyGroup);
        this.model = group;
        this.scene.add(group);
    }

    async addClothing(itemType, textureUrl, productName = '') {
        // Убираем старую одежду этого типа
        if (this.currentOutfit[itemType]) {
            this.scene.remove(this.currentOutfit[itemType]);
        }

        try {
            const texture = await this.loadTexture(textureUrl);
            const color = this.extractColorFromName(productName);
            
            let clothingMesh;

            switch(itemType) {
                case 'tops':
                    clothingMesh = this.createTopClothing(texture, color);
                    break;
                case 'bottoms':
                    clothingMesh = this.createBottomClothing(texture, color);
                    break;
                case 'dresses':
                    clothingMesh = this.createDressClothing(texture, color);
                    break;
                case 'shoes':
                    clothingMesh = this.createShoesClothing(texture, color);
                    break;
            }

            if (clothingMesh) {
                this.scene.add(clothingMesh);
                this.currentOutfit[itemType] = clothingMesh;
                console.log('Clothing added:', itemType, productName);
            }

        } catch (error) {
            console.error('Error adding clothing:', error);
            // Используем простой цвет если текстура не загрузилась
            this.addClothingWithColor(itemType, this.extractColorFromName(productName));
        }
    }

    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(url, resolve, undefined, reject);
        });
    }

    extractColorFromName(productName) {
        const name = productName.toLowerCase();
        
        if (name.includes('красн') || name.includes('red')) return 0xff0000;
        if (name.includes('син') || name.includes('blue')) return 0x0000ff;
        if (name.includes('зелен') || name.includes('green')) return 0x00ff00;
        if (name.includes('желт') || name.includes('yellow')) return 0xffff00;
        if (name.includes('розов') || name.includes('pink')) return 0xff69b4;
        if (name.includes('фиолетов') || name.includes('purple')) return 0x800080;
        if (name.includes('оранж') || name.includes('orange')) return 0xffa500;
        if (name.includes('черн') || name.includes('black')) return 0x000000;
        if (name.includes('сер') || name.includes('gray') || name.includes('grey')) return 0x808080;
        if (name.includes('бел') || name.includes('white')) return 0xffffff;
        if (name.includes('коричн') || name.includes('brown')) return 0x8b4513;
        
        return 0x666666; // нейтральный серый по умолчанию
    }

    createTopClothing(texture, color) {
        const group = new THREE.Group();

        // Основная часть футболки
        const shirtGeometry = new THREE.CylinderGeometry(0.23, 0.26, 0.5, 16);
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1.5, 1.5);
        }
        
        const shirtMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: color,
            transparent: true,
            opacity: 0.95
        });
        const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
        shirt.position.y = 1.05;
        shirt.castShadow = true;
        group.add(shirt);

        // Рукава
        const sleeveGeometry = new THREE.CylinderGeometry(0.065, 0.06, 0.3, 8);
        const sleeveMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: color,
            transparent: true,
            opacity: 0.95
        });
        
        const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        leftSleeve.position.set(-0.25, 1.0, 0);
        leftSleeve.rotation.z = Math.PI / 5;
        leftSleeve.castShadow = true;
        group.add(leftSleeve);

        const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
        rightSleeve.position.set(0.25, 1.0, 0);
        rightSleeve.rotation.z = -Math.PI / 5;
        rightSleeve.castShadow = true;
        group.add(rightSleeve);

        return group;
    }

    createBottomClothing(texture, color) {
        const pantsGeometry = new THREE.CylinderGeometry(0.27, 0.23, 0.6, 16);
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1.2, 1.5);
        }
        
        const pantsMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: color,
            transparent: true,
            opacity: 0.95
        });
        const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
        pants.position.y = 0.4;
        pants.castShadow = true;

        return pants;
    }

    createDressClothing(texture, color) {
        const dressGeometry = new THREE.CylinderGeometry(0.23, 0.4, 1.0, 16);
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1.3, 1.8);
        }
        
        const dressMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: color,
            transparent: true,
            opacity: 0.95
        });
        const dress = new THREE.Mesh(dressGeometry, dressMaterial);
        dress.position.y = 0.7;
        dress.castShadow = true;

        return dress;
    }

    createShoesClothing(texture, color) {
        const group = new THREE.Group();

        const shoeGeometry = new THREE.BoxGeometry(0.12, 0.05, 0.25);
        if (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);
        }
        
        const shoeMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            color: color,
            transparent: true,
            opacity: 0.95
        });
        
        const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        leftShoe.position.set(-0.08, -0.05, 0.08);
        leftShoe.rotation.x = -0.2;
        leftShoe.castShadow = true;
        group.add(leftShoe);

        const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
        rightShoe.position.set(0.08, -0.05, 0.08);
        rightShoe.rotation.x = -0.2;
        rightShoe.castShadow = true;
        group.add(rightShoe);

        return group;
    }

    addClothingWithColor(itemType, color) {
        let clothingMesh;

        switch(itemType) {
            case 'tops':
                clothingMesh = this.createTopClothing(null, color);
                break;
            case 'bottoms':
                clothingMesh = this.createBottomClothing(null, color);
                break;
            case 'dresses':
                clothingMesh = this.createDressClothing(null, color);
                break;
            case 'shoes':
                clothingMesh = this.createShoesClothing(null, color);
                break;
        }

        if (clothingMesh) {
            this.scene.add(clothingMesh);
            this.currentOutfit[itemType] = clothingMesh;
        }
    }

    toggleRotation() {
        this.isRotating = !this.isRotating;
        return this.isRotating;
    }

    reset() {
        // Убираем всю одежду
        Object.values(this.currentOutfit).forEach(item => {
            if (item instanceof THREE.Mesh || item instanceof THREE.Group) {
                this.scene.remove(item);
            }
        });
        this.currentOutfit = {};
        
        // Сбрасываем вращение модели
        if (this.model) {
            this.model.rotation.y = 0;
        }
        this.isRotating = false;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Вращение модели если включено
        if (this.isRotating && this.model) {
            this.model.rotation.y += this.rotationSpeed;
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    setSize(width, height) {
        if (this.renderer && this.camera) {
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
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
    },

    getSettings() {
        const stored = localStorage.getItem(this.KEYS.SETTINGS);
        return stored ? JSON.parse(stored) : {};
    },

    saveSettings(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
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

        this.threeFittingRoom = null;
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

        // 3D Примерочная
        const fittingBack = document.getElementById('fittingBack');
        const fittingProceed = document.getElementById('fittingProceed');
        const fittingBackToSelection = document.getElementById('fittingBackToSelection');
        const fittingReset = document.getElementById('fittingReset');
        const changeModel = document.getElementById('changeModel');
        const toggleRotation = document.getElementById('toggleRotation');
        const saveOutfit = document.getElementById('saveOutfit');
        
        if (fittingBack) fittingBack.addEventListener('click', () => this.closeFittingRoom());
        if (fittingProceed) fittingProceed.addEventListener('click', () => this.showFittingView());
        if (fittingBackToSelection) fittingBackToSelection.addEventListener('click', () => this.showFittingSelection());
        if (fittingReset) fittingReset.addEventListener('click', () => this.resetFitting());
        if (changeModel) changeModel.addEventListener('click', () => this.changeModel());
        if (toggleRotation) toggleRotation.addEventListener('click', () => this.toggleRotation());
        if (saveOutfit) saveOutfit.addEventListener('click', () => this.saveOutfit());

        // Табы в примерочной
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                console.log('Tab clicked:', category);
                this.setActiveFittingTab(category);
            });
        });

        // Админка
        const adminBtn = document.getElementById('adminBtn');
        const adminBack = document.getElementById('adminBack');
        const productForm = document.getElementById('productForm');
        
        if (adminBtn) adminBtn.addEventListener('click', () => this.showAdminPanel());
        if (adminBack) adminBack.addEventListener('click', () => this.hideAdminPanel());
        if (productForm) productForm.addEventListener('submit', (e) => this.addNewProduct(e));
        
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
                        <button onclick="app.openFittingRoom(${product.id})" 
                                style="padding: 15px; background: #f8fafc; color: #6366f1; border: 2px solid #6366f1; 
                                       border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer;
                                       transition: all 0.2s ease;"
                                onmouseover="this.style.background='#6366f1'; this.style.color='white'" 
                                onmouseout="this.style.background='#f8fafc'; this.style.color='#6366f1'">
                            👗 3D Примерка
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

    // 3D ПРИМЕРОЧНАЯ - ДВУХЭТАПНЫЙ ИНТЕРФЕЙС
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
                this.addToFitting(product);
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
        // Проверяем, есть ли выбранные вещи
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        if (!hasItems) {
            this.showAlert('Сначала выберите вещи для примерки!');
            return;
        }
        
        document.getElementById('fittingSelection').classList.add('hidden');
        document.getElementById('fittingView').classList.remove('hidden');
        
        // Инициализируем 3D сцену при первом показе
        setTimeout(() => {
            if (!this.threeFittingRoom) {
                this.threeFittingRoom = new ThreeJSFittingRoom();
                this.threeFittingRoom.init('model3dContainer');
            }
            this.applyOutfitTo3D();
        }, 100);
        
        this.renderOutfitItems();
    }

    addToFitting(product) {
        const category = product.fitting.type;
        console.log('Adding to fitting:', product.name, 'category:', category);
        
        // Для платьев снимаем верх и низ
        if (category === 'dresses') {
            this.state.currentOutfit.tops = null;
            this.state.currentOutfit.bottoms = null;
        }
        // Если добавляем верх или низ - снимаем платье
        else if (category === 'tops' || category === 'bottoms') {
            this.state.currentOutfit.dresses = null;
        }
        
        // Если уже есть вещь этой категории - заменяем, иначе добавляем
        this.state.currentOutfit[category] = product;
        
        this.renderSelectedItems();
        this.updateProceedButton();
        
        // Обновляем отображение товаров в активной вкладке
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.category;
        if (activeTab) {
            this.renderFittingProducts(activeTab);
        }
    }

    removeFromFitting(category) {
        this.state.currentOutfit[category] = null;
        this.renderSelectedItems();
        this.updateProceedButton();
        
        // Обновляем 3D сцену если она активна
        if (this.threeFittingRoom && document.getElementById('fittingView').classList.contains('hidden') === false) {
            this.threeFittingRoom.removeClothing(category);
        }
    }

    setActiveFittingTab(category) {
        console.log('Setting active tab:', category);
        
        // Обновляем активную вкладку
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        // Показываем соответствующий контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.category === category);
        });

        this.renderFittingProducts(category);
    }

    renderFittingProducts(category) {
        const container = document.getElementById(`fittingProducts-${category}`);
        if (!container) return;

        const products = this.state.products.filter(p => p.fitting.type === category);
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-fitting">
                    <p>Товары этой категории появятся скоро</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => {
            const isSelected = this.state.currentOutfit[category]?.id === product.id;
            
            return `
                <div class="fitting-product-card ${isSelected ? 'selected' : ''}" 
                     onclick="app.addToFitting(${product.id})">
                    <img src="${product.images[0]}" alt="${product.name}" 
                         class="fitting-product-image"
                         onerror="this.src='https://placehold.co/200x200/64748b/ffffff?text=Image+Error'">
                    <div class="fitting-product-info">
                        <h4 class="fitting-product-name">${product.name}</h4>
                        <p class="fitting-product-price">${product.price.toLocaleString()} ₽</p>
                        ${isSelected ? '<div class="selected-badge">✓ Выбрано</div>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderSelectedItems() {
        const container = document.getElementById('selectedItems');
        if (!container) return;

        const selectedItems = Object.entries(this.state.currentOutfit)
            .filter(([_, product]) => product !== null)
            .map(([category, product]) => ({
                category,
                product
            }));

        if (selectedItems.length === 0) {
            container.innerHTML = `
                <div class="no-selected-items">
                    <p>Выберите вещи для примерки</p>
                </div>
            `;
            return;
        }

        container.innerHTML = selectedItems.map(({ category, product }) => `
            <div class="selected-item">
                <img src="${product.images[0]}" alt="${product.name}" 
                     class="selected-item-image"
                     onerror="this.src='https://placehold.co/60x60/64748b/ffffff?text=Image+Error'">
                <div class="selected-item-info">
                    <span class="selected-item-name">${product.name}</span>
                    <span class="selected-item-category">${this.getCategoryName(category)}</span>
                </div>
                <button class="remove-selected-btn" 
                        onclick="app.removeFromFitting('${category}')">✕</button>
            </div>
        `).join('');
    }

    getCategoryName(category) {
        const names = {
            'tops': 'Верх',
            'bottoms': 'Низ', 
            'dresses': 'Платье',
            'shoes': 'Обувь'
        };
        return names[category] || category;
    }

    updateProceedButton() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        const proceedBtn = document.getElementById('fittingProceed');
        
        if (proceedBtn) {
            proceedBtn.disabled = !hasItems;
            proceedBtn.style.opacity = hasItems ? '1' : '0.5';
        }
    }

    applyOutfitTo3D() {
        if (!this.threeFittingRoom) return;

        // Сбрасываем текущий наряд
        this.threeFittingRoom.reset();

        // Добавляем каждую вещь в 3D сцену
        Object.entries(this.state.currentOutfit).forEach(([category, product]) => {
            if (product && product.modelImages && product.modelImages[0]) {
                this.threeFittingRoom.addClothing(
                    category, 
                    product.modelImages[0],
                    product.name
                );
            }
        });
    }

    resetFitting() {
        this.state.currentOutfit = {
            tops: null,
            bottoms: null,
            dresses: null, 
            shoes: null
        };
        
        this.renderSelectedItems();
        this.updateProceedButton();
        
        if (this.threeFittingRoom) {
            this.threeFittingRoom.reset();
        }
        
        // Возвращаем к выбору вещей
        this.showFittingSelection();
    }

    toggleRotation() {
        if (this.threeFittingRoom) {
            const isRotating = this.threeFittingRoom.toggleRotation();
            const rotationBtn = document.getElementById('toggleRotation');
            if (rotationBtn) {
                rotationBtn.textContent = isRotating ? '⏸️ Стоп' : '🔄 Вращение';
            }
        }
    }

    changeModel() {
        this.state.currentModel = this.state.currentModel === 'female' ? 'male' : 'female';
        
        // В реальном приложении здесь была бы смена 3D модели
        if (this.threeFittingRoom) {
            this.threeFittingRoom.reset();
            this.applyOutfitTo3D();
        }
        
        this.showAlert(`Модель изменена на: ${this.state.currentModel === 'female' ? 'Женская' : 'Мужская'}`);
    }

    saveOutfit() {
        const outfit = {
            items: this.state.currentOutfit,
            createdAt: new Date().toISOString(),
            total: Object.values(this.state.currentOutfit)
                .filter(item => item !== null)
                .reduce((sum, item) => sum + item.price, 0)
        };
        
        // Сохраняем в localStorage
        const savedOutfits = JSON.parse(localStorage.getItem('fashionhub_outfits') || '[]');
        savedOutfits.push(outfit);
        localStorage.setItem('fashionhub_outfits', JSON.stringify(savedOutfits));
        
        this.showAlert('Набор сохранен! 💾');
    }

    renderOutfitItems() {
        const container = document.getElementById('outfitItems');
        if (!container) return;

        const items = Object.values(this.state.currentOutfit).filter(item => item !== null);
        
        container.innerHTML = items.map(product => `
            <div class="outfit-item-card">
                <img src="${product.images[0]}" alt="${product.name}" 
                     class="outfit-item-image"
                     onerror="this.src='https://placehold.co/80x80/64748b/ffffff?text=Image+Error'">
                <div class="outfit-item-info">
                    <span class="outfit-item-name">${product.name}</span>
                    <span class="outfit-item-price">${product.price.toLocaleString()} ₽</span>
                </div>
            </div>
        `).join('');

        const total = items.reduce((sum, item) => sum + item.price, 0);
        const totalElement = document.getElementById('outfitTotal');
        if (totalElement) {
            totalElement.textContent = `Общая стоимость: ${total.toLocaleString()} ₽`;
        }
    }

    // АДМИН ПАНЕЛЬ
    showAdminPanel() {
        // Проверяем права администратора
        const userId = this.tg.initDataUnsafe.user?.id;
        if (!BASE_PRODUCTS.adminUsers.includes(userId)) {
            this.showAlert('У вас нет прав доступа к админ панели');
            return;
        }

        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        
        this.switchAdminTab('products');
        this.renderAdminProducts();
        this.renderAdminOrders();
    }

    hideAdminPanel() {
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
    }

    switchAdminTab(tabName) {
        // Обновляем активную вкладку
        document.querySelectorAll('.admin-tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Показываем соответствующий контент
        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
    }

    renderAdminProducts() {
        const container = document.getElementById('adminProductsList');
        if (!container) return;

        container.innerHTML = this.state.products.map(product => `
            <div class="admin-product-card">
                <img src="${product.images[0]}" alt="${product.name}" 
                     class="admin-product-image"
                     onerror="this.src='https://placehold.co/100x100/64748b/ffffff?text=Image+Error'">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p>${product.price.toLocaleString()} ₽ • ${this.getCategoryName(product.category)}</p>
                    <div class="admin-product-badges">
                        ${product.isNew ? '<span class="badge">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge">SALE</span>' : ''}
                        ${product.inStock ? '<span class="badge">В наличии</span>' : '<span class="badge">Нет в наличии</span>'}
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-small" onclick="app.editProduct(${product.id})">✏️</button>
                    <button class="btn-small btn-danger" onclick="app.deleteProduct(${product.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    renderAdminOrders() {
        const container = document.getElementById('adminOrdersList');
        if (!container) return;

        const orders = Storage.getOrders();
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="empty-text">Заказов пока нет</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="admin-order-card">
                <div class="order-header">
                    <h4>Заказ #${order.id}</h4>
                    <span class="order-status ${order.status}">${this.getOrderStatusText(order.status)}</span>
                </div>
                <div class="order-info">
                    <p><strong>Клиент:</strong> ${order.user?.first_name || 'Неизвестно'}</p>
                    <p><strong>Сумма:</strong> ${order.total.toLocaleString()} ₽</p>
                    <p><strong>Товаров:</strong> ${order.items.length} шт.</p>
                    <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="order-actions">
                    <select onchange="app.updateOrderStatus(${order.id}, this.value)" 
                            class="status-select">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    getOrderStatusText(status) {
        const statuses = {
            'new': 'Новый',
            'processing': 'В обработке', 
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return statuses[status] || status;
    }

    updateOrderStatus(orderId, status) {
        if (Storage.updateOrderStatus(orderId, status)) {
            this.showAlert(`Статус заказа #${orderId} обновлен`);
            this.renderAdminOrders();
        }
    }

    addNewProduct(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newProduct = {
            name: formData.get('productName'),
            description: formData.get('productDescription'),
            price: parseInt(formData.get('productPrice')),
            oldPrice: formData.get('productOldPrice') ? parseInt(formData.get('productOldPrice')) : null,
            category: formData.get('productCategory'),
            sizes: formData.get('productSizes').split(',').map(s => s.trim()),
            colors: formData.get('productColors').split(',').map(c => c.trim()),
            inStock: formData.get('productInStock') === 'true',
            isNew: formData.get('productIsNew') === 'true',
            isSale: formData.get('productIsSale') === 'true',
            isHot: formData.get('productIsHot') === 'true',
            tags: formData.get('productTags').split(',').map(t => t.trim()),
            material: formData.get('productMaterial'),
            care: formData.get('productCare'),
            images: ['https://placehold.co/400x500/64748b/ffffff?text=New+Product'], // временное изображение
            modelImages: ['https://placehold.co/400x500/64748b/ffffff?text=3D+Model'],
            fitting: {
                type: formData.get('productCategory'),
                layer: this.getLayerByCategory(formData.get('productCategory'))
            }
        };

        const product = Storage.addProduct(newProduct);
        this.state.products = Storage.getProducts();
        
        this.renderAdminProducts();
        this.showAlert(`Товар "${product.name}" добавлен!`);
        e.target.reset();
        this.removeImage();
        this.removeModelImage();
    }

    getLayerByCategory(category) {
        const layers = {
            'tops': 'top-layer',
            'bottoms': 'bottom-layer',
            'dresses': 'dress-layer', 
            'shoes': 'shoes-layer'
        };
        return layers[category] || 'top-layer';
    }

    editProduct(productId) {
        this.showAlert(`Редактирование товара #${productId} - в разработке`);
    }

    deleteProduct(productId) {
        if (confirm('Удалить этот товар?')) {
            this.state.products = Storage.deleteProduct(productId);
            this.renderAdminProducts();
            this.showAlert('Товар удален');
        }
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    showFittingRoom() {
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('fittingRoom').classList.remove('hidden');
    }

    closeFittingRoom() {
        document.getElementById('fittingRoom').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
    }

    showMainApp() {
        document.getElementById('fittingRoom').classList.add('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
    }

    toggleSearch() {
        const searchContainer = document.getElementById('searchContainer');
        if (searchContainer) {
            searchContainer.classList.toggle('active');
            
            const searchInput = document.getElementById('searchInput');
            if (searchContainer.classList.contains('active')) {
                setTimeout(() => searchInput?.focus(), 100);
            } else {
                this.handleSearch('');
            }
        }
    }

    openCart() {
        this.renderCartItems();
        document.getElementById('cartSidebar').classList.add('active');
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
    }

    showModal() {
        document.getElementById('productModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('productModal').classList.remove('active');
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const count = this.state.cart.length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateCategoryCounts() {
        const categories = ['all', 'tops', 'bottoms', 'dresses', 'shoes', 'new'];
        
        categories.forEach(category => {
            const btn = document.querySelector(`[data-category="${category}"]`);
            if (btn) {
                const count = this.getCategoryCount(category);
                let countElement = btn.querySelector('.category-count');
                
                if (!countElement) {
                    countElement = document.createElement('span');
                    countElement.className = 'category-count';
                    btn.appendChild(countElement);
                }
                
                countElement.textContent = count;
            }
        });
    }

    getCategoryCount(category) {
        switch(category) {
            case 'all': return this.state.products.length;
            case 'new': return this.state.products.filter(p => p.isNew).length;
            default: return this.state.products.filter(p => p.category === category).length;
        }
    }

    setupMainButton() {
        if (!this.tg?.MainButton) return;
        
        this.tg.MainButton.setText('Открыть каталог');
        this.tg.MainButton.onClick(() => {
            this.showMainApp();
        });
        this.tg.MainButton.show();
    }

    showAlert(message) {
        if (this.tg?.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', function() {
    app = new FashionApp();
});

// Глобальные функции для обработки событий в HTML
function removeImage() {
    app.removeImage();
}

function removeModelImage() {
    app.removeModelImage();
}
