/*global THREE:true*/
/*global ExternalDensity:true*/
ExternalDensity = function(res, camera) {
    this.res = res;
    this.camera = camera;
    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);
    this.smokeSource = new THREE.Vector3(100, 200, 1);

    this.uniforms = {
        bufferTexture: {value: new THREE.Texture()},
        res: {value: new THREE.Vector2()},
        smokeSource:  {value: new THREE.Vector3()},
        color: {value: new THREE.Vector3(1, 1, 1)},
        radius: {value: 1.0},
        dt: {value: 1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'ExternalDensity' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
   
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
    
}

ExternalDensity.prototype.process = function(renderer, input, radius, delta_t, output){
    this.uniforms.res.value = this.res;
    this.uniforms.bufferTexture.value = input;
    this.uniforms.smokeSource.value = this.smokeSource;
    this.uniforms.radius.value = radius;
    this.uniforms.dt.value = delta_t;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}