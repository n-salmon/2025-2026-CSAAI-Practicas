// P2/game.js - FIXED WIN/LOSE ORDER + ROBUST

let secret = [];
let attempts = 7;
let maxAttempts = 7;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;
let usedDigits = new Set();
let gameActive = true;

const slots = ['slot0', 'slot1', 'slot2', 'slot3'];
let slotElements = [];

function formatTime(cs) {
    const mins = Math.floor(cs / 6000).toString().padStart(2, '0');
    const secs = Math.floor((cs % 6000) / 100).toString().padStart(2, '0');
    const csec = (cs % 100).toString().padStart(2, '0');
    return `${mins}:${secs}.${csec}`;
}

function generateSecret() {
    const digits = Array.from({length: 10}, (_, i) => i);
    for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }
    secret = digits.slice(0, 4);
}

function updateDisplays() {
    document.getElementById('attempts').textContent = attempts;
    document.getElementById('timer').textContent = formatTime(elapsedTime);
    
    for (let i = 0; i <= 9; i++) {
        const btn = document.getElementById(`digit${i}`);
        if (usedDigits.has(i)) {
            btn.disabled = true;
            btn.classList.add('used');
        } else {
            btn.disabled = !gameActive;
            btn.classList.remove('used');
        }
    }
    
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    startBtn.disabled = isRunning || !gameActive;
    stopBtn.disabled = !isRunning;
}

function checkWin() {
    return slotElements.every(slot => slot.textContent !== '*' && slot.classList.contains('correct'));
}

function digitClick(digit) {
    if (!gameActive || usedDigits.has(digit)) return;
    
    usedDigits.add(digit);
    attempts--;
    
    slotElements.forEach((slot, index) => {
        if (slot.textContent === '*' && secret[index] === digit) {
            slot.textContent = digit;
            slot.classList.add('correct');
        }
    });
    
    updateDisplays();
    
    // FIXED: Check WIN FIRST, then LOSE
    if (checkWin()) {
        gameOver(true);
    } else if (attempts <= 0) {
        gameOver(false);
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(() => {
            elapsedTime += 10;
            document.getElementById('timer').textContent = formatTime(elapsedTime);
        }, 10);
        updateDisplays();
    }
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        isRunning = false;
        updateDisplays();
    }
}

function gameOver(isWin) {
    gameActive = false;
    stopTimer();
    if (isWin) {
        const used = maxAttempts - attempts;
        document.getElementById('winMessage').textContent = `¡VICTORIA! Tiempo: ${formatTime(elapsedTime)}, usados: ${used}, restantes: ${attempts}`;
        document.getElementById('winModal').classList.remove('hidden');
    } else {
        document.getElementById('loseMessage').textContent = '¡GAME OVER! Intentos agotados.';
        document.getElementById('revealedSecret').textContent = secret.join('');
        document.getElementById('loseModal').classList.remove('hidden');
    }
}

function resetGame() {
    stopTimer();
    attempts = maxAttempts;
    elapsedTime = 0;
    usedDigits.clear();
    gameActive = true;
    generateSecret();
    slotElements.forEach(slot => {
        slot.textContent = '*';
        slot.classList.remove('correct');
    });
    updateDisplays();
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
}

document.addEventListener('DOMContentLoaded', () => {
    slots.forEach(id => slotElements.push(document.getElementById(id)));
    
    generateSecret();
    slotElements.forEach(slot => slot.textContent = '*');
    updateDisplays();
    
    // Dígitos
    for (let i = 0; i <= 9; i++) {
        document.getElementById(`digit${i}`).onclick = () => digitClick(i);
    }
    
    // Controles
    document.getElementById('startBtn').onclick = startTimer;
    document.getElementById('stopBtn').onclick = stopTimer;
    document.getElementById('resetBtn').onclick = resetGame;
    document.getElementById('resetFromWin').onclick = resetGame;
    document.getElementById('resetFromLose').onclick = resetGame;
    
    // Auto-start primer clic dígito
    document.getElementById('digitsGrid').onclick = (e) => {
        if (e.target.classList.contains('digit-btn') && !isRunning) {
            startTimer();
        }
    };
});
