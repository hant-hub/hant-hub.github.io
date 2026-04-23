var ctx = helpers.InitGL("webgl", true);
var gl = ctx.gl;

var animal = {
    cubes: [],
    decor: [],
};

var fliers = [];

const StringToHandle = {};

var handles = {};
var camera = {
    dist: 5.0,
    rot: new Vector3(),
    vel: new Vector3(),
};

function addFlier() {

    var core = addCube(0, [2, 0.5, 0.5], [0, 10, 0], [0.5, 0.5, 0.5], [0.0, 0.0, 0.0]);
    var head = addCube(core, [0.2, 0.1, 0.1], [1, 0.0, 0.0], [0.5, 0.5, 0.5], [-0.1, 0.0, 0.0]);
    var lwing = addCube(core, [0.8,0.1,2.0], [0.2,0,0], [0.5, 0.5, 0.5], [0.0, 0.0, -1.0]);
    var rwing = addCube(core, [0.8,0.1,2.0], [0.2,0,0], [0.5, 0.5, 0.5], [0.0, 0.0, 1.0]);

    fliers.push({
        pos: new Vector3([50 * Math.random() - 25, 3, 50 * Math.random() - 25]),
        vel: new Vector3([10, 0, 0]),
        handle: core,
    });

}

function addCube(parent, size, pos, color, anchor, stripe) {
    const handle = animal.cubes.length;
    animal.cubes.push({
        pos: new Vector3(pos),
        anchor: new Vector3(anchor).mul(-1),
        size: new Vector3(size),
        stripe: stripe ? stripe : [0, 1, 1, 1.5],
        color: color,
        rot: new Vector3([0, 0, 0]),
        parent: parent ? parent + 1 : 0,
    });

    return handle;
}

function addDecor(parent, size, pos, rot, anchor, tex) {
    const handle = animal.decor.length;
    animal.decor.push({
        pos: pos,
        anchor: new Vector3(anchor).mul(-1),
        size: size,
        rot: new Vector3(rot),
        tex: tex,
        parent: parent ? parent + 1 : 0,
    });

    return handle;
}

const WHITE = [1, 1, 1];
const ORANGE_WHITE = [1, 0.7, 0.5];
const BLACK = [0, 0, 0];
const ORANGE = [1, 0.4, 0];

var grass_verts = null;
var grass_density = 15;
var grass_x = 50;
var grass_y = 50;

var num_grass = grass_density * grass_x * grass_y;

