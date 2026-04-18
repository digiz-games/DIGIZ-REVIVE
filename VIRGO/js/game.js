// ================= VARIABLES =================
var player;

var enemies = [], enemies2 = [], enemies3 = [];
var weapons1 = [], weapons2 = [], weapons3 = [];

var ast1Group, ast2Group, ast3Group;

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

// WEAPON
weapon = game.add.weapon(40,'bullet');
weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
weapon.bulletLifespan = 800;
weapon.bulletSpeed = 800;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

// ===== GROUPS (OPTIMIZACIÓN) =====
ast1Group = game.add.group();
ast2Group = game.add.group();
ast3Group = game.add.group();

ast1Group.enableBody = true;
ast2Group.enableBody = true;
ast3Group.enableBody = true;

// SPAWN
game.time.events.loop(1500,this.spawnEnemy,this);
game.time.events.loop(700,this.spawnAsteroids,this);

game.input.onDown.add(this.handleInput,this);

startTime = game.time.now;

},

update: function(){

if(vida <= 0){ this.dead(); return; }

// MOVIMIENTO
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
// (igual que tu versión, no tocado para no romperte nada)

updateEnemies: function(){
this.updateEnemyGroup(enemies,weapons1,120,1200,0.2,1);
this.updateEnemyGroup(enemies2,weapons2,300,500,0.3,2);
this.updateEnemy3();
},

updateEnemyGroup: function(list,weapons,speed,rate,prob,type){

for(let i=list.length-1;i>=0;i--){

let e = list[i];
let w = weapons[i];

if(!e.exists){
list.splice(i,1);
weapons.splice(i,1);
continue;
}

game.physics.arcade.moveToObject(e,player,speed);
e.rotation = game.physics.arcade.angleBetween(e,player);

if(game.time.now > w.nextFire){
w.fireAtSprite(player);
if(Math.random()<prob){
if(type==1) sndLaser1.play();
if(type==2) sndLaser2.play();
}
w.nextFire = game.time.now + rate;
}

this.checkHits(e,w,type);

}

},

updateEnemy3: function(){

for(let i=enemies3.length-1;i>=0;i--){

let e = enemies3[i];
let w = weapons3[i];

if(!e.exists){
enemies3.splice(i,1);
weapons3.splice(i,1);
continue;
}

game.physics.arcade.moveToObject(e,player,80);
e.rotation = game.physics.arcade.angleBetween(e,player);

if(game.time.now > w.nextFire){

for(let a=0;a<360;a+=30){
let b = w.fire();
if(b){
game.physics.arcade.velocityFromAngle(a,500,b.body.velocity);
}
}

sndLaser3.play();
w.nextFire = game.time.now + 2000;
}

this.checkHits(e,w,3);

}

},

checkHits: function(e,w,type){

game.physics.arcade.overlap(e,weapon.bullets,(enemy,bullet)=>{

bullet.kill();
enemy.hp--;

if(enemy.hp <= 0){

enemy.kill();
sndExplosion.play();
counter++;

if(type==1){
kills1++;
if(kills1 % 5 === 0){
let p = this.spawnFueraPantalla();
this.createEnemy(2,p.x,p.y);
}
}

if(type==2){
kills2++;
if(kills2 % 5 === 0){
let p = this.spawnFueraPantalla();
this.createEnemy(3,p.x,p.y);
}
}

if(type==3){
vida = Math.min(maxVida, vida*2);
}

}

},null,this);

game.physics.arcade.overlap(player,w.bullets,this.hitPlayer,null,this);

},

spawnEnemy: function(){
let pos = this.spawnFueraPantalla();
this.createEnemy(1,pos.x,pos.y);
},

// ================= ASTEROIDES =================

spawnAsteroids: function(){

let r = Math.random();

if(r < 0.6) this.createAst2();
else if(r < 0.85) this.createAst1();
else this.createAst3();

},

createAst1: function(){

let pos = this.spawnFueraPantalla();
let a = ast1Group.create(pos.x,pos.y,'asteroide');

let scale = game.rnd.realInRange(0.5,1.5);
a.scale.set(scale);

a.hp = Math.floor(3 * scale);

a.body.mass = scale * 2;
a.body.bounce.set(0.6);

a.body.velocity.set(
game.rnd.integerInRange(-50,50),
game.rnd.integerInRange(-50,50)
);

},

createAst2: function(){

let pos = this.spawnFueraPantalla();
let a = ast2Group.create(pos.x,pos.y,'asteroide2');

let scale = game.rnd.frac()<0.8 ? 0.3 : game.rnd.realInRange(1,4);
a.scale.set(scale);

a.hp = Math.floor(3 * scale);

let speed = 800 - (scale*150);

game.physics.arcade.velocityFromAngle(game.rnd.angle(),speed,a.body.velocity);

},

createAst3: function(){

let pos = this.spawnFueraPantalla();
let a = ast3Group.create(pos.x,pos.y,'asteroide3');

let scale = game.rnd.realInRange(3,6);
a.scale.set(scale);

a.hp = Math.floor(10 + scale*5);

a.body.mass = scale * 40;
a.body.bounce.set(0.05);

a.body.velocity.set(
game.rnd.integerInRange(-10,10),
game.rnd.integerInRange(-10,10)
);

a.body.drag.set(60);

},

updateAsteroids: function(){

// player colisiones
game.physics.arcade.collide(player, ast1Group);
game.physics.arcade.collide(player, ast3Group, function(player,a){
    a.body.velocity.x *= 0.2;
    a.body.velocity.y *= 0.2;
});

// ast1 muere contra ast3
game.physics.arcade.collide(ast1Group, ast3Group, function(a1,a3){
    a1.kill();
    sndExplosion.play();
});

// ast3 entre sí
game.physics.arcade.collide(ast3Group, ast3Group, function(a,b){
    let dist = game.physics.arcade.distanceBetween(a,b);
    if(dist < (a.width * 0.5)){
        a.kill();
        b.kill();
        sndExplosion.play();
    }
});

// ast2
game.physics.arcade.overlap(ast2Group, weapon.bullets, function(a,b){
    b.kill();
    a.hp--;
    if(a.hp<=0){ a.kill(); sndExplosion.play(); }
});

game.physics.arcade.overlap(player, ast2Group, function(player,a){
    vida -= 5;
    a.kill();
    sndExplosion.play();
});

// disparos
game.physics.arcade.overlap(ast1Group, weapon.bullets, function(a,b){
    b.kill(); a.hp--;
    if(a.hp<=0){ a.kill(); sndExplosion.play(); }
});

game.physics.arcade.overlap(ast3Group, weapon.bullets, function(a,b){
    b.kill(); a.hp--;
    if(a.hp<=0){ a.kill(); sndExplosion.play(); }
});

// limitar velocidad ast3
ast3Group.forEachAlive(function(a){
    let maxSpeed = 40;
    a.body.velocity.x = Phaser.Math.clamp(a.body.velocity.x, -maxSpeed, maxSpeed);
    a.body.velocity.y = Phaser.Math.clamp(a.body.velocity.y, -maxSpeed, maxSpeed);
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
let b = weapon.fire();
if(b) sndLaser.play();
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

game.input.onDown.removeAll();
game.input.onDown.addOnce(()=>game.state.restart(true,false));

}

};
