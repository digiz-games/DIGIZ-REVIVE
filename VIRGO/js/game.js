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

// ================= GAME =================
var Game = {

preload: function(){

game.load.image('space', 'assets/space_bg.jpg');

// 🔥 FIX: faltaban enemigos
game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64);
game.load.image('enemy', 'assets/sprites/enemy.png');
game.load.image('enemy2', 'assets/sprites/enemy2.png');
game.load.image('enemy3', 'assets/sprites/enemy3.png');

// DISPAROS
game.load.image('bullet', 'assets/sprites/laser.png');
game.load.image('laser1', 'assets/sprites/laser1.png');
game.load.image('laser2', 'assets/sprites/laser2.png');
game.load.image('laser3', 'assets/sprites/laser3.png');

// ASTEROIDES
game.load.image('asteroide', 'assets/sprites/asteroide.png');
game.load.image('asteroide2', 'assets/sprites/asteroide2.png');
game.load.image('asteroide3', 'assets/sprites/asteroide3.png');

// AUDIO
game.load.audio('laser', 'assets/audio/laser.wav');
game.load.audio('laser1', 'assets/audio/laser1.mp3');
game.load.audio('laser2', 'assets/audio/laser2.mp3');
game.load.audio('laser3', 'assets/audio/laser3.mp3');

},

create: function(){

game.world.setBounds(0,0,20000,20000);

game.physics.startSystem(Phaser.Physics.ARCADE);

game.add.tileSprite(0,0,20000,20000,'space');

// PLAYER
player = game.add.sprite(10000,10000,'ship');
game.physics.arcade.enable(player);

player.anchor.set(0.5);
player.body.drag.set(80);              // 🔥 más inercia
player.body.maxVelocity.set(500);

game.camera.follow(player);

// WEAPON PLAYER
weapon = game.add.weapon(40,'bullet');
weapon.bulletSpeed = 900;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

// SPAWN
game.time.events.loop(1500,this.spawnEnemy,this);
game.time.events.loop(1000,this.spawnAsteroids,this);

// INPUT
game.input.onDown.add(this.handleInput,this);

},

update: function(){

if(vida <= 0){ this.dead(); return; }

// ================= MOVIMIENTO =================
if(game.input.activePointer.isDown){

game.physics.arcade.accelerateToPointer(player, game.input.activePointer, 600);

// ROTACIÓN
player.rotation = game.physics.arcade.angleToPointer(player);

}

// ================= ENEMIES =================
this.updateGroup(enemies,weapons1,120);
this.updateGroup(enemies2,weapons2,200);
this.updateGroup(enemies3,weapons3,400);

// ================= ASTEROIDES =================
this.updateAsteroids();

game.world.wrap(player,16);

},

// ================= ENEMIES =================

updateGroup: function(list,weapons,speed){

for(let i=list.length-1;i>=0;i--){

let e = list[i];
let w = weapons[i];

if(!e.exists){
list.splice(i,1);
weapons.splice(i,1);
continue;
}

// MOVIMIENTO
game.physics.arcade.moveToObject(e,player,speed);
e.rotation = game.physics.arcade.angleBetween(e,player);

// DISPARO
if(game.time.now > w.nextFire){
w.fireAtSprite(player);
w.nextFire = game.time.now + w.fireRate;
}

// COLISIONES
game.physics.arcade.overlap(e,weapon.bullets,this.hitEnemy,null,this);
game.physics.arcade.overlap(player,w.bullets,this.hitPlayer,null,this);
}
},

spawnEnemy: function(){

let pos = this.spawnFueraPantalla();

// 🔥 siempre spawn base
this.createEnemy(1,pos.x,pos.y);

// 🔥 progresión
if(counter > 0 && counter % 5 === 0){
this.createEnemy(2,pos.x+200,pos.y+200);
}

if(counter > 0 && counter % 25 === 0){
this.createEnemy(3,pos.x-200,pos.y-200);
}

},

createEnemy: function(type,x,y){

let key = type==1?'enemy':type==2?'enemy2':'enemy3';

let e = game.add.sprite(x,y,key);
game.physics.arcade.enable(e);
e.anchor.set(0.5);

let bulletKey = type==1?'laser1':type==2?'laser2':'laser3';

let w = game.add.weapon(10,bulletKey);
w.trackSprite(e,0,0,true);

w.bulletSpeed = type==1?400:type==2?600:700;
w.fireRate = type==1?1200:type==2?600:500;
w.nextFire = 0;

if(type==1){ enemies.push(e); weapons1.push(w); }
if(type==2){ enemies2.push(e); weapons2.push(w); }
if(type==3){ enemies3.push(e); weapons3.push(w); }

},

hitEnemy: function(enemy,bullet){

bullet.kill();
enemy.kill();

counter++;

// 🔥 bonus vida enemy3
if(enemies3.includes(enemy)){
vida = Math.min(maxVida, vida*2);
}

},

hitPlayer: function(player,bullet){

bullet.kill();
vida -= 10;

},

// ================= ASTEROIDES =================

spawnAsteroids: function(){

let r = Math.random();

if(r < 0.6) this.createAst2();
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

a.scale.set(0.5);
a.body.velocity.x = 250; // 🔥 rápido

ast2.push(a);
},

createAst3: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide3');

game.physics.arcade.enable(a);

a.scale.set(3);
a.hp = 10;
a.body.mass = 10;

ast3.push(a);
},

updateAsteroids: function(){

// AST1
ast1.forEach(a=>{
game.physics.arcade.overlap(a,weapon.bullets,(a,b)=>{
b.kill();
a.hp--;
if(a.hp<=0)a.kill();
});
});

// AST2
ast2.forEach(a=>{
game.physics.arcade.overlap(player,a,()=>{
vida -=5;
a.kill();
});
});

// AST3
ast3.forEach(a=>{
game.physics.arcade.overlap(a,weapon.bullets,(a,b)=>{
b.kill();
a.hp--;
if(a.hp<=0)a.kill();
});
});

},

// ================= UTIL =================

spawnFueraPantalla: function(){

let side = Math.floor(Math.random()*4);
let margin = 800;

if(side==0) return {x:player.x + 2000, y:player.y + game.rnd.integerInRange(-margin,margin)};
if(side==1) return {x:player.x - 2000, y:player.y + game.rnd.integerInRange(-margin,margin)};
if(side==2) return {x:player.x + game.rnd.integerInRange(-margin,margin), y:player.y + 2000};
return {x:player.x + game.rnd.integerInRange(-margin,margin), y:player.y - 2000};

},

handleInput: function(pointer){

let now = Date.now();

// DOBLE TAP (MOBILE)
if(now - lastTap < 300){
this.fire();
}

lastTap = now;

// CLICK PC
if(pointer.leftButton && pointer.leftButton.isDown){
this.fire();
}

},

fire: function(){
weapon.fire();
},

dead: function(){

// 🔥 RESET LIMPIO
enemies = [];
enemies2 = [];
enemies3 = [];

weapons1 = [];
weapons2 = [];
weapons3 = [];

ast1 = [];
ast2 = [];
ast3 = [];

vida = maxVida;
counter = 0;

game.state.restart(true,false);

}

};
