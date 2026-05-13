importScripts("helpers.js");
importScripts("voxel.js");
importScripts("mesher.js");

onmessage = (e) => {
    var [chunkx, chunky, chunkz] = e.data;
    var new_chunk = {
        mesh : {
            pos: [],
            uv: []
        }
    };

    var data = genVoxelData(chunkx, chunky, chunkz);

    new_chunk.mesh.pos = [];
    new_chunk.mesh.uv = []
    MeshChunk(new_chunk.mesh.pos, new_chunk.mesh.uv, data);

    var chunkID = {chunkx, chunky, chunkz};
    postMessage([JSON.stringify(chunkID), new_chunk.mesh, data.buffer], [data.buffer]);
};


function worker() {


}
