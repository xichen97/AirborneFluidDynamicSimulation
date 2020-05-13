/*global THREE:true*/
/*global BoundaryPressure:true*/
BoundaryPressure = function(res, camera) {
    this.res = res;
    this.camera = camera;

    var geometry = new THREE.PlaneBufferGeometry(2 * (res.x-2)/res.x , 2 * (res.y-2)/ res.y);

    this.uniforms = {
        res: {value: new THREE.Vector2()},
        bufferTexture: {value: new THREE.Texture()},
        velocityField: {value: new THREE.Texture()},
        scale: {value: 1.0},

        // head center (30, 300)
        face_bottom_left: {value: new THREE.Vector2(25.0, 260.0)},
        face_up_right: {value: new THREE.Vector2(35.0, 340.0)},

        nose_bottom_left: {value: new THREE.Vector2(35.0, 320.0)},
        nose_up_right: {value: new THREE.Vector2(45.0, 325.0)},

        chin_bottom_left: {value: new THREE.Vector2(35.0, 275.0)},
        chin_up_right: {value: new THREE.Vector2(45.0, 280.0)},

        mask_bottom_left: {value: new THREE.Vector2(50.0, 285.0)},
        mask_up_right: {value: new THREE.Vector2(55.0, 320.0)},

        x_left_offset: {value: new THREE.Vector2(-1.0, 0.0)},
        x_right_offset: {value: new THREE.Vector2(1.0, 0.0)},
        y_top_offset: {value: new THREE.Vector2(0.0, 1.0)},
        y_bottom_offset: {value: new THREE.Vector2(0.0, -1.0)},
        
        dt: {value: 1.0}
    };
    var material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        fragmentShader: document.getElementById( 'BoundaryVelocity' ).innerHTML
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene = new THREE.Scene();
    this.scene.add(this.mesh);
}


BoundaryPressure.prototype.process = function(renderer, bufferTexture, velocityField, face_bottom_left, face_up_right,
    nose_bottom_left, nose_up_right, chin_bottom_left, chin_up_right, mask_bottom_left, mask_up_right, dt, output){
    this.uniforms.res.value = this.res;
    this.uniforms.bufferTexture.value = bufferTexture;
    this.uniforms.velocityField.value = velocityField;
    this.uniforms.face_bottom_left.value = face_bottom_left;
    this.uniforms.face_up_right.value = face_up_right;
    this.uniforms.nose_bottom_left.value = nose_bottom_left;
    this.uniforms.nose_up_right.value = nose_up_right;
    this.uniforms.chin_bottom_left.value = chin_bottom_left;
    this.uniforms.chin_up_right.value = chin_up_right;
    this.uniforms.mask_bottom_left.value = mask_bottom_left;
    this.uniforms.mask_up_right.value = mask_up_right;
    this.uniforms.dt.value = dt;
    renderer.setRenderTarget(output);
    renderer.clear(false);
    renderer.render(this.scene, this.camera);
    renderer.setRenderTarget(null);
}