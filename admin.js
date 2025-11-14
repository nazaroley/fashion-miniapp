// Админ-функции
console.log('👨‍💼 AdminPanel loading...');

class AdminPanel {
    constructor(app) {
        console.log('🎯 AdminPanel constructor');
        this.app = app;
        this.isAdmin = false;
        
        // Отложенная инициализация
        setTimeout(() => {
            this.init();
        }, 200);
    }

    init() {
        console.log('🔧 AdminPanel init');
        this.bindEvents();
        this.checkAdminAccess();
    }

    // Проверка доступа администратора
    checkAdminAccess() {
        try {
            const tg = this.app.tg;
            if (tg && tg.initDataUnsafe && typeof BASE_PRODUCTS !== 'undefined') {
                const userId = tg.initDataUnsafe.user?.id;
                if (userId && BASE_PRODUCTS.adminUsers.includes(userId)) {
                    document.getElementById('adminBtn').classList.remove('hidden');
                    this.isAdmin = true;
                    console.log('✅ Admin access granted');
                } else {
                    console.log('❌ Admin access denied');
                }
            }
        } catch (error) {
            console.error('❌ Error checking admin access:', error);
        }
    }

    bindEvents() {
        console.log('🔗 Binding admin events...');
        
        // Кнопка админ-панели
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showAdminPanel();
            });
        }

        // Назад из админки
        const adminBack = document.getElementById('adminBack');
        if (adminBack) {
            adminBack.addEventListener('click', () => {
                this.hideAdminPanel();
            });
        }

        // Табы админки
        document.querySelectorAll('.admin-tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAdminTab(e.target.dataset.tab);
            });
        });

        // Форма добавления товара
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewProduct();
            });
        }
        
        console.log('✅ Admin events bound');
    }

    // ... остальные методы без изменений
}

console.log('✅ AdminPanel loaded');
