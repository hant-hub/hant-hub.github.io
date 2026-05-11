// prettier-ignore
class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

        this.loaded = false;

        this.getFileContent().then(() => {
            this.vertBuf = gl.createBuffer();
            this.normBuf = gl.createBuffer();

            if (!this.vertBuf || !this.normBuf) {
                console.log("failed to create buffers");
                return;
            }

            this.loaded = true;
        });
    }

    async parseModel(fileContent) {
        const lines = fileContent.split("\n");

        const verts = [];
        const normals = [];

        const unpacked_verts = [];
        const unpacked_normals = [];


        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const tokens = line.split(" ");

            if (tokens[0] == 'v') {
                verts.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            } else if (tokens[0] == 'vn') {
                normals.push(
                    parseFloat(tokens[1]),
                    parseFloat(tokens[2]),
                    parseFloat(tokens[3])
                );
            } else if (tokens[0] == 'f') {
                for (const face of [tokens[1], tokens[2], tokens[3]]) {
                    const indices = face.split("//");
                    const vidx = (parseInt(indices[0]) - 1) * 3;
                    const nidx = (parseInt(indices[1]) - 1) * 3;
                        
                    unpacked_verts.push(
                        verts[vidx + 0],
                        verts[vidx + 1],
                        verts[vidx + 2]
                    );

                    unpacked_normals.push(
                        normals[nidx + 0],
                        normals[nidx + 1],
                        normals[nidx + 2]
                    );

                }
            }
        }

        this.modelData = {
            verts: new Float32Array(unpacked_verts),
            norms: new Float32Array(unpacked_normals),
        };
    }

    render(gl, program) {
        if (!this.loaded) return;


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuf); 
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.verts, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Position);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.normBuf); 
        gl.bufferData(gl.ARRAY_BUFFER, this.modelData.norms, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(program.a_Normal);

        gl.uniformMatrix4fv(program.u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4fv(program.u_FragColor, this.color);

        let nmat = new Matrix4().setInverseOf(this.matrix);
        nmat.transpose();
        gl.uniformMatrix4fv(program.u_NormalMatrix, false, nmat.elements);

        gl.drawArrays(gl.TRIANGLES, 0, this.modelData.verts.length / 3);
    }

    async getFileContent() {
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) throw new Error(`Could not load file "${this.filePath}". Are you sure the file name/path are correct?`);

            const fileContent = await response.text();
            this.parseModel(fileContent);
        } catch (e) {
            throw new Error(`Something went wrong when loading ${this.filePath}. Error: ${e.message}`);
        }
    }
}
