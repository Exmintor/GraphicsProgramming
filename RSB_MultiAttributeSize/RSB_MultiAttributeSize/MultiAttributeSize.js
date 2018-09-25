//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   gl_PointSize = a_PointSize;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '   gl_FragColor = u_FragColor;\n' +
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

    //Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    //Get storage location of attribute and uniform variables
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //Pass the point color th the fragment shader's uniform variable
    gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);

    //Set the position of vertices
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw three points
    gl.drawArrays(gl.POINTS, 0, n); //n is 3 in this context
}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);
    var n = 3; //Number of vertices

    var sizes = new Float32Array([
        10.0, 20.0, 30.0 //Point sizes
    ]);

    //Create buffer objects
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }
    var sizeBuffer = gl.createBuffer();
    if (!sizeBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }

    //Bind the vertex buffer object the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    //Write data into the vertex buffer object
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


    //Bind the size buffer object the target
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    //Write data into the size buffer object
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    //Get storage location of attribute variable
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if (a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
        return;
    }
    //Pass point size to vertex shader's attribute variable
    gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
    //Enable the assignment to a_PointSize variable
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}