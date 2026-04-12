var VSHADER_SOURCE =
    `#version 300 es
    out vec4 VertColor;
    out vec2 uv;

    uniform u_testBlock {
        mat4 u_pos[500];
        vec4 u_colors[500];
    };

    void main() {
        vec2 positions[3] = vec2[](
            vec2(0.0, 0.5),
            vec2(-0.5, -0.5),
            vec2(0.5, -0.5)
        );

        vec2 uvs[3] = vec2[](
            vec2(0.5, 1.0),
            vec2(0.0, 0.0),
            vec2(1.0, 0.0)
        );

        gl_Position = u_pos[gl_VertexID/3] * vec4(positions[gl_VertexID % 3], 0.8, 1.0);
        VertColor = u_colors[gl_VertexID/3];
        uv = uvs[gl_VertexID % 3];
    }`;

// Fragment shader program
var FSHADER_SOURCE =
    `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    in vec4 VertColor;
    in vec2 uv;
    void main() {


        vec2 center = uv - vec2(0.5, 0.5);
        float d = dot(center, center);
        if (d > 0.05) discard;

        center *= 4.0;
        vec3 normal = vec3(sin(center.x), sin(center.y), 1.0 - d);
        normal = normalize(normal);
        
        vec3 view = vec3(0.0, 0.0, -1.0);
        vec3 lightdir = vec3(-0.5, 1.5, 2.0);
        lightdir = normalize(lightdir);

        vec3 reflectdir = reflect(-lightdir, view);

        //vec3 h = normalize(lightdir + view);

        float diffuse = max(dot(normal, lightdir), 0.0);
        float spec = pow(max(dot(view, reflectdir), 0.0), 1024.0);

        fragColor = VertColor * (diffuse + spec + 0.2);
        fragColor.w = 0.4 * (spec + diffuse);


        //fragColor = vec4(uv, 0.0, 1.0);
    }
    `;

var VFISH_SRC =
    `#version 300 es
    out vec4 VertColor;
    out vec2 uv;

    uniform u_testBlock {
        mat4 u_pos[500];
        vec4 u_colors[500];
    };

    void main() {
        vec2 positions[6] = vec2[](
            vec2(-0.5, 0.5),
            vec2(-0.5, -0.5),
            vec2(0.5, -0.5),

            vec2(-0.5, 0.5),
            vec2(0.5, -0.5),
            vec2(0.5, 0.5)
        );

        vec2 uvs[6] = vec2[](
            vec2(0.0, 1.0),
            vec2(0.0, 0.0),
            vec2(1.0, 0.0),

            vec2(0.0, 1.0),
            vec2(1.0, 0.0),
            vec2(1.0, 1.0)
        );

        gl_Position = u_pos[gl_VertexID/6] * vec4(positions[gl_VertexID % 6], 0.1, 1.0);
        VertColor = u_colors[gl_VertexID/6];
        uv = uvs[gl_VertexID % 6];
    }`;

// Fragment shader program
var FFISH_SRC =
    `#version 300 es
    precision mediump float;
    out vec4 fragColor;
    in vec4 VertColor;
    in vec2 uv;
    void main() {

        vec2 center = uv - vec2(0.5, 0.5);
        center.x /= 2.0;
        center.x -= 0.0;
        float d = dot(center, center);
        if (2.0 * center.x < -abs(center.y) - 0.16) d -= 1.0;
        if (d > 0.05) discard;

        fragColor = VertColor;
    }
    `;

var VTRI_SOURCE =
    'attribute vec2 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 VertColor;\n' +
    'void main() {\n' +
            '  gl_Position = vec4(a_Position, 0.1, 1.0);\n' +
            '  VertColor = a_Color;\n' +
            '}\n';

// Fragment shader program
var FTRI_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 VertColor;\n' +
    'void main() {\n' +
            '  gl_FragColor = VertColor;\n' +
            '}\n';


var globals = {
    bubbles: [],
    transforms : [],
    colors : [],
    uniform_offsets : [],
    uniform_buf : null,
    vertex_buf : null,
    fish_buf : null,
    fish : [],
    fish_offsets: [],
    fish_prog: null,
    prog: null,
};

var verts = [];

var gl = null;
var time = 0;

