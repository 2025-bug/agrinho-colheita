// Variáveis do jogo
let truckX, truckY;
let obstacles = [];
let products = [];
let score = 0;
let isGameOver = false;
let isWinner = false;
let bgColor;
let isCountryside = true;
let gameTime = 0;
let confetti = [];
let gameState = "menu";
let difficulty = 1;
let isFacingRight = true;
const WIN_SCORE = 1500;
const TRUCK_HITBOX_W = 50;
const TRUCK_HITBOX_H = 30;

// Sprites
let truckImg, cowImg, carImg, appleImg, cornImg, pumpkinImg;

// Sons
let collectSound, crashSound, winSound, backgroundSound;

function preload() {}

function setup() {
  createCanvas(800, 500);
  truckX = 100;
  truckY = height / 2;
  bgColor = color(144, 238, 144);
  
  truckImg = createTractorSprite();
  cowImg = createCowSprite();
  carImg = createCarSprite();
  appleImg = createAppleSprite();
  cornImg = createCornSprite();
  pumpkinImg = createPumpkinSprite();
  
  collectSound = new p5.Oscillator('triangle');
  collectSound.freq(523.25);
  collectSound.amp(0.2);
  
  crashSound = new p5.Oscillator('sawtooth');
  crashSound.freq(110);
  crashSound.amp(0.3);
  
  winSound = new p5.Oscillator('sine');
  winSound.freq(880);
  winSound.amp(0.3);
  
  backgroundSound = new p5.Oscillator('sine');
  backgroundSound.freq(220);
  backgroundSound.amp(0.1);
  
  resetGame();
}

function draw() {
  background(bgColor);
  switch(gameState) {
    case "menu": drawMenu(); break;
    case "playing": updateGame(); drawGame(); break;
    case "gameover": drawGameOver(); break;
    case "win": drawWinScreen(); break;
  }
}

function createTractorSprite() {
  let g = createGraphics(80, 50);
  g.fill(200, 0, 0);
  g.rect(10, 15, 60, 25, 5);
  g.fill(180, 180, 255);
  g.rect(35, 5, 35, 20, 3);
  g.fill(40);
  g.ellipse(20, 45, 30, 30);
  g.ellipse(60, 45, 20, 20);
  g.fill(255, 200, 0);
  g.rect(65, 20, 5, 5);
  return g;
}

function createCowSprite() {
  let g = createGraphics(40, 30);
  g.fill(255);
  g.ellipse(20, 15, 30, 20);
  g.fill(0);
  g.ellipse(10, 10, 5, 5);
  g.ellipse(30, 10, 5, 5);
  return g;
}

function createCarSprite() {
  let g = createGraphics(50, 30);
  g.fill(255, 0, 0);
  g.rect(0, 10, 50, 20);
  g.fill(200, 200, 255);
  g.rect(10, 12, 15, 8);
  g.rect(30, 12, 15, 8);
  return g;
}

function createAppleSprite() {
  let g = createGraphics(30, 30);
  g.fill(255, 0, 0);
  g.ellipse(15, 15, 25, 25);
  g.fill(0, 150, 0);
  g.rect(14, 2, 2, 8);
  return g;
}

function createCornSprite() {
  let g = createGraphics(30, 30);
  g.fill(255, 255, 0);
  g.ellipse(15, 15, 20, 30);
  g.fill(0, 100, 0);
  g.triangle(15, 0, 5, 15, 25, 15);
  return g;
}

function createPumpkinSprite() {
  let g = createGraphics(30, 30);
  g.fill(255, 165, 0);
  g.ellipse(15, 15, 30, 25);
  g.fill(0, 100, 0);
  g.rect(14, 2, 2, 5);
  return g;
}

function drawMenu() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(100, 200, 255), color(50, 150, 50), inter);
    fill(c);
    noStroke();
    rect(0, y, width, 1);
  }

  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("FAZENDA X CIDADE", width/2, 100);
  image(truckImg, width/2 - 40, 150, 80, 50);
  textSize(20);
  text("Leve os produtos agrícolas para a cidade!", width/2, 220);
  text("Use as setas para mover o trator", width/2, 250);
  text("Evite os animais e carros", width/2, 280);
  text(`Colete ${WIN_SCORE} pontos para vencer!`, width/2, 310);
  fill(50, 150, 50);
  rect(width/2 - 100, 350, 200, 50, 10);
  fill(255);
  textSize(24);
  text("INICIAR JOGO", width/2, 385);
}

