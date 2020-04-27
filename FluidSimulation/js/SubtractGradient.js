/*global THREE:true*/
/*global SubtractGradient:true*/
SubtractGradient = function(res, camera) {
    var geometry = new THREE.PlaneBufferGeometry( 2 * (512 - 2) / 512, 2 * (256 - 2) / 256 );
    this.res = res;
    this.uniforms = {
        res : {value: new THREE.Vector2() },
        w: { value: new THREE.Texture() },
        p: { value: new THREE.Texture()  },
        dx: {value: 1.0 },
        dy: {value: 1.0 },
        dt: {value: 1.0 }
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'SubtractGradient' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.quad = new THREE.Mesh(geometry, material);
    this.camera = camera;
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
}

SubtractGradient.prototype.process = function(renderer, w, p, dx, dy, delta_t, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.w.value = w;
    this.uniforms.p.value = p;
    this.uniforms.dx.value = dx;
    this.uniforms.dy.value = dy;
    this.uniforms.dt.value = delta_t,
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}