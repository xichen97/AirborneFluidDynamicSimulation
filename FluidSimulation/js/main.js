// GUI
/*global THREE:true*/
/*global Advect:true*/
/*global ExternalVelocity:true*/
/*global ExternalDensity:true*/
/*global ExternalTemperature:true*/
/*global Draw:true*/
/*global Slab:true*/
/*global Jacobi:true*/
/*global Divergence:true*/
/*global ExternalForces:true*/
/*global SubtractGradient:true*/

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
var externalVelocity;
var externalForces;
var externalDensity;
var externalTemperature;
var draw;
var divergence;
var jacobi;
var subtractGradient;

//renderer
var width;
var height;
var res = new THREE.Vector2(640, 480);
var delta_t = 0.001;

//var color = [50,50,50];

var radiusSettings = {
    Radius: 50.0
};

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
}

function scene_setup() {
    console.log("setup scene");
    scene = new THREE.Scene();
    //camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    //camera.position.set(0, 0, 2);

    camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    //camera.position.set(0, 0, 2);
    renderer = new THREE.WebGLRenderer();
    //renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    
}


function texture_setup(){
    
    advect = new Advect(res, camera);
    externalVelocity = new ExternalVelocity(res, camera);
    externalForces = new ExternalForces(res, camera);
    externalDensity = new ExternalDensity(res, camera);
    externalTemperature = new ExternalTemperature(res, camera);
    draw = new Draw(res, camera);
    divergence = new Divergence(res, camera);
    jacobi = new Jacobi(res, camera);
    subtractGradient = new SubtractGradient(res, camera);
    
    
    velocity = new Slab(res);
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
    
    advect.process(renderer, velocity.read, density.read, 0.98, delta_t, density.write);
    density.swap();

    advect.process(renderer, velocity.read, temperature.read, 0.99, delta_t, temperature.write);
    temperature.swap();

    externalForces.process(renderer, velocity.read, density.read,temperature.read,ambientTemperature, delta_t, velocity.write);
    velocity.swap();

    externalDensity.process(renderer, density.read, radiusSettings.Radius, delta_t, density.write);
    density.swap();

    externalVelocity.process(renderer, velocity.read, radiusSettings.Radius, delta_t,velocity.write);
    velocity.swap();

    externalTemperature.process(renderer, temperature.read, 0.01, radiusSettings.Radius, temperature.write);
    temperature.swap();

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
    /*draw.displayVelocity();
    read = velocity.read;*/

    
    //draw density
    draw.displayDensity();
    read = density.read;

    draw.process(renderer, read, drawTexture);
    //console.log(drawTexture);

    // tells browser to update animation on screen
    requestAnimationFrame( render );
    
    renderer.render( scene, camera );
    //console.log(scene);

    console.log("render finish");
}

window.onresize = resize;

scene_setup();
texture_setup();
render();