function updateFish(dt) {

    //boid constraints
    for (var i = 0; i < globals.fish.length; i++) {
        var fish = globals.fish[i];

        var speed = fish.vel.magnitude();
        speed *= 2.0;
        speed += 0.01;

        if (fish.pos.elements[0] > 0.8) {
            fish.vel.elements[0] -= speed * 2.0 * dt;
        }
        if (fish.pos.elements[0] < -0.8) {
            fish.vel.elements[0] += speed * 2.0 * dt;
        }
        if (fish.pos.elements[1] > 0.8) {
            fish.vel.elements[1] -= speed * 2.0 * dt;
        }
        if (fish.pos.elements[1] < -0.5) {
            fish.vel.elements[1] += speed * 2.0 * dt;
        }


        var avg_pos = new Vector3([0,0,0]);
        for (var j = i + 1; j < globals.fish.length; j++) {
            if (i == j) continue;
            var fish2 = globals.fish[j];
            avg_pos.add(fish2.pos);

            var diff = new Vector3([0, 0, 0]);
            diff.add(fish2.pos);
            diff.sub(fish.pos);

            var dist = Vector3.dot(diff, diff);

            if (dist == 0) {
                fish.vel.add(new Vector3([Math.random(), Math.random(), 0]));
                fish.vel.normalize();
                fish.vel.mul(speed);
                continue;
            } 

            var vdiff = new Vector3([0,0,0]);
            vdiff.add(fish2.vel);
            vdiff.sub(fish.vel);

            if (vdiff.magnitude() != 0) {
                vdiff.normalize();
                vdiff.mul(-(1/dist) * 1.5 * speed * dt);
                fish.vel.add(vdiff);
            }

            if (dist < 0.3 * fish.scale.elements[0]) {
                diff.normalize();
                diff.mul(-(1/dist) * fish.scale.elements[0] * speed * dt);
                fish.vel.add(diff);
                //fish2.vel.sub(diff);
            }
        }
        avg_pos.mul(1/globals.fish.length);

        avg_pos.sub(fish.pos);
        if (avg_pos.magnitude() != 0) {
            avg_pos.normalize();
            avg_pos.mul(speed * dt * 2.5);
            fish.vel.add(avg_pos);
        }

        var screen_center = new Vector3([0, 0, 0]);
        screen_center.sub(fish.pos);
        
        if (screen_center.magnitude() != 0) {
            screen_center.normalize();
            screen_center.mul(speed * dt * 0.5);
            fish.vel.add(screen_center);
        }

        fish.vel.normalize();
        fish.vel.mul(0.5 * dt);

        globals.fish[i] = fish;
    }

    //integration + position constraints
    for (var i = 0; i < globals.fish.length; i++) {
        var fish = globals.fish[i];

        fish.pos.add(fish.vel);
        globals.fish[i] = fish;

        if (fish.pos.elements[0] > 1.1) {
            fish.pos.elements[0] = -1.1;
        }
        if (fish.pos.elements[1] > 1.1) {
            fish.pos.elements[1] = -1.1;
        }
        if (fish.pos.elements[0] < -1.1) {
            fish.pos.elements[0] = 1.1;
        }
        if (fish.pos.elements[1] < -1.1) {
            fish.pos.elements[1] = 1.1;
        }
    }



}

function updateBubbles(dt) {
    //update positions
    
    for (var i = 0; i < globals.bubbles.length; i++) {
        var bubble = globals.bubbles[i];


        var friction = 1.0 - (bubble.vel.elements[1]/(bubble.maxvel.elements[1]));
        friction = Math.min(friction, 1.0);
        friction = Math.max(friction, 0.0);

        bubble.vel.mul(friction * friction);
        bubble.vel.add(new Vector3([bubble.drift * Math.sin(bubble.offset + time/300.0) * dt, 0.1 * dt, 0]));

        //constrain velocity

        bubble.pos.add(bubble.vel);

        globals.bubbles[i] = bubble;
    }

    //constrain positions

    for (var i = 0; i < globals.bubbles.length; i++) {
        var bubble = globals.bubbles[i];

        if (bubble.pos.elements[1] > 1.1) {
            bubble.pos.elements[1] = -1.1;
            bubble.drift = (Math.random() * 2 - 1) * 0.1;
            bubble.offset = (Math.random() * 2 - 1);
            bubble.scale = 0.1 * ((Math.random() * 0.6) + 0.4)
            bubble.maxvel.elements[1] = Math.random() * 0.1;
        }

        if (bubble.pos.elements[0] > 1.2) {
            bubble.pos.elements[0] = -1.2;
        }

        if (bubble.pos.elements[0] < -1.2) {
            bubble.pos.elements[0] = 1.2;
        }

        globals.bubbles[i] = bubble;
    }


}

