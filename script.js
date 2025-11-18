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
                female: "https://placehold.co/300x500/8b5cf6/ffffff?text=Футболка+на+модели",
                male: "https://placehold.co/300x500/8b5cf6/ffffff?text=Футболка+на+модели"
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
                female: "https://placehold.co/300x500/06b6d4/ffffff?text=Джинсы+на+модели",
                male: "https://placehold.co/300x500/06b6d4/ffffff?text=Джинсы+на+модели"
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
            name: "Красное платье Миди",
            description: "Элегантное платье миди длины для особых случаев.",
            price: 5999,
            oldPrice: 6999,
            category: "dresses",
            images: ["https://placehold.co/400x500/dc2626/ffffff?text=Red+Dress"],
            modelImages: {
                female: "https://placehold.co/300x500/ec4899/ffffff?text=Платье+на+модели",
                male: "https://placehold.co/300x500/ec4899/ffffff?text=Платье+на+модели"
            },
            sizes: ["XS", "S", "M", "L"],
            colors: ["Красный", "Черный", "Синий"],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            tags: ["платье", "миди", "вечернее"],
            material: "Полиэстер",
            care: "Химчистка",
            fitting: {
                type: "dresses",
                layer: "dress"
            }
        },
        {
            id: 4,
            name: "Кроссовки Спортивные",
            description: "Удобные спортивные кроссовки для активного образа жизни.",
            price: 3999,
            oldPrice: null,
            category: "shoes",
            images: ["https://placehold.co/400x500/475569/ffffff?text=Sneakers"],
            modelImages: {
                female: "https://placehold.co/300x500/f59e0b/ffffff?text=Кроссовки+на+модели",
                male: "https://placehold.co/300x500/f59e0b/ffffff?text=Кроссовки+на+модели"
            },
            sizes: ["36", "37", "38", "39", "40", "41", "42"],
            colors: ["Белый", "Черный", "Серый"],
            inStock: true,
            isNew: false,
            isSale: false,
            isHot: true,
            tags: ["кроссовки", "спортивные", "повседневные"],
            material: "Текстиль, резина",
            care: "Мыть вручную",
            fitting: {
                type: "shoes",
                layer: "shoes"
            }
        }
    ],
    adminUsers: [447355860]
};

// Базовая модель
const MODEL_BASES = {
    female: "female.png",
    male: "male.png"
};

// Класс для трансформации одежды
class ClothingTransformer {
    constructor(layerType) {
        this.layerType = layerType;
        this.currentTransform = {
            scale: 1.0,
            translateX: 0,
            translateY: 0,
            rotation: 0
        };
        this.isDragging = false;
        this.isScaling = false;
        this.lastTouchDistance = 0;
        this.startX = 0;
        this.startY = 0;
        this.initialX = 0;
        this.initialY = 0;
    }

    initTransformControls(layerElement) {
        if (!layerElement) return;

        // Создаем контролы для трансформации
        const controls = document.createElement('div');
        controls.className = 'transform-controls';
        controls.innerHTML = `
            <div class="control-btn scale-up" title="Увеличить">➕</div>
            <div class="control-btn scale-down" title="Уменьшить">➖</div>
            <div class="control-btn rotate-left" title="Повернуть влево">↶</div>
            <div class="control-btn rotate-right" title="Повернуть вправо">↷</div>
            <div class="control-btn reset" title="Сбросить">🔄</div>
        `;

        layerElement.appendChild(controls);

        // Добавляем обработчики
        this.bindControlEvents(controls, layerElement);
        this.bindDragEvents(layerElement);
        this.bindScaleEvents(layerElement);
        
        // Добавляем класс для активации
        layerElement.classList.add('transformable');
    }

