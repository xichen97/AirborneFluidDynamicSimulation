/*global THREE:true*/
/*global Advect:true*/
/*global BoundaryDensity:true*/
/*global BoundaryPressure:true*/
/*global BoundaryVelocity:true*/
/*global Curl:true*/
/*global ExternalVelocity:true*/
/*global ExternalDensity:true*/
/*global ExternalTemperature:true*/
/*global Draw:true*/
/*global Slab:true*/
/*global Jacobi:true*/
/*global Divergence:true*/
/*global ExternalForces:true*/
/*global SubtractGradient:true*/
/*global VorticityFunc:true*/

//GUI
var button;
var buttonmask;

var scene;
var camera;
var renderer;

// properties
var velocity;
var density;
var temperature;
var pressure;
var diverge;
var gravityAcc = 9.8;
var dragC = 0.01;
var densityAir = 0.001225;
// var prob = 0.3;
var evaporation = 0.99;

var ambientTemperature = 0.0;
// slabs
var drawTexture;

var plane;
var finalMaterial;
var mesh;

// shaders
var advect;
var boundaryDensity;
var boundaryPressure;
var boundaryVelocity;
var curl;
var externalVelocity;
var externalForces;
var externalDensity;
var externalTemperature;
var draw;
var divergence;
var jacobi;
var subtractGradient;
var vorticityFunc;
var vorticity;

//renderer
var width;
var height;
var res = new THREE.Vector2(400, 400);
var delta_t = 0.5;

//var color = [50,50,50];

var radiusSettings = {
    Radius: 30.0
};

var sneezePos = new THREE.Vector3(30, 300, 1);
var sneezeVelocity = new THREE.Vector2(500, 0);
var sneezeDensity = new THREE.Vector3(50, 50, 50);

//set droplet
var resetdroplet = true;
var dropletDensity = 1; // 1kg/dm3   
var dropletPos = [];
var dropletRad = [];
var dropletVel = [];
var dropletMesh = [];
var dropletLengthSingleSneeze = 500; // user defined length
var dropletLength = 0;
var dropletInitialPos = new THREE.Vector3((sneezePos.x - (radiusSettings.Radius + res.x) / 2) / (res.x / 2),
                                        (sneezePos.y - res.y / 2) / (res.y / 2), 0);
var dropletInitialRadsmall = 0.002; // 1 = 1dm   // 10 ^ -4 m
var dropletInitialRadlarge = 0.004;
//var dropletInitialVelocity = new THREE.Vector2(0, 0);

//mask
var maskOn = false;
var face_bottom_left = new THREE.Vector2(0.0, 260.0);
var face_up_right = new THREE.Vector2(40.0, 340.0);

var nose_bottom_left = new THREE.Vector2(35.0, 310.0);
var nose_up_right = new THREE.Vector2(45.0, 320.0);

var chin_bottom_left = new THREE.Vector2(35.0, 280.0);
var chin_up_right = new THREE.Vector2(45.0, 290.0);

var mask_bottom_left = new THREE.Vector2(48.0, 285.0);
var mask_up_right = new THREE.Vector2(58.0, 320.0);


function addImage() {
    var texture = new THREE.TextureLoader().load( 'ruler.png' );
    var geometry = new THREE.PlaneBufferGeometry( 1.7125, 0.2175);
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    material.transparent = true;

    mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0.0, -0.6, 0);
    scene.add( mesh );

    var texturehead = new THREE.TextureLoader().load( 'head.png' );
    var geometryhead = new THREE.PlaneBufferGeometry( 0.3, 0.5);
    var materialhead = new THREE.MeshBasicMaterial( { map: texturehead } );
    materialhead.transparent = true;

    mesh = new THREE.Mesh( geometryhead, materialhead );
    mesh.position.set(-0.85, 0.5, 0);
    scene.add( mesh );
    console.log("finished adding ruler and head");
}

function addImagemask() {
    var texture = new THREE.TextureLoader().load( 'mask.png' );
    var geometry = new THREE.PlaneBufferGeometry(0.2, 0.3);
    var material = new THREE.MeshBasicMaterial( { map: texture } );
    material.transparent = true;

    mesh = new THREE.Mesh( geometry, material );
    mesh.name = 'mask';
    mesh.position.set(-0.77, 0.511, 0);
    scene.add( mesh );
}

