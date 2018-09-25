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
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   vec4 color0 = texture2D(u_Sampler0, v_TexCoord);\n' +
    '   vec4 color1 = texture2D(u_Sampler1, v_TexCoord);\n' +
    '   gl_FragColor = color0 * color1;\n' +
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
    //Create texture objects
    var texture0 = gl.createTexture();
    if (!texture0) {
        console.log('Failed to create the texture object.');
        return -1;
    }
    var texture1 = gl.createTexture();
    if (!texture1) {
        console.log('Failed to create the texture object.');
        return -1;
    }

    //Get storage location of u_Sampler0 and u_Sampler1
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (u_Sampler0 < 0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (u_Sampler1 < 0) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    //Crate an image object
    var image0 = new Image();
    if (!image0) {
        console.log('Failed to create the image object.');
        return -1;
    }
    var image1 = new Image();
    if (!image1) {
        console.log('Failed to create the image object.');
        return -1;
    }

    //Register the event handler to be called on loading an image
    image0.onload = function () { loadTexture(gl, n, texture0, u_Sampler0, image0, 0); };
    image1.onload = function () { loadTexture(gl, n, texture1, u_Sampler1, image1, 1); };
    //Tell the browser to load an image
    image0.src = 'resources/sky.jpg';
    image1.src = 'resources/circle.gif';

    return true;
}

//Specify whether the texture unit is ready to use
var g_texUnit0 = false, g_texUnit1 = false;
function loadTexture(gl, n, texture, u_Sampler, image, texUnit) {
    //Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    if (texUnit == 0) {
        gl.activeTexture(gl.TEXTURE0);
        g_texUnit0 = true;
    } else {
        gl.activeTexture(gl.TEXTURE1);
        g_texUnit1 = true;
    }
    //Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    //Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, texUnit);

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (g_texUnit0 && g_texUnit1) {
        //Draw a rectangle
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); //n is 4 in this context
    }
}