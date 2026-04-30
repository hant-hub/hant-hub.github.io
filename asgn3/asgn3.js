var ctx = helpers.InitGL("webgl", true); 
var gl = ctx.gl;

async function main() {
    var prog = await helpers.LoadShaders(ctx, "test.vert", "test.frag");
    var buffer = helpers.CreateVertBuffer(ctx, prog);
    var buf2 = helpers.CreateMultiVertBuffer(ctx, prog);

    var pos = [
        -0.5, -0.5,
        0.5, -0.5,
        -0.5,  0.5,

        0.5,  0.5,
        -0.5,  0.5,
        0.5, -0.5,

        -0.5,  0.5,
        0.5, 0.5,
        0.0,  1.0,
    ];

    var uv = [
        0.0, 0.0,
        0.5, 0.0,
        0.25, 1.0,

        0.0, 0.0,
        0.5, 0.0,
        0.25, 1.0,

        0.0, 0.0,
        0.5, 0.0,
        0.25, 1.0,
    ];

    helpers.ResizeMultiVertBuffer(ctx, buf2, 9);
    helpers.PushMultiVerts(ctx, buf2, [pos, uv]);

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
        1, 1,
        1, 1,

        1, 1,
        1, 1
    ];

    var vox = helpers.Create3DTex(ctx);
    helpers.Upload3DData(ctx, vox, voxData, 2, 2, 2); 

    helpers.ResizeVertBuffer(ctx, buffer, 6);
    if (helpers.PushVerts(ctx, buffer, verticies)) {
        console.log("hit");
    }

    helpers.BindTexture(ctx, prog.uniform_map.utex, prog, 0, true, tex);
    helpers.BindTexture(ctx, prog.uniform_map.vox, prog,  1, false, vox);

    helpers.SetUniform(ctx, prog, prog.uniform_map.x, 0);
    helpers.SetUniform(ctx, prog, prog.uniform_map.y, 0);
    helpers.SetUniform(ctx, prog, prog.uniform_map.z, 0);


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    (function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        //helpers.DrawBuffer(ctx, prog, buffer);
        helpers.DrawMultiVert(ctx, prog, buf2);
        requestAnimationFrame(render);
    })()
}