function resetGame() {
  obstacles = [];
  products = [];
  score = 0;
  gameTime = 0;
  difficulty = 1;
  isGameOver = false;
  isWinner = false;
  isCountryside = true;
  isFacingRight = true;
  bgColor = color(144, 238, 144);
  confetti = [];
  for (let i = 0; i < 3; i++) obstacles.push(createObstacle());
  for (let i = 0; i < 3; i++) products.push(createProduct());
}

function createObstacle() {
  return {
    x: random(width),
    y: random(height - 50),
    speed: random(1, 3),
    type: isCountryside ? "animal" : "carro",
    direction: random() > 0.5 ? 1 : -1
  };
}

function createProduct() {
  return {
    x: random(width),
    y: random(height - 50),
    type: floor(random(3)),
    collected: false
  };
}

function updateGame() {
  if (!isGameOver && !isWinner) {
    gameTime += deltaTime / 1000;
    difficulty = 1 + floor(gameTime / 15) * 0.15;

    if (truckX > width - 50 && isCountryside) {
      bgColor = color(70, 130, 180);
      isCountryside = false;
      for (let obs of obstacles) obs.type = "carro";
    } else if (truckX < 50 && !isCountryside) {
      bgColor = color(144, 238, 144);
      isCountryside = true;
      for (let obs of obstacles) obs.type = "animal";
    }

    if (keyIsDown(LEFT_ARROW)) { truckX = max(0, truckX - (5 + difficulty)); isFacingRight = false; }
    if (keyIsDown(RIGHT_ARROW)) { truckX = min(width - 80, truckX + (5 + difficulty)); isFacingRight = true; }
    if (keyIsDown(UP_ARROW)) truckY = max(0, truckY - 3);
    if (keyIsDown(DOWN_ARROW)) truckY = min(height - 50, truckY + 3);

    for (let obs of obstacles) {
      obs.x += obs.speed * obs.direction * difficulty * 1.2;
      if (obs.x > width + 50) obs.x = -50;
      if (obs.x < -50) obs.x = width + 50;
      if (collision(truckX+15, truckY+10, TRUCK_HITBOX_W, TRUCK_HITBOX_H, obs.x, obs.y, obs.type === "animal" ? 35 : 45, 
25)) {
        gameOver();
      }
    }

    for (let prod of products) {
      if (!prod.collected && collision(truckX+15, truckY+10, TRUCK_HITBOX_W, TRUCK_HITBOX_H, 
                                      prod.x-15, prod.y-15, 30, 30)) {
        prod.collected = true;
        score += 50;
        collectSound.start();
        collectSound.stop(0.1);
        products.push(createProduct());
      }
    }

    if (frameCount % max(30, 90 - floor(score/30)) === 0) {
      products.push(createProduct());
    }

    if (obstacles.length < 3 + floor(difficulty) && frameCount % 60 === 0) {
      obstacles.push(createObstacle());
    }

    if (score >= WIN_SCORE) {
      winGame();
    }
  }
}

function collision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 &&
         x1 + w1 > x2 &&
         y1 < y2 + h2 &&
         y1 + h1 > y2;
}

function drawGame() {
  drawBackground();

  fill(0, 0, 0, 50);
  noStroke();
  ellipse(truckX + 40, truckY + 45, 60, 15);

  push();
  translate(truckX + 40, truckY + 25);
  if (!isFacingRight) scale(-1, 1);
  image(truckImg, -40, -25);
  pop();

  for (let obs of obstacles) {
    if (obs.type === "animal") image(cowImg, obs.x, obs.y);
    else image(carImg, obs.x, obs.y);
  }

  for (let prod of products) {
    if (!prod.collected) {
      switch(prod.type) {
        case 0: image(appleImg, prod.x-15, prod.y-15); break;
        case 1: image(cornImg, prod.x-15, prod.y-15); break;
        case 2: image(pumpkinImg, prod.x-15, prod.y-15); break;
      }
    }
  }

  fill(0);
  textSize(20);
  textAlign(LEFT);
  text(`Pontuação: ${score}/${WIN_SCORE}`, 20, 30);
  text(`Tempo: ${floor(gameTime)}s`, 20, 60);
  text(`Local: ${isCountryside ? "Fazenda" : "Cidade"}`, 20, 90);
  text(`Dificuldade: x${difficulty.toFixed(1)}`, 20, 120);
}

