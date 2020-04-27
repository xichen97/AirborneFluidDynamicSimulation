/*global THREE:true*/
/*global Jacobi:true*/
Jacobi = function(res, camera) {
    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);
    this.res = res;
    this.uniforms = {
        res : {value: new THREE.Vector2() },
        x: { value: new THREE.Texture()  },
        b: { value: new THREE.Texture()  },
        alpha: {value: 1.0},
        beta: {value: 1.0 }
    };

    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Jacobi' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.camera = camera;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}

Jacobi.prototype.process = function(renderer, x, b, alpha, beta, output){
    this.uniforms.res.value = this.res;
    this.uniforms.x.value = x;
    this.uniforms.b.value = b;
    this.uniforms.alpha.value = alpha;
    this.uniforms.beta.value = beta;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}