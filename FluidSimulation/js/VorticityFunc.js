/*global THREE:true*/
/*global VorticityFunc:true*/
VorticityFunc = function(res, camera) {
    this.res = res;
    this.camera = camera;

    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);

    this.uniforms = {
        res: {value: new THREE.Vector2()},
        velocity: {value: new THREE.Texture()},
        curl: {value: new THREE.Texture()},
        weight: {value: 0.1},
        threshold: {value: 0.01},
        dx: {value: 1.0},
        dy: {value: 1.0},
        dt: {value: 1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'VorticityFunc' ).innerHTML
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}


VorticityFunc.prototype.process = function(renderer, velocity, curl, weight, dt, output){
    this.uniforms.res.value = this.res;
    this.uniforms.velocity.value = velocity;
    this.uniforms.curl.value = curl;
    this.uniforms.weight.value = weight;
    this.uniforms.dt.value = dt;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}