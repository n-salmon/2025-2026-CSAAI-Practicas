const PAIRS = {
    dogcat: { wordA: 'PERRO', wordB: 'GATO', imgA: 'img/perro.png', imgB: 'img/gato.png',
        levels: [
            [true,true,true,true,false,false,false,false],
            [true,false,true,false,true,false,true,false],
            [true,true,false,false,true,true,false,false],
            [true,false,false,true,false,true,true,false],
            [false,true,false,true,true,false,true,false]
        ]
    },
    applebanana: { wordA: 'MANZANA', wordB: 'PLÁTANO', imgA: 'img/manzana.png', imgB: 'img/platano.png',
        levels: [
            [true,true,true,true,false,false,false,false],
            [true,false,true,false,true,false,true,false],
            [true,true,false,false,true,true,false,false],
            [true,false,false,true,false,true,true,false],
            [false,true,false,true,true,false,true,false]
        ]
    },
    housecar: { wordA: 'CASA', wordB: 'COCHE', imgA: 'img/casa.png', imgB: 'img/coche.png',
        levels: [
            [true,true,true,true,false,false,false,false],
            [true,false,true,false,true,false,true,false],
            [true,true,false,false,true,true,false,false],
            [true,false,false,true,false,true,true,false],
            [false,true,false,true,true,false,true,false]
        ]
    }
};

const SPEEDS = [2000,1600,1200,800,500];

let state = {
    pair: "dogcat",
    curLevel: 1,
    isPlaying: false,
    seqPos: 0,
    interval: null,
    startTime: 0,
    gridData: []
};

const els = {
    start: document.getElementById("startBtn"),
    stop: document.getElementById("stopBtn"),
    pair: document.getElementById("pairSelect"),
    levelSelect: document.getElementById("levelSelect"),
    level: document.getElementById("currentLevel"),
    timer: document.getElementById("timer"),
    word: document.getElementById("wordArea"),
    grid: document.getElementById("grid"),
    musicaToggle: document.getElementById("musicToggle"),
};

let gridItems = [];
let musicaActiva = els.musicaToggle.checked;
let audio = document.getElementById("bgMusic");

// INIT GRID
function init() {
    for(let i=0;i<8;i++){
        let div = document.createElement("div");
        div.classList.add("grid-item");
        els.grid.appendChild(div);
        gridItems.push(div);
    }
}

// START GAME
function startGame(){
    state.isPlaying = true;
    state.curLevel = parseInt(els.levelSelect.value);
    state.startTime = Date.now();
    state.pair = els.pair.value;

    els.start.disabled = true;
    els.stop.disabled = false;
    els.pair.disabled = true;
    els.levelSelect.disabled = true;

    // Reproducir música si está activa
    if (musicaActiva) {
        audio.currentTime = 0;
        audio.play().catch(()=>{});
    }

    nextLevel();
}

// STOP GAME
function stopGame(){
    state.isPlaying = false;
    clearTimeout(state.interval);

    // Parar música
    audio.pause();
    audio.currentTime = 0;

    els.start.disabled = false;
    els.stop.disabled = true;
    els.pair.disabled = false;
    els.levelSelect.disabled = false;
}

// LOAD GRID
function loadGrid(){
    const pair = PAIRS[state.pair];
    state.gridData = pair.levels[state.curLevel - 1];

    gridItems.forEach((item, i) => {
        if(state.gridData[i]){
            item.innerHTML = `<img src="${pair.imgA}"><div class="label">${pair.wordA}</div>`;
        } else {
            item.innerHTML = `<img src="${pair.imgB}"><div class="label">${pair.wordB}</div>`;
        }
    });
}

// NEXT LEVEL
function nextLevel(){
    if(state.curLevel > 5){
        els.word.textContent = "FIN";
        stopGame();
        return;
    }

    els.level.textContent = "Nivel: " + state.curLevel;
    loadGrid();
    state.seqPos = 0;

    setTimeout(playRound, 1000);
}

// PLAY ROUND
function playRound(){
    if(!state.isPlaying) return;

    gridItems.forEach(i=>i.classList.remove("highlight"));

    let current = state.gridData[state.seqPos];
    const pair = PAIRS[state.pair];

    gridItems[state.seqPos].classList.add("highlight");
    els.word.textContent = current ? pair.wordA : pair.wordB;

    state.seqPos++;

    if(state.seqPos >= 8){
        state.curLevel++;
        setTimeout(nextLevel,1500);
        return;
    }

    state.interval = setTimeout(playRound, SPEEDS[state.curLevel-1]);
}

// MÚSICA con checkbox
els.musicaToggle.addEventListener("change", () => {
    musicaActiva = els.musicaToggle.checked;

    if(musicaActiva){
        if(state.isPlaying){
            audio.play().catch(()=>{});
        }
    } else {
        audio.pause();
    }
});

// TIMER
function updateTimer(){
    if(state.isPlaying){
        let t = Math.floor((Date.now()-state.startTime)/1000);
        els.timer.textContent = "Tiempo: " + t + "s";
    }
    requestAnimationFrame(updateTimer);
}

// EVENTS
els.start.onclick = startGame;
els.stop.onclick = stopGame;

// INIT
init();
updateTimer();