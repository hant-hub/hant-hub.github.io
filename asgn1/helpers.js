function InitGL(id) {
  var canvas = document.getElementById(id);

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas, true);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }


  return { gl: gl, canvas: canvas };
}

function CompileShaders(gl, vert, frag) {
  // Initialize shaders
  var program = createProgram(gl, vert, frag);
  if (!program) {
    console.log('Failed to intialize shaders.');
    return;
  }
  return program;
}

function AttrTypeToSize(gl, type) {
    if (type == gl.FLOAT) return 4;
    consol.log("Unknown type");
    return 0;
}

function prepareAttrs(gl, prog, attrs) {
    var out = [];

    var stride = 0;
    for (const attr of attrs) {
        stride += attr.count * AttrTypeToSize(gl, attr.type);
    }

    var offset = 0;
    for (const attr of attrs) {
        var location = gl.getAttribLocation(prog, attr.name);
        out.push({
            location : location,
            offset : offset,
            stride : stride,
            count : attr.count,
            type : attr.type
        });
        offset += attr.count * AttrTypeToSize(attr.type);
    }

    return out;
}

function VertAttrs(gl, attrs) {
    for (const attr of attrs) {
        gl.vertexAttribPointer(attr.location, attr.count, attr.type, false, attr.stride, attr.offset);
        gl.enableVertexAttribArray(attr.location);
    }
}

function CreateVertBuffer(gl, prog, attrs) {
    var vbo = gl.createBuffer();
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

    return {
        buf: vbo,
        prog: prog,
        attrs: prepareAttrs(gl, prog, attrs),
    };
}

function BindVerts(gl, buf) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.buf);
    gl.useProgram(buf.prog);
    VertAttrs(gl, buf.attrs);
}
