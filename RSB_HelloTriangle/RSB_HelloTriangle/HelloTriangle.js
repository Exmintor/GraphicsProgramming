//Vertex Shader
var VSHADER_SOURCE =
    //This holds the storage location of the vertex buffer (first index)
    'attribute vec4 a_Position;\n' +
    //Main function of vertex shader
    'void main() {\n' +
    //The position of the vertices should be dependent on the vertex buffer
    '   gl_Position = a_Position;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    //Main function of fragment shader
    'void main() {\n' +
    //The color of the triangle is red
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

//Main Function
function main() {
    //Retrieve canvas by ID
    var canvas = document.getElementById('webgl');

    //Get rendering context
    var gl = getWebGLContext(canvas);
    //Failsafe
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    //Initialize shaders and make sure it works
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    //Set the position of vertices
    var n = initVertexBuffers(gl);
    //Failsafe
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

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
        0.0, 0.5,   -0.5, -0.5,     0.5, -0.5  //Top, Left, Right
    ]);
    var n = 3; //Number of vertices

    //Create a buffer object
    var vertexBuffer = gl.createBuffer();
    //Failsafe
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
    //Failsafe
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    //Enable the assignment to a_Position varibale
    gl.enableVertexAttribArray(a_Position);

    //Returns 3 (the number of vertices in the buffer)
    return n;
}