function drawBackground() {
  noStroke();
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(135, 206, 235), color(255), inter);
    fill(c);
    rect(0, i, width, 1);
  }

  fill(255, 255, 150);
  ellipse(width-50, 50, isCountryside ? 60 : 40);

  if (isCountryside) {
    fill(34, 139, 34);
    rect(0, height-50, width, 50);
    fill(139, 69, 19);
    for (let x = 0; x < width; x += 100) {
      rect(x+10, height-80, 10, 30);
      fill(0, 100, 0);
      ellipse(x+15, height-90, 30, 40);
      fill(139, 69, 19);
    }
  } else {
    fill(70, 70, 70);
    rect(100, height-120, 60, 120);
    rect(200, height-150, 80, 150);
    rect(350, height-180, 70, 180);
    rect(500, height-100, 60, 100);

    fill(255, 255, 150);
    for (let y = height-110; y > 100; y -= 30) {
      for (let x = 110; x < 160; x += 20) {
        rect(x, y, 10, 15);
      }
    }
  }
}

function gameOver() {
  isGameOver = true;
  gameState = "gameover";
  crashSound.start();
  crashSound.stop(0.5);
  backgroundSound.amp(0);
}

function drawGameOver() {
  fill(255, 0, 0, 180);
  rect(0, 0, width, height);
  fill(255);
  textSize(40);
  textAlign(CENTER);
  text("Fim de Jogo!", width/2, height/2);
  text(`Pontuação: ${score}/${WIN_SCORE}`, width/2, height/2 + 50);
  text(`Tempo: ${floor(gameTime)}s`, width/2, height/2 + 90);
  textSize(20);
  text("Clique para reiniciar", width/2, height/2 + 140);
}

function winGame() {
  isWinner = true;
  gameState = "win";
  winSound.start();
  winSound.stop(0.5);
  backgroundSound.amp(0);

  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: random(width),
      y: random(-height, 0),
      speed: random(2, 5),
      size: random(5, 15),
      color: color(random(255), random(255), random(255))
    });
  }
}

function drawWinScreen() {
  background(50, 50, 50);
  fill(80);
  rect(150, 150, 30, 150);
  rect(250, 120, 25, 180);
  rect(400, 180, 20, 120);

  for (let i = 0; i < 3; i++) {
    fill(200, 200, 200, 100);
    ellipse(165 + i*10, 130 - i*20, 40 + i*10, 30 + i*5);
    ellipse(265 + i*10, 90 - i*20, 50 + i*10, 40 + i*5);
    ellipse(410 + i*10, 150 - i*20, 30 + i*10, 25 + i*5);
  }

  fill(60);
  rect(width/2 - 150, height/2 - 100, 300, 200);

  fill(255);
  textSize(40);
  textAlign(CENTER);
  text("MISSÃO CUMPRIDA!", width/2, 100);
  textSize(24);
  text(`Você entregou ${WIN_SCORE}kg de produtos!`, width/2, height/2 - 50);
  text(`Tempo: ${floor(gameTime)} segundos`, width/2, height/2 - 20);
  text("Dificuldade final: x" + difficulty.toFixed(1), width/2, height/2 + 10);

  updateConfetti();
  for (let c of confetti) {
    fill(c.color);
    noStroke();
    rect(c.x, c.y, c.size, c.size);
  }

  textSize(20);
  text("Clique para jogar novamente", width/2, height - 30);
}

function updateConfetti() {
  for (let i = confetti.length - 1; i >= 0; i--) {
    let c = confetti[i];
    c.y += c.speed;
    if (c.y > height) confetti.splice(i, 1);
  }
}

function mousePressed() {
  if (gameState === "menu") {
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
        mouseY > 350 && mouseY < 400) {
      gameState = "playing";
      backgroundSound.start();
    }
  } else if (gameState === "gameover" || gameState === "win") {
    resetGame();
    gameState = "playing";
    backgroundSound.start();
  }
}
