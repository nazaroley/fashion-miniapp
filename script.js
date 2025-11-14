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
            modelImages: ["https://placehold.co/300x400/ffffff/333333?text=T-Shirt+Texture"],
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
            modelImages: ["https://placehold.co/300x400/1e3a8a/ffffff?text=Jeans+Texture"],
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
            modelImages: ["https://placehold.co/300x400/dc2626/ffffff?text=Dress+Texture"],
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
            name: "Кроссовки спортивные",
            description: "Удобные кроссовки для повседневной носки и занятий спортом.",
            price: 5999,
            oldPrice: 6999,
            category: "shoes",
            images: ["https://placehold.co/400x500/000000/ffffff?text=Sports+Shoes"],
            modelImages: ["https://placehold.co/300x400/000000/ffffff?text=Shoes+Texture"],
            sizes: ["38", "39", "40", "41", "42", "43"],
            colors: ["Черный", "Белый", "Серый"],
            inStock: true,
            isNew: true,
            isSale: false,
            isHot: true,
            tags: ["спортивные", "удобные", "повседневные"],
            material: "Текстиль, синтетика",
            care: "Протирать влажной тканью",
            fitting: {
                type: "shoes",
                layer: "shoes-layer"
            }
        }
    ],
    adminUsers: [447355860]
};

// 3D Примерочная
class ThreeJSFittingRoom {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.currentOutfit = {};
        this.isRotating = false;
        this.rotationSpeed = 0.01;
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
            this.camera.position.set(0, 1.5, 4);

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

            // Создаем базовую модель человека
            this.createBaseModel();

            // Запускаем анимацию
            this.animate();

