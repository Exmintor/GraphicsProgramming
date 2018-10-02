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

    //Create the model matrix
    var modelMatrix = new Matrix4();
    //Create the view matrix
    var viewMatrix = new Matrix4();
    //Create the projection matrix
    var projMatrix = new Matrix4();
    //Create the MVP matrix
    var mvpMatrix = new Matrix4();

    //Calculate the model matrix
    modelMatrix.setTranslate(0.75, 0, 0);
    //Calculate the view matrix
    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    //Calculate the projection matrix
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
    //Calculate the MVP matrix
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

    //Pass the mvp matrix to the vertex shader
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw triangles on the right
    gl.drawArrays(gl.TRIANGLES, 0, n);

    //Prepare the model matrix for another set of triangles
    modelMatrix.setTranslate(-0.75, 0, 0);
    //Calculate the MVP matrix again
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    //Pass the model matrix to the vertex shader again
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //Draw triangles on the left
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    //Vertex coordinates and colors
    var verticesColors = new Float32Array([
        0.0, 1.0, -4.0, 0.4, 1.0, 0.4, //The Green Triangle in the back
        -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
        0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

        0.0, 1.0, -2.0, 1.0, 1.0, 0.4, //The Yellow Triangle in the middle
        -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
        0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

        0.0, 1.0, 0.0, 0.4, 0.4, 1.0, //The Blue Triangle in the front
        -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
        0.5, -1.0, 0.0, 1.0, 0.4, 0.4
    ]);
    var n = 9; //Number of vertices (3 * 3)

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