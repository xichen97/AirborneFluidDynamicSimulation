/*global THREE:true*/
/*global Advect:true*/
Advect = function(res, camera) {
    this.res = res;
    this.camera = camera;

    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);

    this.uniforms = {
        res: {value: new THREE.Vector2()},
        velocityField: {value: new THREE.Texture()},
        advectionField: {value: new THREE.Texture()},
        dissipation: {value: 1.0},
        dt:{value: 1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'Advect' ).innerHTML
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}


Advect.prototype.process = function(renderer, velocityField, advectionField, dissipation, dt, output){
    this.uniforms.res.value = this.res;
    this.uniforms.velocityField.value = velocityField;
    this.uniforms.advectionField.value = advectionField;
    this.uniforms.dissipation.value = dissipation;
    this.uniforms.dt.value = dt;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}