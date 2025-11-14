// admin.js - добавьте проверку
console.log('Admin loading, BASE_PRODUCTS:', typeof BASE_PRODUCTS);

if (typeof BASE_PRODUCTS === 'undefined') {
    console.error('BASE_PRODUCTS не доступен в admin.js');
    // Защитная логика
    this.isAdmin = false;
    return;
}
// Админ-функции
class AdminPanel {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAdminAccess();
    }

    // Проверка доступа администратора
    checkAdminAccess() {
        const tg = this.app.tg;
        if (tg && tg.initDataUnsafe) {
            const userId = tg.initDataUnsafe.user?.id;
            if (userId && BASE_PRODUCTS.adminUsers.includes(userId)) {
                document.getElementById('adminBtn').classList.remove('hidden');
                this.isAdmin = true;
            }
        }
    }

    bindEvents() {
        // Кнопка админ-панели
        document.getElementById('adminBtn').addEventListener('click', () => {
            this.showAdminPanel();
        });

        // Назад из админки
        document.getElementById('adminBack').addEventListener('click', () => {
            this.hideAdminPanel();
        });

        // Табы админки
        document.querySelectorAll('.admin-tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.dataset.tab);
            });
        });

        // Форма добавления товара
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewProduct();
        });
    }

    showAdminPanel() {
        document.getElementById('adminPanel').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
        this.loadAdminProducts();
        this.loadOrders();
    }

    hideAdminPanel() {
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }

    switchAdminTab(tabName) {
        // Скрыть все табы
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Показать выбранный таб
        document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Загрузить данные если нужно
        if (tabName === 'products') {
            this.loadAdminProducts();
        } else if (tabName === 'orders') {
            this.loadOrders();
        }
    }

    // Загрузка товаров для админки
    loadAdminProducts() {
        const products = Storage.getProducts();
        const container = document.getElementById('adminProductsList');

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-admin">
                    <p>Нет товаров</p>
                    <button class="btn-primary" onclick="app.admin.switchAdminTab('add')">Добавить первый товар</button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-card">
                <img src="${product.images[0]}" alt="${product.name}" class="admin-product-image">
                <div class="admin-product-info">
                    <h4>${product.name}</h4>
                    <p class="admin-product-price">${product.price} ₽</p>
                    <p class="admin-product-category">${this.getCategoryName(product.category)}</p>
                    <div class="admin-product-badges">
                        ${product.isNew ? '<span class="badge new">NEW</span>' : ''}
                        ${product.isSale ? '<span class="badge sale">SALE</span>' : ''}
                        ${product.isHot ? '<span class="badge hot">HOT</span>' : ''}
                        ${!product.inStock ? '<span class="badge">НЕТ</span>' : ''}
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-small" onclick="app.admin.editProduct(${product.id})">✏️</button>
                    <button class="btn-small btn-danger" onclick="app.admin.deleteProduct(${product.id})">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    // Добавление нового товара
    addNewProduct() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);

        // Валидация
        const name = document.getElementById('productName').value.trim();
        const description = document.getElementById('productDescription').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const category = document.getElementById('productCategory').value;

        if (!name || !description || !price || !category) {
            this.showAlert('Заполните обязательные поля');
            return;
        }

        // Сбор данных
        const product = {
            name: name,
            description: description,
            price: price,
            oldPrice: document.getElementById('productOldPrice').value ? parseInt(document.getElementById('productOldPrice').value) : null,
            category: category,
            subcategory: document.getElementById('productSubcategory').value.trim() || category,
            sizes: document.getElementById('productSizes').value.split(',').map(s => s.trim()).filter(s => s),
            colors: document.getElementById('productColors').value.split(',').map(c => c.trim()).filter(c => c),
            images: document.getElementById('productImages').value.split('\n').map(url => url.trim()).filter(url => url),
            modelImages: document.getElementById('productModelImages').value.split('\n').map(url => url.trim()).filter(url => url),
            material: document.getElementById('productMaterial').value.trim() || 'Не указано',
            care: document.getElementById('productCare').value.trim() || 'Не указано',
            tags: document.getElementById('productTags').value.split(',').map(t => t.trim()).filter(t => t),
            inStock: document.getElementById('productInStock').checked,
            isNew: document.getElementById('productIsNew').checked,
            isSale: document.getElementById('productIsSale').checked,
            isHot: document.getElementById('productIsHot').checked,
            fitting: {
                type: category === 'dresses' ? 'dress' : 
                      category === 'shoes' ? 'shoes' :
                      category === 'bottoms' ? 'bottom' : 'top',
                position: { x: 50, y: 30, scale: 0.8 },
                layer: category === 'dresses' ? 'dress-layer' :
                      category === 'shoes' ? 'shoes-layer' :
                      category === 'bottoms' ? 'bottom-layer' : 'top-layer'
            }
        };

        try {
            Storage.addProduct(product);
            this.showAlert('Товар успешно добавлен!');
            form.reset();
            this.loadAdminProducts();
            this.app.renderProducts(); // Обновляем основной каталог
        } catch (error) {
            this.showAlert('Ошибка при добавлении товара: ' + error.message);
        }
    }

    // Редактирование товара
    editProduct(productId) {
        const products = Storage.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            // Заполняем форму данными товара
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productOldPrice').value = product.oldPrice || '';
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productSubcategory').value = product.subcategory || '';
            document.getElementById('productSizes').value = product.sizes.join(', ');
            document.getElementById('productColors').value = product.colors.join(', ');
            document.getElementById('productImages').value = product.images.join('\n');
            document.getElementById('productModelImages').value = product.modelImages?.join('\n') || '';
            document.getElementById('productMaterial').value = product.material || '';
            document.getElementById('productCare').value = product.care || '';
            document.getElementById('productTags').value = product.tags?.join(', ') || '';
            document.getElementById('productInStock').checked = product.inStock;
            document.getElementById('productIsNew').checked = product.isNew;
            document.getElementById('productIsSale').checked = product.isSale;
            document.getElementById('productIsHot').checked = product.isHot;

            // Переключаемся на вкладку добавления
            this.switchAdminTab('add');
            this.showAlert('Заполнена форма для редактирования. Измените данные и нажмите "Обновить товар"');
        }
    }

    // Удаление товара
    deleteProduct(productId) {
        if (confirm('Удалить этот товар?')) {
            Storage.deleteProduct(productId);
            this.loadAdminProducts();
            this.app.renderProducts();
            this.showAlert('Товар удален');
        }
    }

    // Загрузка заказов
    loadOrders() {
        const orders = Storage.getOrders();
        const container = document.getElementById('adminOrdersList');

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
                <div class="order-header">
                    <h4>Заказ #${order.id}</h4>
                    <span class="order-status ${order.status}">${this.getStatusText(order.status)}</span>
                </div>
                <div class="order-info">
                    <p><strong>Товары:</strong> ${order.items.length} шт.</p>
                    <p><strong>Сумма:</strong> ${order.total} ₽</p>
                    <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="order-actions">
                    <select onchange="app.admin.updateOrderStatus(${order.id}, this.value)" class="status-select">
                        <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Подтвержден</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    updateOrderStatus(orderId, status) {
        if (Storage.updateOrderStatus(orderId, status)) {
            this.showAlert(`Статус заказа #${orderId} изменен на "${this.getStatusText(status)}"`);
            this.loadOrders();
        }
    }

    // Вспомогательные методы
    getCategoryName(categoryId) {
        const category = BASE_PRODUCTS.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    getStatusText(status) {
        const statuses = {
            'new': 'Новый',
            'confirmed': 'Подтвержден',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return statuses[status] || status;
    }

    showAlert(message) {
        if (this.app && this.app.showAlert) {
            this.app.showAlert(message);
        } else {
            alert(message);
        }
    }
}
