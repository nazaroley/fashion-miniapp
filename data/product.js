// Данные товаров магазина
const PRODUCTS_DATA = {
    products: [
        {
            id: 1,
            name: "Белая футболка Oversize",
            description: "Стильная футболка oversize из премиального хлопка. Идеальна для повседневной носки.",
            price: 2499,
            oldPrice: 2999,
            category: "tops",
            subcategory: "t-shirts",
            sizes: ["XS", "S", "M", "L", "XL"],
            colors: ["Белый", "Черный", "Серый"],
            images: [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300"
            ],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            tags: ["oversize", "хлопок", "повседневная"],
            material: "100% хлопок",
            care: "Машинная стирка при 30°C",
            fitting: {
                type: "top",
                position: { x: 50, y: 30, scale: 0.8 },
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
            subcategory: "jeans",
            sizes: ["28", "30", "32", "34", "36"],
            colors: ["Синий", "Черный", "Светло-синий"],
            images: [
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=300"
            ],
            inStock: true,
            isNew: false,
            isSale: false,
            isHot: true,
            tags: ["slim fit", "джинсы", "базовые"],
            material: "98% хлопок, 2% эластан",
            care: "Машинная стирка при 30°C",
            fitting: {
                type: "bottom",
                position: { x: 50, y: 60, scale: 0.9 },
                layer: "bottom-layer"
            }
        },
        {
            id: 3,
            name: "Черное платье Миди",
            description: "Элегантное черное платье миди длины. Идеально для вечера и особых случаев.",
            price: 5999,
            oldPrice: 6999,
            category: "dresses",
            subcategory: "midi",
            sizes: ["XS", "S", "M", "L"],
            colors: ["Черный", "Бордовый", "Темно-синий"],
            images: [
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
            ],
            inStock: true,
            isNew: true,
            isSale: true,
            isHot: false,
            tags: ["вечернее", "элегантное", "миди"],
            material: "Вискоза, полиэстер",
            care: "Химчистка",
            fitting: {
                type: "dress",
                position: { x: 50, y: 20, scale: 0.85 },
                layer: "dress-layer"
            }
        },
        {
            id: 4,
            name: "Кожаная куртка",
            description: "Стильная кожаная куртка премиального качества. Настоящая кожа.",
            price: 12999,
            oldPrice: 14999,
            category: "outerwear",
            subcategory: "jackets",
            sizes: ["S", "M", "L", "XL"],
            colors: ["Черный", "Коричневый", "Бордовый"],
            images: [
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
            ],
            inStock: true,
            isNew: false,
            isSale: true,
            isHot: true,
            tags: ["кожа", "куртка", "премиум"],
            material: "100% натуральная кожа",
            care: "Профессиональная чистка",
            fitting: {
                type: "top",
                position: { x: 50, y: 25, scale: 0.9 },
                layer: "top-layer"
            }
        },
        {
            id: 5,
            name: "Бежевые брюки-карго",
            description: "Современные брюки карго с удобными карманами. Универсальный бежевый цвет.",
            price: 3899,
            oldPrice: null,
            category: "bottoms",
            subcategory: "pants",
            sizes: ["XS", "S", "M", "L", "XL"],
            colors: ["Бежевый", "Оливковый", "Черный"],
            images: [
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1595956553066-9c6a6e6eeb35?w=300"
            ],
            inStock: true,
            isNew: true,
            isSale: false,
            isHot: false,
            tags: ["карго", "повседневные", "универсальные"],
            material: "Хлопок, полиэстер",
            care: "Машинная стирка при 30°C",
            fitting: {
                type: "bottom",
                position: { x: 50, y: 65, scale: 0.85 },
                layer: "bottom-layer"
            }
        },
        {
            id: 6,
            name: "Кроссовки White Sport",
            description: "Стильные белые кроссовки для повседневной носки. Комфорт и стиль.",
            price: 5599,
            oldPrice: 6999,
            category: "shoes",
            subcategory: "sneakers",
            sizes: ["36", "37", "38", "39", "40", "41", "42"],
            colors: ["Белый", "Черный", "Серый"],
            images: [
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300"
            ],
            inStock: true,
            isNew: false,
            isSale: true,
            isHot: true,
            tags: ["кроссовки", "спорт", "повседневные"],
            material: "Кожа, текстиль",
            care: "Влажная чистка",
            fitting: {
                type: "shoes",
                position: { x: 50, y: 85, scale: 0.4 },
                layer: "shoes-layer"
            }
        },
        {
            id: 7,
            name: "Красное платье Мини",
            description: "Яркое красное платье мини длины. Для смелых и уверенных в себе.",
            price: 4299,
            oldPrice: null,
            category: "dresses",
            subcategory: "mini",
            sizes: ["XS", "S", "M"],
            colors: ["Красный", "Розовый", "Черный"],
            images: [
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300"
            ],
            inStock: true,
            isNew: true,
            isSale: false,
            isHot: true,
            tags: ["мини", "вечернее", "яркое"],
            material: "Атлас, полиэстер",
            care: "Ручная стирка",
            fitting: {
                type: "dress",
                position: { x: 50, y: 25, scale: 0.8 },
                layer: "dress-layer"
            }
        },
        {
            id: 8,
            name: "Шерстяной свитер",
            description: "Теплый шерстяной свитер с высоким горлом. Идеален для холодной погоды.",
            price: 3299,
            oldPrice: 3999,
            category: "tops",
            subcategory: "sweaters",
            sizes: ["S", "M", "L", "XL"],
            colors: ["Серый", "Бежевый", "Бордовый"],
            images: [
                "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400"
            ],
            modelImages: [
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300"
            ],
            inStock: true,
            isNew: false,
            isSale: true,
            isHot: false,
            tags: ["шерсть", "зима",уютный"],
            material: "80% шерсть, 20% акрил",
            care: "Ручная стирка",
            fitting: {
                type: "top",
                position: { x: 50, y: 30, scale: 0.85 },
                layer: "top-layer"
            }
        }
    ],

    categories: [
        { id: "all", name: "Все товары", count: 8 },
        { id: "new", name: "Новинки", count: 4 },
        { id: "tops", name: "Верхняя одежда", count: 3 },
        { id: "bottoms", name: "Брюки и юбки", count: 2 },
        { id: "dresses", name: "Платья", count: 2 },
        { id: "outerwear", name: "Верхняя одежда", count: 1 },
        { id: "shoes", name: "Обувь", count: 1 },
        { id: "accessories", name: "Аксессуары", count: 0 }
    ],

    models: [
        {
            id: "female",
            name: "Женская модель",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
            baseImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
        },
        {
            id: "male", 
            name: "Мужская модель",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
            baseImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
        }
    ]
};

// Функции для работы с данными
const ProductsAPI = {
    // Получить все товары
    getAllProducts() {
        return PRODUCTS_DATA.products;
    },

    // Получить товары по категории
    getProductsByCategory(category) {
        if (category === 'all') {
            return this.getAllProducts();
        }
        if (category === 'new') {
            return this.getAllProducts().filter(product => product.isNew);
        }
        return this.getAllProducts().filter(product => product.category === category);
    },

    // Поиск товаров
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllProducts().filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.description.toLowerCase().includes(lowerQuery) ||
            product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },

    // Получить товар по ID
    getProductById(id) {
        return this.getAllProducts().find(product => product.id === id);
    },

    // Получить товары для примерки по категории
    getFittingProducts(category) {
        return this.getAllProducts().filter(product => 
            product.fitting && product.fitting.type === category
        );
    },

    // Получить категории
    getCategories() {
        return PRODUCTS_DATA.categories;
    },

    // Получить модели для примерки
    getModels() {
        return PRODUCTS_DATA.models;
    }
};
