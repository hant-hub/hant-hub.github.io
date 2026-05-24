// prettier-ignore
class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.loaded = false;

        this.getFileContent();
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
                for (const face of [tokens[2], tokens[1], tokens[3]]) {
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
