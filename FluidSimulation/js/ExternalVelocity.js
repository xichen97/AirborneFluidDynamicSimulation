ExternalVelocity = function(res, camera) {
    this.res = res;
    this.camera = camera;
    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);
    this.smokeSource = new THREE.Vector3(300,200,1);
    this.sourceVelocity = new THREE.Vector2(2,3);

    this.uniforms = {
        bufferTexture: { type: "t" },
        res : {type: "v2" },
        smokeSource: {type:"v3" },
        sourceVelocity: {type:"v2" },
        radius: {type: "f"}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'ExternalVelocity' ).innerHTML,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NoBlending
    });

    /*
  

    var material = new THREE.ShaderMaterial({
        uniforms:{
            bufferTexture: {value: new THREE.Texture()},
            res: {value: new THREE.Vector2()},
            source: {value: new THREE.Vector3()},
            sourceVelocity: {value: new THREE.Vector2()},
            radius: {value: 1.0}
        },
        fragmentShader: document.getElementById( 'ExternalVelocity' ).innerHTML,
    });*/

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
    
}

ExternalVelocity.prototype.process = function(renderer, input, radius, output){
    this.uniforms.res.value = this.res;
    this.uniforms.bufferTexture.value = input;
    this.uniforms.smokeSource.value = this.smokeSource;
    this.uniforms.sourceVelocity.value = this.sourceVelocity;
    this.uniforms.radius.value = radius;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}