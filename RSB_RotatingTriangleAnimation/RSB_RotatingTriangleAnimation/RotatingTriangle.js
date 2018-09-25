//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'void main() {\n' +
    //Transform with matrix multiplication
    '   gl_Position = u_ModelMatrix * a_Position;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'void main() {\n' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

//Rotation angle in degrees/second
var ANGLE_STEP = 45.0;

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

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Get storage location of uniform variable
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    //Current rotation angle of the triangle
    var currentAngle = 0.0;
    //Matrix4 object for model transformation
    var modelMatrix = new Matrix4();

    //Anonymous function that animates the triangle
    var tick = function () {
        currentAngle = animate(currentAngle); //Update the rotation angle
        draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix); //Draw the triangle
        requestAnimationFrame(tick); //Request that the browser calls tick again
    };
    //Call the tick function to begin the loop
    tick();
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

//Last time the function was called
var g_last = Date.now();
function animate(angle) {
    //Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last; //Milliseconds
    g_last = now;
    //Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
    //Set up the rotation matrix
    modelMatrix.setRotate(currentAngle, 0, 0, 1);
    //modelMatrix.translate(0.35, 0, 0);

    //Assign the matrix to the vertex shader
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw a triangle
    gl.drawArrays(gl.TRIANGLES, 0, n); //n is 3 in this context
}