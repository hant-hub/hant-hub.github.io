var VSHADER_SOURCE = `#version 300 es
    out vec4 VertColor;
    uniform mat4 pv;

    vec3 verts[] = vec3[](
        // Back face
        vec3(-0.5f, -0.5f, -0.5f), // Bottom-left
        vec3( 0.5f, -0.5f, -0.5f), // bottom-right    
        vec3( 0.5f,  0.5f, -0.5f), // top-right              
        vec3( 0.5f,  0.5f, -0.5f), // top-right
        vec3(-0.5f,  0.5f, -0.5f), // top-left
        vec3(-0.5f, -0.5f, -0.5f), // bottom-left                
        // Front face
        vec3(-0.5f, -0.5f,  0.5f), // bottom-left
        vec3( 0.5f,  0.5f,  0.5f), // top-right
        vec3( 0.5f, -0.5f,  0.5f), // bottom-right        
        vec3( 0.5f,  0.5f,  0.5f), // top-right
        vec3(-0.5f, -0.5f,  0.5f), // bottom-left
        vec3(-0.5f,  0.5f,  0.5f), // top-left        
        // Left face
        vec3(-0.5f,  0.5f,  0.5f), // top-right
        vec3(-0.5f, -0.5f, -0.5f), // bottom-left
        vec3(-0.5f,  0.5f, -0.5f), // top-left       
        vec3(-0.5f, -0.5f, -0.5f), // bottom-left
        vec3(-0.5f,  0.5f,  0.5f), // top-right
        vec3(-0.5f, -0.5f,  0.5f), // bottom-right
        // Right face
        vec3( 0.5f,  0.5f,  0.5f), // top-left
        vec3( 0.5f,  0.5f, -0.5f), // top-right      
        vec3( 0.5f, -0.5f, -0.5f), // bottom-right          
        vec3( 0.5f, -0.5f, -0.5f), // bottom-right
        vec3( 0.5f, -0.5f,  0.5f), // bottom-left
        vec3( 0.5f,  0.5f,  0.5f), // top-left
        // Bottom face 
        vec3(-0.5f, -0.5f, -0.5f), // top-right
        vec3( 0.5f, -0.5f,  0.5f), // bottom-left
        vec3( 0.5f, -0.5f, -0.5f), // top-left        
        vec3( 0.5f, -0.5f,  0.5f), // bottom-left
        vec3(-0.5f, -0.5f, -0.5f), // top-right
        vec3(-0.5f, -0.5f,  0.5f), // bottom-right
        // Top face
        vec3(-0.5f,  0.5f, -0.5f), // top-left
        vec3( 0.5f,  0.5f, -0.5f), // top-right
        vec3( 0.5f,  0.5f,  0.5f), // bottom-right                 
        vec3( 0.5f,  0.5f,  0.5f), // bottom-right
        vec3(-0.5f,  0.5f,  0.5f), // bottom-left  
        vec3(-0.5f,  0.5f, -0.5f) // top-left              
    );

    vec2 uv[] = vec2[](
        // Back face
        vec2(0.0f, 0.0f), // Bottom-left
        vec2(1.0f, 0.0f), // bottom-right    
        vec2(1.0f, 1.0f), // top-right              
        vec2(1.0f, 1.0f), // top-right
        vec2(0.0f, 1.0f), // top-left
        vec2(0.0f, 0.0f), // bottom-left                
        // Front face
        vec2(0.0f, 0.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-right        
        vec2(1.0f, 1.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-left
        vec2(0.0f, 1.0f), // top-left        
        // Left face
        vec2(1.0f, 0.0f), // top-right
        vec2(0.0f, 1.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-left       
        vec2(0.0f, 1.0f), // bottom-left
        vec2(1.0f, 0.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-right
        // Right face
        vec2(1.0f, 0.0f), // top-left
        vec2(1.0f, 1.0f), // top-right      
        vec2(0.0f, 1.0f), // bottom-right          
        vec2(0.0f, 1.0f), // bottom-right
        vec2(0.0f, 0.0f), // bottom-left
        vec2(1.0f, 0.0f), // top-left
        // Bottom face          
        vec2(0.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-left
        vec2(1.0f, 1.0f), // top-left        
        vec2(1.0f, 0.0f), // bottom-left
        vec2(0.0f, 1.0f), // top-right
        vec2(0.0f, 0.0f), // bottom-right
        // Top face
        vec2(0.0f, 1.0f), // top-left
        vec2(1.0f, 1.0f), // top-right
        vec2(1.0f, 0.0f), // bottom-right                 
        vec2(1.0f, 0.0f), // bottom-right
        vec2(0.0f, 0.0f), // bottom-left  
        vec2(0.0f, 1.0f)  // top-left              
    );

    layout(std140) uniform cubes {
        mat4 model[500];
        mat4 size[500];
        ivec4 parents[500];
    };

    int getParent(int idx) {
        ivec4 group = parents[idx/4];
        if (idx % 4 == 0) return group.x;
        if (idx % 4 == 1) return group.y;
        if (idx % 4 == 2) return group.z;
        if (idx % 4 == 3) return group.w;
    }

    mat4 getModel(int idx) {
        mat4 base = model[idx];
        int parent = getParent(idx);
        
        int max = 20;
        while (max >= 0 && parent != 0) {
            max--;
            mat4 p = model[parent - 1];
            base = p * base; 

            idx = parent - 1;
            parent = getParent(idx);
        }

        return base;
    }

    void main() {
        mat4 model = getModel(gl_VertexID/36) * size[gl_VertexID/36];
        gl_Position = pv * model * vec4(verts[gl_VertexID % 36], 1.0);
        VertColor = vec4(uv[gl_VertexID % 36], 0.0, 1.0);

        //VertColor = vec4(float(getParent(gl_VertexID / 36)));
        //VertColor.w = 1.0;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `#version 300 es
    precision mediump float;
    in vec4 VertColor;

    out vec4 fragColor;

    void main() {
        fragColor = VertColor;
    }`;


var ctx = helpers.InitGL("webgl", true);
var gl = ctx.gl;

var animal = {
    cubes: []
};

var handles = {};
var camera = {
    dist: 5.0,
    rot: new Vector3(),
    vel: new Vector3(),
};

function addCube(parent, size, pos, anchor) {
    const handle = animal.cubes.length;
    animal.cubes.push({
        pos: new Vector3(pos),
        anchor: new Vector3(anchor).mul(-1),
        size: new Vector3(size),
        rot: new Vector3([0, 0, 0]),
        parent: parent ? parent + 1 : 0,
    });

    return handle;
}

function main() {
    var prog = helpers.CompileShaders(ctx, VSHADER_SOURCE, FSHADER_SOURCE);
    var uniform = helpers.CreateUniformBuffer(ctx, prog, 0);

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    gl.enable(gl.DEPTH_TEST);

    addCube(0, [10, 0.5, 10], [0, -4, 0], [0, 0, 0]);
    handles.body = addCube(0, [2, 1.5, 1], [0, 0, 0], [0,0,0]);
    handles.neck = addCube(handles.body, [1, 0.8, 0.8], [0.5, 0.40, 0], [-0.5, 0, 0.0]);
    handles.head = addCube(handles.neck, [0.5, 1, 1.0], [0.5, 0, 0], [-0.25, -0.1, 0]);
    handles.snout = addCube(handles.head, [0.8, 0.8, 0.5], [0.5, 0, 0], [0, 0, 0]);

    handles.rShoulder = addCube(handles.body, [0.8, 1.0, 0.6], [0.5, 0.0, 0.5], [0.0, 0.3, -0.0]);
    handles.frLeg = addCube(handles.rShoulder, [0.5, 1.4, 0.5], [0.0, -0.45, 0.0], [0.0, 0.4, 0.0]);
    handles.frFoot = addCube(handles.frLeg, [0.7, 0.3, 0.6], [0.0, -0.7, 0.0], [-0.1, 0.15, 0.0]);

    handles.lShoulder = addCube(handles.body, [0.8, 1.0, 0.6], [0.5, 0.0, -0.5], [0.0, 0.3, -0.0]);
    handles.flLeg = addCube(handles.lShoulder, [0.5, 1.4, 0.5], [0.0, -0.45, 0.0], [0.0, 0.4, 0.0]);
    handles.flFoot = addCube(handles.flLeg, [0.7, 0.3, 0.6], [0.0, -0.7, 0.0], [-0.1, 0.15, 0.0]);

    handles.rear = addCube(handles.body, [1.4, 1.35, 1], [-1, 0.75, 0], [0.7, 0.7, 0]);

    handles.rHip = addCube(handles.rear, [0.8, 1.4, 0.3], [0, 0, 0.5], [0, 0.3, 0]);
    handles.rlLeg = addCube(handles.rHip, [0.6, 1.0, 0.3], [0, -0.70, 0.0], [0, 0.5, 0]);
    handles.rlFoot = addCube(handles.rlLeg, [0.7, 0.3, 0.6], [0, -0.5, 0], [-0.1, 0.15, 0]);

    handles.lHip = addCube(handles.rear, [0.8, 1.4, 0.3], [0, 0, -0.5], [0, 0.3, 0]);
    handles.llLeg = addCube(handles.lHip, [0.6, 1.0, 0.3], [0, -0.70, 0.0], [0, 0.5, 0]);
    handles.llFoot = addCube(handles.llLeg, [0.7, 0.3, 0.6], [0, -0.5, 0], [-0.1, 0.15, 0]);

    handles.tail = [];
    handles.tail[0] = addCube(handles.rear, [0.3, 0.3, 0.3], [-0.7, 0.575, 0], [0.1, 0, 0]);

    for (var i = 1; i < 8; i++) {
        var old = handles.tail[i - 1];
        handles.tail.push(addCube(old, [0.3, 0.3, 0.3], [-0.15, 0, 0], [0.15, 0, 0]));
    }

    ctx.canvas.onmousemove = function(ev) { onMouseMove(ev); };
    ctx.canvas.onwheel = function(ev) { onMouseWheel(ev); };

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    tick(0, prog, uniform);
}

function blendCube(handle, t, rot1, pos1, rot2, pos2) {
    var pdiff = new Vector3();
    pdiff.add(pos2);
    pdiff.sub(pos1);
    pdiff.mul(t);

    var rdiff = new Vector3();
    rdiff.add(rot2);
    rdiff.sub(rot1);
    rdiff.mul(t);


    animal.cubes[handle].pos = pos1.add(pdiff);
    animal.cubes[handle].rot = rot1.add(rdiff);
}

function onMouseWheel(ev) {
    camera.dist += ev.deltaY * 0.01;
}

function onMouseMove(ev) {
    if (ev.buttons != 1 && ev.buttons != 3) {
        return;
    }

    const dx = ev.movementX; // x coordinate of a mouse pointer
    const dy = ev.movementY; // y coordinate of a mouse pointer

    camera.vel.elements[1] = dx * 0.5;
    camera.vel.elements[0] = dy * 0.5;
}

var time = 0;
var avg_dt = 0;
function tick(curr_time, prog, uniform) {
    dt = curr_time - time;
    if (dt > 2000) dt = 2000;
    if (dt == 0) dt = 0.0001
    dt /= 1000.0;
    time = curr_time;

    const startTime = performance.now();

    camera.rot.add(camera.vel);
    camera.vel.mul(0.9);

    render(prog, uniform);


    const endTime = performance.now();
    if ((time * 100) % 1 == 0) {
        const dt = (endTime - startTime) / 1000; //dt is in seconds
        avg_dt = avg_dt * 0.999 + 0.001 * dt; //blend dt to get average

        //convert sec to ms, then round to 2 places
        document.getElementById("frame").innerText = `UpdateTime: ${Math.round(avg_dt * 1000 * 100) / 100} ms`; 

        //calculate fps, then round to 2 places
        document.getElementById("fps").innerText = `FPS: ${Math.round((1.0/avg_dt) * 100) / 100}`; 
    }

    requestAnimationFrame((dt) => {
        tick(dt, prog, uniform);
    })
}


function render(prog, uniform) {
    var mat = new Matrix4();

    mat.setIdentity();
    mat.frustum(-1, 1, -1, 1, 1.0, 10000.0);

    mat.translate(0, 0, -camera.dist);
    mat.rotate(camera.rot.elements[0], 1, 0, 0);
    mat.rotate(camera.rot.elements[1], 0, 1, 0);
    mat.rotate(camera.rot.elements[2], 0, 0, 1);

    helpers.SetUniform(ctx, prog, 0, mat.elements);

    var sizes = [];
    var models = [];
    var parents = [];
    for (var i = 0; i < animal.cubes.length; i++) {
        const pos = animal.cubes[i].pos;
        const anchor = animal.cubes[i].anchor;
        const size = animal.cubes[i].size;
        const rot = animal.cubes[i].rot;
        const parent = animal.cubes[i].parent;

        const model = new Matrix4();
        model.setTranslate(pos.elements[0], pos.elements[1], pos.elements[2]);

        model.rotate(rot.elements[0], 1, 0, 0);
        model.rotate(rot.elements[1], 0, 1, 0);
        model.rotate(rot.elements[2], 0, 0, 1);
        model.translate(anchor.elements[0], anchor.elements[1], anchor.elements[2]);

        var size_matrix = new Matrix4();
        size_matrix.setScale(size.elements[0], size.elements[1], size.elements[2]);

        const msize = Array.from(size_matrix.elements);
        sizes.push(...msize);

        var elements = Array.from(model.elements)
        models.push(...elements);
        parents.push(parent);
    }

    helpers.UploadUniform(ctx, uniform, 0, 0, models);
    helpers.UploadUniform(ctx, uniform, 0, 1, sizes);
    helpers.UploadUniform(ctx, uniform, 1, 2, parents);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    helpers.Draw(ctx, prog, 36 * animal.cubes.length);
}
