const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, player, camera, ui;

let enemies = [];
let bulletsPlayer = [], bulletsEnemy = [];

let vida = 200, maxVida = 200;
let score = 0;

let shooting = false;

// ================= SCENE =================
const createScene = () => {

scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0,0,0,1);

// ===== CÁMARA 2D =====
camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0,0,-10), scene);
camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

let ratio = engine.getRenderWidth()/engine.getRenderHeight();
let size = 30; // 🔥 zoom mejor (antes 50)

camera.orthoLeft = -size * ratio;
camera.orthoRight = size * ratio;
camera.orthoTop = size;
camera.orthoBottom = -size;

camera.inputs.clear();

// ===== LUZ =====
new BABYLON.HemisphericLight("l", new BABYLON.Vector3(0,1,0), scene);

// ===== FONDO (INFINITO REAL + MÁS GRANDE) =====
let bg = BABYLON.MeshBuilder.CreatePlane("bg",{size:500},scene);

let bgMat = new BABYLON.StandardMaterial("bgMat",scene);
let bgTex = new BABYLON.Texture("assets/space_bg.jpg",scene);

// 🔥 CLAVE: textura MUCHO más grande
bgTex.uScale = 2;   // antes 20
bgTex.vScale = 2;

bgTex.updateSamplingMode(BABYLON.Texture.NEAREST_SAMPLINGMODE);

bgMat.diffuseTexture = bgTex;
bgMat.emissiveTexture = bgTex;
bgMat.disableLighting = true;

bg.material = bgMat;
bg.position.z = 10;

bg.isPickable = true;
bg.name = "bg";

// ===== PLAYER =====
player = createSprite("assets/sprites/nave.png",4);
player.position = new BABYLON.Vector3(0,0,0);

// ===== INPUT =====
scene.onPointerObservable.add((pointerInfo)=>{
if(pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN){
    if(pointerInfo.event.button === 0) shooting = true;
}
if(pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP){
    if(pointerInfo.event.button === 0) shooting = false;
}
});

// ===== UI =====
createUI();

// ===== LOOP =====
scene.onBeforeRenderObservable.add(()=>{

let dt = engine.getDeltaTime()/1000;

// MOUSE
let mouse = getMouseWorld();
let dir = mouse.subtract(player.position);

if(dir.length() > 0.1){
    dir = dir.normalize();
}

// MOVIMIENTO
player.position.addInPlace(dir.scale(25*dt));

// ROTACIÓN
player.rotation.z = Math.atan2(dir.y, dir.x);

// CÁMARA
camera.position.x = player.position.x;
camera.position.y = player.position.y;

// 🔥 FONDO INFINITO (más lento = más grande visualmente)
bg.material.diffuseTexture.uOffset = player.position.x * 0.002;
bg.material.diffuseTexture.vOffset = player.position.y * 0.002;

// DISPARO
if(shooting){
    shootPlayer(dir);
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
let tex = new BABYLON.Texture(texture,scene);

tex.hasAlpha = true;

let frameSize = 64;

tex.onLoadObservable.add(()=>{
    tex.uScale = frameSize / tex.getSize().width;
    tex.vScale = frameSize / tex.getSize().height;
});

mat.diffuseTexture = tex;
mat.emissiveColor = new BABYLON.Color3(1,1,1);

mat.backFaceCulling = false;
mat.disableDepthWrite = true;

m.material = mat;
m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

return m;
}

// ================= INPUT =================
function getMouseWorld(){

let pick = scene.pick(scene.pointerX, scene.pointerY, (mesh)=> mesh.name === "bg");

if(pick.hit){
    return pick.pickedPoint;
}

return player.position.clone();

}

// ================= PLAYER =================
function shootPlayer(dir){

if(!shootPlayer.lastTime) shootPlayer.lastTime = 0;
if(Date.now() - shootPlayer.lastTime < 120) return;

shootPlayer.lastTime = Date.now();

let b = createSprite("assets/sprites/laser.png",1);
b.position = player.position.clone();
b.position.z = -1;

b.dir = dir.clone();

bulletsPlayer.push(b);
}

// ================= ENEMIES =================
function spawnEnemy(){
let p = spawnOutside();
createEnemy(p.x,p.y);
}

function createEnemy(x,y){

let e = createSprite("assets/sprites/enemy.png",4);
e.position = new BABYLON.Vector3(x,y,0);

e.hp = 1;
e.lastFire = 0;

enemies.push(e);
}

function updateEnemies(dt){

for(let i = enemies.length-1; i>=0; i--){

let e = enemies[i];

// movimiento
let dir = player.position.subtract(e.position).normalize();
e.position.addInPlace(dir.scale(12*dt));

// 🔥 COLISIÓN REAL ARREGLADA
for(let j = bulletsPlayer.length-1; j>=0; j--){

let b = bulletsPlayer[j];

let hitDist = 4;

if(BABYLON.Vector3.DistanceSquared(e.position, b.position) < hitDist * hitDist){

b.dispose();
bulletsPlayer.splice(j,1);

e.dispose();
enemies.splice(i,1);
score++;

break;
}

}

}

}

// ================= BULLETS =================
function updateBullets(dt){

for(let i = bulletsPlayer.length-1; i>=0; i--){

let b = bulletsPlayer[i;

// 🔥 anti-salto de colisión
let step = b.dir.scale(60*dt);
b.position.addInPlace(step.scale(0.5));
b.position.addInPlace(step.scale(0.5));

if(BABYLON.Vector3.Distance(player.position,b.position)>120){
b.dispose();
bulletsPlayer.splice(i,1);
}

}

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
function spawnOutside(){

let side = Math.floor(Math.random()*4);
let d = 80;

let px = player.position.x;
let py = player.position.y;

if(side==0) return {x:px+80,y:py+(Math.random()*d-d/2)};
if(side==1) return {x:px-80,y:py+(Math.random()*d-d/2)};
if(side==2) return {x:px+(Math.random()*d-d/2),y:py+80};
return {x:px+(Math.random()*d-d/2),y:py-80};

}

// ================= INIT =================
scene = createScene();

engine.runRenderLoop(()=> scene.render());
window.addEventListener("resize",()=>engine.resize());
