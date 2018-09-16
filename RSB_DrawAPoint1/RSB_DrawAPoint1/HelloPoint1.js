//Vertex Shader
var VSHADER_SOURCE =
    'void main() {\n' +
    '   gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' +
    '   gl_PointSize = 10.0;\n' +
    '}\n';

//Fragment Shader
var FSHADER_SOURCE =
    'void main() {\n' +
    '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
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

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw a point
    gl.drawArrays(gl.POINTS, 0, 1);
}