async function main() {
    var ctx = helpers.InitGL("webgl", true); 
    var gl = ctx.gl;

    var prog = await helpers.LoadShaders(ctx, "test.vert", "test.frag");
    var buffer = helpers.CreateVertBuffer(ctx, prog);

    var tex = helpers.LoadTexture(ctx, "img/decor.png");

    var verticies = [
        0.0,  0.5,  0.25, 1.0,
       -0.5, -0.5,  0.0, 0.0,
        0.5, -0.5,  0.5, 0.0,
    ];

    helpers.ResizeVertBuffer(ctx, buffer, 6);
    if (helpers.PushVerts(ctx, buffer, verticies)) {
        console.log("hit");
    }
    
    var uniform_buf = helpers.CreateUniformBuffer(ctx, prog, prog.block_map.block);
    helpers.UploadUniform(ctx, uniform_buf, 0, 0, [1.0, 1.0]);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    (function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        helpers.DrawBuffer(ctx, prog, buffer);
        requestAnimationFrame(render);
    })()
}

