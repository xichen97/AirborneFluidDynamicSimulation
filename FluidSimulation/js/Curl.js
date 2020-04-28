/*global THREE:true*/
/*global Curl:true*/
Curl = function(res, camera) {
    this.res = res;
    this.camera = camera;

    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);

    this.uniforms = {
        res: {value: new THREE.Vector2()},
        u: {value: new THREE.Texture()},
        dx: {value: 1.0},
        dy: {value: 1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Curl' ).innerHTML
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}


Curl.prototype.process = function(renderer, u, output){
    this.uniforms.res.value = this.res;
    this.uniforms.u.value = u;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}