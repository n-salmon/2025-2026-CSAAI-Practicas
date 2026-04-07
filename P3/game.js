(function() {
    'use strict';

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    let score = 0;
    let lives = 3;
    let energy = 5;
    const maxEnergy = 5;
    let gameState = "playing";
    let alienDirection = 1;
    let alienSpeed = 1;
    let lastShot = 0;
    let lastAlienShot = 0;

    // IMÁGENES EN LÍNEA / locales
    const playerImg = new Image();
    playerImg.src = "nave.png"; // ruta local

    const alienImg = new Image();
    alienImg.src = "alien.webp"; // ruta local

    // Jugador
    const player = { x: 380, y: 550, w: 40, h: 40 };

    // Arrays de disparos y aliens
    let aliens = [];
    let bullets = [];
    let enemyBullets = [];

    // Inicializar aliens (3 filas x 8 columnas)
    function initAliens() {
        aliens = [];
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 8; c++) {
                aliens.push({ x: 80 + c * 80, y: 50 + r * 50, w: 40, h: 40, alive: true });
            }
        }
    }
    initAliens();

    // Input
    let keys = {};
    document.addEventListener("keydown", e => {
        keys[e.code] = true;
        if (e.code === "Enter" && gameState !== "playing") restart();
    });
    document.addEventListener("keyup", e => keys[e.code] = false);

    // Update
    function update(time) {
        if (gameState !== "playing") return;

        // Movimiento jugador
        if (keys["ArrowLeft"] && player.x > 0) player.x -= 5;
        if (keys["ArrowRight"] && player.x + player.w < canvas.width) player.x += 5;

        // Disparo jugador
        if (keys["Space"] && time - lastShot > 200 && energy > 0) {
            bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, speed: 7 });
            energy--;
            lastShot = time;
        }

        if (energy < maxEnergy) { energy += 0.01; if (energy > maxEnergy) energy = maxEnergy; }

        // Mover balas
        bullets.forEach(b => b.y -= b.speed);
        enemyBullets.forEach(b => b.y += b.speed);

        // Movimiento aliens
        let aliveAliens = aliens.filter(a => a.alive);
        if (aliveAliens.length === 0) { victory(); return; }

        let left = Math.min(...aliveAliens.map(a => a.x));
        let right = Math.max(...aliveAliens.map(a => a.x + a.w));
        let down = false;
        if (right >= canvas.width || left <= 0) { alienDirection *= -1; down = true; }
        aliens.forEach(a => { 
            if (a.alive) { 
                a.x += alienDirection * alienSpeed; 
                if (down) a.y += 20; 
                if (a.y + a.h >= player.y) gameOver(); 
            } 
        });
        alienSpeed = 1 + (24 - aliveAliens.length) / 10;

        // Disparo aleatorio aliens
        if (time - lastAlienShot > 1000) {
            let shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
            if (shooter) enemyBullets.push({ x: shooter.x + shooter.w / 2 - 2, y: shooter.y + shooter.h, speed: 3 });
            lastAlienShot = time;
        }

        // Colisiones
        bullets.forEach((b, i) => {
            aliens.forEach(a => {
                if (a.alive && b.x < a.x + a.w && b.x + 4 > a.x && b.y < a.y + a.h && b.y + 10 > a.y) {
                    a.alive = false; bullets.splice(i, 1); score += 10;
                }
            });
        });

        enemyBullets.forEach((b, i) => {
            if (b.x > player.x && b.x < player.x + player.w && b.y > player.y && b.y < player.y + player.h) {
                enemyBullets.splice(i, 1);
                lives--;
                if (lives <= 0) gameOver();
            }
        });

        // Actualizar HUD
        document.getElementById("score").textContent = score;
        document.getElementById("lives").textContent = lives;
        document.getElementById("energy-bar").value = energy;
        document.getElementById("energy-text").textContent = Math.floor(energy) + "/" + maxEnergy;
    }

    // Draw
    function drawBackground() {
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, "#000428");
        g.addColorStop(1, "#004e92");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawPlayer() { ctx.drawImage(playerImg, player.x, player.y, player.w, player.h); }
    function drawAlien(a) { ctx.drawImage(alienImg, a.x, a.y, a.w, a.h); }
    function drawBullets() {
        ctx.fillStyle = "yellow"; bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
        ctx.fillStyle = "red"; enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
    }

    function draw() {
        drawBackground();
        drawPlayer();
        aliens.forEach(a => { if (a.alive) drawAlien(a); });
        drawBullets();
    }

    function loop(time) { update(time); draw(); requestAnimationFrame(loop); }

    requestAnimationFrame(loop);

    // Game Over / Victoria
    function gameOver() { 
        gameState = "gameover"; 
        document.getElementById("gameOverScreen").classList.remove("hidden"); 
        document.getElementById("finalScore").textContent = score; 
    }
    function victory() { 
        gameState = "victory"; 
        document.getElementById("victoryScreen").classList.remove("hidden"); 
        document.getElementById("victoryScore").textContent = score; 
    }

    // Restart
    function restart() {
        gameState = "playing";
        score = 0; 
        lives = 3; 
        energy = 5;
        bullets = []; 
        enemyBullets = [];
        player.x = 380;
        alienDirection = 1;
        alienSpeed = 1;
        lastShot = 0;
        lastAlienShot = 0;
        initAliens();
        document.getElementById("gameOverScreen").classList.add("hidden");
        document.getElementById("victoryScreen").classList.add("hidden");
    }

})();