
const vehicleColors=[0xa52523,0xbdb546,0x7824c];

const scene= new THREE.Scene();

const playerCar=Car();
scene.add(playerCar);

//definir luzes
const ambientLight=new THREE.AmbientLight(0xffffff,0.6);
scene.add(ambientLight);

const dirlight=new THREE.DirectionalLight(0xffffff,0.6);
dirlight.position.set(100,-300,400);
scene.add(dirlight);

//definir camaras
const aspectRatio= window.innerWidth / window.innerHeight;
const cameraWidth=960//aumentar a distância que a camara se encontra do objeto;
const cameraHeight=cameraWidth/aspectRatio;


const camera=new THREE.OrthographicCamera(
    cameraWidth / -2,//esquerda
    cameraWidth / 2,//direita
    cameraHeight / 2,//cima
    cameraHeight / -2,//baixo
    0,//próximo do plano de visualização
    1000//longe do plano de visualização
);


camera.position.set(0,-260,300);//altera posição da camara
//camera.up.set(0,0,1);rotação da camara
camera.lookAt(0,0,0);



//Calcular os angulos para o desenho da pista

//definição do circulo interior e exterior da pista
const trackRadius=225;
const trackWidth=45;
const innerTrackRadius=trackRadius-trackWidth;
const outerTrackRadius=trackRadius+trackWidth;

//angulo que irá desenhar o cirulo interior da primeira pista
const arcAngle1=(1/3)*Math.PI;//60 graus
const deltaY=Math.sin(arcAngle1)*innerTrackRadius;
const arcAngle2=Math.asin(deltaY/outerTrackRadius);

//ponto central entre o centro das duas pistas
const arcCenterX=(
    Math.cos(arcAngle1)*innerTrackRadius +
    Math.cos(arcAngle2)*outerTrackRadius
)/2;

//angulo que irá desenhar o cirulo interior da segunda pista
const arcAngle3=Math.acos(arcCenterX/innerTrackRadius);
//angulo que irá desenhar o cirulo exterior da segunda pista
const arcAngle4=Math.acos(arcCenterX/outerTrackRadius);

renderMap(cameraWidth,cameraHeight*2);



const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.render(scene,camera);

document.body.appendChild(renderer.domElement);



function Car(){
    const car = new THREE.Group();

    const backWheel = Wheel();
    backWheel.position.x=-18;
    car.add(backWheel);

    const frontwheel=Wheel();
    frontwheel.position.x=18;
    car.add(frontwheel);

    const main=new THREE.Mesh(
        new THREE.BoxBufferGeometry(60,30,15),
        new THREE.MeshLambertMaterial({color:pickRandom(vehicleColors)})
    );
    main.position.z=12;
    car.add(main);

    const carFrontTexture=FrontWindowTexture();
    carFrontTexture.center=new THREE.Vector2(0.5,0.5);
    carFrontTexture.rotation=-Math.PI / 2;

    const carBackTexture=FrontWindowTexture();
    carBackTexture.center=new THREE.Vector2(0.5,0.5);
    carBackTexture.rotation=-Math.PI /2;

    const carRightSideTexture=SideWindowTexture();

    const carLeftSideTexture=SideWindowTexture();
    carLeftSideTexture.flipY=false;

    const cabin=new THREE.Mesh(
        new THREE.BoxBufferGeometry(33,24,12),[
        new THREE.MeshLambertMaterial({map:carFrontTexture}),
        new THREE.MeshLambertMaterial({map:carBackTexture}),
        new THREE.MeshLambertMaterial({map:carLeftSideTexture}),
        new THREE.MeshLambertMaterial({map:carRightSideTexture}),
        new THREE.MeshLambertMaterial({color:0xffffff}),
        new THREE.MeshLambertMaterial({color:0xffffff})]
    );
    cabin.position.x=-6;
    cabin.position.z=25.5;
    car.add(cabin);

    return car;

}

function Wheel(){
    const wheel = new THREE.Mesh(
        new THREE.BoxBufferGeometry(12,33,12),
        new THREE.MeshLambertMaterial({color:0x333333})
    );
    wheel.position.z=6;
    return wheel;
}
function pickRandom(array){
return array[Math.floor(Math.random()*array.length)];
}

function FrontWindowTexture(){
    const canvas=document.createElement('canvas');
    canvas.width=64;
    canvas.height=32;
    const contexto=canvas.getContext('2d');

    contexto.fillStyle='#ffffff';
    contexto.fillRect(0,0,64,32);

    contexto.fillStyle='#666666';
    contexto.fillRect(8,8,48,24);

    return new THREE.CanvasTexture(canvas);
}

function SideWindowTexture(){
    const canvas=document.createElement('canvas');
    canvas.width=128;
    canvas.height=32;
    const contexto=canvas.getContext('2d');

    contexto.fillStyle='#ffffff';
    contexto.fillRect(0,0,128,32);

    contexto.fillStyle='#666666';
    contexto.fillRect(8,8,38,24);
    contexto.fillRect(58,8,60,24);

    return new THREE.CanvasTexture(canvas);
}

