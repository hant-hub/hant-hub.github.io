var ctx = helpers.InitGL("webgl", true); 
var gl = ctx.gl;

var input_state = {
    focused: false,
    enable_mouse_look: true,
    enable_move: true,

    move: {
        w: false,
        a: false,
        s: false,
        d: false,
        up: false,
        down: false,
    }
};

var camera = {
    pos: new Vector3([0, 0, -1]),
    dir: new Vector3([0, 0, 1]),
};

var voxel_data = [];
var chunks = {};

var mesh1 = {
    pos: [],
    uv: []
};

var mesh2 = {
    pos: [],
    uv: []
};

var buf2 = null;
var circ_prog = null;
var circ_buf = null;

var teapot_buf = null;

var vox_prog = null;
var sky_prog = null;
var boid_prog = null;

var num_boids = 200;
var boids = [];
var boid_pos = null;

var chunk_gen = [
    new Worker("make_chunk.js"),
    new Worker("make_chunk.js"),
];

async function main() {
    vox_prog = await helpers.LoadShaders(ctx, "voxel.vert", "voxel.frag");
    sky_prog = await helpers.LoadShaders(ctx, "skybox.vert", "skybox.frag");
    boid_prog = await helpers.LoadShaders(ctx, "boid.vert", "boid.frag");
    circ_prog = await helpers.LoadShaders(ctx, "sphere.vert", "sphere.frag");

    var buffer = helpers.CreateVertBuffer(ctx, vox_prog);
    buf2 = helpers.CreateMultiVertBuffer(ctx, circ_prog);

    circ_buf = helpers.CreateMultiVertBuffer(ctx, circ_prog);

    var d = Math.PI/100;
    var pos = [];
    var norm = [];

    for (var t = 0; t < Math.PI; t += d) {
        for (var r = 0; r < 2*Math.PI; r += d) {
            var p1 = [Math.sin(t) * Math.cos(r), Math.sin(t) * Math.sin(r), Math.cos(t)];
            var p2 = [Math.sin(t + d) * Math.cos(r), Math.sin(t + d) * Math.sin(r), Math.cos(t + d)]; 
            var p3 = [Math.sin(t) * Math.cos(r + d), Math.sin(t) * Math.sin(r + d), Math.cos(t)];
            var p4 = [Math.sin(t + d) * Math.cos(r + d), Math.sin(t + d) * Math.sin(r + d), Math.cos(t + d)];

            pos.push(...p1);
            pos.push(...p2);
            pos.push(...p4);

            pos.push(...p3);
            pos.push(...p1);
            pos.push(...p4);

            norm.push(...p1);
            norm.push(...p2);
            norm.push(...p4);

            norm.push(...p3);
            norm.push(...p1);
            norm.push(...p4);

            //helpers.UploadMultiVertBuffer(ctx, chunk.buffer, [chunk.mesh.pos, chunk.mesh.uv, chunk.mesh.norm, chunk.mesh.vox]);

        }
    }
    console.log(pos);
    console.log(norm);
    helpers.UploadMultiVertBuffer(ctx, circ_buf, [pos, norm]);
    console.log(circ_buf);

    teapot_buf = helpers.CreateMultiVertBuffer(ctx, circ_prog);

    var teapot = new Model(gl, "teapot.obj");
    await teapot.getFileContent();

    helpers.UploadMultiVertBuffer(ctx, teapot_buf, [teapot.modelData.verts, teapot.modelData.norms]);
    console.log(teapot_buf);


    if (window.localStorage.getItem("cam") != null) {
        var cam = JSON.parse(window.localStorage.getItem("cam"));
        console.log(cam);

        if (cam.dir.elements[0] != null) {
            camera.dir = new Vector3(cam.dir.elements);
            camera.pos = new Vector3(cam.pos.elements);
        }
    }

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthRange(0.0, 1.0);
    gl.clearDepth(1.0);


    boid_pos = helpers.CreateVertBuffer(ctx, boid_prog);
    gl.vertexAttribDivisor(0, 1);
    gl.vertexAttribDivisor(1, 1);
    gl.vertexAttribDivisor(2, 1);
    gl.vertexAttribDivisor(3, 1);
    helpers.ResizeVertBuffer(ctx, boid_pos, 64 * num_boids);
    InitBoids(camera, boids, num_boids);



    //var vox = helpers.Create3DTex(ctx);
    //helpers.Upload3DData(ctx, vox, voxData, 2, 2, 2); 

    //helpers.ResizeVertBuffer(ctx, buffer, 6);
    //if (helpers.PushVerts(ctx, buffer, verticies)) {
    //    console.log("hit");
    //}

    var tex = await helpers.LoadTexture(ctx, "img/voxel.jpg");
    helpers.BindTexture(ctx, vox_prog.uniform_map.utex, vox_prog, 1, true, tex);
    //helpers.BindTexture(ctx, prog.uniform_map.vox, prog,  1, false, vox);

    var skybox = await helpers.LoadTexture(ctx, "img/sky.png");
    helpers.BindTexture(ctx, sky_prog.uniform_map.skybox, sky_prog, 2, true, skybox);

    //helpers.SetUniform(ctx, prog, prog.uniform_map.x, 1);
    //helpers.SetUniform(ctx, prog, prog.uniform_map.y, 1);
    //helpers.SetUniform(ctx, prog, prog.uniform_map.z, 0);

    console.log(XYZtoIndex(32, 0, 0));
    console.log(IndextoXYZ(1));
    console.log(IndextoXYZ(32));
    console.log(IndextoXYZ(32 * 32));

    //genChunk(0, 0, 0);

    //for (var x = -1; x < 2; x++) {
    //    for (var z = -1; z < 2; z++) {
    //        genChunk(x, 0, z);
    //    }
    //}

    ctx.canvas.onmousemove = function(ev) { return on_move(ev); };
    ctx.canvas.onwheel = function(ev) { on_wheel(ev);  return false;};
    ctx.canvas.onmousedown = on_click;
    document.addEventListener("keydown", function(ev) { on_key_down(ev); return false;});
    document.addEventListener("keyup", function(ev) { on_key_up(ev); return false;});

    document.getElementById("cam").onclick = () => {
        camera.dir = new Vector3([0, 0, 1]);
        camera.pos = new Vector3([0, 0, 0]);
    };

    tick(0, vox_prog, buf2);
}

