/*global THREE:true*/
/*global Advect:true*/
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

var scene;
var camera;
var renderer;

// properties
var velocity;
var density;
var temperature;
var pressure;
var diverge;

var ambientTemperature = 0.0;
// slabs
var drawTexture;

var plane;
var finalMaterial;
var mesh;

// shaders
var advect;
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
var res = new THREE.Vector2(640, 480);
var delta_t = 0.5;

//var color = [50,50,50];

var radiusSettings = {
    Radius: 100.0
};

var sneezePos = new THREE.Vector3(200, 200, 1);
var sneezeVelocity = new THREE.Vector2(500, 0);
var sneezeDensity = new THREE.Vector3(10, 10, 10);


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
    //}
}

function stopSneeze() {
    externalDensity.smokeSource = new THREE.Vector3(0, 0, 0);
    externalTemperature.smokeSource = new THREE.Vector3(0, 0, 0);
    externalVelocity.sourceVelocity = new THREE.Vector2(0, 0);
    externalDensity.sourceDensity = new THREE.Vector3(0, 0, 0);
    //button.value = "sneeze";
    //button.innerHTML = 'start sneeze';
}



function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    button.style.left = width - 200 +'px';
    button.style.top = 100 +'px';

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
    console.log("finished setup scene");
}


function texture_setup(){
    
    advect = new Advect(res, camera);
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

    externalForces.process(renderer, velocity.read, density.read, temperature.read,ambientTemperature, delta_t, velocity.write);
    velocity.swap();

    externalDensity.process(renderer, density.read, radiusSettings.Radius, delta_t, density.write);
    density.swap();

    externalVelocity.process(renderer, velocity.read, radiusSettings.Radius, delta_t,velocity.write);
    velocity.swap();

    externalTemperature.process(renderer, temperature.read, 0.01, radiusSettings.Radius, temperature.write);
    temperature.swap();

    curl.process(renderer, velocity.read, vorticity.write);
    vorticity.swap();

    vorticityFunc.process(renderer, velocity.read, vorticity.read, 1.0, delta_t, velocity.write);
    velocity.swap();

    divergence.process(renderer, velocity.read, 1.0, 1.0, diverge.write);
    diverge.swap();

    //renderer.clearTarget(pressure.read, true, false, false);
    renderer.clear(pressure.read);

    for (var i = 0; i < 20; i++) {
        jacobi.process(renderer, pressure.read, diverge.read, -1.0, 4.0, pressure.write);
        pressure.swap();
    }

    subtractGradient.process(renderer, velocity.read, pressure.read, 1.0, 1.0, delta_t, velocity.write);
    velocity.swap()

    var read;
    
    //draw Velocity
    // draw.displayVelocity();
    // read = velocity.read;

    
    //draw density
    draw.displayDensity();
    read = density.read;

    draw.process(renderer, read, drawTexture);
    //console.log(drawTexture);

    
    
    renderer.render( scene, camera );
    //console.log(scene);

    // tells browser to update animation on screen
    requestAnimationFrame( render );

    console.log("render finish");
}

scene_setup();
texture_setup();
render();