function randn_bm() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return num;
}


function flipCoin(prob){
    var randnum = Math.random();
    if (randnum < prob){
        return true;
    }
    return false;
}

function setDroplets() {
    var num = dropletLengthSingleSneeze;
    if(maskOn){
        num *= 0.01;
    }

    for(var i = 0; i < num; i++) {
        dropletLength += 1;
        dropletPos.push(new THREE.Vector3(dropletInitialPos.x, dropletInitialPos.y, dropletInitialPos.z));
        if(flipCoin(0.3)){
            if(maskOn){
                dropletRad.push(Math.random() * dropletInitialRadsmall * 0.1);
            }
            dropletRad.push(Math.random() * dropletInitialRadsmall);
        }
        else{
            if(maskOn){
                dropletRad.push(Math.random() * dropletInitialRadsmall * 0.1);
            }
            dropletRad.push(Math.random() * dropletInitialRadlarge);
        }
        
        dropletVel.push(new THREE.Vector2(randn_bm() * 0.05, randn_bm() * 0.06 - 0.03));

        var geometry = new THREE.CircleGeometry(dropletRad[dropletLength-1], 32);

        var material = new THREE.MeshBasicMaterial( { color: 0xffe90b } );
        //var circle = new THREE.Mesh( geometry, material );

        //circle.position.set(dropletPos[dropletLength-1].x, dropletPos[dropletLength-1].y, dropletPos[dropletLength-1].z);
        //console.log(circle);

        dropletMesh.push(new THREE.Mesh( geometry, material ));
        dropletMesh[dropletLength-1].position.set(dropletPos[dropletLength-1].x, dropletPos[dropletLength-1].y, dropletPos[dropletLength-1].z);
        dropletMesh[dropletLength-1].position.needsUpdate = true;
        dropletMesh[dropletLength-1].geometry.dynamic = true;
        scene.add(dropletMesh[dropletLength-1]);
    }
}


function updateDroplets() {
    for (var i = 0; i < dropletLength; i++) {
        //dropletVel[i].x += Math.random() * 0.000001;
        //dropletVel[i].y -= Math.random() * 0.000001;
        /*
        if(maskOn){
            if(dropletPos[i].x<-0.7 && dropletPos[i].x>-0.8){
                if(flipCoin(0.95))
                    continue;
            }
        }
        */
        var ax = 0;
        var ay = 0;
        //cal m
        var volume = 4/3 * Math.PI * Math.pow(dropletRad[i], 3);
        var mass = dropletDensity * volume;
        

        // --x-- friction
        var areaDroplet = Math.PI * Math.pow(dropletRad[i], 2); 
        var dragAcc_x = 1/2 * dragC * densityAir * areaDroplet * Math.pow(dropletVel[i].x, 2) / mass;
        dragAcc_x *= (- dropletVel[i].x / Math.abs(dropletVel[i].x));
        
        ax += dragAcc_x;

        // var surrounding_density = 0.1;  // external_density.read;
        var buoyancyAcc = densityAir * gravityAcc * volume / mass; 

        // --y-- gravity, buoyancy
        ay -= gravityAcc / 780; // m to dm
        ay += buoyancyAcc;

        // --y-- friction 
        var dragAcc_y = 1/2 * dragC * densityAir * areaDroplet * Math.pow(dropletVel[i].y, 2) / mass;
        dragAcc_y *= (- dropletVel[i].y / Math.abs(dropletVel[i].y));

        ay += dragAcc_y;

        //update pos
        dropletPos[i].x += dropletVel[i].x * delta_t + 1/2 * ax * delta_t * delta_t; //Math.random() * 0.01 - 0.005;
        dropletPos[i].y += dropletVel[i].y * delta_t + 1/2 * ay * delta_t * delta_t; //Math.random() * 0.01 - 0.005;
        
        //update vel
        dropletVel[i].x += ax * delta_t;
        dropletVel[i].y += ay * delta_t;

        //update rad
        dropletRad[i] *= evaporation;

        dropletMesh[i].position.set(dropletPos[i].x, dropletPos[i].y, dropletPos[i].z);
        //dropletMesh[i].geometry.radius = dropletRad[i];
        dropletMesh[i].scale.x *= evaporation;
        dropletMesh[i].scale.y *= evaporation;
        dropletMesh[i].scale.z *= evaporation;

    }
}


