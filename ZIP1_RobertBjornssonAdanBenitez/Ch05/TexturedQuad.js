// Vertex shader
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' + // Vertex position
  'attribute vec2 a_TexCoord;\n' + // Texture coordinate
  'varying vec2 v_TexCoord;\n' + // Texture coordinate (for passing to fragment shader)
  'void main() {\n' +
  '  gl_Position = a_Position;\n' + // Vertex position
  '  v_TexCoord = a_TexCoord;\n' + // Pass the texture coordinate to the fragment shader
  '}\n';

// Fragment shader
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' + // Set the precision of floats
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' + // Texture information (pixels)
  'varying vec2 v_TexCoord;\n' + // Texture coordinate passed from the vertex shader
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' + // Reads the pixel information from the texture (using the coordinate)
  '}\n';

// Main function
function main() {
    //Get the HTML canvas
    var canvas = document.getElementById('webgl');

    // Get the WebGL context from the canvas
    var gl = getWebGLContext(canvas);
    // Failsafe
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the position of the vertices
    var n = initVertexBuffers(gl); // n equals the number of vertices
    // Failsafe
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    // Set the clear color for the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Display the texture
    if (!initTextures(gl, n)) {
        console.log('Failed to intialize the texture.');
        return;
    }
}

// Set the position of the vertices
function initVertexBuffers(gl) {
    // Map texture coordinates to the WebGL coordinates
    var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
        -1,  1,   0.0, 4.0, // Top Left
        -1, -1,   0.0, 0.0, // Bottom Left
        1,  1,   4.0, 4.0, // Top Right
        1, -1,   4.0, 0.0, // Bottom Right
    ]);
    var n = 4; // The number of vertices

    // Create a buffer object to hold the vertex coordinates
    var vertexTexCoordBuffer = gl.createBuffer();
    // Failsafe
    if (!vertexTexCoordBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to its target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    // Write the data from the texture coordinates into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    // Size of each element in the vertex coordinate array
    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    // Get the storage location of the 'a_position' variable in the vertex shader
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // Failsafe
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // Write data from the buffer object to the 'a_position' variable in the vertex shader
    // The second parameter indicates the number of elements to use
    // The two final parameters indicate the distance between elements and the starting point in the array
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    // Enable the assignment of the buffer object
    gl.enableVertexAttribArray(a_Position);

    // Get the storage location of the 'a_TexCoord' variable in the vertex shader
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    // Failsafe
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_TexCoord');
        return -1;
    }
    // Write data from the buffer object to the 'a_TexCoord' variable in the vertex shader
    // The second parameter indicates the number of elements to use
    // The two final parameters indicate the distance between elements and the starting point in the array
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    // Enable the assignment of the buffer object
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

// Display the texture
function initTextures(gl, n) {
    // Create a texture object
    var texture = gl.createTexture();
    // Failsafe
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    // Get the storage location of the 'u_Sampler' variable in the fragment shader
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    // Failsafe
    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }
    // Crate a new image object
    var image = new Image();  
    // Failsafe
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Event handler. When the image has loaded, call the "loadTexture" function to draw the image
    image.onload = function () { loadTexture(gl, n, texture, u_Sampler, image); };
    // Load the image from local files
    image.src = 'resources/particle.png';

    // Indicate that the function ran without complications
    return true;
}

// Draw the texture
function loadTexture(gl, n, texture, u_Sampler, image) {
    // Flip the y-axis to conform to WebGL standards
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); 
    // Specify which texture unit to use (texture unit 0 is used)
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to a target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters (options)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
    // Write the data from the image (piel information) object into the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit to 0 (the same texture used earlier) in the fragment shader
    gl.uniform1i(u_Sampler, 0);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);   

    // Draw a filled rectangle (using TRIANGLE_STRIP)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // n is 4 in this context
}