    bindControlEvents(controls, layerElement) {
        const image = layerElement.querySelector('.clothing-image');
        if (!image) return;

        controls.querySelector('.scale-up').addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentTransform.scale *= 1.2;
            this.applyTransform(image);
        });

        controls.querySelector('.scale-down').addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentTransform.scale /= 1.2;
            this.applyTransform(image);
        });

        controls.querySelector('.rotate-left').addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentTransform.rotation -= 15;
            this.applyTransform(image);
        });

        controls.querySelector('.rotate-right').addEventListener('click', (e) => {
            e.stopPropagation();
            this.currentTransform.rotation += 15;
            this.applyTransform(image);
        });

        controls.querySelector('.reset').addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetTransform(image);
        });
    }

    bindDragEvents(layerElement) {
        const image = layerElement.querySelector('.clothing-image');
        if (!image) return;

        const startDrag = (clientX, clientY) => {
            this.isDragging = true;
            this.startX = clientX;
            this.startY = clientY;
            this.initialX = this.currentTransform.translateX;
            this.initialY = this.currentTransform.translateY;
            image.style.cursor = 'grabbing';
            layerElement.classList.add('dragging');
        };

        const doDrag = (clientX, clientY) => {
            if (!this.isDragging) return;
            
            const dx = clientX - this.startX;
            const dy = clientY - this.startY;
            
            this.currentTransform.translateX = this.initialX + dx;
            this.currentTransform.translateY = this.initialY + dy;
            
            this.applyTransform(image);
        };

        const endDrag = () => {
            this.isDragging = false;
            image.style.cursor = 'grab';
            layerElement.classList.remove('dragging');
        };

        // Мышиные события
        image.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mousemove', (e) => {
            doDrag(e.clientX, e.clientY);
        });

        document.addEventListener('mouseup', endDrag);

        // Сенсорные события
        image.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                e.stopPropagation();
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isDragging) {
                e.preventDefault();
                doDrag(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        document.addEventListener('touchend', endDrag);
    }

    bindScaleEvents(layerElement) {
        const image = layerElement.querySelector('.clothing-image');
        if (!image) return;

        const handleTouchStart = (e) => {
            if (e.touches.length === 2) {
                this.isScaling = true;
                this.lastTouchDistance = this.getTouchDistance(e.touches);
                e.preventDefault();
            }
        };

        const handleTouchMove = (e) => {
            if (e.touches.length === 2 && this.isScaling) {
                const touchDistance = this.getTouchDistance(e.touches);
                const scaleChange = touchDistance / this.lastTouchDistance;
                
                this.currentTransform.scale *= scaleChange;
                this.applyTransform(image);
                
                this.lastTouchDistance = touchDistance;
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e) => {
            if (e.touches.length < 2) {
                this.isScaling = false;
            }
        };

        layerElement.addEventListener('touchstart', handleTouchStart);
        layerElement.addEventListener('touchmove', handleTouchMove);
        layerElement.addEventListener('touchend', handleTouchEnd);
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    applyTransform(image) {
        if (!image) return;

        // Ограничиваем масштаб
        this.currentTransform.scale = Math.max(0.3, Math.min(3, this.currentTransform.scale));
        
        // Ограничиваем перемещение
        const maxMove = 150;
        this.currentTransform.translateX = Math.max(-maxMove, Math.min(maxMove, this.currentTransform.translateX));
        this.currentTransform.translateY = Math.max(-maxMove, Math.min(maxMove, this.currentTransform.translateY));

        const transform = `
            translate(${this.currentTransform.translateX}px, ${this.currentTransform.translateY}px)
            scale(${this.currentTransform.scale})
            rotate(${this.currentTransform.rotation}deg)
        `;

        image.style.transform = transform;
        image.style.transformOrigin = 'center center';
    }

    resetTransform(image) {
        this.currentTransform = {
            scale: 1.0,
            translateX: 0,
            translateY: 0,
            rotation: 0
        };
        this.applyTransform(image);
    }

    getTransform() {
        return { ...this.currentTransform };
    }

    setTransform(transform) {
        this.currentTransform = { ...transform };
    }
}

// Улучшенный Canvas процессор для удаления фона
class AdvancedCanvasProcessor {
    constructor() {
        this.settings = {
            bgDetectionSensitivity: 0.1,
            colorTolerance: 55,
            edgeDetectionThreshold: 30,
            featherSize: 3,
            minObjectSize: 100
        };
    }

    // Основной метод удаления фона
    async removeBackground(imageFile) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    this.intelligentBackgroundRemoval(imageData);
                    this.featherEdges(imageData);
                    this.removeSmallArtifacts(imageData);
                    
                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(imageFile);
        });
    }

    // Интеллектуальное удаление фона
    intelligentBackgroundRemoval(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        const bgColors = this.analyzeBackgroundColors(imageData);
        const edgeMap = this.detectEdges(imageData);
        const visited = new Set();
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                
                if (visited.has(`${x},${y}`)) continue;
                
                const pixel = [data[index], data[index + 1], data[index + 2]];
                
                const isBackground = 
                    this.isBackgroundColor(pixel, bgColors) ||
                    this.isEdgeBackground(x, y, edgeMap, width, height) ||
                    this.isSmallIsland(x, y, imageData, visited);
                
                if (isBackground) {
                    data[index + 3] = 0;
                    visited.add(`${x},${y}`);
                }
            }
        }
    }

    // Анализ цветов фона
    analyzeBackgroundColors(imageData) {
        const strategies = [
            this.getCornerColors.bind(this),
            this.getEdgeColors.bind(this),
            this.getHistogramColors.bind(this)
        ];
        
        const allBgColors = [];
        
        for (const strategy of strategies) {
            const colors = strategy(imageData);
            allBgColors.push(...colors);
        }
        
        return this.averageColors(allBgColors);
    }

    // Анализ цветов в углах
    getCornerColors(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const corners = [
            [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
        ];
        
        const cornerColors = [];
        const sampleSize = 5;
        
        for (const [cx, cy] of corners) {
            const samples = [];
            for (let dy = -sampleSize; dy <= sampleSize; dy++) {
                for (let dx = -sampleSize; dx <= sampleSize; dx++) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (x >= 0 && x < width && y >= 0 && y < height) {
                        const index = (y * width + x) * 4;
                        samples.push([data[index], data[index + 1], data[index + 2]]);
                    }
                }
            }
            if (samples.length > 0) {
                cornerColors.push(this.averageColors(samples));
            }
        }
        
        return cornerColors;
    }

    // Анализ цветов по краям
    getEdgeColors(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const edgeSamples = [];
        const sampleDensity = Math.max(2, Math.floor(width * 0.02));
        
        for (let x = 0; x < width; x += sampleDensity) {
            let index = (0 * width + x) * 4;
            edgeSamples.push([data[index], data[index + 1], data[index + 2]]);
            
            index = ((height - 1) * width + x) * 4;
            edgeSamples.push([data[index], data[index + 1], data[index + 2]]);
        }
        
        for (let y = 0; y < height; y += sampleDensity) {
            let index = (y * width + 0) * 4;
            edgeSamples.push([data[index], data[index + 1], data[index + 2]]);
            
            index = (y * width + (width - 1)) * 4;
            edgeSamples.push([data[index], data[index + 1], data[index + 2]]);
        }
        
        return [this.averageColors(edgeSamples)];
    }

    // Анализ гистограммы цветов
    getHistogramColors(imageData) {
        const data = imageData.data;
        const colorCounts = new Map();
        
        for (let i = 0; i < data.length; i += 16) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const quantized = this.quantizeColor(r, g, b);
            const key = quantized.join(',');
            colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
        }
        
        const sortedColors = Array.from(colorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        
        return sortedColors.map(([key]) => key.split(',').map(Number));
    }

    quantizeColor(r, g, b, bins = 16) {
        return [
            Math.floor(r / bins) * bins,
            Math.floor(g / bins) * bins,
            Math.floor(b / bins) * bins
        ];
    }

    averageColors(colors) {
        if (colors.length === 0) return [255, 255, 255];
        
        const total = colors.reduce((acc, color) => {
            return [acc[0] + color[0], acc[1] + color[1], acc[2] + color[2]];
        }, [0, 0, 0]);
        
        return [
            Math.round(total[0] / colors.length),
            Math.round(total[1] / colors.length),
            Math.round(total[2] / colors.length)
        ];
    }

    isBackgroundColor(pixel, bgColors) {
        for (const bgColor of bgColors) {
            const distance = this.colorDistance(pixel, bgColor);
            if (distance < this.settings.colorTolerance) {
                return true;
            }
        }
        return false;
    }

    colorDistance(color1, color2) {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }

    // Обнаружение краев (алгоритм Собеля)
    detectEdges(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const edgeMap = new Array(width * height).fill(0);
        
        const kernelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        const kernelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
                        const luminance = this.getLuminance(
                            data[pixelIndex],
                            data[pixelIndex + 1],
                            data[pixelIndex + 2]
                        );
                        
                        gx += luminance * kernelX[ky + 1][kx + 1];
                        gy += luminance * kernelY[ky + 1][kx + 1];
                    }
                }
                
                const gradient = Math.sqrt(gx * gx + gy * gy);
                edgeMap[y * width + x] = gradient > this.settings.edgeDetectionThreshold ? 1 : 0;
            }
        }
        
        return edgeMap;
    }

    getLuminance(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    isEdgeBackground(x, y, edgeMap, width, height) {
        const index = y * width + x;
        return edgeMap[index] === 0 && this.isNearEdge(x, y, width, height);
    }

    isNearEdge(x, y, width, height) {
        const margin = Math.min(width, height) * this.settings.bgDetectionSensitivity;
        return x < margin || x > width - margin || y < margin || y > height - margin;
    }

    // Обнаружение маленьких островков
    isSmallIsland(startX, startY, imageData, visited) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const queue = [[startX, startY]];
        const islandPixels = [];
        
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            visited.add(key);
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            const index = (y * width + x) * 4;
            if (data[index + 3] === 0) continue;
            
            islandPixels.push([x, y]);
            
            if (islandPixels.length < this.settings.minObjectSize * 2) {
                queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
        
        return islandPixels.length < this.settings.minObjectSize;
    }

    // Сглаживание краев
    featherEdges(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const featherSize = this.settings.featherSize;
        
        for (let y = featherSize; y < height - featherSize; y++) {
            for (let x = featherSize; x < width - featherSize; x++) {
                const index = (y * width + x) * 4;
                const currentAlpha = data[index + 3];
                
                if (currentAlpha > 0 && currentAlpha < 255) {
                    let alphaSum = 0;
                    let count = 0;
                    
                    for (let dy = -featherSize; dy <= featherSize; dy++) {
                        for (let dx = -featherSize; dx <= featherSize; dx++) {
                            const neighborIndex = ((y + dy) * width + (x + dx)) * 4;
                            alphaSum += data[neighborIndex + 3];
                            count++;
                        }
                    }
                    
                    const averageAlpha = alphaSum / count;
                    data[index + 3] = Math.round(averageAlpha);
                }
            }
        }
    }

    // Удаление мелких артефактов
    removeSmallArtifacts(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = (y * width + x) * 4;
                
                if (data[index + 3] === 0) continue;
                
                const transparentNeighbors = this.countTransparentNeighbors(x, y, imageData);
                
                if (transparentNeighbors >= 6) {
                    data[index + 3] = 0;
                }
            }
        }
    }

    countTransparentNeighbors(x, y, imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const neighborIndex = (ny * width + nx) * 4;
                    if (data[neighborIndex + 3] === 0) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    }
}

