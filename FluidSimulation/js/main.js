// GUI
var scene;
var camera;
var renderer;

// properties
var velocity;
var density;
var pressure;

// slabs
var drawTexture;

var plane;
var finalMaterial;
var mesh;

// shaders
var advect;
var externalVelocity;
var draw;

//renderer
var width;
var height;
var res = new THREE.Vector2(640, 480);

var color = [50,50,50];

var radiusSettings = {
    Radius: 8.0
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
    draw = new Draw(res, camera);

    velocity = new Slab(res);
    
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
    advect.process(renderer, velocity.read, velocity.read, 1.0, velocity.write);
    velocity.swap();
    
    externalVelocity.process(renderer, velocity.read, radiusSettings.Radius, velocity.write);
    velocity.swap();

    var read;
    
    //draw Velocity
    //draw.displayNeg();
    read = velocity.read;

    draw.process(renderer, read, drawTexture);
    //console.log(drawTexture);

    // tells browser to update animation on screen
    requestAnimationFrame( render );
    
    renderer.render( scene, camera );
    console.log(scene);

    console.log("render finish");
}

window.onresize = resize;

scene_setup();
texture_setup();
render();


/*var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
// camera.position.set(0, 0, 10);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.PlaneBufferGeometry( 5, 20, 32, 32 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
var plane = new THREE.Mesh( geometry, material );
scene.add( plane );

//camera.position.z = 5;

render();

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}*/