function clearDroplets() {
    var i = 0;
    while(i < dropletLength){
        if(dropletPos[i].x > 1 || dropletPos[i].x < -1 || dropletPos[i].y > 1 || dropletPos[i].y < -1 || dropletRad[i] <= 0.000){
            dropletPos.splice(i, 1);
            dropletRad.splice(i, 1);
            dropletVel.splice(i, 1);
            dropletMesh.splice(i, 1);
            i--;
            dropletLength--;
        }
        i++;
    }

    console.log(dropletLength);
}

function mask() {
    
    if(buttonmask.value == "addmask")
    {
        addImagemask();
        buttonmask.value="removemask";
        buttonmask.innerHTML = 'remove mask';
        maskOn = true;
    }
    else{
        buttonmask.value="addmask";
        buttonmask.innerHTML = 'add mask';
        removeEntity("mask");
        maskOn = false;
    }
}

function removeEntity(objectName) {
    var selectedObject = scene.getObjectByName(objectName);
    scene.remove( selectedObject );
}

function sneezeOnce() {
    
    //if(button.value == "sneeze")
    //{
        externalDensity.smokeSource = sneezePos;
        externalTemperature.smokeSource = sneezePos;
        externalVelocity.smokeSource = sneezePos;
        externalVelocity.sourceVelocity = sneezeVelocity;
        externalDensity.sourceDensity = sneezeDensity;
        //button.value="stop";
        //button.innerHTML = 'stop sneeze';
        
        if(resetdroplet == true){
            setDroplets();
            console.log("droplet set in sneeze");
            resetdroplet = false;
        }
    //}
}

function stopSneeze() {
    externalDensity.smokeSource = new THREE.Vector3(0, 0, 0);
    externalTemperature.smokeSource = new THREE.Vector3(0, 0, 0);
    externalVelocity.sourceVelocity = new THREE.Vector2(0, 0);
    externalDensity.sourceDensity = new THREE.Vector3(0, 0, 0);
    //button.value = "sneeze";
    //button.innerHTML = 'start sneeze';

    if(resetdroplet == false){
        clearDroplets();
        resetdroplet = true;
    }
}



function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    button.style.left = width - 200 +'px';
    buttonmask.style.left = width - 200 +'px';
    renderer.setSize(width, height);
}

function scene_setup() {
    
   
    window.onresize = resize;

    scene = new THREE.Scene();
    //camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    //camera.position.set(0, 0, 2);


    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    //camera.position.set(0, 0, 2);
    renderer = new THREE.WebGLRenderer();
    //renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //button = document.getElementById("myButton1");
    //button.onclick = sneezeOnce();

    button = document.createElement("button");
    button.innerHTML = "sneeze";
    //button.value = "sneeze";
    var page = document.getElementById("btn");
    page.appendChild(button);

    
    button.style.position = "absolute";
    button.style.left = window.innerWidth - 200 +'px';
    button.style.top = 80 +'px';
    button.style.width = "100px";
    button.style.height = "50px";
    button.style.fontSize = "12pt";


    //button.addEventListener("click", Start);
    button.onmousedown = sneezeOnce;
    button.onmouseup = stopSneeze;


    buttonmask= document.createElement("button");
    buttonmask.innerHTML = "add mask";
    buttonmask.value = "addmask";
    page.appendChild(buttonmask);

    
    buttonmask.style.position = "absolute";
    buttonmask.style.left = window.innerWidth - 200 +'px';
    buttonmask.style.top = 160 +'px';
    buttonmask.style.width = "100px";
    buttonmask.style.height = "50px";
    buttonmask.style.fontSize = "12pt";


    //button.addEventListener("click", Start);
    buttonmask.onclick = mask;
    

    

    // set droplets
    // setDropLets();

    

    console.log("finished setup scene");
}


