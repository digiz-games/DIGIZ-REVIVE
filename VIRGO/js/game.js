// ================= VARIABLES =================
var player;

var enemies = [], enemies2 = [], enemies3 = [];
var weapons1 = [], weapons2 = [], weapons3 = [];

var ast1 = [], ast2 = [], ast3 = [];

var vida = 200;
var maxVida = 200;

var weapon;
var counter = 0;

var lastTap = 0;
var startTime = 0;

var scoreText;
var vidaBar;

var music;
var sndLaser, sndLaser1, sndLaser2, sndLaser3, sndExplosion;

// ================= GAME =================
var Game = {

preload: function(){

game.load.image('space', 'assets/space_bg.jpg');
game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64);

game.load.image('enemy', 'assets/sprites/enemy.png');
game.load.image('enemy2', 'assets/sprites/enemy2.png');
game.load.image('enemy3', 'assets/sprites/enemy3.png');

game.load.image('bullet', 'assets/sprites/laser.png');
game.load.image('laser1', 'assets/sprites/laser1.png');
game.load.image('laser2', 'assets/sprites/laser2.png');
game.load.image('laser3', 'assets/sprites/laser3.png');

game.load.image('asteroide', 'assets/sprites/asteroide.png');
game.load.image('asteroide2', 'assets/sprites/asteroide2.png');
game.load.image('asteroide3', 'assets/sprites/asteroide3.png');

game.load.audio('laser', 'assets/audio/laser.wav');
game.load.audio('laser1', 'assets/audio/laser1.mp3');
game.load.audio('laser2', 'assets/audio/laser2.mp3');
game.load.audio('laser3', 'assets/audio/laser3.mp3');
game.load.audio('explosion', 'assets/audio/explosion.wav');
game.load.audio('music', 'assets/audio/virgo_song.mp3');

},

create: function(){

game.world.setBounds(0,0,20000,20000);
game.physics.startSystem(Phaser.Physics.ARCADE);
game.add.tileSprite(0,0,20000,20000,'space');

// AUDIO
sndLaser = game.add.audio('laser');
sndLaser1 = game.add.audio('laser1');
sndLaser2 = game.add.audio('laser2');
sndLaser3 = game.add.audio('laser3');
sndExplosion = game.add.audio('explosion');

music = game.add.audio('music');
music.loopFull(0.5);

// PLAYER
player = game.add.sprite(10000,10000,'ship');
game.physics.arcade.enable(player);
player.anchor.set(0.5);
player.body.drag.set(80);
player.body.maxVelocity.set(500);

game.camera.follow(player);

// UI
scoreText = game.add.text(20,20,'Score: 0',{font:'20px Arial',fill:'#fff'});
scoreText.fixedToCamera = true;

vidaBar = game.add.graphics(20,50);
vidaBar.fixedToCamera = true;

// WEAPON PLAYER
weapon = game.add.weapon(40,'bullet');
weapon.bulletSpeed = 800;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

// TIMERS
game.time.events.loop(1500,this.spawnEnemy,this);
game.time.events.loop(1000,this.spawnAsteroids,this);
game.time.events.loop(8000,this.meteorShower,this);

game.input.onDown.add(this.handleInput,this);

startTime = game.time.now;

},

update: function(){

if(vida <= 0){ this.dead(); return; }

// MOVIMIENTO
if(game.input.activePointer.isDown){
game.physics.arcade.accelerateToPointer(player,null,600);
player.rotation = game.physics.arcade.angleToPointer(player);
}

// ENEMIES
this.updateEnemies();

// ASTEROIDES
this.updateAsteroids();

// UI
scoreText.text = "Score: " + counter;

vidaBar.clear();
vidaBar.beginFill(0xff0000);
vidaBar.drawRect(0,0,200*(vida/maxVida),10);

game.world.wrap(player,16);

},

// ================= ENEMIES =================

updateEnemies: function(){

// ENEMIES1 → rodean
for(let i=enemies.length-1;i>=0;i--){

let e = enemies[i];
let w = weapons1[i];

if(!e.exists){
enemies.splice(i,1);
weapons1.splice(i,1);
continue;
}

// movimiento circular
let angle = game.time.now * 0.001 + i;
let tx = player.x + Math.cos(angle)*250;
let ty = player.y + Math.sin(angle)*250;

game.physics.arcade.moveToXY(e,tx,ty,120);
e.rotation = game.physics.arcade.angleBetween(e,player);

// disparo simple
if(game.time.now > w.nextFire){
w.fireAtSprite(player);
sndLaser1.play();
w.nextFire = game.time.now + 1200;
}

this.checkHits(e,w);
}

// ENEMIES2 → persecución agresiva
for(let i=enemies2.length-1;i>=0;i--){

let e = enemies2[i];
let w = weapons2[i];

if(!e.exists){
enemies2.splice(i,1);
weapons2.splice(i,1);
continue;
}

game.physics.arcade.moveToObject(e,player,300);
e.rotation = game.physics.arcade.angleBetween(e,player);

// disparo tipo shotgun corto
if(game.time.now > w.nextFire){

for(let a=-20;a<=20;a+=10){
let b = w.fire();
if(b){
game.physics.arcade.velocityFromAngle(e.angle+a,500,b.body.velocity);
}
}

sndLaser2.play();
w.nextFire = game.time.now + 400;
}

this.checkHits(e,w);
}

// ENEMIES3 → guardianes
for(let i=enemies3.length-1;i>=0;i--){

let e = enemies3[i];
let w = weapons3[i];

if(!e.exists){
enemies3.splice(i,1);
weapons3.splice(i,1);
continue;
}

// movimiento lento
if(!e.nextMove || game.time.now > e.nextMove){
let ang = game.rnd.angle();
game.physics.arcade.velocityFromAngle(ang,80,e.body.velocity);
e.nextMove = game.time.now + 2000;
}

e.rotation = game.physics.arcade.angleBetween(e,player);

// activación por cercanía
let dist = game.physics.arcade.distanceBetween(e,player);

if(dist < 400 && game.time.now > w.nextFire){

for(let a=0;a<360;a+=15){
let b = w.fire();
if(b){
game.physics.arcade.velocityFromAngle(a,400,b.body.velocity);
}
}

sndLaser3.play();
w.nextFire = game.time.now + 2500;
}

this.checkHits(e,w);
}

},