function refreshChunk(chunk) {
    chunk.mesh.pos = [];
    chunk.mesh.uv = [];
    chunk.mesh.norm = [];
    chunk.mesh.vox = [];

    helpers.Upload3DData(ctx, chunk.tex, chunk.data, 32, 32, 32);
    MeshChunk(chunk.mesh.pos, chunk.mesh.uv, chunk.mesh.norm, chunk.mesh.vox, chunk.data);
    helpers.UploadMultiVertBuffer(ctx, chunk.buffer, [chunk.mesh.pos, chunk.mesh.uv, chunk.mesh.norm, chunk.mesh.vox]);
}

var selected_gen = 0;
async function genChunk(chunkx, chunky, chunkz) {

    var chunkID = {chunkx, chunky, chunkz};
    if (chunks[JSON.stringify(chunkID)]) {
        return;
    }

    chunk_gen[selected_gen].postMessage([chunkx, chunky, chunkz]);
    selected_gen = (selected_gen + 1) % chunk_gen.length;

    chunks[JSON.stringify(chunkID)] = {ready: false};

}

for (var i = 0; i < chunk_gen.length; i++) {
    chunk_gen[i].onmessage = (e) => {
        var [key, mesh, data] = e.data; 

        var new_chunk = {
            data : new Uint8Array(data),
            buffer: helpers.CreateMultiVertBuffer(ctx, vox_prog),
            mesh : mesh,
            tex : helpers.Create3DTex(ctx),
            dirty: false,
            ready: true,
        };
        chunks[key] = new_chunk;

        helpers.Upload3DData(ctx, chunks[key].tex, chunks[key].data, 32, 32, 32);
        helpers.UploadMultiVertBuffer(ctx, chunks[key].buffer, 
            [chunks[key].mesh.pos, chunks[key].mesh.uv, chunks[key].mesh.norm, chunks[key].mesh.vox]);

    };
}

