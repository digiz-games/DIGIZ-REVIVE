// ================= VARIABLES =================
var player;

var enemies = [];
var weapons1 = [];

var ast2 = [];

var vida = 200;
var maxVida = 200;

var weapon;
var counter = 0;

var lastTap = 0;
var startTime = 0;

var scoreText;
var vidaBar;

var music;
var sndLaser, sndLaser1, sndExplosion;

// ================= GAME =================
var Game = {

preload: function(){

game.load.image('space', 'assets/space_bg.jpg');
game.load.spritesheet('ship', 'assets/sprites/nave.png', 64, 64);

game.load.spritesheet('enemy', 'assets/sprites/enemy.png',64,64);

game.load.image('bullet', 'assets/sprites/laser.png');
game.load.image('laser1', 'assets/sprites/laser1.png');

game.load.image('asteroide2', 'assets/sprites/asteroide2.png');

game.load.audio('laser', 'assets/audio/laser.mp3');
game.load.audio('laser1', 'assets/audio/laser1.mp3');
game.load.audio('explosion', 'assets/audio/explosion.wav');
game.load.audio('music', 'assets/audio/virgo_song.mp3');

},

create: function(){

// LIMPIEZA
game.world.removeAll();
game.time.events.removeAll();
game.input.onDown.removeAll();

enemies = [];
weapons1 = [];
ast2 = [];

vida = maxVida;
counter = 0;

game.world.setBounds(0,0,20000,20000);
game.physics.startSystem(Phaser.Physics.ARCADE);
game.add.tileSprite(0,0,20000,20000,'space');

// AUDIO
sndLaser = game.add.audio('laser'); sndLaser.volume = 0.4;
sndLaser1 = game.add.audio('laser1'); sndLaser1.volume = 0.15;
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

// WEAPON PLAYER
weapon = game.add.weapon(40,'bullet');
weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
weapon.bulletLifespan = 1000;
weapon.bulletSpeed = 800;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

// TIMERS
game.time.events.loop(1500,this.spawnEnemy,this);
game.time.events.loop(800,this.spawnAsteroids,this);

game.input.onDown.add(this.handleInput,this);

startTime = game.time.now;

},

update: function(){

if(vida <= 0){ this.dead(); return; }

// MOVIMIENTO CORRECTO
if(game.input.activePointer.isDown){

game.physics.arcade.accelerateToPointer(player, game.input.activePointer, 600);
player.rotation = game.physics.arcade.angleToPointer(player);

}else{
player.body.acceleration.set(0);
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

for(let i=enemies.length-1;i>=0;i--){

let e = enemies[i];
let w = weapons1[i];

if(!e.exists){
enemies.splice(i,1);
weapons1.splice(i,1);
continue;
}

// movimiento hacia jugador
game.physics.arcade.moveToObject(e,player,150);
e.rotation = game.physics.arcade.angleBetween(e,player);

// disparo
if(game.time.now > w.nextFire){
w.fireAtSprite(player);

if(game.rnd.frac()<0.2) sndLaser1.play();

w.nextFire = game.time.now + 1200;
}

// colisiones
game.physics.arcade.overlap(e,weapon.bullets,this.hitEnemy,null,this);
game.physics.arcade.overlap(player,w.bullets,this.hitPlayer,null,this);

}

},

spawnEnemy: function(){

let pos = this.spawnFueraPantalla();
this.createEnemy(pos.x,pos.y);

},

createEnemy: function(x,y){

let e = game.add.sprite(x,y,'enemy',0);
game.physics.arcade.enable(e);
e.anchor.set(0.5);
e.hp = 1;

let w = game.add.weapon(10,'laser1');
w.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
w.bulletLifespan = 1200;
w.trackSprite(e,0,0,true);
w.nextFire = 0;

enemies.push(e);
weapons1.push(w);

},

hitEnemy: function(enemy,bullet){

bullet.kill();
enemy.hp--;

if(enemy.hp <= 0){
enemy.kill();
sndExplosion.play();
counter++;
}

},

hitPlayer: function(player,bullet){

bullet.kill();
vida -= 10;
sndExplosion.play();

},

// ================= ASTEROIDES =================

spawnAsteroids: function(){

if(Math.random()<0.7){
this.createAst2();
}

},

createAst2: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide2');
game.physics.arcade.enable(a);

let speed = game.rnd.integerInRange(200,800);

// dirección aleatoria REAL (antes solo X)
let angle = game.rnd.angle();
game.physics.arcade.velocityFromAngle(angle, speed, a.body.velocity);

ast2.push(a);

},

updateAsteroids: function(){

for(let i=ast2.length-1;i>=0;i--){

let a = ast2[i];

if(!a.exists){
ast2.splice(i,1);
continue;
}

game.physics.arcade.overlap(player,a,()=>{
vida -=5;
a.kill();
sndExplosion.play();
});

}

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
if(b){
sndLaser.play();
}

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

let txt = game.add.text(game.camera.width/2,game.camera.height/2,
"GAME OVER\n\nScore: "+counter+"\nTiempo: "+tiempo+"s\n\nToca para reiniciar",
{font:"40px Arial",fill:"#fff",align:"center"});

txt.anchor.set(0.5);
txt.fixedToCamera = true;

// RESTART LIMPIO
game.input.onDown.removeAll();
game.input.onDown.addOnce(()=>{
game.state.restart(true,false);
});

}

};
