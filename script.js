document.addEventListener('DOMContentLoaded', () => {
    const attemptsInput = document.getElementById('attemptsInput');
    const quickButtons = document.querySelectorAll('.quick-buttons button');
    const attemptsLeftEl = document.getElementById('attemptsLeft');
    const averageTimeEl = document.getElementById('averageTime');
    const completedAttemptsEl = document.getElementById('completedAttempts');
    const testArea = document.getElementById('testArea');
    const messageEl = document.getElementById('message');
    const submessageEl = document.getElementById('submessage');

    let state = 'idle'; // idle, waiting, ready, result, false-start
    let attemptsLeft = 5;
    let totalAttempts = 5;
    let reactionTimes = [];
    let timeoutId = null;
    let startTime = 0;

    // Инициализация / сброс сессии
    function init() {
        const val = parseInt(attemptsInput.value, 10);
        if (isNaN(val) || val < 1) {
            attemptsInput.value = 1;
            totalAttempts = 1;
        } else {
            totalAttempts = val;
        }
        attemptsLeft = totalAttempts;
        reactionTimes = [];
        state = 'idle';
        updateStats();
        updateUI();
    }

    // Обновление цифр статистики
    function updateStats() {
        attemptsLeftEl.textContent = attemptsLeft;
        completedAttemptsEl.textContent = reactionTimes.length;
        
        if (reactionTimes.length > 0) {
            const sum = reactionTimes.reduce((a, b) => a + b, 0);
            const avg = Math.round(sum / reactionTimes.length);
            averageTimeEl.textContent = `${avg} мс`;
        } else {
            averageTimeEl.textContent = '—';
        }
    }

    // Обновление текста и цветов в зависимости от состояния
    function updateUI() {
        testArea.className = 'test-area ' + state;
        
        switch (state) {
            case 'idle':
                messageEl.textContent = 'Нажмите, чтобы начать';
                submessageEl.textContent = `Осталось попыток: ${attemptsLeft} (или нажмите Пробел)`;
                break;
            case 'waiting':
                messageEl.textContent = 'Ждите зелёный...';
                submessageEl.textContent = 'Не нажимайте раньше времени!';
                break;
            case 'ready':
                messageEl.textContent = 'ЖМИТЕ!';
                submessageEl.textContent = 'Как можно быстрее!';
                break;
            case 'result':
                const lastTime = reactionTimes[reactionTimes.length - 1];
                if (attemptsLeft === 0) {
                    const sum = reactionTimes.reduce((a, b) => a + b, 0);
                    const avg = Math.round(sum / reactionTimes.length);
                    messageEl.textContent = 'Тест завершён!';
                    submessageEl.textContent = `Среднее время: ${avg} мс. Нажмите, чтобы начать заново.`;
                } else {
                    messageEl.textContent = `${lastTime} мс`;
                    submessageEl.textContent = 'Нажмите, чтобы продолжить';
                }
                break;
            case 'false-start':
                messageEl.textContent = 'Слишком рано!';
                submessageEl.textContent = 'Фальстарт. Нажмите, чтобы попробовать снова.';
                break;
        }
    }

    // Сброс при изменении поля ввода (при потере фокуса или нажатии Enter)
    attemptsInput.addEventListener('change', init);
    attemptsInput.addEventListener('blur', init);

    // Быстрые кнопки
    quickButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            attemptsInput.value = btn.dataset.attempts;
            init();
        });
    });

    // Основная логика клика по тестовой области
    function handleInteraction() {
        if (state === 'idle' || state === 'result' || state === 'false-start') {
            // Если тест завершён, начинаем заново
            if (state === 'result' && attemptsLeft === 0) {
                init();
                return;
            }
            
            if (attemptsLeft > 0) {
                attemptsLeft--;
                updateStats();
                state = 'waiting';
                updateUI();
                
                // Случайная задержка от 1.5 до 4 секунд (1500 - 4000 мс)
                const delay = Math.floor(Math.random() * 2500) + 1500;
                timeoutId = setTimeout(() => {
                    state = 'ready';
                    startTime = performance.now();
                    updateUI();
                }, delay);
            }
        } else if (state === 'waiting') {
            // Фальстарт: отменяем таймер, возвращаем попытку, показываем ошибку
            clearTimeout(timeoutId);
            state = 'false-start';
            attemptsLeft++; 
            updateStats();
            updateUI();
        } else if (state === 'ready') {
            // Успешный клик: считаем время
            const endTime = performance.now();
            const reactionTime = Math.round(endTime - startTime);
            reactionTimes.push(reactionTime);
            state = 'result';
            updateStats();
            updateUI();
        }
    }

    // Обработчики событий
    testArea.addEventListener('click', handleInteraction);
    
    // Поддержка клавиши Пробел для удобства на ПК
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Предотвращаем прокрутку страницы
            handleInteraction();
        }
    });

    // Предотвращение выделения текста при быстрых двойных кликах
    testArea.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    // Запуск при загрузке
    init();
});