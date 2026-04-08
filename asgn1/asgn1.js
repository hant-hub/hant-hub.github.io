// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec2 a_Position;\n' +
    'attribute vec3 a_Color;\n' +
    'varying vec4 VertColor;\n' +
    'void main() {\n' +
            '  gl_Position = vec4(a_Position, 0.0, 1.0);\n' +
            '  VertColor = vec4(a_Color, 1.0);\n' +
            '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 VertColor;\n' +
    'void main() {\n' +
            '  gl_FragColor = VertColor;\n' +
            '}\n';

var VCIRC_SRC =
    'attribute vec2 a_Position;\n' +
    'attribute vec3 a_Color;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec4 VertColor;\n' +
    'varying vec2 uv;\n' +
    'void main() {\n' +
        'gl_Position = vec4(a_Position, 0.0, 1.0);\n' +
        'VertColor = vec4(a_Color, 1.0);\n' +
        'uv = a_UV;\n' +
    '}\n';

var FCIRC_SRC =
    'precision mediump float;\n' +
    'varying vec4 VertColor;\n' +
    'varying vec2 uv;\n' +
    'void main() {\n' +
    '  vec2 center = uv - vec2(0.5, 0.5);\n' +
    '  float d = dot(center, center);\n' +
    '  gl_FragColor = VertColor;\n' +
    '  if (d > 0.01) discard;\n' +
    '}\n';

// Notes:
//
// So basically this code is kinda spaghetti. I think I have
// a good interface for vertex buffers, although I should eventually update
// it to support stuff like index buffers
//
// Realistically I would also pack stuff like the num_verts and vertdata into
// the buffer as well, but this is fine too.
//
// The Real annoyance is the shader interface. Really they should be
// loaded from an external file. But that would require requesting the files from
// the server as far as I can tell and I felt a little lazy XD
//
// I also would have really liked using a VAO which is basically what I am
// doing via my buffer abstraction except it would probably be significantly more
// performant due to running entirely in the driver rather than in javascript.
//
// Also none of this code was written using AI, I think AI is kinda trash anyways,
// so all of this is my own homegrown artisan trash XD.



var num_verts = 0;
var verticies = [];

var num_points = 0;
var points = [];

//0 - triangle
//1 - square
//2 - circle
var mode = 1;

function main() {

    var ctx = InitGL("webgl");
    var gl = ctx.gl;

    var prog = CompileShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    var circ_prog = CompileShaders(gl, VCIRC_SRC, FCIRC_SRC);
    gl.useProgram(prog);

    var polygons = CreateVertBuffer(gl, prog, [
        {name : 'a_Position', count : 2, type : gl.FLOAT},
        {name : 'a_Color', count : 3, type : gl.FLOAT},
    ]);

    var circles = CreateVertBuffer(gl, circ_prog, [
        {name : 'a_Position', count : 2, type : gl.FLOAT},
        {name : 'a_Color', count : 3, type : gl.FLOAT},
        {name : 'a_UV', count : 2, type : gl.FLOAT},
    ]);
    //BindVerts(gl, prog, polygons);

    //I think baking the data that varies between triangles into
    //the vertex data is more efficient, but this is here to demonstrate
    //that I do know how to set and get uniforms

    // this would work but I disabled all the uniforms because they were basically useless.
    //var loc = gl.getUniformLocation(prog, 'transparent');
    //gl.uniform1f(loc, 1.0);

    // Register function (event handler) to be called on a mouse press
    ctx.canvas.onmousedown = function(ev){ addpoint(ev, gl, ctx.canvas, prog, polygons, circles) };
    ctx.canvas.onmousemove = function(ev){ addpoint(ev, gl, ctx.canvas, prog, polygons, circles) };
    document.getElementById("clear").onclick = function() {
        num_verts = 0;
        verticies = [];
        num_points = 0;
        points = [];
        gl.clear(gl.COLOR_BUFFER_BIT);
    };

    document.getElementById("tri").onclick = function() {
        mode = 0;
    }; 
    document.getElementById("square").onclick = function() {
        mode = 1;
    }; 
    document.getElementById("circ").onclick = function() {
        mode = 2;
    }; 

    //default to tris

    // Specify the color for clearing <canvas>
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);
}



