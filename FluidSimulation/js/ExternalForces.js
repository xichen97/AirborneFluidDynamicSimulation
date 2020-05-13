/*global THREE:true*/
/*global ExternalForces:true*/

ExternalForces = function(res, camera) {
    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);
    this.res = res;
    this.camera = camera;
    this.uniforms = {
        res: {value: new THREE.Vector2()},
        velocityField: {value: new THREE.Texture()},
        temperatureField: {value: new THREE.Texture()},
        densityField:  {value: new THREE.Texture()},
        kappa: {value: 0.001},
        sigma: {value: 0.08},
        ambientTemperature: {value: 0},
        gravity:{value:0.001},
        dt:{value:1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'ExternalForces' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.quad = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.quad);
}

ExternalForces.prototype.process = function(renderer, velocityField, densityField, temperatureField, ambientTemperature, delta_t, output) {
    this.uniforms.res.value = this.res;
    this.uniforms.velocityField.value = velocityField;
    this.uniforms.densityField.value = densityField;
    this.uniforms.temperatureField.value = temperatureField;
    this.uniforms.ambientTemperature.value = ambientTemperature;
    this.uniforms.sigma.value = 0.08;
    this.uniforms.kappa.value = 1;
    this.uniforms.gravity.value = 9.8;
    this.uniforms.dt.value = delta_t;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}