function texture_setup(){
    
    advect = new Advect(res, camera);
    boundaryDensity = new BoundaryDensity(res, camera);
    boundaryPressure = new BoundaryPressure(res, camera);
    boundaryVelocity = new BoundaryVelocity(res, camera);
    curl = new Curl(res, camera);
    externalVelocity = new ExternalVelocity(res, camera);
    externalForces = new ExternalForces(res, camera);
    externalDensity = new ExternalDensity(res, camera);
    externalTemperature = new ExternalTemperature(res, camera);
    draw = new Draw(res, camera);
    divergence = new Divergence(res, camera);
    jacobi = new Jacobi(res, camera);
    subtractGradient = new SubtractGradient(res, camera);
    vorticityFunc = new VorticityFunc(res, camera);
    
    velocity = new Slab(res);
    vorticity = new Slab(res);
    density = new Slab(res);
    pressure = new Slab(res);
    diverge = new Slab(res);
    temperature = new Slab(res);
    
    drawTexture = new THREE.WebGLRenderTarget( res.x, res.y, {  minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, type: THREE.FloatType } );
    
    plane = new THREE.PlaneBufferGeometry( 2, 2);
    
    finalMaterial =  new THREE.MeshBasicMaterial({map: drawTexture});

    //var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    
    mesh = new THREE.Mesh(plane, finalMaterial);

    scene.add(mesh);

    addImage();

    console.log("texture_setup finished");
    
}


function render() {
    // //console.log("render starttart");
    advect.process(renderer, velocity.read, velocity.read, 1.0, delta_t, velocity.write);
    velocity.swap();
    
    advect.process(renderer, velocity.read, density.read, 0.99, delta_t, density.write);
    density.swap();

    advect.process(renderer, velocity.read, temperature.read, 0.99, delta_t, temperature.write);
    temperature.swap();

    if(maskOn){
        boundaryVelocity.process(renderer, velocity.read, face_bottom_left, face_up_right,
            nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, velocity.write);
        velocity.swap();
        boundaryDensity.process(renderer, density.read, velocity.read, face_bottom_left, face_up_right,
            nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, density.write);
        density.swap();
    }

    externalForces.process(renderer, velocity.read, density.read, temperature.read,ambientTemperature, delta_t, velocity.write);
    velocity.swap();

    externalDensity.process(renderer, density.read, radiusSettings.Radius, delta_t, density.write);
    density.swap();

    externalVelocity.process(renderer, velocity.read, radiusSettings.Radius, delta_t,velocity.write);
    velocity.swap();

    externalTemperature.process(renderer, temperature.read, 0.01, radiusSettings.Radius, temperature.write);
    temperature.swap();

    if(maskOn){
        boundaryVelocity.process(renderer, velocity.read, face_bottom_left, face_up_right,
            nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, velocity.write);
        velocity.swap();
        boundaryDensity.process(renderer, density.read, velocity.read, face_bottom_left, face_up_right,
            nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, density.write);
        density.swap();
    }

    curl.process(renderer, velocity.read, vorticity.write);
    vorticity.swap();

    vorticityFunc.process(renderer, velocity.read, vorticity.read, 1.0, delta_t, velocity.write);
    velocity.swap();

    if(maskOn){
        boundaryVelocity.process(renderer, velocity.read, face_bottom_left, face_up_right,
            nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, velocity.write);
        velocity.swap();
    }

    divergence.process(renderer, velocity.read, 1.0, 1.0, diverge.write);
    diverge.swap();

    //renderer.clearTarget(pressure.read, true, false, false);
    renderer.clear(pressure.read);

    for (var i = 0; i < 50; i++) {
        jacobi.process(renderer, pressure.read, diverge.read, -1.0, 4.0, pressure.write);
        pressure.swap();
        if(maskOn){
            boundaryPressure.process(renderer, pressure.read, velocity.read, face_bottom_left, face_up_right,
                nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, pressure.write);
            pressure.swap();
        }
    }

    subtractGradient.process(renderer, velocity.read, pressure.read, 1.0, 1.0, delta_t, velocity.write);
    velocity.swap()

    if(maskOn){
        boundaryVelocity.process(renderer, velocity.read, face_bottom_left, face_up_right,
            nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, delta_t, velocity.write);
        velocity.swap();
    }

    var read;
    
    //draw Velocity
    // draw.displayVelocity();
    // read = velocity.read;

    
    //draw density
    draw.displayDensity();
    read = density.read;

    draw.process(renderer, read, drawTexture);
    //console.log(drawTexture);

    //draw droplets
    updateDroplets();
    
    renderer.render( scene, camera );
    //console.log(scene);

    // tells browser to update animation on screen
    requestAnimationFrame( render );

    // console.log(dropletPos[0]);
    //console.log("render finish");
}

scene_setup();
texture_setup();
render();