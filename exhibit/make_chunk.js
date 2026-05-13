importScripts("helpers.js");
importScripts("voxel.js");
importScripts("mesher.js");

onmessage = (e) => {
    var [chunkx, chunky, chunkz] = e.data;
    var new_chunk = {
        mesh : {
            pos: [],
            uv: [],
            norm: [],
        }
    };

    var data = genVoxelData(chunkx, chunky, chunkz);
    MeshChunk(new_chunk.mesh.pos, new_chunk.mesh.uv, new_chunk.mesh.norm, data);

    var chunkID = {chunkx, chunky, chunkz};
    postMessage([JSON.stringify(chunkID), new_chunk.mesh, data.buffer], [data.buffer]);
    
    delete new_chunk.mesh.uv;
    delete new_chunk.mesh.norm;
    delete new_chunk.mesh.pos;
    delete new_chunk.mesh;
    delete new_chunk;
};


function worker() {


}