function main() {
    var cube_prog = helpers.CompileShaders(ctx, cube_shader.vert, cube_shader.frag);
    var decor_prog = helpers.CompileShaders(ctx, decor_shader.vert, decor_shader.frag);
    var grass_prog = helpers.CompileShaders(ctx, grass_shader.vert, grass_shader.frag);
    //var prog = helpers.CompileShaders(ctx, cube_shader.vert, cube_shader.frag);
    var cubes = helpers.CreateUniformBuffer(ctx, cube_prog, cube_prog.block_map["cubes"]);
    var decor = helpers.CreateUniformBuffer(ctx, decor_prog, decor_prog.block_map["decor"]);

    grass_verts = helpers.CreateVertBuffer(ctx, grass_prog);
    gl.vertexAttribDivisor(0, 1);
    gl.vertexAttribDivisor(1, 1);
    gl.vertexAttribDivisor(2, 1);
    gl.vertexAttribDivisor(3, 1);
    helpers.ResizeVertBuffer(ctx, grass_verts, 64 * 5000);
    console.log(num_grass);

    var elements = [];
    for (var i = 0; i < grass_density * grass_x * grass_y; i++) {
        var mat = new Matrix4();
        mat.setTranslate(Math.random() * 50 - 25, -2.5, Math.random() * 50 - 25);
        mat.rotate(50 * i, 0, 1, 0);
        mat.scale(0.2, 1.0, 1.0);

        elements.push(...Array.from(mat.elements));
    }

    console.log(elements.length);
    if (helpers.SubVerts(ctx, grass_verts, 0, elements)) {
        console.log("failed");
    }


    var texture = helpers.LoadTexture(ctx, "img/decor.png");

    helpers.BindUniformBuffer(ctx, decor_prog, cubes, decor_prog.block_map["cubes"]);

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthRange(0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    addCube(0, [10, 0.5, 10], [0, -4, 0], WHITE, [0, 0, 0]);
    handles.body = addCube(0, [2, 1.5, 1], [0, 0, 0], ORANGE, [0, 0, 0], [1, 0, 1, 0.5]);
    handles.neck = addCube(handles.body, [1, 0.8, 0.8], [0.5, 0.40, 0], ORANGE, [-0.5, 0, 0.0], [1, 0, 0.5, 0.5]);
    handles.head = addCube(handles.neck, [0.5, 1, 1.0], [0.5, 0, 0], ORANGE, [-0.25, -0.1, 0], [1, 0, 0.5, 0.8]);
    handles.snout = addCube(handles.head, [0.5, 0.5, 0.5], [0.5, -0.2, 0], [242/255, 143/255, 136/255], [0, 0, 0]);


    handles.rShoulder = addCube(handles.body, [0.8, 1.0, 0.6], [0.5, 0.0, 0.5], ORANGE, [0.0, 0.3, -0.0], [0, 1, 0.5, 0.5]);
    handles.frLeg = addCube(handles.rShoulder, [0.5, 1.4, 0.5], [0.0, -0.45, 0.0], ORANGE, [0.0, 0.4, 0.0], [0, 1, 1.0, 0.5]);
    handles.frFoot = addCube(handles.frLeg, [0.7, 0.3, 0.6], [0.0, -0.7, 0.0], ORANGE, [-0.1, 0.15, 0.0]);

    handles.lShoulder = addCube(handles.body, [0.8, 1.0, 0.6], [0.5, 0.0, -0.5], ORANGE, [0.0, 0.3, -0.0], [0, 1, 0.5, 0.5]);
    handles.flLeg = addCube(handles.lShoulder, [0.5, 1.4, 0.5], [0.0, -0.45, 0.0], ORANGE, [0.0, 0.4, 0.0], [0, 1, 1.0, 0.5]);
    handles.flFoot = addCube(handles.flLeg, [0.7, 0.3, 0.6], [0.0, -0.7, 0.0], ORANGE, [-0.1, 0.15, 0.0]);

    handles.rear = addCube(handles.body, [2.5, 1.35, 0.9], [-1, 0.75, 0], ORANGE, [1.25, 0.7, 0], [1, 0, 1, 0.5]);

    handles.rHip = addCube(handles.rear, [0.8, 1.4, 0.3], [-0.4, 0, 0.5], ORANGE, [0, 0.3, 0], [0, 1, 0.5, 0.5]);
    handles.rlLeg = addCube(handles.rHip, [0.6, 1.0, 0.25], [0, -0.70, 0.0], ORANGE, [0, 0.5, 0], [0, 1, 1.0, 0.5]);
    handles.rlFoot = addCube(handles.rlLeg, [0.7, 0.3, 0.6], [0, -0.5, 0], ORANGE, [-0.1, 0.15, 0]);

    handles.lHip = addCube(handles.rear, [0.8, 1.4, 0.3], [-0.4, 0, -0.5], ORANGE, [0, 0.3, 0], [0, 1, 0.5, 0.5]);
    handles.llLeg = addCube(handles.lHip, [0.6, 1.0, 0.25], [0, -0.70, 0.0], ORANGE, [0, 0.5, 0], [0, 1, 1.0, 0.5]);
    handles.llFoot = addCube(handles.llLeg, [0.7, 0.3, 0.6], [0, -0.5, 0], ORANGE, [-0.1, 0.15, 0]);

    handles.tail = [];
    handles.tail[0] = addCube(handles.rear, [0.3, 0.3, 0.3], [-1.3, 0.555, 0], ORANGE, [0.1, 0, 0]);

    for (var i = 1; i < 15; i++) {
        var old = handles.tail[i - 1];
        handles.tail.push(addCube(old, [0.3, 0.3, 0.3], [-0.15, 0, 0], i % 2 ? ORANGE_WHITE : BLACK, [0.15, 0, 0]));
    }

    handles.lEar = addCube(handles.head, [0.07, 0.3, 0.15], [0.01, 0.5, 0.3], ORANGE, [0.0, 0.0, 0.0]);
    handles.lEar2 = addCube(handles.head, [0.1, 0.2, 0.2], [0.0, 0.5, 0.3], ORANGE, [0.0, 0.0, 0.0]);
    handles.lEarIn = addCube(handles.head, [0.09, 0.19, 0.15], [0.01, 0.5, 0.3], WHITE, [0.0, 0.0, 0.0]);

    handles.rEar = addCube(handles.head, [0.07, 0.3, 0.15], [0.01, 0.5, -0.3], ORANGE, [0.0, 0.0, 0.0]);
    handles.rEar2 = addCube(handles.head, [0.1, 0.2, 0.2], [0.0, 0.5, -0.3], ORANGE, [0.0, 0.0, 0.0]);
    handles.rEarIn = addCube(handles.head, [0.09, 0.19, 0.15], [0.01, 0.5, -0.3], WHITE, [0.0, 0.0, 0.0]);


    handles.face = addDecor(handles.head, [1.0, 1.0], [0.265, 0.0, 0.0], [0, 90, 0], [0, 0, 0], [0, 1.0, 0.5, -0.5]);
    handles.snoutleft = addDecor(handles.snout, [0.53, 0.53], [0.0, 0.0, 0.265], [0, 0, 0], [0, 0, 0], [0, 0.5, 0.5, -0.5]);
    handles.snoutright = addDecor(handles.snout, [0.53, 0.53], [0.0, 0.0, -0.265], [0, 0, 0], [0, 0, 0], [0, 0.5, 0.5, -0.5]);
    handles.snouttop = addDecor(handles.snout, [0.53, 0.54], [0.0, 0.265, 0.0], [90, 0, 0], [0, 0, 0], [0, 0.3, 0.5, -0.3]);
    handles.snoutbot = addDecor(handles.snout, [0.53, 0.54], [0.0, -0.265, 0.0], [90, 0, 0], [0, 0, 0], [0, 0.3, 0.5, -0.3]);
    handles.snoutfront = addDecor(handles.snout, [0.53, 0.53], [0.265, 0.0, 0.0], [0, 90, 0], [0, 0, 0], [0.19, 0.87, 0.12, -0.12]);

    //used to move the entire model
    handles.core = addCube(0, [0, 0, 0], [0, 0, 0], WHITE, [0, 0, 0]);
    animal.cubes[handles.body].parent = handles.core + 1;

    //Shelved for now, may return to later
    //for (var i = 0; i < 10; i++) {
    //    addFlier();
    //}

    StringToHandle["body"] = handles.body;
    StringToHandle["rear"] = handles.rear;
    StringToHandle["neck"] = handles.neck;
    StringToHandle["head"] = handles.head;
    StringToHandle["rshoulder"] = handles.rShoulder;
    StringToHandle["lshoulder"] = handles.lShoulder;
    StringToHandle["frleg"] = handles.frLeg;
    StringToHandle["flleg"] = handles.flLeg;
    StringToHandle["frfoot"] = handles.frFoot;
    StringToHandle["flfoot"] = handles.flFoot;
    StringToHandle["rhip"] = handles.rHip;
    StringToHandle["lhip"] = handles.lHip;
    StringToHandle["brleg"] = handles.rlLeg;
    StringToHandle["blleg"] = handles.llLeg;
    StringToHandle["brfoot"] = handles.rlFoot;
    StringToHandle["blfoot"] = handles.llFoot;
    StringToHandle["tail"] = handles.tail[0];

    ctx.canvas.onmousemove = function(ev) { onMouseMove(ev); };
    ctx.canvas.onwheel = function(ev) { onMouseWheel(ev); };
    ctx.canvas.onclick = function(ev) {
        if (!ev.shiftKey) {
            return;
        }

        if (state == "walk") {
            next = "sit";
        }

        if (state == "sit-idle") {
            next = "sit-rev";
        }
    };

    document.getElementById("output-pose").onclick = printFrame;
    document.getElementById("reset").onclick = function() {
        document.getElementById("xrot").value = 0;
        document.getElementById("yrot").value = 0;
        document.getElementById("zrot").value = 0;
    };

    document.getElementById("selected-part").onchange = function() {
        const handle = StringToHandle[document.getElementById("selected-part").value];
        const rot = animal.cubes[handle].rot;
        document.getElementById("xrot").value = rot.elements[0];
        document.getElementById("yrot").value = rot.elements[1];
        document.getElementById("zrot").value = rot.elements[2];
    };

    console.log(handles);

    gl.clearColor(0.4, 0.4, 0.8, 1.0);
    tick(0, cube_prog, decor_prog, grass_prog, cubes, decor);
}

async function printFrame() {
    var frame = [];
    const handles = Object.values(StringToHandle);

    for (var i = 0; i < handles.length; i++) {
        frame.push({
            handle: handles[i],
            rot: Array.from(animal.cubes[handles[i]].rot.elements)
        });
    }

    await navigator.clipboard.write([
        new ClipboardItem({ ["text/plain"]: JSON.stringify(frame) + "," })
    ]);

    window.alert("Copied JSON!");
}

function blendCube(handle, t, rot1, rot2) {
    t = 3 * (t * t) - 2 * (t * t * t);

    var rdiff = new Vector3();
    rdiff.add(rot2);
    rdiff.sub(rot1);
    rdiff.mul(t);

    animal.cubes[handle].rot = rot1.add(rdiff);
}

function blendFrame(t, frame1, frame2) {
    for (var i = 0; i < frame1.length; i++) {
        blendCube(frame1[i].handle, t, new Vector3(frame1[i].rot), new Vector3(frame2[i].rot));
    }
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

var state = "walk";
var next = "walk";
var curr_frame = walk_animation[0];
var next_frame = walk_animation[0];

var index = 0;
var t_frac = 0;

var t_time = 0;

function updateFliers(dt) {
    const speed = 10.0;

    for (var i = 0; i < fliers.length; i++) {
        var pos = fliers[i].pos;
        var vel = fliers[i].vel;
        const handle = fliers[i].handle;

        if (pos.elements[0] > 25) {
            vel.elements[0] -= speed * 0.4;
        }
        if (pos.elements[0] < -25) {
            vel.elements[0] += speed * 0.4;
        }
        if (pos.elements[2] > 25) {
            vel.elements[2] -= speed * 0.4;
        }
        if (pos.elements[2] < -25) {
            vel.elements[2] += speed * 0.4;
        }


        var delta = new Vector3(vel.elements);
        delta.normalize();
        delta.mul(speed);
        delta.mul(dt);
        pos.add(delta);

        animal.cubes[handle].pos = pos;

        vel.elements[1] = 0.0;

        var a1 = Math.atan2(vel.elements[2], vel.elements[0]);
        var a2 = Math.atan2(vel.elements[0], vel.elements[1]);

        a1 *= 180/Math.pi;
        a2 *= 180/Math.pi;

        animal.cubes[handle].rot.elements[0] = 0;
        animal.cubes[handle].rot.elements[1] = 0;
        animal.cubes[handle].rot.elements[2] = 0;

        fliers[i].pos = pos;
        fliers[i].vel = vel;
    }


}

function updatePose(dt) {
    const frame_toggle = document.getElementById("frame-toggle").checked;
    var anim_name = document.getElementById("anim").value;


    const dynamic_toggle  = document.getElementById("dynamic-toggle").checked;
    if (dynamic_toggle) {
        anim_name = state;
    } else {
        state = "walk";
        next = "walk";
    }

    const animation = animation_data[anim_name];
    if (frame_toggle) {
        //pose based on frame
        const index = document.getElementById("frame-num").value % animation.anim.length;
        const frame1 = animation.anim[index];
        const frame2 = animation.anim[(index + 1) % animation.anim.length];

        //no interpolation
        blendFrame(0, frame1, frame2);

        return;
    }

    const play_toggle = document.getElementById("play-toggle").checked;

    if (play_toggle) {
        if (state == "walk") t_time += dt;
        //wiggle tail
        for (var i = 0; i < handles.tail.length; i++) {
            animal.cubes[handles.tail[i]].rot.elements[1] = 10 * Math.sin(time * 0.001 + i * Math.PI/8);
            animal.cubes[handles.tail[i]].rot.elements[0] = 10 * Math.sin(10 + time * 0.001 + i * Math.PI/8);
        }


        //interpolate frames
        t_frac += animation.speed * 1/12.0;

        if (t_frac > 1) {
            index = (index + 1) % animation.anim.length;
            t_frac %= 1;

            curr_frame = next_frame;
            next_frame = animation.anim[index];

            if (index == animation.anim.length - 1 && dynamic_toggle) {
                index = 0;
                state = next;
                if (state == "sit") {
                    next = "sit-idle";
                }
                if (state == "sit-rev") {
                    next = "walk";
                }
            }

        }


        blendFrame(t_frac, curr_frame, next_frame);

        animal.cubes[handles.core].pos.elements[1] = animation.bob * 0.05 * Math.sin(Math.PI * 3 * time / 1000);
        if (state == "walk") {
            animal.cubes[handles.neck].rot.elements[2] -= 3 * Math.sin(time / 1000 * 3 * Math.PI);
            animal.cubes[handles.head].rot.elements[2] += 3 * Math.sin(time / 1000 * 3 * Math.PI);
        }
        return;
    }

    const body_part = document.getElementById("selected-part").value;
    const x = document.getElementById("xrot").value;
    const y = document.getElementById("yrot").value;
    const z = document.getElementById("zrot").value;

    const handle = StringToHandle[body_part];

    animal.cubes[handle].rot.elements[0] = x;
    animal.cubes[handle].rot.elements[1] = y;
    animal.cubes[handle].rot.elements[2] = z;

}

var time = 0;
var avg_dt = 0;
function tick(curr_time, prog, decor_prog, grass_prog, cubes, decor) {
    dt = curr_time - time;
    if (dt > 2000) dt = 2000;
    if (dt == 0) dt = 0.0001
    dt /= 1000.0;
    time = curr_time;

    const startTime = performance.now();

    camera.rot.add(camera.vel);
    camera.vel.mul(0.9);

    render(prog, decor_prog, grass_prog, cubes, decor);

    updatePose(dt);

    updateFliers(dt);

    const endTime = performance.now();
    if ((time * 100) % 1 == 0) {
        const dt = (endTime - startTime) / 1000; //dt is in seconds
        avg_dt = avg_dt * 0.95 + 0.05 * dt; //blend dt to get average

        //convert sec to ms, then round to 2 places
        document.getElementById("frame").innerText = `UpdateTime: ${Math.round(avg_dt * 1000 * 100) / 100} ms`;

        //calculate fps, then round to 2 places
        document.getElementById("fps").innerText = `FPS: ${Math.round((1.0 / avg_dt) * 100) / 100}`;
    }

    requestAnimationFrame((dt) => {
        tick(dt, prog, decor_prog, grass_prog, cubes, decor);
    })
}

function render(prog, decor_prog, grass_prog, cubes, decor) {
    var mat = new Matrix4();

    mat.setIdentity();
    mat.perspective(90, 1, 0.5, 1000.0);

    mat.translate(0, 0, -camera.dist);
    mat.rotate(camera.rot.elements[0], 1, 0, 0);
    mat.rotate(camera.rot.elements[1], 0, 1, 0);
    mat.rotate(camera.rot.elements[2], 0, 0, 1);

    helpers.SetUniform(ctx, prog, prog.uniform_map.pv, mat.elements);
    helpers.SetUniform(ctx, prog, prog.uniform_map.time, time/1000);


    helpers.SetUniform(ctx, decor_prog, decor_prog.uniform_map.pv, mat.elements);
    helpers.SetUniform(ctx, decor_prog, decor_prog.uniform_map.time, time/1000);

    helpers.SetUniform(ctx, grass_prog, grass_prog.uniform_map.pv, mat.elements);
    helpers.SetUniform(ctx, grass_prog, grass_prog.uniform_map.time, time/1000);
    helpers.SetUniform(ctx, grass_prog, grass_prog.uniform_map.scroll, -1.4 * t_time);
    //console.log(-2 * time/1000);
    //mat.invert();
    //helpers.SetUniform(ctx, prog, 1, mat.elements);

    var sizes = [];
    var models = [];
    var colors = [];
    var stripes = [];
    var parents = [];
    for (var i = 0; i < animal.cubes.length; i++) {
        const pos = animal.cubes[i].pos;
        const anchor = animal.cubes[i].anchor;
        const size = animal.cubes[i].size;
        const rot = animal.cubes[i].rot;
        const parent = animal.cubes[i].parent;
        const stripe = animal.cubes[i].stripe;
        const color = animal.cubes[i].color;

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

        stripes.push(...stripe);

        colors.push(...color);
        colors.push(1.0);
    }

    helpers.UploadUniform(ctx, cubes, 0, 0, models);
    helpers.UploadUniform(ctx, cubes, 0, 1, sizes);
    helpers.UploadUniform(ctx, cubes, 0, 2, colors);
    helpers.UploadUniform(ctx, cubes, 0, 3, stripes);
    helpers.UploadUniform(ctx, cubes, 1, 4, parents);

    models = [];
    sizes = [];
    texs = [];
    parents = []; 
    for (var i = 0; i < animal.decor.length; i++) {
        const pos = animal.decor[i].pos;
        const anchor = animal.decor[i].anchor;
        const size = animal.decor[i].size;
        const rot = animal.decor[i].rot;
        const parent = animal.decor[i].parent;
        const tex = animal.decor[i].tex;

        const model = new Matrix4();
        model.setTranslate(pos[0], pos[1], pos[2]);

        model.rotate(rot.elements[0], 1, 0, 0);
        model.rotate(rot.elements[1], 0, 1, 0);
        model.rotate(rot.elements[2], 0, 0, 1);
        model.translate(anchor.elements[0], anchor.elements[1], anchor.elements[2]);

        var size_matrix = new Matrix4();
        size_matrix.setScale(size[0], size[1], 1);

        const msize = Array.from(size_matrix.elements);
        sizes.push(...msize);

        var elements = Array.from(model.elements)
        models.push(...elements);
        parents.push(parent);

        texs.push(...tex);
    }

    helpers.UploadUniform(ctx, decor, 0, 0, models);
    helpers.UploadUniform(ctx, decor, 0, 1, sizes);
    helpers.UploadUniform(ctx, decor, 0, 2, texs);
    helpers.UploadUniform(ctx, decor, 1, 3, parents);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);

    helpers.Draw(ctx, prog, 36 * animal.cubes.length);

    gl.disable(gl.CULL_FACE);

    helpers.Draw(ctx, decor_prog, 6 * animal.decor.length);

    if (ctx.state.prog !== grass_prog) {
        gl.useProgram(grass_prog.p);
        ctx.state.prog = grass_prog;
    }

    if (ctx.state.vertexbuffer !== grass_verts) {
        gl.bindBuffer(gl.ARRAY_BUFFER, grass_verts.buffer);
        gl.bindVertexArray(grass_verts.vao);
        ctx.state.vertexbuffer = grass_verts;
    }

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 15, num_grass);
}
