//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    //Calculate the vertex position in the world coordinate
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Color = a_Color;\n' + 
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec3 u_LightColor;\n' +
    'uniform vec3 u_LightPosition;\n' +
    'uniform vec3 u_AmbientLight;\n' +
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    //Normalize the normal because it is interpolated and not 1.0 in length any more
    '  vec3 normal = normalize(v_Normal);\n' +
    //Calculate the light direction and make its length 1.
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    //The dot product of the light direction and the normal
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    //Calculate the final color from diffuse reflection and ambient reflection
    '  vec3 diffuse = u_LightColor * vec3(v_Color) * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * vec3(v_Color);\n' +
    '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
    '}\n';

//Main Function
function main() {
    //Retrieve canvas by ID
    var canvas = document.getElementById('webgl');

    //Get rendering context
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //Enable the hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    //Set the position of vertices
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    //Get storage location of the u_MvpMatrix variable
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (u_MvpMatrix < 0) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }
    //Get storage location of the u_ModelMatrix variable
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    //Get storage location of the u_NormalMatrix variable
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (u_NormalMatrix < 0) {
        console.log('Failed to get the storage location of u_NormalMatrix');
        return;
    }
    //Get storage location of the u_LightColor variable
    var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
    if (u_LightColor < 0) {
        console.log('Failed to get the storage location of u_LightColor');
        return;
    }
    //Get storage location of the u_LightPosition variable
    var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
    if (u_LightPosition < 0) {
        console.log('Failed to get the storage location of u_LightPosition');
        return;
    }
    //Get storage location of the u_AmbientLight variable
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
    if (u_AmbientLight < 0) {
        console.log('Failed to get the storage location of u_AmbientLight');
        return;
    }

    //Create the Model Matrix
    var modelMatrix = new Matrix4();
    //Create the MVP matrix
    var mvpMatrix = new Matrix4();
    //Create the Normal Matrix
    var normalMatrix = new Matrix4();

    //Calcualte the Model Matrix
    modelMatrix.setRotate(90, 0, 1, 0);
    //Pass the Model Matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    //Calculate the MVP matrix
    mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);
    //Pass the mvp matrix to the vertex shader
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //Calculate normal matrix based on model matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    //Pass the new normal matrix to the vertex shader
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    //Set the light color (white)
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);

    //Set the Light Position
    gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);

    //Set the ambient light
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    //Clear the canvas and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    //Vertex coordinates
    var vertices = new Float32Array([
        2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0, // v0-v1-v2-v3 front
        2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, // v0-v3-v4-v5 right
        2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
        -2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, // v1-v6-v7-v2 left
        -2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0, // v7-v4-v3-v2 down
        2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0  // v4-v7-v6-v5 back
    ]);
    //Color
    var colors = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
    ]);
    //Normals
    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    //Create buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }

    //Write the vertex coordinates to a new buffer object
    if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
        return -1;
    //Write the colors to a new buffer object
    if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
        return -1;
    //Write the normals to a new buffer object
    if (!initArrayBuffer(gl, normals, 3, gl.FLOAT, 'a_Normal'))
        return -1;

    //Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
    //Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }

    //Write data into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    //Get storage location of attribute variable
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log('Failed to get the storage location of ' + attribute);
        return false;
    }

    //Pass data to vertex shader's attribute variable
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    return true;
}