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

async function main() {
    var prog = await helpers.LoadShaders(ctx, "test.vert", "test.frag");
    var buffer = helpers.CreateVertBuffer(ctx, prog);
    var buf2 = helpers.CreateMultiVertBuffer(ctx, prog);

    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CW);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.depthRange(0.0, 1.0);
    gl.clearDepth(1.0);

    var tex = await helpers.LoadTexture(ctx, "img/decor.png");
    var verticies = [
        -0.5, -0.5,  0.0, 0.0,
         0.5, -0.5,  0.5, 0.0,
        -0.5,  0.5,  0.25, 1.0,

         0.5,  0.5,  0.0, 0.0,
        -0.5,  0.5,  0.5, 0.0,
         0.5, -0.5,  0.25, 1.0,
    ];

    var voxData = [
        128, 1,
        1, 1,

        1, 1,
        1, 255
    ];

    var vox = helpers.Create3DTex(ctx);
    helpers.Upload3DData(ctx, vox, voxData, 2, 2, 2); 

    helpers.ResizeVertBuffer(ctx, buffer, 6);
    if (helpers.PushVerts(ctx, buffer, verticies)) {
        console.log("hit");
    }

    helpers.BindTexture(ctx, prog.uniform_map.utex, prog, 0, true, tex);
    //helpers.BindTexture(ctx, prog.uniform_map.vox, prog,  1, false, vox);

    //helpers.SetUniform(ctx, prog, prog.uniform_map.x, 1);
    //helpers.SetUniform(ctx, prog, prog.uniform_map.y, 1);
    //helpers.SetUniform(ctx, prog, prog.uniform_map.z, 0);

    console.log(XYZtoIndex(32, 0, 0));
    console.log(IndextoXYZ(1));
    console.log(IndextoXYZ(32));
    console.log(IndextoXYZ(32 * 32));


    var pos = [];
    var uv = [];

    var voxel_data = [];
    for (var i = 0; i < 10; i++) {
        voxel_data.push(0);
    }
    voxel_data[0] = 1;

    MeshChunk(pos, uv, voxel_data);
    console.log(pos, uv);
    helpers.UploadMultiVertBuffer(ctx, buf2, [pos]);

    ctx.canvas.onmousemove = function(ev) { return on_move(ev); };
    ctx.canvas.onwheel = function(ev) { on_wheel(ev);  return false;};
    ctx.canvas.onmousedown = on_click;
    document.addEventListener("keydown", function(ev) { on_key_down(ev);});
    document.addEventListener("keyup", function(ev) { on_key_up(ev);});


    tick(0, prog, buf2);
}

async function on_click(ev) {
    on_move(ev);
    await ctx.canvas.requestPointerLock();
    input_state.focused = true;
}

function on_wheel(ev) {
    //camera.pos.sub(camera.dir);
}

function on_key_up(ev) {
    switch (ev.key) {
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
        case 'Shift': {
            input_state.move.down = false;
        } break;


        default: break;
    }
}

function on_key_down(ev) {
    switch (ev.key) {
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

        case ' ': {
            input_state.move.up = true;
        } break;
        case 'Shift': {
            input_state.move.down = true;
        } break;


        default: break;
    }
}

async function on_move(ev) {
    if (!input_state.enable_mouse_look) {
        return true;
    }


    const dx = ev.movementX; // x coordinate of a mouse pointer
    const dy = ev.movementY; // y coordinate of a mouse pointer

    var up = new Vector3([0, 1, 0]);
    var perp = Vector3.cross(camera.dir, up);
    perp.normalize();

    var rot = new Matrix4();
    rot.rotate(-dx, 0, 1, 0);
    rot.rotate(-dy, perp.elements[0], perp.elements[1], perp.elements[2]);

    if (input_state.focused) {
        camera.dir = rot.multiplyVector3(camera.dir);
        camera.dir.normalize();
    }
}

var curr_time = 0;
var time = 0;
function tick(dt, prog, buf) {
    dt = curr_time - time;
    if (dt > 2000) dt = 2000;
    if (dt == 0) dt = 0.0001
    dt /= 1000.0;
    time = curr_time;
    
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
        perp.mul(dt * 1000000);


        camera.pos.add(perp);
    }

    var pv = new Matrix4();
    pv.setIdentity();
    pv.perspective(90, ctx.canvas.width/ctx.canvas.height, 0.5, 1000.0);
    var target = new Vector3();
    target.set(camera.dir);
    target.add(camera.pos);

    pv.lookAt(camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
              target.elements[0], target.elements[1], target.elements[2],
              0, 1, 0);

     

    helpers.SetUniform(ctx, prog, prog.uniform_map.pv, pv.elements);


    gl.clear(gl.COLOR_BUFFER_BIT);
    //helpers.DrawBuffer(ctx, prog, buffer);
    helpers.DrawMultiVert(ctx, prog, buf, false);

    requestAnimationFrame((dt) => { tick(dt, prog, buf); });
}

