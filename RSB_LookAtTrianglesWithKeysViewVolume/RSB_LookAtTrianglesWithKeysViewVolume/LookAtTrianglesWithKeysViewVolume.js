﻿//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
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

    //Get storage location of the u_ViewMatrix variable
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (u_ViewMatrix < 0) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    //Get storage location of the u_ProjMatrix variable
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (u_ProjMatrix < 0) {
        console.log('Failed to get the storage location of u_ProjMatrix');
        return;
    }

    //Create the view matrix
    var viewMatrix = new Matrix4();

    //Register an event handler on key press
    document.onkeydown = function (ev) { keydown(ev, gl, n, u_ViewMatrix, viewMatrix); };

    //Crate the projection matrix
    var projMatrix = new Matrix4();
    //Set the projection matrix
    projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
    //Pass the projection matrix to the vertex shader
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    //Draw a triangle
    draw(gl, n, u_ViewMatrix, viewMatrix);
}

function initVertexBuffers(gl) {
    //Vertex coordinates and colors
    var verticesColors = new Float32Array([
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // The back green triangle
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // The middle yellow triangle
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        0.0, 0.5, 0.0, 0.4, 0.4, 1.0, // The front blue triangle
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    ]);
    var n = 9; //Number of vertices

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;

    //Create buffer object
    var vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
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

    return n;
}

var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25; //Eye coordinates
function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    if (ev.keyCode == 39) { //Right Arrow key
        g_eyeX += 0.01;
    }
    else if (ev.keyCode == 37) { //Left Arrow key
        g_eyeX -= 0.01;
    }
    else { //Prevent unnecessary drawing
        return;
    }
    //Draw a triangle
    draw(gl, n, u_ViewMatrix, viewMatrix)
}

function draw(gl, n, u_ViewMatrix, viewMatrix) {
    // Set the eye point, look-at point, and the up direction
    viewMatrix.setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);

    //Pass the view matrix to the vertex shader
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw three points
    gl.drawArrays(gl.TRIANGLES, 0, n); //n is 3 in this context
}