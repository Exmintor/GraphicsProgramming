﻿//Vertex Shader
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
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if (a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
        return;
    }
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    //Register an event handler function that is called on mousepress
    canvas.onmousedown = function(ev) { click(ev, gl, canvas, a_Position, u_FragColor); };

    //Pass point size to vertex shader's attribute values
    gl.vertexAttrib1f(a_PointSize, 10.0);

    //Set color for clearing canvas to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = []; //Array that holds mouse presses
var g_colors = []; //Array that holds the color of a point
function click(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX; //X coordinate of mouse
    var y = ev.clientY; //Y coordinate of mouse
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.height / 2) / (canvas.height / 2);
    y = (canvas.width / 2 - (y - rect.top)) / (canvas.width / 2);
    //Store the coordinates in the g_points array
    g_points.push([x, y]);

    //Get the correct color based on click location
    var color = getColor(x, y);
    //Store the color in the g_colors array
    g_colors.push(color);

    //Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    var length = g_points.length;
    for (var i = 0; i < length; i++) {
        var xy = g_points[i];
        var rgba = g_colors[i];
        //Pass the position of a point the the a_Position attribute variable 
        gl.vertexAttrib2f(a_Position, xy[0], xy[1]);
        //Pass the color of a point to uFragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        //Draw a point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

function getColor(x, y) {
    if (x >= 0.0 && y >= 0.0) { //First quadrant
        return [1.0, 0.0, 0.0, 1.0]; //Red
    }
    else if (x < 0.0 && y < 0.0) { //Third quadrant
        return [0.0, 1.0, 0.0, 1.0]; //Green
    }
    else { //Other quadrants
        return [1.0, 1.0, 1.0, 1.0]; //White
    }
}