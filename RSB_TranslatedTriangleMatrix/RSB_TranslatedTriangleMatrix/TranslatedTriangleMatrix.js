//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_xformMatrix;\n' +
    'void main() {\n' +
    //Translate with matrix multiplication
    '   gl_Position = u_xformMatrix * a_Position;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'void main() {\n' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

//Offset variables
var Tx = 0.5, Ty = 0.5, Tz = 0.0;

function main() {
    //Retrieve canvas by ID
    var canvas = document.getElementById('webgl');

    //Get rendering context
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

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

    //Create a translation matrix
    //Note: WebGl requires column major order
    var xformMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        Tx, Ty, Tz, 1.0
    ]);

    //Get storage location of uniform variable
    var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
    if (u_xformMatrix < 0) {
        console.log('Failed to get the storage location of u_xformMatrix');
        return;
    }

    //Assign the transform matrix to the vertex shader
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw a triangle
    gl.drawArrays(gl.TRIANGLES, 0, n); //n is 3 in this context
}

function initVertexBuffers(gl) {
    //An array of vertices
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5  //Top, Left, Right
    ]);
    var n = 3; //Number of vertices

    //Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }

    //Bind the buffer object to the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //Get storage location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    //Enable the assignment to a_Position varibale
    gl.enableVertexAttribArray(a_Position);

    //Number of vertices in the buffer)
    return n;
}