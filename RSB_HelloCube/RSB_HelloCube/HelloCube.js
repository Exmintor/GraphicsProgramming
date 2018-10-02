//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_MvpMatrix * a_Position;\n' +
    '   v_Color = a_Color;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
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

    //Create the MVP matrix
    var mvpMatrix = new Matrix4();


    //Calculate the MVP matrix
    mvpMatrix.setPerspective(30, 1, 1, 100);
    mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);

    //Pass the mvp matrix to the vertex shader
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //Clear the canvas and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    //Vertex coordinates and colors
    var verticesColors = new Float32Array([
        1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
        -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
        -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
        1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
        1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
        1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
        -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
        -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        0, 3, 4, 0, 4, 5,    // right
        0, 5, 6, 0, 6, 1,    // up
        1, 6, 7, 1, 7, 2,    // left
        7, 4, 3, 7, 3, 2,    // down
        4, 7, 6, 4, 6, 5     // back
    ]);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    //Create buffer objects
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }
    //Create buffer objects
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }

    //Bind the vertex buffer object the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    //Write data into the vertex buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

    //Get storage location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    //Enable the assignment to a_Position varibale
    gl.enableVertexAttribArray(a_Position);

    //Get storage location of attribute variable
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }
    //Pass point size to vertex shader's attribute variable
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    //Enable the assignment to a_PointSize variable
    gl.enableVertexAttribArray(a_Color);

    //Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}