function DeleteChunk(chunkx, chunky, chunkz) {
    var chunkID = {
        chunkx: chunkx,
        chunky: chunky,
        chunkz: chunkz
    };
    var chunk = chunks[JSON.stringify(chunkID)];
    if (!chunk || !chunk.ready) return;

    //skip dirty chunks
    if (chunk.dirty) return;

    helpers.DeleteMultiVertBuffer(ctx, chunk.buffer);
    gl.deleteTexture(chunk.tex);
    delete chunk.data;
    delete chunk.mesh.pos;
    delete chunk.mesh.uv;
    delete chunk.mesh;

    delete chunks[JSON.stringify(chunkID)];
}

async function on_click(ev) {
    on_move(ev);

    if (!input_state.focused) {
        await ctx.canvas.requestPointerLock();
        input_state.focused = true;
        return;
    }

    var action = document.getElementById("action").value;

    switch (action) {
        case "place":
            {
                var collision = ChunkRaycast(
                    camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
                    camera.dir.elements[0], camera.dir.elements[1], camera.dir.elements[2],
                    10, chunks);

                if (ev.buttons == 1) {
                    //if (!chunk.data[collision[collision.length - 1]]) return;
                    var index = 0;
                    while (index < collision.length && !collision[index][1]) index++;
                    if (index >= collision.length) break;
                    if (index != 0) index--;
                    
                    var block_type = document.getElementById("type").value;

                    var value = 0;
                    switch (block_type) {
                        case "dirt": value = 1; break;
                        case "stone": value = 2; break;
                        case "grass": value = 3; break;
                        case "ore": value = 4; break;
                    }

                    writeVoxel(
                        collision[index][0][0],
                        collision[index][0][1],
                        collision[index][0][2],
                        value,
                        chunks);
                }

                if (ev.buttons == 2) {
                    //if (!chunk.data[collision[collision.length - 1]]) return;
                    var index = 0;
                    while (index < collision.length && !collision[index][1]) index++;
                    if (index >= collision.length) break;
                    writeVoxel(
                        collision[index][0][0],
                        collision[index][0][1],
                        collision[index][0][2],
                        0,
                        chunks);
                }

            } break;
        case "ray":
            {
                var collision = ChunkRaycast(
                    camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
                    camera.dir.elements[0], camera.dir.elements[1], camera.dir.elements[2],
                    100, chunks);

                var content = 1;
                if (ev.buttons == 2) content = 0;

                for (var i = 3; i < collision.length; i++) {
                    writeVoxel(
                        collision[i][0][0],
                        collision[i][0][1],
                        collision[i][0][2],
                        1,
                        chunks);
                }
            } break;
        case "lazer":
            {
                lazer(camera, boids, chunks);
            } break;
    }


    //console.log("place!", collision);
}


function on_wheel(ev) {
    //camera.pos.sub(camera.dir);
}

function on_key_up(ev) {
    switch (ev.key.toLowerCase()) {
        case 'w': {
            input_state.move.w = false;
        } break;
        case 's': {
            input_state.move.s = false;
        } break;
        case 'a': {
            input_state.move.a = false;
        } break;
        case 'd': {
            input_state.move.d = false;
        } break;

        case ' ': {
            input_state.move.up = false;
        } break;
        case 'shift': {
            input_state.move.down = false;
        } break;


        default: break;
    }
}

function on_key_down(ev) {

    ev.preventDefault();
    switch (ev.key.toLowerCase()) {
        case 'w': {
            input_state.move.w = true;
        } break;
        case 's': {
            input_state.move.s = true;
        } break;
        case 'a': {
            input_state.move.a = true;
        } break;
        case 'd': {
            input_state.move.d = true;
        } break;

        case 'c': console.log(Object.keys(chunks)); break;

        case ' ': {
            input_state.move.up = true;
        } break;
        case 'shift': {
            input_state.move.down = true;
        } break;


        default: break;
    }
}