function renderMap(mapWidth,mapHeight){
const TexturaLinhas=DesenharLinhasPista(mapWidth,mapHeight);

const planeGeometry=new THREE.PlaneBufferGeometry(mapWidth,mapHeight);
const planeMaterial=new THREE.MeshLambertMaterial({
    map:TexturaLinhas,
});


const plano=new THREE.Mesh(planeGeometry,planeMaterial);
scene.add(plano);

//preencher o interior ,exterior e o centro das duas pistas com textura;
const ilhaesquerda=getIlhaEsquerda();
const ilhadireita=getIlhaDireita();
const ilhameio=getIlhaMeio();
const campoexterior=getCampoExterior(mapWidth,mapHeight);


const fieldGeometry=new THREE.ExtrudeGeometry(
    [ilhaesquerda,ilhameio,ilhadireita,campoexterior],
    {depth:6,bevelEnabled:false}
    );

    const fieldMesh=new THREE.Mesh(fieldGeometry,[
        new THREE.MeshLambertMaterial({color:0x67c240}),
        new THREE.MeshLambertMaterial({color:0x23311c})
    ]);

    scene.add(fieldMesh);

}



function DesenharLinhasPista(mapWidth,mapHeight){
    const canvas = document.createElement('canvas');
    canvas.width=mapWidth;
    canvas.height=mapHeight;
    const contexto=canvas.getContext('2d');

    contexto.fillStyle="#546E90";
    contexto.fillRect(0,0,mapWidth,mapHeight);
    
    contexto.lineWidth=2;
    contexto.strokeStyle="#E0FFFF";
    contexto.setLineDash([10,14]);

    //Desenhar circulo da esquerda
    contexto.beginPath();
    contexto.arc(
        mapWidth / 2 - arcCenterX,
        mapHeight / 2,
        trackRadius,
        0,
        Math.PI * 2
    );
    contexto.stroke();

    //Desenhar circulo da esquerda
    contexto.beginPath();
    contexto.arc(
        mapWidth / 2 + arcCenterX,
        mapHeight / 2,
        trackRadius,
        0,
        Math.PI * 2
    );
    contexto.stroke();

    return new THREE.CanvasTexture(canvas);
}

function getIlhaEsquerda(){
    const ilhaesquerda=new THREE.Shape();

    ilhaesquerda.absarc(//responsável por preencher com uma textura desdo o angulo 60º até -60º apartir do ponto (-1,0)centro da ilha;
        -arcCenterX,
        0,
        innerTrackRadius,
        arcAngle1,
        -arcAngle1,
        false
    );

    ilhaesquerda.absarc(
        arcCenterX,
        0,
        outerTrackRadius,
        Math.PI+arcAngle2,
        Math.PI-arcAngle2,
        true
    );

    return ilhaesquerda;
}

function getIlhaMeio(){
    const ilhameio=new THREE.Shape();

    ilhameio.absarc(
        -arcCenterX, 
        0,
        innerTrackRadius,
        arcAngle3,
        -arcAngle3,
        true
    );

    ilhameio.absarc(
        arcCenterX,
        0,
        innerTrackRadius,
        Math.PI+arcAngle3,
        Math.PI-arcAngle3,
        true
    );

    return ilhameio;
}

function getIlhaDireita(){
    const ilhadireita=new THREE.Shape();

    ilhadireita.absarc(//responsável por preencher com uma textura desdo o angulo 60º até -60º apartir do ponto (-1,0)centro da ilha;
        arcCenterX,
        0,
        innerTrackRadius,
        Math.PI-arcAngle1,
        Math.PI+arcAngle1,
        true
    );

    ilhadireita.absarc(
        -arcCenterX,
        0,
        outerTrackRadius,
        -arcAngle2,
        arcAngle2,
        false
    );

    return ilhadireita;
}

function getCampoExterior(mapWidth,mapHeight){
const field=new THREE.Shape();

field.moveTo(-mapWidth / 2,-mapHeight / 2);
field.lineTo(0,-mapHeight / 2);

field.absarc(//desenha o contorno da pista da esquerda
    -arcCenterX,
    0,
    outerTrackRadius,
    -arcAngle4,
    arcAngle4,
    true
);

field.absarc(//desenha o contorno da pista da direita
    arcCenterX,
    0,
    outerTrackRadius,
    Math.PI -arcAngle4,
    Math.PI + arcAngle4,
    true
);

//desenha parte de baixo,da esquerda ,da direita e de cima ,do campo exterior.
field.lineTo(0,-mapHeight / 2);
field.lineTo(mapWidth / 2,-mapHeight / 2);
field.lineTo(mapWidth / 2,mapHeight / 2);
field.lineTo(-mapWidth / 2,mapHeight / 2);

return field;

}



