/*global THREE:true*/
/*global Divergence:true*/
Divergence = function(res, camera) {
    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);
    this.res = res;
    this.uniforms = {
        res : {value: new THREE.Vector2()},
        u: { value: new THREE.Texture() },
        dx: {value: 1.0},
        dy: {value: 1.0}
    }

    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Divergence' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });

    this.camera = camera;
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}

Divergence.prototype.process = function(renderer, u, dx, dy, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.u.value = u;
    this.uniforms.dx.value = dx;
    this.uniforms.dy.value = dy;
    
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}