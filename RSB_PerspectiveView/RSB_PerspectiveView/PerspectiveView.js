//Vertex Shader
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
    //Crate the projection matrix
    var projMatrix = new Matrix4();

    //Calculate the view matrix
    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    //Calculate the projection matrix
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    //Pass the view matrix to the vertex shader
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    //Pass the projection matrix to the vertex shader
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
    //Vertex coordinates and colors
    var verticesColors = new Float32Array([
        //Three Triangles on the Right side
        0.75, 1.0, -4.0, 0.4, 1.0, 0.4, //The Green Triangle in the back
        0.25, -1.0, -4.0, 0.4, 1.0, 0.4,
        1.25, -1.0, -4.0, 1.0, 0.4, 0.4,
        
        0.75, 1.0, -2.0, 1.0, 1.0, 0.4, //The Yellow Triangle in the middle
        0.25, -1.0, -2.0, 1.0, 1.0, 0.4,
        1.25, -1.0, -2.0, 1.0, 0.4, 0.4,
        
        0.75, 1.0, 0.0, 0.4, 0.4, 1.0, //The Blue Triangle in the front
        0.25, -1.0, 0.0, 0.4, 0.4, 1.0,
        1.25, -1.0, 0.0, 1.0, 0.4, 0.4,
        
        //Three Triangles on the Left side
        -0.75, 1.0, -4.0, 0.4, 1.0, 0.4, //The Green Triangle in the back
        -1.25, -1.0, -4.0, 0.4, 1.0, 0.4,
        -0.25, -1.0, -4.0, 1.0, 0.4, 0.4,
        
        -0.75, 1.0, -2.0, 1.0, 1.0, 0.4, //The Yellow Triangle in the middle
        -1.25, -1.0, -2.0, 1.0, 1.0, 0.4,
        -0.25, -1.0, -2.0, 1.0, 0.4, 0.4,
        
        -0.75, 1.0, 0.0, 0.4, 0.4, 1.0, //The Blue Triangle in the front
        -1.25, -1.0, 0.0, 0.4, 0.4, 1.0,
        -0.25, -1.0, 0.0, 1.0, 0.4, 0.4,
    ]);
    var n = 18; //Number of vertices (3 * 6)

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