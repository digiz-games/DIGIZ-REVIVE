// ================= VARIABLES =================
var player;

var enemies = [], enemies2 = [], enemies3 = [];
var weapons1 = [], weapons2 = [], weapons3 = [];

var ast1 = [], ast2 = [], ast3 = [];

var vida = 200;
var maxVida = 200;

var weapon;
var counter = 0;

var kills1 = 0;
var kills2 = 0;

var lastTap = 0;
var startTime = 0;

var scoreText;
var vidaBar;

var music;
var sndLaser, sndLaser1, sndLaser2, sndLaser3, sndExplosion;

// 🔥 LIMITES
var MAX_ENEMIES = 60;
var MAX_AST = 80;


// ================= GAME =================
var Game = {

preload: function(){
game.load.image('space', 'assets/space_bg.jpg');
game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64);

game.load.spritesheet('enemy', 'assets/sprites/enemy.png',64,64);
game.load.spritesheet('enemy2', 'assets/sprites/enemy2.png',64,64);
game.load.spritesheet('enemy3', 'assets/sprites/enemy3.png',64,64);

game.load.image('bullet', 'assets/sprites/laser.png');
game.load.image('laser1', 'assets/sprites/laser1.png');
game.load.image('laser2', 'assets/sprites/laser2.png');
game.load.image('laser3', 'assets/sprites/laser3.png');

game.load.image('asteroide', 'assets/sprites/asteroide.png');
game.load.image('asteroide2', 'assets/sprites/asteroide2.png');
game.load.image('asteroide3', 'assets/sprites/asteroide3.png');

game.load.audio('laser', 'assets/audio/laser.mp3');
game.load.audio('laser1', 'assets/audio/laser1.mp3');
game.load.audio('laser2', 'assets/audio/laser2.mp3');
game.load.audio('laser3', 'assets/audio/laser3.mp3');
game.load.audio('explosion', 'assets/audio/explosion.wav');
game.load.audio('music', 'assets/audio/virgo_song.mp3');
},

create: function(){

game.world.removeAll();
game.time.events.removeAll();
game.input.onDown.removeAll();

enemies = []; enemies2 = []; enemies3 = [];
weapons1 = []; weapons2 = []; weapons3 = [];
ast1 = []; ast2 = []; ast3 = [];

vida = maxVida;
counter = 0;
kills1 = 0;
kills2 = 0;

game.world.setBounds(0,0,20000,20000);
game.physics.startSystem(Phaser.Physics.ARCADE);
game.add.tileSprite(0,0,20000,20000,'space');

// AUDIO
sndLaser = game.add.audio('laser'); sndLaser.volume = 0.4;
sndLaser1 = game.add.audio('laser1'); sndLaser1.volume = 0.1;
sndLaser2 = game.add.audio('laser2'); sndLaser2.volume = 0.1;
sndLaser3 = game.add.audio('laser3'); sndLaser3.volume = 0.1;
sndExplosion = game.add.audio('explosion');

music = game.add.audio('music');
music.volume = 0.9;
music.loopFull();

// PLAYER
player = game.add.sprite(10000,10000,'ship',0);
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

// ================= WEAPON PLAYER =================
weapon = game.add.weapon(60,'bullet'); // 🔥 pool limitado
weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
weapon.bulletSpeed = 1800;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

// 🔥 LIMPIEZA AUTOMATICA
weapon.bullets.setAll('checkWorldBounds', true);
weapon.bullets.setAll('outOfBoundsKill', true);
weapon.autoExpandBullets = false;


// SPAWN
game.time.events.loop(1500,this.spawnEnemy,this);
game.time.events.loop(700,this.spawnAsteroids,this);

game.input.onDown.add(this.handleInput,this);

startTime = game.time.now;
},

update: function(){

if(vida <= 0){ this.dead(); return; }

if(game.input.activePointer.isDown){
game.physics.arcade.accelerateToPointer(player, game.input.activePointer, 600);
player.rotation = game.physics.arcade.angleToPointer(player);
}else{
player.body.acceleration.set(0);
}

this.updateEnemies();
this.updateAsteroids();

scoreText.text = "Score: " + counter;

vidaBar.clear();
vidaBar.beginFill(0xff0000);
vidaBar.drawRect(0,0,200*(vida/maxVida),10);

game.world.wrap(player,16);

// 🔥 LIMPIEZA GLOBAL (CLAVE)
this.cleanArrays();
},

// ================= LIMPIEZA =================
cleanArrays: function(){
enemies = enemies.filter(e=>e.exists);
enemies2 = enemies2.filter(e=>e.exists);
enemies3 = enemies3.filter(e=>e.exists);

ast1 = ast1.filter(a=>a.exists);
ast2 = ast2.filter(a=>a.exists);
ast3 = ast3.filter(a=>a.exists);
},

// ================= ENEMIES =================

spawnEnemy: function(){

if(enemies.length + enemies2.length + enemies3.length > MAX_ENEMIES) return;

let pos = this.spawnFueraPantalla();
this.createEnemy(1,pos.x,pos.y);
},

createEnemy: function(type,x,y){

let key = type==1?'enemy':type==2?'enemy2':'enemy3';

let e = game.add.sprite(x,y,key,0);
game.physics.arcade.enable(e);
e.anchor.set(0.5);

if(type==3) e.scale.set(2.5);

e.hp = type==1?1:type==2?3:5;

let bulletKey = type==1?'laser1':type==2?'laser2':'laser3';

// 🔥 arma optimizada
let w = game.add.weapon(20,bulletKey);
w.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
w.trackSprite(e,0,0,true);

w.bullets.setAll('checkWorldBounds', true);
w.bullets.setAll('outOfBoundsKill', true);
w.autoExpandBullets = false;

if(type==1){ w.bulletSpeed=600; }
if(type==2){ w.bulletSpeed=1600; }
if(type==3){ w.bulletSpeed=200; }

w.nextFire = 0;

if(type==1){ enemies.push(e); weapons1.push(w); }
if(type==2){ enemies2.push(e); weapons2.push(w); }
if(type==3){ enemies3.push(e); weapons3.push(w); }

},

// ================= ASTEROIDES =================

spawnAsteroids: function(){

if(ast1.length + ast2.length + ast3.length > MAX_AST) return;

let r = Math.random();

if(r < 0.6) this.createAst2();
else if(r < 0.85) this.createAst1();
else this.createAst3();
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
let b = weapon.fire();
if(b) sndLaser.play();
},

// ================= DEAD =================

dead: function(){

music.stop();

let tiempo = Math.floor((game.time.now - startTime)/1000);

let txt = game.add.text(game.camera.width/2,game.camera.height/2,
"GAME OVER\n\nScore: "+counter+"\nTiempo: "+tiempo+"s\n\nToca para reiniciar",
{font:"40px Arial",fill:"#fff",align:"center"});

txt.anchor.set(0.5);
txt.fixedToCamera = true;

game.input.onDown.removeAll();
game.input.onDown.addOnce(()=>game.state.restart(true,false));

}

};
