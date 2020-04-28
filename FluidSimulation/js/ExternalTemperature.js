/*global THREE:true*/
/*global ExternalTemperature:true*/

ExternalTemperature = function(res, camera) {
    var geometry = new THREE.PlaneBufferGeometry( 2 * (512 - 2) / 512, 2 * (256 - 2) / 256 );
    this.res = res;
    this.smokeSource = new THREE.Vector3(0, 0, 0);
    this.uniforms = {
        bufferTexture: { value: new THREE.Texture() },
        res : {value: new THREE.Vector2()},
        smokeSource: {value: new THREE.Vector3()},
        temp: {value: 1.0},
        radius: {value: 1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'ExternalTemperature' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.camera = camera;
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}

ExternalTemperature.prototype.process = function(renderer, input, temp, radius, output) {
    this.uniforms.bufferTexture.value = input;
    this.uniforms.res.value = this.res;
    this.uniforms.temp.value = temp;
    this.uniforms.smokeSource.value = this.smokeSource;
    this.uniforms.radius.value = radius;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}