function drawfish(dt) {
    gl.useProgram(globals.fish_prog);
    globals.transforms = [];
    globals.colors = [];

    for (var i = 0; i < globals.fish.length; i++) {
        var fish = globals.fish[i];
        var mat = new Matrix4();
        mat.setTranslate(fish.pos.elements[0], fish.pos.elements[1], 0.0);

        var angle = Math.atan2(fish.vel.elements[1], fish.vel.elements[0]);
        mat.rotate(angle * (360/(2*Math.PI)), 0, 0, 1.0);

        mat.scale(fish.scale.elements[0], fish.scale.elements[1], fish.scale.elements[2]);
        globals.transforms.push.apply(globals.transforms, Array.from(mat.elements));
        globals.colors.push(0.6, 0.6, 0.7, 1.0);
    }

    gl.bufferSubData(gl.UNIFORM_BUFFER, globals.fish_offsets[0], Float32Array.from(globals.transforms));
    gl.bufferSubData(gl.UNIFORM_BUFFER, globals.fish_offsets[1], Float32Array.from(globals.colors));

    gl.colorMask(true, true, true, false);
    gl.drawArrays(gl.TRIANGLES, 0, globals.fish.length * 6);
}

function drawBubbles() {

    gl.useProgram(globals.prog);
    
    globals.transforms = [];
    globals.colors = [];
    for (var i = 0; i < globals.bubbles.length; i++) {
        var bubble = globals.bubbles[i];
        var mat = new Matrix4();
        mat.setTranslate(bubble.pos.elements[0], bubble.pos.elements[1], 0.0);
        mat.scale(bubble.scale * (1.0 + bubble.vel.elements[1] * 40), bubble.scale, 1.0);
        globals.transforms.push.apply(globals.transforms, Array.from(mat.elements));
        globals.colors.push(0.1, 0.1, 0.6, 1.0);
    }

    gl.bufferSubData(gl.UNIFORM_BUFFER, globals.uniform_offsets[0], Float32Array.from(globals.transforms));
    gl.bufferSubData(gl.UNIFORM_BUFFER, globals.uniform_offsets[1], Float32Array.from(globals.colors));

    gl.colorMask(true, true, true, false);
    gl.drawArrays(gl.TRIANGLES, 0, globals.bubbles.length * 3);
}

function update(curr_time) {
    dt = curr_time - time;
    if (dt > 2000) dt = 2000;
    if (dt == 0) dt = 0.0001
    dt /= 1000.0;
    time = curr_time;

    var start = performance.now()/1000.0;
    gl.clear(gl.COLOR_BUFFER_BIT);


    updateBubbles(dt);
    updateFish(dt);
    drawBubbles(dt);
    drawfish(dt);

    gl.colorMask(true, true, true, true);
    BindVerts(gl, globals.vertex_buf);
    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 6);

    var end = performance.now()/1000.0;
    if (time % 3 == 0) {
        console.log("Uncapped fps: " + 1/(end - start));
        console.log("Capped fps: " + 1/(dt));
    }

    requestAnimationFrame(update);
}

