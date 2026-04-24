
var helpers = function() {
    function InitGL(id, webgl2) {
        var canvas = document.getElementById(id);
        if (!webgl2) {

            // Get the rendering context for WebGL
            var gl = getWebGLContext(canvas, true);
            if (!gl) {
                console.log('Failed to get the rendering context for WebGL');
                return;
            }
            return { gl: gl, canvas: canvas };
        }

        var names = ["webgl2"];
        var gl = null;
        var opt_attribs = null;
        for (var ii = 0; ii < names.length; ++ii) {
            try {
                gl = canvas.getContext(names[ii], opt_attribs);
            } catch (e) { }
            if (gl) {
                break;
            }
        }

        if (!gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        return {
            gl: gl,
            canvas: canvas,
            state: {
                prog: null,
                vertexbuffer: null,
                uniformbuffer: null,
                uniform_block_index: 0,
            },
        };
    }

    function ParseGeneralType(gl, type) {

        switch (type) {
            case gl.FLOAT:
                return {
                    type: gl.FLOAT,
                    count: 1,
                    size: 4,
                    dup: 1,
                };
            case gl.FLOAT_VEC2:
                return {
                    type: gl.FLOAT,
                    count: 2,
                    size: 8,
                    dup: 1,
                };
            case gl.FLOAT_VEC3:
                return {
                    type: gl.FLOAT,
                    count: 3,
                    size: 12,
                    dup: 1,
                };
            case gl.FLOAT_VEC4:
                return {
                    type: gl.FLOAT,
                    count: 4,
                    size: 16,
                    dup: 1,
                };
            case gl.FLOAT_MAT4:
                return {
                    type: gl.FLOAT,
                    count: 4,
                    size: 16,
                    dup: 4,
                };
            default:
                console.log("Unknown Attr Type");
                console.log(type);
                return {
                    type: gl.FLOAT,
                    count: 0,
                    size: 0,
                };
        }
    }

    /** 
        CompileShaders(ctx, vert, frag)
    ctx -> global context
    vert -> Vertex Shader Source (string)
    frag -> Fragment Shader Source (string)

    returns 
    {
        p -> shader Program
        attrs -> List of vertex attributes
        uniforms -> List of uniform locations
        (Uniform locations do not include uniform buffer objects)
        count -> Number of floats per vertex
    }

    */
    function CompileShaders(ctx, vert, frag) {
        var gl = ctx.gl;

        // Initialize shaders
        var program = createProgram(gl, vert, frag);
        if (!program) {
            console.log('Failed to intialize shaders.');
            return;
        }

        //parse attributes
        var attr_infos = [];
        var stride = 0;
        var count = 0;

        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        var builtins = 0;
        for (var i = 0; i < numAttribs; i++) {
            const info = gl.getActiveAttrib(program, i);

            if (info.name == "gl_VertexID") {//skip builtin vars
                builtins++;
                continue;
            }

            if (info.name == "gl_InstanceID") {//skip builtin vars
                builtins++;
                continue;
            }

            const location = gl.getAttribLocation(program, info.name);
            const tinfo = ParseGeneralType(gl, info.type);

            for (var i = 0; i < tinfo.dup; i++) {
                attr_infos.push({
                    location: location + i,
                    type: tinfo.type,
                    count: tinfo.count,
                    stride: 0,
                    offset: stride,
                });
                stride += tinfo.size;
                count += tinfo.count;
            }
        }

        numAttribs -= builtins;

        for (var i = 0; i < attr_infos.length; i++) {
            attr_infos[i].stride = stride;
        }

        //parse Uniforms
        var uniforms = [];
        var mapping = {};
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; i++) {
            const uinfo = gl.getActiveUniform(program, i);
            const location = gl.getUniformLocation(program, uinfo.name);
            console.log(uinfo);
            if (location) {
                uniforms.push({
                    location: location,
                    type: uinfo.type,
                });
                mapping[uinfo.name] = uniforms.length - 1;
            }
        }

        //parse Uniform Blocks
        var num_blocks = gl.getProgramParameter(program, 
            gl.ACTIVE_UNIFORM_BLOCKS
        );

        var block_data = [];
        var block_map = {};
        for (var i = 0; i < num_blocks; i++) {

            const block_name = gl.getActiveUniformBlockName(program, i);

            const active_indicies = gl.getActiveUniformBlockParameter(
                program,
                i,
                gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES
            );

            const blockSize = gl.getActiveUniformBlockParameter(
                program,
                i,
                gl.UNIFORM_BLOCK_DATA_SIZE
            );

            const uniform_offsets = gl.getActiveUniforms(
                program,
                active_indicies,
                gl.UNIFORM_OFFSET,
            );

            block_map[block_name] = i;
            block_data.push({
                name: block_name,
                size: blockSize,
                offsets: uniform_offsets,
            });
        }

        console.log(block_data);

        return {
            p: program,
            attrs: attr_infos,
            uniform_loc: uniforms,
            uniform_map: mapping,
            block_map: block_map,
            uniform_blocks: block_data,
            count: count,
        };
    }

    function CreateVertBuffer(ctx, prog) {
        var gl = ctx.gl;
        var buffer = gl.createBuffer();
        var vao = gl.createVertexArray();

        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        for (var i = 0; i < prog.attrs.length; i++) {
            var attr = prog.attrs[i];
            gl.vertexAttribPointer(attr.location, attr.count, attr.type, false, attr.stride, attr.offset);
            gl.enableVertexAttribArray(attr.location);
        }

        console.log("vertsize: " + prog.attrs[0].stride);

        var vert = {
            vao: vao,
            buffer: buffer,
            size: 0,
            cap: 0,
            div: prog.count,
            vert_size: prog.attrs[0].stride,
            inv_divisor: 1,
        };

        ctx.state.vertexbuffer = vert;
        return vert;

    }

    function CreateUniformBuffer(ctx, prog, idx) {
        var gl = ctx.gl;
        var buffer = gl.createBuffer();

        gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);

        gl.bindBufferBase(gl.UNIFORM_BUFFER,
            ctx.state.uniform_block_index,
            buffer
        );

        gl.bufferData(gl.UNIFORM_BUFFER, prog.uniform_blocks[idx].size, gl.DYNAMIC_DRAW);
        gl.uniformBlockBinding(prog.p, idx, ctx.state.uniform_block_index);

        var out = {
            buf: buffer,
            offsets: prog.uniform_blocks[idx].offsets,
            cap: prog.uniform_blocks[idx].size,
            bindpoint: ctx.state.uniform_block_index++,
        };

        ctx.state.uniformbuffer = out;
        return out;
    }

    function BindUniformBuffer(ctx, prog, buffer, idx) {
        var gl = ctx.gl;
        gl.uniformBlockBinding(prog.p, idx, buffer.bindpoint);
    }


    function UploadUniformBuffer(ctx, buffer, data) {
        var gl = ctx.gl;

        if (ctx.state.uniformbuffer !== buffer) {
            gl.bindBuffer(gl.UNIFORM_BUFFER, buffer.buf);
            ctx.state.uniformbuffer = buffer;
        }

        gl.bufferSubData(gl.UNIFORM_BUFFER, 
            0,
            Float32Array.from(data)
        );

        return 0;
    }

    function UploadUniform(ctx, buffer, type, idx, data) {
        var gl = ctx.gl;

        if (ctx.state.uniformbuffer !== buffer) {
            gl.bindBuffer(gl.UNIFORM_BUFFER, buffer.buf);
            ctx.state.uniformbuffer = buffer;
        }

        var buf = null;

        switch (type) {
            case 0:
                buf = Float32Array.from(data);
                break;
            case 1:
                buf = Int32Array.from(data);
                break;
        }

        gl.bufferSubData(gl.UNIFORM_BUFFER, 
            buffer.offsets[idx],
            buf
        );

        return 0;
    }

    function SetUniform(ctx, prog, index, value) {
        var gl = ctx.gl;

        if (ctx.state.prog !== prog) {
            gl.useProgram(prog.p);
            ctx.state.prog = prog;
        }

        const info = prog.uniform_loc[index];

        switch (info.type) {
            case gl.FLOAT: {
                gl.uniform1f(info.location, value);
            } break;
            case gl.FLOAT_VEC2: {
                gl.uniform2f(info.location, value[0], value[1]);
            } break;
            case gl.FLOAT_MAT4: {
                gl.uniformMatrix4fv(info.location, false, value);
            } break;
            default: {
                console.log("Unknown Uniform Type!");
                return;
            }
        }
        
    }

    function UploadVertBuffer(ctx, buffer, vertices) {
        var gl = ctx.gl;

        if (ctx.state.vertexbuffer !== buffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bindVertexArray(buffer.vao);
            ctx.state.vertexbuffer = buffer;
        }

        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.DYNAMIC_DRAW);
        buffer.size = vertices.length / buffer.div;
        buffer.cap = buffer.size;
    }

    function ResizeVertBuffer(ctx, buffer, newsize) {
        var gl = ctx.gl;

        if (ctx.state.vertexbuffer !== buffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bindVertexArray(buffer.vao);
            ctx.state.vertexbuffer = buffer;
        }

        gl.bufferData(gl.ARRAY_BUFFER, newsize * buffer.vert_size, gl.DYNAMIC_DRAW);

        buffer.size = 0;
        buffer.cap = newsize;
    }

    function PushVerts(ctx, buffer, verts) {
        var gl = ctx.gl;

        if (ctx.state.vertexbuffer !== buffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bindVertexArray(buffer.vao);
            ctx.state.vertexbuffer = buffer;
        }

        if (buffer.size + (verts.length/buffer.div) > buffer.cap) {
            return 1;
        }

        gl.bufferSubData(
            gl.ARRAY_BUFFER, 
            buffer.size * buffer.vert_size,
            Float32Array.from(verts),
        );

        buffer.size += verts.length/buffer.div;
        return 0;
    }

    function SubVerts(ctx, buffer, offset, verts) {
        var gl = ctx.gl;

        if (ctx.state.vertexbuffer !== buffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            //gl.bindVertexArray(buffer.vao);
            ctx.state.vertexbuffer = buffer;
        }

        if (offset + (verts.length/buffer.div) > buffer.cap) {
            return 1;
        }

        gl.bufferSubData(
            gl.ARRAY_BUFFER, 
            offset * buffer.vert_size,
            Float32Array.from(verts),
        );

        buffer.size = Math.max(offset + verts.length/buffer.div, buffer.size);
        return 0;
    }

    function LoadTexture(ctx, file) {
        var gl = ctx.gl;

        /*
            Borrowed from the MDN docs
        */
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel,
        );

        var img = new Image();
        img.src = file;
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                img,
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.generateMipmap(gl.TEXTURE_2D);
        }

        return texture;
    }

    function DrawBuffer(ctx, prog, buffer) {
        var gl = ctx.gl;

        if (ctx.state.prog !== prog) {
            gl.useProgram(prog.p);
            ctx.state.prog = prog;
        }

        if (ctx.state.vertexbuffer !== buffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
            gl.bindVertexArray(buffer.vao);
            ctx.state.vertexbuffer = buffer;
        }

        gl.drawArrays(gl.TRIANGLES, 0, buffer.size * buffer.inv_divisor);
    }

    function Draw(ctx, prog, num_verts) {
        var gl = ctx.gl;

        if (ctx.state.prog !== prog) {
            gl.useProgram(prog.p);
            ctx.state.prog = prog;
        }

        gl.drawArrays(gl.TRIANGLES, 0, num_verts);
    }

    return {
        InitGL: InitGL,
        CompileShaders: CompileShaders,
        LoadTexture: LoadTexture,
        CreateUniformBuffer: CreateUniformBuffer,
        BindUniformBuffer: BindUniformBuffer,
        CreateVertBuffer: CreateVertBuffer,
        ResizeVertBuffer: ResizeVertBuffer,
        PushVerts: PushVerts,
        SubVerts: SubVerts,
        UploadVertBuffer: UploadVertBuffer,
        UploadUniformBuffer: UploadUniformBuffer,
        UploadUniform: UploadUniform,
        SetUniform: SetUniform,
        DrawBuffer: DrawBuffer,
        Draw: Draw,
    };
}();
