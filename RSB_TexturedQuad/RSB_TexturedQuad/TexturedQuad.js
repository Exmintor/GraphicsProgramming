//Vertex Shader
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   v_TexCoord = a_TexCoord;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
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

    //Set the position of vertices
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the positions of the vertices');
        return;
    }

    //Set the textures
    if (!initTextures(gl, n)) {
        console.log('Failed to set the positions of the vertices');
        return;
    }
}

function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        //Vertex and texture coordinates
        -0.5, 0.5, 0.0, 1.0, //Top Left
        -0.5, -0.5, 0.0, 0.0, //Bottom Left
        0.5, 0.5, 1.0, 1.0, //Top Right
        0.5, -0.5, 1.0, 0.0 //Bottom Right
    ]);
    var n = 4; //Number of vertices

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;

    //Create buffer object
    var vertexTexCoordsBuffer = gl.createBuffer();
    if (!vertexTexCoordsBuffer) {
        console.log('Failed to create the buffer object.');
        return -1;
    }

    //Bind the vertex and texture buffer object the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordsBuffer);
    //Write data into the vertex and texture buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    //Get storage location of attribute variable
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    //Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    //Enable the assignment to a_Position varibale
    gl.enableVertexAttribArray(a_Position);


    //Get storage location of attribute variable
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return;
    }
    //Pass texture coordinate to vertex shader's attribute variable
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    //Enable the assignment to a_TexCoord variable
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {
    //Create texture object
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object.');
        return -1;
    }

    //Get storage location of u_Sampler
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (u_Sampler < 0) {
        console.log('Failed to get the storage location of u_Sampler');
        return;
    }

    //Crate an image object
    var image = new Image();
    if (!image) {
        console.log('Failed to create the image object.');
        return -1;
    }

    //Register the event handler to be called on loading an image
    image.onload = function () { loadTexture(gl, n, texture, u_Sampler, image); };
    //Tell the browser to load an image
    image.src = 'resources/sky.jpg';

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
    //Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    //Enable the texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw a rectangle
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); //n is 4 in this context
}