// Хранилище
const Storage = {
    KEYS: {
        PRODUCTS: 'fashionhub_products',
        ORDERS: 'fashionhub_orders',
        CART: 'fashionhub_cart',
        FAVORITES: 'fashionhub_favorites',
        SETTINGS: 'fashionhub_settings',
        OUTFITS: 'fashionhub_outfits'
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
    },

    getOutfits() {
        try {
            const stored = localStorage.getItem(this.KEYS.OUTFITS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading outfits:', error);
            return [];
        }
    },

    saveOutfits(outfits) {
        try {
            localStorage.setItem(this.KEYS.OUTFITS, JSON.stringify(outfits));
        } catch (error) {
            console.error('Error saving outfits:', error);
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

        this.imageProcessor = new AdvancedCanvasProcessor();
        this.clothingTransformers = {};
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

    // Обработка изображений с улучшенным алгоритмом
    async processProductImages(mainImageFile, modelImageFile = null) {
        try {
            const [mainProcessed, modelProcessed] = await Promise.all([
                this.readFileAsDataURL(mainImageFile),
                modelImageFile ? this.imageProcessor.removeBackground(modelImageFile) : null
            ]);

            return {
                main: mainProcessed,
                model: modelProcessed || mainProcessed
            };
        } catch (error) {
            console.error('Image processing failed:', error);
            // Fallback на оригинальные изображения
            const mainFallback = await this.readFileAsDataURL(mainImageFile);
            return {
                main: mainFallback,
                model: mainFallback
            };
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
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

    // Добавление товара в примерку
    addToFitting(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product || !product.fitting) {
            console.error('Product not found:', productId);
            return;
        }

        const category = product.fitting.type;
        
        if (category === 'dresses') {
            this.state.currentOutfit.tops = null;
            this.state.currentOutfit.bottoms = null;
        }
        else if (category === 'tops' || category === 'bottoms') {
            this.state.currentOutfit.dresses = null;
        }
        
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

    // Обновление отображения модели с трансформациями
    updateModelView() {
        const modelBase = document.getElementById('modelBase');
        const clothingLayers = document.getElementById('clothingLayers');
        
        if (!modelBase || !clothingLayers) return;

        const baseImage = MODEL_BASES[this.state.currentModel];
        
        modelBase.innerHTML = `
            <img src="${baseImage}" alt="${this.state.currentModel === 'female' ? 'Женская модель' : 'Мужская модель'}" 
                 class="model-base-image"
                 onerror="this.handleModelImageError(this)">
        `;

        clothingLayers.innerHTML = '';

        const layersOrder = ['dresses', 'tops', 'bottoms', 'shoes'];
        this.clothingTransformers = {};
        
        layersOrder.forEach(layerType => {
            const product = this.state.currentOutfit[layerType];
            if (product) {
                const layer = document.createElement('div');
                layer.className = `clothing-layer ${layerType}-layer transformable`;
                
                const modelImage = this.getModelImage(product, layerType);
                
                layer.innerHTML = `
                    <img src="${modelImage}" 
                         alt="${product.name}" 
                         class="clothing-image ${layerType}-image"
                         onerror="app.handleClothingImageError(this, '${layerType}')">
                `;
                clothingLayers.appendChild(layer);

                // Инициализируем трансформатор для этого слоя
                this.clothingTransformers[layerType] = new ClothingTransformer(layerType);
                setTimeout(() => {
                    this.clothingTransformers[layerType].initTransformControls(layer);
                }, 100);
            }
        });
    }

    // Обработка ошибок загрузки модели
    handleModelImageError(imgElement) {
        console.log('Model image failed to load, using placeholder');
        const isFemale = this.state.currentModel === 'female';
        imgElement.src = isFemale 
            ? 'https://placehold.co/300x500/ffb6c1/ffffff?text=Женская+модель'
            : 'https://placehold.co/300x500/93c5fd/ffffff?text=Мужская+модель';
        imgElement.onerror = null;
    }

    // Обработка ошибок загрузки одежды
    handleClothingImageError(imgElement, layerType) {
        console.log('Clothing image failed to load, using placeholder');
        const color = this.getCategoryColor(layerType);
        const text = this.getCategoryText(layerType);
        const dimensions = this.getImageDimensions(layerType);
        
        imgElement.src = `https://placehold.co/${dimensions}/${color}/ffffff?text=${text}`;
        imgElement.onerror = null;
    }

    // Автоматическая адаптация изображений для примерочной
    getModelImage(product, layerType) {
        if (product.modelImages && product.modelImages[this.state.currentModel]) {
            return product.modelImages[this.state.currentModel];
        }
        
        return this.adaptImageForFitting(product.images[0], layerType);
    }

    // Адаптация обычного фото товара для примерочной
    adaptImageForFitting(imageUrl, layerType) {
        if (layerType === 'dresses') {
            return imageUrl;
        }
        
        const baseUrl = imageUrl.split('?')[0];
        const dimensions = this.getImageDimensions(layerType);
        
        if (imageUrl.includes('placehold.co')) {
            const color = this.getCategoryColor(layerType);
            const text = this.getCategoryText(layerType);
            return `https://placehold.co/${dimensions}/${color}/ffffff?text=${text}`;
        }
        
        return imageUrl;
    }

    getImageDimensions(layerType) {
        const dimensions = {
            'tops': '250x300',
            'bottoms': '250x200', 
            'dresses': '300x500',
            'shoes': '200x150'
        };
        return dimensions[layerType] || '300x300';
    }

    getCategoryColor(layerType) {
        const colors = {
            'tops': '8b5cf6',
            'bottoms': '06b6d4',
            'dresses': 'ec4899',
            'shoes': 'f59e0b'
        };
        return colors[layerType] || '64748b';
    }

    getCategoryText(layerType) {
        const texts = {
            'tops': 'Футболка+на+модели',
            'bottoms': 'Штаны+на+модели',
            'dresses': 'Платье+на+модели',
            'shoes': 'Обувь+на+модели'
        };
        return texts[layerType] || 'Одежда+на+модели';
    }

    // Смена модели
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
        this.state.currentOutfit = {
            tops: null,
            bottoms: null,
            dresses: null,
            shoes: null
        };
        
        // Сбрасываем трансформации
        Object.values(this.clothingTransformers || {}).forEach(transformer => {
            transformer.resetTransform();
        });
        
        this.renderSelectedItems();
        this.renderOutfitItems();
        this.updateProceedButton();
        this.updateModelView();
        
        this.showAlert('Примерка сброшена');
    }

    // Сохранение образа с трансформациями
    saveOutfit() {
        const hasItems = Object.values(this.state.currentOutfit).some(item => item !== null);
        
        if (!hasItems) {
            this.showAlert('Добавьте товары для сохранения образа');
            return;
        }

        // Собираем трансформации
        const transformations = {};
        Object.keys(this.clothingTransformers || {}).forEach(layerType => {
            if (this.clothingTransformers[layerType]) {
                transformations[layerType] = this.clothingTransformers[layerType].getTransform();
            }
        });

        const savedOutfits = Storage.getOutfits();
        const newOutfit = {
            id: Date.now(),
            outfit: { ...this.state.currentOutfit },
            transformations: transformations,
            model: this.state.currentModel,
            createdAt: new Date().toISOString()
        };
        
        savedOutfits.push(newOutfit);
        Storage.saveOutfits(savedOutfits);
        
        this.showAlert('Образ сохранен с трансформациями!');
    }

    // Загрузка сохраненного образа
    loadSavedOutfit(outfitId) {
        const savedOutfits = Storage.getOutfits();
        const outfit = savedOutfits.find(o => o.id === outfitId);
        
        if (outfit) {
            this.state.currentOutfit = { ...outfit.outfit };
            this.state.currentModel = outfit.model;
            
            // Восстанавливаем трансформации
            this.updateModelView();
            setTimeout(() => {
                Object.keys(outfit.transformations || {}).forEach(layerType => {
                    if (this.clothingTransformers[layerType]) {
                        this.clothingTransformers[layerType].setTransform(outfit.transformations[layerType]);
                        const image = document.querySelector(`.${layerType}-layer .clothing-image`);
                        if (image) {
                            this.clothingTransformers[layerType].applyTransform(image);
                        }
                    }
                });
            }, 200);
            
            this.showAlert('Образ загружен!');
        }
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

        // Показываем индикатор обработки
        this.showProcessingIndicator();

        this.processProductImages(mainImageFile, modelImageFile)
            .then(({ main, model }) => {
                const product = {
                    id: Date.now(),
                    name: document.getElementById('productName').value,
                    description: document.getElementById('productDescription').value,
                    price: parseInt(document.getElementById('productPrice').value),
                    oldPrice: document.getElementById('productOldPrice').value ? 
                        parseInt(document.getElementById('productOldPrice').value) : null,
                    category: document.getElementById('productCategory').value,
                    images: [main],
                    modelImages: this.createModelImages(main, model, document.getElementById('productCategory').value),
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
                this.hideProcessingIndicator();
                this.showAlert('Товар успешно добавлен! Фон автоматически обработан для примерочной!');
                
                e.target.reset();
                this.removeImage();
                this.removeModelImage();
            })
            .catch(error => {
                this.hideProcessingIndicator();
                this.showAlert('Ошибка при добавлении товара: ' + error.message);
            });
    }

    // Создание изображений для примерочной
    createModelImages(mainImage, customModelImage, category) {
        if (customModelImage) {
            return {
                female: customModelImage,
                male: customModelImage
            };
        }
        
        return {
            female: mainImage,
            male: mainImage
        };
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

    // Индикатор обработки
    showProcessingIndicator() {
        const overlay = document.createElement('div');
        overlay.className = 'processing-overlay';
        overlay.innerHTML = `
            <div class="processing-content">
                <div class="processing-spinner"></div>
                <div class="processing-text">Обрабатываем изображение...</div>
                <div class="processing-subtext">Удаляем фон и оптимизируем для примерочной</div>
            </div>
        `;
        overlay.id = 'processingOverlay';
        document.body.appendChild(overlay);
    }

    hideProcessingIndicator() {
        const overlay = document.getElementById('processingOverlay');
        if (overlay) {
            overlay.remove();
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
