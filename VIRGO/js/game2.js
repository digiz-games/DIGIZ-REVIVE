const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, player, camera, ui;

let enemies1 = [], enemies2 = [], enemies3 = [];
let bulletsPlayer = [], bulletsEnemy = [];

let vida = 200, maxVida = 200;
let score = 0;
let lastFire = 0;

// ================= SCENE =================
const createScene = () => {

scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0,0,0,1);

// ===== CÁMARA 2D =====
camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0,0,-10), scene);
camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

let ratio = engine.getRenderWidth()/engine.getRenderHeight();
let size = 50;

camera.orthoLeft = -size * ratio;
camera.orthoRight = size * ratio;
camera.orthoTop = size;
camera.orthoBottom = -size;

camera.rotation = new BABYLON.Vector3(0,0,0);
camera.inputs.clear();

// ===== LUZ =====
new BABYLON.HemisphericLight("l", new BABYLON.Vector3(0,1,0), scene);

// ===== FONDO =====
let bg = BABYLON.MeshBuilder.CreatePlane("bg",{size:200},scene);

let bgMat = new BABYLON.StandardMaterial("bgMat",scene);
bgMat.diffuseTexture = new BABYLON.Texture("assets/space_bg.jpg",scene);
bgMat.emissiveTexture = bgMat.diffuseTexture;
bgMat.disableLighting = true;

bg.material = bgMat;
bg.position.z = 5;
bg.isPickable = false;

// ===== PLAYER =====
console.log("scene:", scene);
console.log("createSprite:", createSprite);
    
player = createSprite("assets/sprites/nave.png",4);

if(!player){
    throw new Error("❌ player no se creó");
}

player.position = new BABYLON.Vector3(0,0,0);

  player = createSprite("assets/sprites/nave.png",4);
console.log("player creado:", player);  

// ===== INPUT =====
let pointerDown = false;

scene.onPointerDown = ()=> pointerDown = true;
scene.onPointerUp = ()=> pointerDown = false;

// ===== UI =====
createUI();

// ===== LOOP =====
scene.onBeforeRenderObservable.add(()=>{

let dt = engine.getDeltaTime()/1000;

// MOVIMIENTO
if(pointerDown){
let target = getMouseWorld();
let dir = target.subtract(player.position).normalize();
player.position.addInPlace(dir.scale(25*dt));
}

// ROTACIÓN
let dirRot = getMouseWorld().subtract(player.position);
player.rotation.z = Math.atan2(dirRot.y, dirRot.x);

// DISPARO
if(Date.now() - lastFire > 120){
shootPlayer();
lastFire = Date.now();
}

// UPDATE
updateBullets(dt);
updateEnemies(dt);
updateUI();

});

setInterval(spawnEnemy,1500);

return scene;
};

// ================= SPRITE =================
function createSprite(texture,size){

let m = BABYLON.MeshBuilder.CreatePlane("s",{size},scene);

let mat = new BABYLON.StandardMaterial("mat",scene);

let tex = new BABYLON.Texture(
    texture,
    scene,
    false,
    false,
    BABYLON.Texture.NEAREST_SAMPLINGMODE,
    () => {
        // 🔥 aplicar cuando carga
        let frameSize = 64;

        let texW = tex.getSize().width;
        let texH = tex.getSize().height;

        tex.uScale = frameSize / texW;
        tex.vScale = frameSize / texH;
    }
);

tex.hasAlpha = true;

mat.diffuseTexture = tex;
mat.emissiveColor = new BABYLON.Color3(1,1,1);

mat.backFaceCulling = false;
mat.disableDepthWrite = true;

m.material = mat;
m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

m.position.z = 0;

return m;
}

// ================= INPUT =================
function getMouseWorld(){
let x = (scene.pointerX / engine.getRenderWidth()) * 100 - 50;
let y = -(scene.pointerY / engine.getRenderHeight()) * 100 + 50;
return new BABYLON.Vector3(x,y,0);
}

// ================= PLAYER =================
function shootPlayer(){

let b = createSprite("assets/sprites/laser.png",1);
b.position = player.position.clone();
b.position.z = -1;

b.dir = getMouseWorld().subtract(player.position).normalize();

bulletsPlayer.push(b);
}

// ================= ENEMIES =================
function spawnEnemy(){
let p = spawnOutside();
createEnemy(1,p.x,p.y);
}

function createEnemy(type,x,y){

let tex = type==1?"enemy":type==2?"enemy2":"enemy3";

let e = createSprite(`assets/sprites/${tex}.png`, 4);
e.position = new BABYLON.Vector3(x,y,0);

e.hp = type==1?1:type==2?3:5;
e.type = type;
e.lastFire = 0;

if(type==1) enemies1.push(e);
if(type==2) enemies2.push(e);
if(type==3) enemies3.push(e);
}

function updateEnemies(dt){

[enemies1,enemies2,enemies3].forEach(list=>{
list.forEach((e,i)=>{

let dir = player.position.subtract(e.position).normalize();
let speed = e.type==1?12:e.type==2?20:6;

e.position.addInPlace(dir.scale(speed*dt));

// DISPARO
if(Date.now()-e.lastFire > 1000){

let b = createSprite(`assets/sprites/laser${e.type}.png`,1);
b.position = e.position.clone();
b.position.z = -1;

b.dir = player.position.subtract(e.position).normalize();

bulletsEnemy.push(b);

e.lastFire = Date.now();
}

// HIT
bulletsPlayer.forEach((b,bi)=>{
if(dist(e,b)<2){
b.dispose();
bulletsPlayer.splice(bi,1);

e.hp--;
if(e.hp<=0){
e.dispose();
list.splice(i,1);
score++;
}
}
});

});
});

// HIT PLAYER
bulletsEnemy.forEach((b,bi)=>{
if(dist(player,b)<2){
vida -= 10;
b.dispose();
bulletsEnemy.splice(bi,1);
}
});
}

// ================= UI =================
function createUI(){
ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui");

let text = new BABYLON.GUI.TextBlock();
text.color = "white";
text.fontSize = 24;
text.top = "-45%";
text.left = "-45%";

ui.addControl(text);
ui.score = text;
}

function updateUI(){
ui.score.text = "Score: " + score;
}

// ================= UTILS =================
function dist(a,b){
return BABYLON.Vector3.Distance(a.position,b.position);
}

function updateBullets(dt){

[bulletsPlayer,bulletsEnemy].forEach(list=>{
list.forEach((b,i)=>{
b.position.addInPlace(b.dir.scale(60*dt));

if(BABYLON.Vector3.Distance(player.position,b.position)>120){
b.dispose();
list.splice(i,1);
}
});
});
}

function spawnOutside(){

let side = Math.floor(Math.random()*4);
let d = 80;

if(side==0) return {x:80,y:Math.random()*d-d/2};
if(side==1) return {x:-80,y:Math.random()*d-d/2};
if(side==2) return {x:Math.random()*d-d/2,y:80};
return {x:Math.random()*d-d/2,y:-80};
}

// ================= INIT =================
scene = createScene();

engine.runRenderLoop(()=> scene.render());
window.addEventListener("resize",()=>engine.resize());