function main() {

    var ctx = InitGL("webgl", true);
    gl = ctx.gl;
    if (!gl) {
        console.log("Fail!");
        return;
    }

    var prog = CompileShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    var triprog = CompileShaders(gl, VTRI_SOURCE, FTRI_SOURCE);
    var fishprog = CompileShaders(gl, VFISH_SRC, FFISH_SRC);
    globals.prog = prog;
    globals.fish_prog = fishprog;
    //var cprog = CompileShaders(gl, VCIRC_SRC, FCIRC_SRC);

    globals.vertex_buf = CreateVertBuffer(gl, triprog, [
        {name : 'a_Position', count : 2, type : gl.FLOAT},
        {name : 'a_Color', count : 4, type : gl.FLOAT},
    ]);



    BindVerts(gl, globals.vertex_buf);


               //pos       //color
    verts.push(-1, -0.8,  0.1, 0.1, 0.0, 1.0);
    verts.push(-1, -0.6,  0.1, 0.1, 0.0, 1.0);
    verts.push( 1, -0.8,  0.1, 0.1, 0.0, 1.0);

    verts.push(-1, -0.6,  0.1, 0.1, 0.0, 1.0);
    verts.push( 1, -0.8,  0.1, 0.1, 0.0, 1.0);
    verts.push( 1, -0.6,  0.1, 0.1, 0.0, 1.0);

    verts.push(-1, -1,   0.2, 0.2, 0.0, 1.0);
    verts.push(-1, -0.8, 0.2, 0.2, 0.0, 1.0);
    verts.push( 1, -1,   0.2, 0.2, 0.0, 1.0);

    verts.push(-1, -0.8,  0.2, 0.2, 0.0, 1.0);
    verts.push( 1, -1,    0.2, 0.2, 0.0, 1.0);
    verts.push( 1, -0.8,  0.2, 0.2, 0.0, 1.0);


    for (var i = 0; i < 20; i++) {
        var x = (4 * Math.random()) - 2.0;
        var width = (Math.random()) * 0.2;

        verts.push(-1 + x,  1,          0.0, 0.2, 0.2, 0.03);
        verts.push( 1 + x, -1,          0.0, 0.2, 0.2, 0.03);
        verts.push( 1 + x, -1 + width,  0.0, 0.2, 0.2, 0.03);

        verts.push(-1 + x,  1 + width,  0.0, 0.2, 0.2, 0.03);
        verts.push(-1 + x,  1,          0.0, 0.2, 0.2, 0.03);
        verts.push( 1 + x, -1 + width,  0.0, 0.2, 0.2, 0.03);
    }




    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(verts), gl.DYNAMIC_READ);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    //bubbles
    var blockIndex = gl.getUniformBlockIndex(prog, 'u_testBlock');
    var blockSize = gl.getActiveUniformBlockParameter(
        prog,
        blockIndex,
        gl.UNIFORM_BLOCK_DATA_SIZE
    );


    globals.uniform_buf = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, globals.uniform_buf);
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_READ);

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, globals.uniform_buf);

    var uniform_indicies = gl.getUniformIndices(
        prog,
        ["u_pos", "u_colors"]
    );

    globals.uniform_offsets = gl.getActiveUniforms(
        prog,
        uniform_indicies,
        gl.UNIFORM_OFFSET,
    );


    for (var i = 0; i < 250; i++) {
        var x = Math.random() * 2 - 1;
        var y = Math.random() * 2 - 1;
        globals.bubbles.push({
            pos: new Vector3([x, y, 0.0]),
            vel: new Vector3([Math.random() * 0.001, Math.random() * 0.001, 0.0]),
            maxvel: new Vector3([Math.random() * 0.1, Math.random() * 0.1, 0.0]),
            drift: 0.01 * ((2 * Math.random()) + 0.5),
            offset: Math.random(),
            scale: 0.2 * ((Math.random() * 0.5) + 0.5),
        });
    }

    //fish
    blockIndex = gl.getUniformBlockIndex(fishprog, 'u_testBlock');
    blockSize = gl.getActiveUniformBlockParameter(
        fishprog,
        blockIndex,
        gl.UNIFORM_BLOCK_DATA_SIZE
    );

    globals.fish_buf = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, globals.fish_buf);
    gl.bufferData(gl.UNIFORM_BUFFER, blockSize, gl.DYNAMIC_READ);

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, globals.fish_buf);

    uniform_indicies = gl.getUniformIndices(
        fishprog,
        ["u_pos", "u_colors"]
    );

    globals.fish_offsets = gl.getActiveUniforms(
        fishprog,
        uniform_indicies,
        gl.UNIFORM_OFFSET,
    );

    gl.bindBuffer(gl.UNIFORM_BUFFER, globals.fish_buf);

    for (var i = 0; i < 300; i++) {
        globals.fish.push({
            pos: new Vector3([Math.random() - 0.5, Math.random() - 0.5, 0]),
            vel: new Vector3([0.01, 0.005, 0]),
            scale: new Vector3([0.07, 0.07, 0.07]),
        });
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.colorMask(true, true, true, true);
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.1, 0.25, 1.0);
    //gl.clearDepth(1.0);
 

    // Clear <canvas>
    update(0);
}