checkHits: function(e,w){

game.physics.arcade.overlap(e,weapon.bullets,this.hitEnemy,null,this);
game.physics.arcade.overlap(player,w.bullets,this.hitPlayer,null,this);

},

spawnEnemy: function(){

let pos = this.spawnFueraPantalla();
this.createEnemy(1,pos.x,pos.y);

// evolución
if(counter % 5 == 0){
let p = this.spawnFueraPantalla();
this.createEnemy(2,p.x,p.y);
}

if(counter % 25 == 0){
let p = this.spawnFueraPantalla();
this.createEnemy(3,p.x,p.y);
}

},

createEnemy: function(type,x,y){

let key = type==1?'enemy':type==2?'enemy2':'enemy3';

let e = game.add.sprite(x,y,key);
game.physics.arcade.enable(e);
e.anchor.set(0.5);

if(type==3) e.scale.set(2);

let bulletKey = type==1?'laser1':type==2?'laser2':'laser3';

let w = game.add.weapon(20,bulletKey);
w.trackSprite(e,0,0,true);

w.bulletSpeed = 400;
w.fireRate = 500;
w.nextFire = 0;

if(type==1){ enemies.push(e); weapons1.push(w); }
if(type==2){ enemies2.push(e); weapons2.push(w); }
if(type==3){ enemies3.push(e); weapons3.push(w); }

},

hitEnemy: function(enemy,bullet){

bullet.kill();
enemy.kill();
sndExplosion.play();

counter++;

// bonus vida por enemy3
if(enemies3.includes(enemy)){
vida = Math.min(maxVida, vida*2);
}

},

hitPlayer: function(player,bullet){

bullet.kill();
vida -= 10;
sndExplosion.play();

},

// ================= ASTEROIDES =================

spawnAsteroids: function(){

let r = Math.random();

if(r < 0.7) this.createAst2();
else if(r < 0.9) this.createAst1();
else this.createAst3();

},

createAst1: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide');
game.physics.arcade.enable(a);
a.hp = 3;
ast1.push(a);

},

createAst2: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide2');
game.physics.arcade.enable(a);

let speed = game.rnd.integerInRange(150,600);
a.body.velocity.x = speed;

ast2.push(a);

},

createAst3: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide3');
game.physics.arcade.enable(a);

a.scale.set(3);
a.hp = 10;

ast3.push(a);

},

meteorShower: function(){

let count = game.rnd.integerInRange(15,30);

for(let i=0;i<count;i++){
this.createAst2();
}

},

updateAsteroids: function(){

ast2.forEach(a=>{
game.physics.arcade.overlap(player,a,()=>{
vida -=5;
a.kill();
sndExplosion.play();
});
});

},

// ================= INPUT =================

handleInput: function(pointer){

let now = Date.now();

if(now - lastTap < 300){
this.fire();
}

lastTap = now;

if(pointer.leftButton && pointer.leftButton.isDown){
this.fire();
}

},

fire: function(){

weapon.fire();
sndLaser.play();

},

// ================= UTIL =================

spawnFueraPantalla: function(){

let side = Math.floor(Math.random()*4);
let margin = 800;

if(side==0) return {x:player.x+2000,y:player.y+game.rnd.integerInRange(-margin,margin)};
if(side==1) return {x:player.x-2000,y:player.y+game.rnd.integerInRange(-margin,margin)};
if(side==2) return {x:player.x+game.rnd.integerInRange(-margin,margin),y:player.y+2000};
return {x:player.x+game.rnd.integerInRange(-margin,margin),y:player.y-2000};

},

// ================= DEAD =================

dead: function(){

music.stop();

let tiempo = Math.floor((game.time.now - startTime)/1000);

let txt = game.add.text(player.x,player.y,
"GAME OVER\n\nScore: "+counter+"\nTiempo: "+tiempo+"s\n\nToca para reiniciar",
{font:"40px Arial",fill:"#fff",align:"center"});

txt.anchor.set(0.5);
txt.fixedToCamera = true;

game.input.onDown.addOnce(function(){
game.state.restart(true,false);
});

}

};
