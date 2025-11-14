// Базовые данные товаров
const BASE_PRODUCTS = {
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
        }
    ],

    categories: [
        { id: "all", name: "Все товары", count: 0 },
        { id: "new", name: "Новинки", count: 0 },
        { id: "tops", name: "Верхняя одежда", count: 0 },
        { id: "bottoms", name: "Брюки и юбки", count: 0 },
        { id: "dresses", name: "Платья", count: 0 },
        { id: "outerwear", name: "Верхняя одежда", count: 0 },
        { id: "shoes", name: "Обувь", count: 0 },
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
    ],

    // ID администраторов (замените на ваши Telegram ID)
    adminUsers: [123456789, 987654321]
};