async function on_move(ev) {
    if (!input_state.enable_mouse_look) {
        return true;
    }


    var dx = ev.movementX; // x coordinate of a mouse pointer
    var dy = ev.movementY; // y coordinate of a mouse pointer

    var up = new Vector3([0, 1, 0]);
    var perp = Vector3.cross(camera.dir, up);
    perp.normalize();

    var rot = new Matrix4();
    rot.rotate(-dx, 0, 1, 0);

    if (
        camera.dir.elements[0] < 0.1 &&
        camera.dir.elements[0] > -0.1 &&
        camera.dir.elements[2] < 0.1 &&
        camera.dir.elements[2] > -0.1
    ) {
        if (camera.dir.elements[1] < 0 && dy > 0) dy = 0;
        if (camera.dir.elements[1] > 0 && dy < 0) dy = 0;
    }

    rot.rotate(-dy, perp.elements[0], perp.elements[1], perp.elements[2]);

    if (input_state.focused) {
        camera.dir = rot.multiplyVector3(camera.dir);
        camera.dir.normalize();
    }
}

var time = 0;
var counter = 0;
var avg_dt = 0;

var render_dist = 3;

var flash_pos = [0, 0, 0];
function tick(curr_time, prog, buf) {
    dt = curr_time - time;
    if (dt > 2000) dt = 2000;
    if (dt == 0) dt = 0.0001
    dt /= 1000.0;
    time = curr_time;

    const startTime = performance.now();

    render_dist = document.getElementById("render").value;

    window.localStorage.setItem("cam", JSON.stringify(camera));

    if (input_state.focused && document.pointerLockElement != ctx.canvas) {
        console.log(camera.dir);
        input_state.focused = false;

        input_state.move = {
            w: false,
            a: false,
            s: false,
            d: false,
            up: false,
            down: false,
        };
    }
    
    if (input_state.focused) {
        var forward = new Vector3();
        forward.set(camera.dir);
        forward.elements[1] = 0;
        if (forward.magnitude()) forward.normalize();
        forward.mul(input_state.move.w - input_state.move.s);

        var up = new Vector3([0, 1, 0]);
        var perp = Vector3.cross(camera.dir, up);
        perp.elements[1] = 0;
        if (perp.magnitude()) perp.normalize();
        perp.mul(input_state.move.d - input_state.move.a);

        perp.add(forward);
        up.mul(input_state.move.up - input_state.move.down);
        if (up.magnitude()) up.normalize();

        perp.add(up);

        if (perp.magnitude()) perp.normalize();
        var speed = document.getElementById("speed").value;
        perp.mul(dt * 10.0 * speed);

        var test = new Vector3();
        var test_perp = new Vector3();
        test_perp.set(perp);
        test_perp.normalize();
        test_perp.mul(1.5);

        test.set(camera.pos);
        test.add(perp);
        test.add(test_perp);
        
        const camera_chunk = {
            chunkx : Math.floor(test.elements[0]/32),
            chunky : Math.floor(test.elements[1]/32),
            chunkz : Math.floor(test.elements[2]/32),
        };

        var x = Math.floor(test.elements[0] - camera_chunk.chunkx * 32);
        var y = Math.floor(test.elements[1] - camera_chunk.chunky * 32);
        var z = Math.floor(test.elements[2] - camera_chunk.chunkz * 32);

        var chunk = chunks[JSON.stringify(camera_chunk)];

        if (!chunk || !chunk.ready || !chunk.data[XYZtoIndex(x, y, z)]) camera.pos.add(perp);
    }

    //set voxel camera
    var p = new Matrix4();
    p.setIdentity();
    p.perspective(90, ctx.canvas.width/ctx.canvas.height, 0.5, (render_dist + 1) * 32);

    var target = new Vector3();
    target.set(camera.dir);
    target.add(camera.pos);

    var v = new Matrix4();
    v.lookAt(camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
              target.elements[0], target.elements[1], target.elements[2],
              0, 1, 0);

    var n = new Matrix4();
    n.setLookAt(0, 0, 0,
                -camera.dir.elements[0], -camera.dir.elements[1], -camera.dir.elements[2],
                0, 1, 0);
    //n.invert();

    var pv = new Matrix4();
    pv.set(p);
    pv.concat(v);

    helpers.SetUniform(ctx, prog, prog.uniform_map.pv, pv.elements);
    helpers.SetUniform(ctx, boid_prog, boid_prog.uniform_map.pv, pv.elements);

    helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.pv, pv.elements);
    helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.camera, camera.pos.elements);

    var debug_normal = document.getElementById("debug-normal").checked;
    helpers.SetUniform(ctx, prog, prog.uniform_map.debug_normal, debug_normal);
    helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.debug_normal, debug_normal);

    var enable_light = document.getElementById("enable-light").checked;
    helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.light_enable, enable_light);

    var enable_flash = document.getElementById("enable-flash").checked;
    helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.flash_enable, enable_flash);


    var enable_update = document.getElementById("enable-flash-update").checked;
    if (enable_update) {
        flash_pos = [
            camera.pos.elements[0],
            camera.pos.elements[1],
            camera.pos.elements[2],
        ];

        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.flash, camera.pos.elements);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.flash_dir, camera.dir.elements);
    }

    var move_light = document.getElementById("move-light").checked;
    var point_pos = [
        document.getElementById("px").value,
        document.getElementById("py").value,
        document.getElementById("pz").value
    ];
    if (move_light) {
        point_pos = [
            10.0 * Math.cos(time/1000) * Math.sin(time/1000 + 0.5),
            10.0 * Math.sin(time/1000) * Math.sin(time/1000 + 0.5),
            10.0 * Math.cos(time/1000),
        ];
    }

    helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.point_light, point_pos);

    var obj_color = [
        document.getElementById("or").value,
        document.getElementById("og").value,
        document.getElementById("ob").value
    ];

    var light_color = [
        document.getElementById("lr").value,
        document.getElementById("lg").value,
        document.getElementById("lb").value
    ];


    {
        var collision = ChunkRaycast(
            camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
            camera.dir.elements[0], camera.dir.elements[1], camera.dir.elements[2],
            10, chunks);

        if (collision && collision.length != 0) {
            var index = 0;
            while (index < collision.length && !collision[index][1]) index++;
            //if (index != 0) index--;

            if (index < collision.length) {
                var x = collision[index][0][0];
                var y = collision[index][0][1];
                var z = collision[index][0][2];

                helpers.SetUniform(ctx, prog, prog.uniform_map.cursor, [x, y, z]);
            } else {
                var x = collision[collision.length - 1][0][0];
                var y = collision[collision.length - 1][0][1];
                var z = collision[collision.length - 1][0][2];

                helpers.SetUniform(ctx, prog, prog.uniform_map.cursor, [x, y, z]);
            }
        }
    }



    var pv = new Matrix4();
    pv.setIdentity();
    pv.perspective(90, ctx.canvas.width/ctx.canvas.height, 0.01, 2.0);
    var target = new Vector3();
    target.set(camera.dir);
    target.add(camera.pos);

    pv.lookAt(camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
              target.elements[0], target.elements[1], target.elements[2],
              0, 1, 0);


    helpers.SetUniform(ctx, sky_prog, sky_prog.uniform_map.pv, pv.elements);
    helpers.SetUniform(ctx, sky_prog, sky_prog.uniform_map.pos, camera.pos.elements);


    UpdateBoids(ctx, camera, boid_pos, boids);

    gl.clear(gl.COLOR_BUFFER_BIT);

    const camera_chunk = {
        chunkx : Math.floor(camera.pos.elements[0]/32),
        chunky : Math.floor(camera.pos.elements[1]/32),
        chunkz : Math.floor(camera.pos.elements[2]/32),
    };


    gl.disable(gl.DEPTH_TEST);
    helpers.Draw(ctx, sky_prog, 6 * 6);
    gl.enable(gl.DEPTH_TEST);


    for (var x = -render_dist; x <= render_dist; x++) {
        for (var y = -render_dist; y <= render_dist; y++) {
            for (var z = -render_dist; z <= render_dist; z++) {
                var chunkID = {
                    chunkx: x + camera_chunk.chunkx,
                    chunky: y + camera_chunk.chunky,
                    chunkz: z + camera_chunk.chunkz
                };
                var value = chunks[JSON.stringify(chunkID)];

                if (!value) { 
                    genChunk(chunkID.chunkx, chunkID.chunky, chunkID.chunkz);
                    continue;
                }
                
                if (!value.ready) {
                    continue;
                }

                value = chunks[JSON.stringify(chunkID)];

                helpers.SetUniform(ctx, prog, prog.uniform_map.chunk_pos, [chunkID.chunkx * 32, chunkID.chunky * 32, chunkID.chunkz * 32]);
                helpers.BindTexture(ctx, prog.uniform_map.vox, prog, 0, false, value.tex); 

                helpers.DrawMultiVert(ctx, prog, value.buffer, false);
            }
        }
    }

    var enable_tea = document.getElementById("enable-tea").checked;


    if (Math.abs(camera_chunk.chunkx) <= render_dist &&
        Math.abs(camera_chunk.chunky) <= render_dist &&
        Math.abs(camera_chunk.chunkz) <= render_dist) {

        var m = new Matrix4();
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.m, m.elements);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.obj_color, obj_color);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.light_color, light_color);

        if (enable_tea) {
            helpers.DrawMultiVert(ctx, circ_prog, teapot_buf, false);
        } else {
            helpers.DrawMultiVert(ctx, circ_prog, circ_buf, false);
        }

        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.obj_color, [1.0, 1.0, 1.0]);
    }

    if (enable_light) {
        var m = new Matrix4();
        m.translate(point_pos[0], point_pos[1], point_pos[2]);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.m, m.elements);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.light_enable, 0);
        helpers.DrawMultiVert(ctx, circ_prog, circ_buf, false);
    }

    if (enable_flash && !enable_update) {
        var m = new Matrix4();
        m.translate(flash_pos[0], flash_pos[1], flash_pos[2]);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.m, m.elements);
        helpers.SetUniform(ctx, circ_prog, circ_prog.uniform_map.light_enable, 0);
        helpers.DrawMultiVert(ctx, circ_prog, circ_buf, false);
    }

    if (ctx.state.prog !== boid_prog) {
        gl.useProgram(boid_prog.p);
        ctx.state.prog = boid_prog;
    }

    if (ctx.state.vertexbuffer !== boid_pos) {
        gl.bindBuffer(gl.ARRAY_BUFFER, boid_pos.buffer);
        gl.bindVertexArray(boid_pos.vao);
        ctx.state.vertexbuffer = boid_pos;
    }

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, num_boids);

    var range = render_dist + 3;
    for (var x = -range; x <= range; x++) {
        for (var y = -range; y <= range; y++) {
            for (var z = -range; z <= range; z++) {
                if (Math.abs(x) < range &&
                    Math.abs(y) < range &&
                    Math.abs(z) < range) continue;

                DeleteChunk(
                    x + camera_chunk.chunkx,
                    y + camera_chunk.chunky,
                    z + camera_chunk.chunkz
                );

            }
        }
    }

    const endTime = performance.now();
    if ((time * 100) % 1 == 0) {
        {
            const dt = (endTime - startTime) / 1000; //dt is in seconds
            avg_dt = avg_dt * 0.95 + 0.05 * dt; //blend dt to get average

            //convert sec to ms, then round to 2 places
            document.getElementById("frame").innerText = `Rendertime: ${Math.round(avg_dt * 1000 * 100) / 100} ms`;
        }

        //calculate fps, then round to 2 places
        document.getElementById("fps").innerText = `FPS: ${Math.round((1.0 / dt) * 100) / 100}`;
    }

    requestAnimationFrame((dt) => { tick(dt, prog, buf); });
}