            console.log('3D Fitting Room initialized successfully');

        } catch (error) {
            console.error('Error initializing 3D Fitting Room:', error);
            container.innerHTML = '<div class="loading-3d">Ошибка загрузки 3D</div>';
        }
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);
    }

    createBaseModel() {
        const group = new THREE.Group();

        // Голова
        const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.6;
        head.castShadow = true;
        group.add(head);

        // Тело
        const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 32);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x64748b,
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);

        // Ноги
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 32);
        const legMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x475569,
            transparent: true,
            opacity: 0.8
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1, 0.2, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.1, 0.2, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);

        // Руки
        const armGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 32);
        const armMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffdbac,
            transparent: true,
            opacity: 0.8
        });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.3, 1.0, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.3, 1.0, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        group.add(rightArm);

        this.scene.add(group);
        this.model = group;
    }

    addClothing(itemType, textureUrl, color = 0xffffff) {
        // Убираем старую одежду этого типа
        if (this.currentOutfit[itemType]) {
            this.scene.remove(this.currentOutfit[itemType]);
        }

        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(textureUrl, (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(1, 1);

            let geometry, material, mesh;

            switch(itemType) {
                case 'tops':
                    geometry = new THREE.CylinderGeometry(0.28, 0.32, 0.7, 32);
                    material = new THREE.MeshLambertMaterial({ 
                        map: texture,
                        color: color
                    });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.y = 1.1;
                    break;

                case 'bottoms':
                    geometry = new THREE.CylinderGeometry(0.32, 0.25, 0.6, 32);
                    material = new THREE.MeshLambertMaterial({ 
                        map: texture,
                        color: color
                    });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.y = 0.5;
                    break;

                case 'dresses':
                    geometry = new THREE.CylinderGeometry(0.28, 0.45, 1.0, 32);
                    material = new THREE.MeshLambertMaterial({ 
                        map: texture,
                        color: color
                    });
                    mesh = new THREE.Mesh(geometry, material);
                    mesh.position.y = 0.8;
                    break;

                case 'shoes':
                    // Простая обувь как боксы у ног
                    const shoeGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.3);
                    material = new THREE.MeshLambertMaterial({ 
                        map: texture,
                        color: color
                    });
                    
                    mesh = new THREE.Group();
                    
                    const leftShoe = new THREE.Mesh(shoeGeometry, material);
                    leftShoe.position.set(-0.1, 0.0, 0.1);
                    leftShoe.castShadow = true;
                    mesh.add(leftShoe);

                    const rightShoe = new THREE.Mesh(shoeGeometry, material);
                    rightShoe.position.set(0.1, 0.0, 0.1);
                    rightShoe.castShadow = true;
                    mesh.add(rightShoe);
                    break;
            }

            if (mesh) {
                mesh.castShadow = true;
                this.scene.add(mesh);
                this.currentOutfit[itemType] = mesh;
                console.log('Clothing added:', itemType);
            }
        }, undefined, (error) => {
            console.error('Error loading texture:', error);
            // Используем простой цвет если текстура не загрузилась
            this.addClothingWithColor(itemType, color);
        });
    }

    addClothingWithColor(itemType, color) {
        let geometry, mesh;

        switch(itemType) {
            case 'tops':
                geometry = new THREE.CylinderGeometry(0.28, 0.32, 0.7, 32);
                break;
            case 'bottoms':
                geometry = new THREE.CylinderGeometry(0.32, 0.25, 0.6, 32);
                break;
            case 'dresses':
                geometry = new THREE.CylinderGeometry(0.28, 0.45, 1.0, 32);
                break;
            case 'shoes':
                const shoeGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.3);
                mesh = new THREE.Group();
                
                const leftShoe = new THREE.Mesh(shoeGeometry, new THREE.MeshLambertMaterial({ color: color }));
                leftShoe.position.set(-0.1, 0.0, 0.1);
                mesh.add(leftShoe);

                const rightShoe = new THREE.Mesh(shoeGeometry, new THREE.MeshLambertMaterial({ color: color }));
                rightShoe.position.set(0.1, 0.0, 0.1);
                mesh.add(rightShoe);
                break;
        }

        if (mesh) {
            mesh.castShadow = true;
            this.scene.add(mesh);
            this.currentOutfit[itemType] = mesh;
        } else if (geometry) {
            mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
            mesh.castShadow = true;
            
            switch(itemType) {
                case 'tops':
                    mesh.position.y = 1.1;
                    break;
                case 'bottoms':
                    mesh.position.y = 0.5;
                    break;
                case 'dresses':
                    mesh.position.y = 0.8;
                    break;
            }
            
            this.scene.add(mesh);
            this.currentOutfit[itemType] = mesh;
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
        
        console.log('3D Fitting Room reset');
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

// Хранилище (без изменений)
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
                top: null,
                bottom: null,
                dress: null,
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
        const fittingReset = document.getElementById('fittingReset');
        const changeModel = document.getElementById('changeModel');
        const toggleRotation = document.getElementById('toggleRotation');
        const saveOutfit = document.getElementById('saveOutfit');
        
        if (fittingBack) fittingBack.addEventListener('click', () => this.closeFittingRoom());
        if (fittingReset) fittingReset.addEventListener('click', () => this.resetFitting());
        if (changeModel) changeModel.addEventListener('click', () => this.changeModel());
        if (toggleRotation) toggleRotation.addEventListener('click', () => this.toggleRotation());
        if (saveOutfit) saveOutfit.addEventListener('click', () => this.saveOutfit());

        // Табы в примерочной
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFittingTabChange(e.target.dataset.category);
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

    // 3D ПРИМЕРОЧНАЯ - ОСНОВНЫЕ МЕТОДЫ
    openFittingRoom(productId = null) {
        this.showFittingRoom();
        
        // Инициализируем 3D сцену
        setTimeout(() => {
            if (!this.threeFittingRoom) {
                this.threeFittingRoom = new ThreeJSFittingRoom();
                this.threeFittingRoom.init('model3dContainer');
            }
        }, 100);

        // Устанавливаем первую активную вкладку
        this.setActiveFittingTab('tops');
        
        // Если передан товар, примеряем его
        if (productId) {
            const product = this.state.products.find(p => p.id === productId);
            if (product && product.modelImages && product.modelImages.length > 0) {
                setTimeout(() => {
                    this.tryOnProduct(product);
                }, 500);
            }
        }
    }

    setActiveFittingTab(category) {
        // Обновляем кнопки табов
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        // Рендерим товары для выбранной категории
        this.renderFittingProducts(category);
    }

    renderFittingProducts(category) {
        const container = document.getElementById('fittingProducts');
        if (!container) return;

        const products = this.state.products.filter(p => 
            p.fitting?.type === category && 
            p.modelImages && 
            p.modelImages.length > 0
        );

        // Очищаем контейнер
        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div class="fitting-empty" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                    <div class="empty-icon">👗</div>
                    <h3 style="margin: 10px 0; color: var(--text);">Нет товаров для примерки</h3>
                    <p style="color: var(--text-light);">Добавьте товары с фото на модели</p>
                </div>
            `;
            return;
        }

        // Создаем сетку товаров
        container.innerHTML = products.map(product => {
            const isActive = this.state.currentOutfit[product.category]?.id === product.id;
            return `
                <div class="fitting-product ${isActive ? 'active' : ''}" 
                     onclick="app.tryOnProduct(${product.id})">
                    <img src="${product.images[0]}" alt="${product.name}" 
                         onerror="this.src='https://placehold.co/150x150/64748b/ffffff?text=Image+Error'">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} ₽</div>
                </div>
            `;
        }).join('');
    }

    tryOnProduct(productId) {
        const product = typeof productId === 'number' 
            ? this.state.products.find(p => p.id === productId)
            : productId;

        if (!product || !product.fitting || !this.threeFittingRoom) {
            console.log('Product or 3D room not ready');
            return;
        }

        const category = product.fitting.type;
        const textureUrl = product.modelImages[0];
        
        // Определяем цвет на основе названия товара
        let color = 0xffffff; // белый по умолчанию
        if (product.name.includes('красн') || product.name.includes('red')) color = 0xff0000;
        if (product.name.includes('син') || product.name.includes('blue')) color = 0x0000ff;
        if (product.name.includes('зелен') || product.name.includes('green')) color = 0x00ff00;
        if (product.name.includes('черн') || product.name.includes('black')) color = 0x000000;
        
        // Применяем одежду в 3D
        this.threeFittingRoom.addClothing(category, textureUrl, color);
        
        // Обновляем состояние
        this.state.currentOutfit[category] = product;
        
        // Обновляем активные состояния в текущей вкладке
        this.renderFittingProducts(category);
        
        console.log('3D clothing applied:', product.name);
    }

    toggleRotation() {
        if (this.threeFittingRoom) {
            const isRotating = this.threeFittingRoom.toggleRotation();
            const button = document.getElementById('toggleRotation');
            if (button) {
                button.textContent = isRotating ? '⏹️ Стоп' : '🔄 Вращение';
                button.classList.toggle('active', isRotating);
            }
        }
    }

    resetFitting() {
        if (this.threeFittingRoom) {
            this.threeFittingRoom.reset();
        }

        // Сбрасываем состояние
        this.state.currentOutfit = {
            top: null,
            bottom: null,
            dress: null,
            shoes: null
        };

        // Обновляем список товаров в активной вкладке
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            this.renderFittingProducts(activeTab.dataset.category);
        }

        // Сбрасываем кнопку вращения
        const rotationButton = document.getElementById('toggleRotation');
        if (rotationButton) {
            rotationButton.textContent = '🔄 Вращение';
            rotationButton.classList.remove('active');
        }
    }

    changeModel() {
        // В упрощенной версии просто меняем цвет кожи модели
        if (this.threeFittingRoom && this.threeFittingRoom.model) {
            const skinColors = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524];
            const randomColor = skinColors[Math.floor(Math.random() * skinColors.length)];
            
            this.threeFittingRoom.model.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material.color.setHex(randomColor);
                }
            });
        }
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
        
        this.showAlert('3D образ сохранен! Вы можете поделиться им с друзьями.');
    }

    handleFittingTabChange(category) {
        this.setActiveFittingTab(category);
    }

    // Админка (без изменений)
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
                    <button class="btn-small btn-danger" onclick="app.deleteProduct(${product.id})">
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
                modelImages: modelImageData ? [modelImageData] : [],
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
            'tops': { type: 'tops', layer: 'top-layer' },
            'bottoms': { type: 'bottoms', layer: 'bottom-layer' },
            'dresses': { type: 'dresses', layer: 'dress-layer' },
            'shoes': { type: 'shoes', layer: 'shoes-layer' }
        };
        return configs[category] || { type: category, layer: category + '-layer' };
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new FashionApp();
    });
} else {
    app = new FashionApp();
}

window.app = app;
