// Импорт для анимации фона
import Spheres2Background from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.8/build/backgrounds/spheres2.cdn.min.js";

// Инициализация фона
function initBackground() {
    const bg = Spheres2Background(document.getElementById("webgl-canvas"), {
        count: 200,
        colors: [0xff0000, 0x0, 0xffffff],
        minSize: 0.5,
        maxSize: 1,
    });

    const button1 = document.getElementById("colors-btn");

    document.body.addEventListener("click", (ev) => {
        if (ev.target !== button1) bg.togglePause();
    });

    button1.addEventListener("click", () => {
        bg.spheres.setColors([
            0xffffff * Math.random(),
            0xffffff * Math.random(),
            0xffffff * Math.random(),
        ]);
        bg.spheres.light1.color.set(0xffffff * Math.random());
    });
}

// Функционал трекера
function initTracker() {
    const container = document.querySelector(".tracker-container");
    if (!container) return; // Проверяем наличие контейнера

    // Обработка раскрытия/закрытия транзакций
    container.addEventListener("click", (e) => {
        const transaction = e.target.closest(".transaction");
        const closeBtn = e.target.closest(".close-btn");

        if (closeBtn) {
            const expandedTransaction = document.querySelector(".transaction.expanded");
            const otherTransactions = [...document.querySelectorAll(".transaction")]
                .filter((t) => t !== expandedTransaction);
            
            otherTransactions.forEach((t) => t.classList.remove("not-expanded"));
            
            if (expandedTransaction) {
                document.startViewTransition({
                    update: () => {
                        expandedTransaction.classList.remove("expanded");
                    },
                    types: ["collapse"],
                });
            }
            return;
        } else if (transaction && !transaction.classList.contains("expanded")) {
            const otherTransactions = [...document.querySelectorAll(".transaction")]
                .filter((t) => t !== transaction);
            
            otherTransactions.forEach((t) => t.classList.add("not-expanded"));
            
            document.startViewTransition({
                update: () => {
                    transaction.classList.add("expanded");
                },
                types: ["expand"],
            });
        }
    });

    // Фильтрация транзакций
    const filterBtns = document.querySelectorAll('.filter-btn');
    const transactions = document.querySelectorAll('.transaction');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.textContent.toLowerCase();
            
            transactions.forEach(transaction => {
                const category = transaction.querySelector('.subtitle').textContent.toLowerCase();
                transaction.style.display = (filter === 'all' || category.includes(filter)) ? 'flex' : 'none';
            });
        });
    });

    // Поиск транзакций
    const searchInput = document.querySelector('.search-input');
    
    searchInput?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        transactions.forEach(transaction => {
            const title = transaction.querySelector('.title').textContent.toLowerCase();
            const subtitle = transaction.querySelector('.subtitle').textContent.toLowerCase();
            
            transaction.style.display = (title.includes(searchTerm) || subtitle.includes(searchTerm)) ? 'flex' : 'none';
        });
    });

    // Сортировка транзакций
    const sortBtn = document.querySelector('.sort-btn');
    const sortMenu = document.querySelector('.sort-menu');
    const sortOptions = document.querySelectorAll('.sort-option');
    const transactionList = document.querySelector('.transaction-list');

    sortBtn?.addEventListener('click', () => {
        sortMenu.classList.toggle('active');
    });

    sortOptions.forEach(option => {
        option.addEventListener('click', () => {
            const sortBy = option.dataset.sort;
            const transactionsArray = Array.from(transactions);

            transactionsArray.sort((a, b) => {
                switch(sortBy) {
                    case 'date':
                        const dateA = new Date(a.querySelector('.transaction-date').textContent);
                        const dateB = new Date(b.querySelector('.transaction-date').textContent);
                        return dateB - dateA;
                    case 'amount':
                        const amountA = parseFloat(a.querySelector('.amount').textContent.replace(/[^0-9.-]+/g,""));
                        const amountB = parseFloat(b.querySelector('.amount').textContent.replace(/[^0-9.-]+/g,""));
                        return amountB - amountA;
                    case 'name':
                        const nameA = a.querySelector('.title').textContent;
                        const nameB = b.querySelector('.title').textContent;
                        return nameA.localeCompare(nameB);
                    default:
                        return 0;
                }
            });

            transactionList.innerHTML = '';
            transactionsArray.forEach(transaction => {
                transactionList.appendChild(transaction);
            });

            sortMenu.classList.remove('active');
        });
    });

    // Закрытие меню сортировки при клике вне его
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sort-dropdown')) {
            sortMenu?.classList.remove('active');
        }
    });

    // Добавляем функционал для карточки баланса
    const balanceCard = document.querySelector('.balance-card');
    const balanceAmount = document.querySelector('.balance-amount');
    let isAnimating = false;

    // Анимация обновления баланса
    function animateBalance(newValue, oldValue) {
        if (isAnimating) return;
        isAnimating = true;
        
        const duration = 1000;
        const start = Date.now();
        const diff = newValue - oldValue;

        function update() {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Эффект пружины для анимации
            const easing = 1 + (--progress) * progress * progress * progress * progress;
            const current = oldValue + diff * easing;
            
            balanceAmount.textContent = `$${current.toFixed(2)}`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                isAnimating = false;
            }
        }
        
        update();
    }

    // Добавляем функционал быстрых действий
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.textContent.trim().toLowerCase();
            const currentBalance = parseFloat(balanceAmount.textContent.replace(/[^0-9.-]+/g, ""));
            
            switch(action) {
                case 'send':
                    showModal('send');
                    break;
                case 'request':
                    showModal('request');
                    break;
                case 'bills':
                    showModal('bills');
                    break;
            }
        });
    });

    // Создаем и показываем модальное окно
    function showModal(type) {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        let content = '';
        switch(type) {
            case 'send':
                content = `
                    <div class="modal-content">
                        <button class="modal-close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <div class="modal-header">
                            <h3>Send Money</h3>
                        </div>
                        <input type="text" placeholder="Recipient" class="modal-input">
                        <input type="number" placeholder="Amount" class="modal-input">
                        <div class="modal-buttons">
                            <button class="modal-btn cancel">Cancel</button>
                            <button class="modal-btn confirm">Send</button>
                        </div>
                    </div>
                `;
                break;
            case 'request':
                content = `
                    <div class="modal-content">
                        <button class="modal-close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <div class="modal-header">
                            <h3>Request Money</h3>
                        </div>
                        <input type="text" placeholder="From" class="modal-input">
                        <input type="number" placeholder="Amount" class="modal-input">
                        <div class="modal-buttons">
                            <button class="modal-btn cancel">Cancel</button>
                            <button class="modal-btn confirm">Request</button>
                        </div>
                    </div>
                `;
                break;
            case 'bills':
                content = `
                    <div class="modal-content">
                        <button class="modal-close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                        <div class="modal-header">
                            <h3>Pay Bills</h3>
                        </div>
                        <select class="modal-input">
                            <option>Electricity</option>
                            <option>Water</option>
                            <option>Internet</option>
                            <option>Phone</option>
                        </select>
                        <input type="number" placeholder="Amount" class="modal-input">
                        <div class="modal-buttons">
                            <button class="modal-btn cancel">Cancel</button>
                            <button class="modal-btn confirm">Pay</button>
                        </div>
                    </div>
                `;
                break;
        }
        
        modal.innerHTML = content;
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
        
        // Анимация появления
        requestAnimationFrame(() => {
            backdrop.classList.add('active');
            modal.classList.add('active');
        });

        // Обработчики закрытия
        const closeModal = () => {
            backdrop.classList.remove('active');
            modal.classList.remove('active');
            setTimeout(() => {
                backdrop.remove();
                modal.remove();
            }, 300);
        };

        modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
        modal.querySelector('.cancel')?.addEventListener('click', closeModal);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeModal();
        });

        // Обработчики кнопок
        modal.querySelector('.confirm').addEventListener('click', () => {
            const amount = parseFloat(modal.querySelector('input[type="number"]').value);
            if (!amount) return;

            const currentBalance = parseFloat(balanceAmount.textContent.replace(/[^0-9.-]+/g, ""));
            const newBalance = type === 'request' ? currentBalance + amount : currentBalance - amount;
            
            animateBalance(newBalance, currentBalance);
            addNewTransaction(type, amount);
            closeModal();
        });
    }

    // Добавление новой транзакции
    function addNewTransaction(type, amount) {
        const transactionList = document.querySelector('.transaction-list');
        const newTransaction = document.createElement('div');
        newTransaction.className = 'transaction';
        
        const date = new Date();
        const transactionId = Math.floor(Math.random() * 10000);
        
        newTransaction.innerHTML = `
            <div class="icon-container">
                <div class="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14" stroke-width="2"/>
                    </svg>
                </div>
                <button class="close-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                        <path d="M12 4L4 12M4 4l8 8" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
            <div class="details">
                <div class="title-container">
                    <div class="title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    <div class="subtitle">${type === 'request' ? 'Income' : 'Payment'}</div>
                </div>
                <div class="amount">${type === 'request' ? '+' : '-'}$${amount.toFixed(2)}</div>
            </div>
            <div class="transaction-details">
                <div class="transaction-id">#${transactionId}</div>
                <div class="transaction-date">${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
                <div class="transaction-time">${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        
        transactionList.insertBefore(newTransaction, transactionList.firstChild);
        
        // Анимация появления
        newTransaction.style.opacity = '0';
        newTransaction.style.transform = 'translateY(-20px)';
        requestAnimationFrame(() => {
            newTransaction.style.opacity = '1';
            newTransaction.style.transform = 'translateY(0)';
        });
    }
}

// Добавьте эту функцию в main.js
function initInteractiveButtons() {
    // Неоновая кнопка - добавляем анимацию для линий
    const neonButton = document.querySelector('.neon-button');
    if (neonButton) {
        const spans = neonButton.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.animation = `neon-line${index + 1} 1s linear infinite ${index * 0.25}s`;
        });
    }

    // Жидкий переключатель - исправляем ошибку
    const liquidSwitches = document.querySelectorAll('.liquid-switch input');
    liquidSwitches.forEach(switchEl => { // Переименовали параметр
        switchEl.addEventListener('change', function() {
            const liquid = this.nextElementSibling.querySelector('.liquid');
            if (this.checked) {
                liquid.style.transform = 'translate(100%, -50%)';
            } else {
                liquid.style.transform = 'translate(-100%, -50%)';
            }
        });
    });

    // Кнопка с частицами
    const particleButtons = document.querySelectorAll('.particle-button');
    particleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const particles = this.querySelector('.particles');
            for (let i = 0; i < 10; i++) {
                createParticle(e.clientX, e.clientY, particles);
            }
        });
    });

    // Морфинг кнопка
    const morphButtons = document.querySelectorAll('.morph-button');
    morphButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const circle = this.querySelector('.circle');
            circle.style.transform = 'scale(1.5)';
        });
        button.addEventListener('mouseleave', function() {
            const circle = this.querySelector('.circle');
            circle.style.transform = 'scale(0)';
        });
    });
}

// Функция создания частиц
function createParticle(x, y, container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    container.appendChild(particle);

    const destinationX = x + (Math.random() - 0.5) * 100;
    const destinationY = y - Math.random() * 100;

    const animation = particle.animate([
        {
            transform: `translate(${x}px, ${y}px)`,
            opacity: 1
        },
        {
            transform: `translate(${destinationX}px, ${destinationY}px)`,
            opacity: 0
        }
    ], {
        duration: 1000,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        delay: Math.random() * 200
    });

    animation.onfinish = () => particle.remove();
}

function initCustomControls() {
    // Магнитная кнопка
    const magneticBtns = document.querySelectorAll('.magnetic-button');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // Плазма эффект
    const plasmaBtns = document.querySelectorAll('.plasma-button');
    plasmaBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            btn.querySelector('.plasma-effect').style.setProperty('--x', `${x}%`);
            btn.querySelector('.plasma-effect').style.setProperty('--y', `${y}%`);
        });
    });

    // Звуковая волна
    const waveBtns = document.querySelectorAll('.wave-button');
    waveBtns.forEach(btn => {
        const bars = btn.querySelector('.wave-bars');
        for(let i = 0; i < 10; i++) {
            const bar = document.createElement('span');
            bar.style.setProperty('--i', i);
            bars.appendChild(bar);
        }
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById("webgl-canvas")) {
        initBackground();
    }
    initTracker();
    initInteractiveButtons();
    initCustomControls();
}); 