var psize = 0;
var csize = 0;
var accum = 0;
var frames = 0;
function addpoint(ev, gl, canvas, prog, polygons, circles) {

    if (ev.buttons != 1 && ev.buttons != 3) {
        return;
    }

    var start = performance.now();
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    var r = document.getElementById("red").value;
    var g = document.getElementById("green").value;
    var b = document.getElementById("blue").value;


    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    //better than uniform
    var scale = document.getElementById("size").value;

    gl.clear(gl.COLOR_BUFFER_BIT);

    BindVerts(gl, polygons);
    if (mode == 0) {
        verticies.push( scale *  0.0 + x,  scale *  0.1 + y, r, g, b);
        verticies.push( scale * -0.1 + x,  scale * -0.1 + y, r, g, b);
        verticies.push( scale *  0.1 + x,  scale * -0.1 + y, r, g, b);

        //incrementally build vertex buffer (only resize when strictly necessary)
        // I think this is marginally faster on my machine, definitely would require
        // further testing, and probably would suck on mobile
        if (num_verts/3 >= psize) {
            psize = psize ? psize * 2 : 20;
            gl.bufferData(gl.ARRAY_BUFFER, psize * 3 * 5 * 4, gl.DYNAMIC_DRAW);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(verticies));
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, num_verts * 5 * 4, Float32Array.from(verticies.slice(-15)));
        }
        //gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(verticies), gl.DYNAMIC_DRAW);
        num_verts += 3;
    } else if (mode == 1) {
        verticies.push( scale * -0.1 + x,  scale *  0.1 + y, r, g, b);
        verticies.push( scale * -0.1 + x,  scale * -0.1 + y, r, g, b);
        verticies.push( scale *  0.1 + x,  scale * -0.1 + y, r, g, b);

        verticies.push( scale * -0.1 + x,  scale *  0.1 + y, r, g, b);
        verticies.push( scale *  0.1 + x,  scale *  0.1 + y, r, g, b);
        verticies.push( scale *  0.1 + x,  scale * -0.1 + y, r, g, b);

        //incrementally build vertex buffer (only resize when strictly necessary)
        // I think this is marginally faster on my machine, definitely would require
        // further testing, and probably would suck on mobile
        if (num_verts/3 >= psize) {
            psize = psize ? psize * 2 : 20;
            gl.bufferData(gl.ARRAY_BUFFER, psize * 6 * 5 * 4, gl.DYNAMIC_DRAW);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(verticies));
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, num_verts * 5 * 4, Float32Array.from(verticies.slice(-30)));
        }
        //gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(verticies), gl.DYNAMIC_DRAW);
        num_verts += 6;
    }

    // Clear <canvas>
    gl.drawArrays(gl.TRIANGLES, 0, num_verts);

    BindVerts(gl, circles);
    
    if (mode == 2) {
        points.push( scale *  0.0 + x,  scale *  0.3 + y, r, g, b, 0.5, 1.0);
        points.push( scale * -0.3 + x,  scale * -0.3 + y, r, g, b, 0.0, 0.0);
        points.push( scale *  0.3 + x,  scale * -0.3 + y, r, g, b, 1.0, 0.0);

        //incrementally build vertex buffer (only resize when strictly necessary)
        // I think this is marginally faster on my machine, definitely would require
        // further testing, and probably would suck on mobile
        if (num_points/3 >= csize) {
            csize = csize ? csize * 2 : 20;
            gl.bufferData(gl.ARRAY_BUFFER, csize * 3 * 7 * 4, gl.DYNAMIC_DRAW);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(points));
        } else {
            gl.bufferSubData(gl.ARRAY_BUFFER, num_points * 7 * 4, Float32Array.from(points.slice(-21)));
        }
        //gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(verticies), gl.DYNAMIC_DRAW);
        num_points += 3;
    }


    gl.drawArrays(gl.TRIANGLES, 0, num_points);

    //do circle stuff

    var end = performance.now();
    accum += end - start;
    frames += 1;

    if (frames >= 10) {
        console.log(`Render Time: ${accum/frames} ms`);
        console.log(`Verts: ${num_verts}`);
        frames = 0;
        accum = 0;
    }

}

