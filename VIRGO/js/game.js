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

// LIMPIEZA
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

// WEAPON PLAYER
weapon = game.add.weapon(40,'bullet');
weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;
weapon.bulletLifespan = 150;
weapon.bulletSpeed = 1800;
weapon.fireRate = 120;
weapon.trackSprite(player,0,0,true);

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

createEnemy: function(type,x,y){

let key = type==1?'enemy':type==2?'enemy2':'enemy3';

let e = game.add.sprite(x,y,key,0);
game.physics.arcade.enable(e);
e.anchor.set(0.5);

if(type==3) e.scale.set(2.5);

e.hp = type==1?1:type==2?3:5;

let bulletKey = type==1?'laser1':type==2?'laser2':'laser3';

let w = game.add.weapon(20,bulletKey);
w.trackSprite(e,0,0,true);

if(type==1){ w.bulletSpeed=600; w.bulletLifespan=5; }
if(type==2){ w.bulletSpeed=1600; w.bulletLifespan=30; }
if(type==3){ w.bulletSpeed=200; w.bulletLifespan=2500; }

w.nextFire = 0;

if(type==1){ enemies.push(e); weapons1.push(w); }
if(type==2){ enemies2.push(e); weapons2.push(w); }
if(type==3){ enemies3.push(e); weapons3.push(w); }

},

hitPlayer: function(player,bullet){
bullet.kill();
vida -= 10;
sndExplosion.play();
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
let a = game.add.sprite(pos.x,pos.y,'asteroide');
game.physics.arcade.enable(a);

let scale = game.rnd.realInRange(0.5,1.5);
a.scale.set(scale);

a.hp = Math.floor(3 * scale);

a.body.mass = scale * 2;
a.body.bounce.set(0.6);

a.body.velocity.set(
game.rnd.integerInRange(-50,50),
game.rnd.integerInRange(-50,50)
);

ast1.push(a);

},

createAst2: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide2');
game.physics.arcade.enable(a);

let scale = game.rnd.frac()<0.8 ? 0.3 : game.rnd.realInRange(1,4);
a.scale.set(scale);

let speed = 800 - (scale*150);

game.physics.arcade.velocityFromAngle(game.rnd.angle(),speed,a.body.velocity);

ast2.push(a);

},

createAst3: function(){

let pos = this.spawnFueraPantalla();
let a = game.add.sprite(pos.x,pos.y,'asteroide3');
game.physics.arcade.enable(a);

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
  
ast3.push(a);

},

updateAsteroids: function(){

// ================= COLISIONES =================

// ast1 normales
ast1.forEach(a=>{
    game.physics.arcade.collide(player,a);
});

// ast3 pesados (con amortiguación real)
ast3.forEach(a=>{
    game.physics.arcade.collide(player,a, function(player, a){

        // 🔥 mata el impulso acumulado
        a.body.velocity.x *= 0.2;
        a.body.velocity.y *= 0.2;

    });
});


// ================= LIMITADOR DE VELOCIDAD =================

ast3.forEach(a => {

    let maxSpeed = 40;

    a.body.velocity.x = Phaser.Math.clamp(a.body.velocity.x, -maxSpeed, maxSpeed);
    a.body.velocity.y = Phaser.Math.clamp(a.body.velocity.y, -maxSpeed, maxSpeed);

});


// ================= DAÑO Y DESTRUCCIÓN =================

// ast1 destrucción
ast1.forEach(a=>{
    game.physics.arcade.overlap(a,weapon.bullets,(a,b)=>{
        b.kill(); 
        a.hp--;
        if(a.hp<=0){ 
            a.kill(); 
            sndExplosion.play(); 
        }
    });
});

// ast3 destrucción
ast3.forEach(a=>{
    game.physics.arcade.overlap(a,weapon.bullets,(a,b)=>{
        b.kill(); 
        a.hp--;
        if(a.hp<=0){ 
            a.kill(); 
            sndExplosion.play(); 
        }
    });
});

// ast2 destructivo
ast2.forEach(a=>{
    game.physics.arcade.overlap(player,a,()=>{
        vida -= 5;
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
