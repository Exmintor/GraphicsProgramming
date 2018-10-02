//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_Position = u_ProjMatrix * a_Position;\n' +
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
    //Get the nearFar element
    var nf = document.getElementById('nearFar');

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

    //Get storage location of the u_ProjMatrix variable
    var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
    if (u_ProjMatrix < 0) {
        console.log('Failed to get the storage location of u_ProjMatrix');
        return;
    }

    //Create the projecion matrix
    var projMatrix = new Matrix4();

    //Register an event handler on key press
    document.onkeydown = function (ev) { keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf); };

    //Draw a triangle
    draw(gl, n, u_ProjMatrix, projMatrix, nf);
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

var g_near = 0.0, g_far = 0.5;
function keydown(ev, gl, n, u_ProjMatrix, projMatrix, nf) {
    switch (ev.keyCode) {
        case 39: g_near += 0.01; break; //The Right Arrow key was pressed
        case 37: g_near -= 0.01; break; //The Left Arrow key was pressed
        case 38: g_far += 0.01; break; //The Up Arrow key was pressed
        case 40: g_far -= 0.01; break; //The Down Arrow key was pressed
        default: return; //Prevent unnecessary drawing
    }

    //Draw a triangle
    draw(gl, n, u_ProjMatrix, projMatrix, nf)
}

function draw(gl, n, u_ProjMatrix, projMatrix, nf) {
    // Set the eye point, look-at point, and the up direction
    projMatrix.setOrtho(-1, 1, -1, 1, g_near, g_far);

    //Pass the projection matrix to the vertex shader
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Display the near and far values
    nf.innerHTML = 'near: ' + Math.round(g_near * 100) / 100 + ', far: ' + Math.round(g_far * 100) / 100;

    //Draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, n); //n is 9 in this context
}