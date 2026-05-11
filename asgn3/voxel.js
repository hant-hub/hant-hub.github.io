
//fnv based hash
function noise(x, y, z) {

    var result = 49817;
    result ^= x;
    result ^= result >> 4;
    result ^= y;
    result ^= result >> 4;
    result *= 7;
    result ^= z;
    result ^= result << 4;
    result *= 7;

    return (result/1000.0) % 1;
}

//smoothstep
function step(t, a, b) {
    var s = t * t * (3 - 2 * t);
    return s * b + (1 - s) * a;
}

//value noise, trilinear blend between 8 samples
var scale = 16;
function valueNoise(x, y, z) {

    var fx = Math.floor(x/scale);
    var fy = Math.floor(y/scale);
    var fz = Math.floor(z/scale);

    var lx = (x - fx * scale)/scale;
    var ly = (y - fy * scale)/scale;
    var lz = (z - fz * scale)/scale;


    var o = noise(fx, fy, fz);
    var px = noise(fx + 1, fy, fz);
    var py = noise(fx, fy + 1, fz);
    var pz = noise(fx, fy, fz + 1);

    var pxy = noise(fx + 1, fy + 1, fz);
    var pxz = noise(fx + 1, fy, fz + 1);
    var pyz = noise(fx, fy + 1, fz + 1);

    var pxyz = noise(fx + 1, fy + 1, fz + 1);

    var bfx = step(lx, o, px);
    var tfy = step(lx, py, pxy);

    var bbx = step(lx, pz, pxz);
    var tby = step(lx, pyz, pxyz);

    var f = step(ly, bfx, tfy);
    var b = step(ly, bbx, tby);

    return step(lz, f, b);
}

function genVoxelData(chunkx, chunky, chunkz) {

    data = [];
    for (var idx = 0; idx < XYZtoIndex(31, 31, 31); idx++) {
        const [rel_x, rel_y, rel_z] = IndextoXYZ(idx);
        
        const x = rel_x + chunkx * 32;
        const y = rel_y + chunky * 32;
        const z = rel_z + chunkz * 32;

        //value noise
        if (valueNoise(x, y, z) > 0.6) {
            data[idx] = 1;
        } else {
            data[idx] = 0;
        }
    }

    return data;
}

//Based on A Fast Voxel Traversal Algorithm for Ray Tracing By
//John Amanatides and Andrew Woo (1987)
function ChunkRaycast(x, y, z, dx, dy, dz, max, chunks) {

    //get unit steps along each axis
    var dir = new Vector3([dx, dy, dz]);
    dir.normalize();
    
    var StepX = Math.sign(dx);
    var StepY = Math.sign(dy);
    var StepZ = Math.sign(dz);

    var diffX = Math.floor(x + StepX) - x;
    var diffY = Math.floor(y + StepY) - y;
    var diffZ = Math.floor(z + StepZ) - z;

    var tMaxX = diffX/dx;
    var tMaxY = diffY/dy;
    var tMaxZ = diffZ/dz;

    var deltaX = StepX/dx;
    var deltaY = StepY/dy;
    var deltaZ = StepZ/dz;

    var samples = [];

    var chunkID = {
        chunkx : Math.floor(x/32),
        chunky : Math.floor(y/32),
        chunkz : Math.floor(z/32),
    };

    x = Math.floor(x - chunkID.chunkx * 32);
    y = Math.floor(y - chunkID.chunky * 32);
    z = Math.floor(z - chunkID.chunkz * 32);

    var chunk = chunks[JSON.stringify(chunkID)];

    while (samples.length < max) {

        samples.push([[x + chunkID.chunkx * 32, y + chunkID.chunky * 32, z + chunkID.chunkz * 32], chunk.data[XYZtoIndex(x, y, z)]]);

        if (tMaxX < tMaxY) {
            if (tMaxX < tMaxZ) {
                x = x + StepX;
                tMaxX = tMaxX + deltaX;
            }
            else if (tMaxX > tMaxZ){
                z = z + StepZ;
                tMaxZ = tMaxZ + deltaZ;
            }
            else{
                x = x + StepX;
                tMaxX = tMaxX + deltaX;
                z = z + StepZ;
                tMaxZ = tMaxZ + deltaZ;
            }
        }
        else if (tMaxX > tMaxY){
            if (tMaxY < tMaxZ) {
                y = y + StepY;
                tMaxY = tMaxY + deltaY;
            }
            else if (tMaxY > tMaxZ){
                z = z + StepZ;
                tMaxZ = tMaxZ + deltaZ;
            }
            else{
                y = y + StepY;
                tMaxY = tMaxY + deltaY;
                z = z + StepZ;
                tMaxZ = tMaxZ + deltaZ;

            }
        }
        else{
            if (tMaxY < tMaxZ) {
                y = y + StepY;
                tMaxY = tMaxY + deltaY;
                x = x + StepX;
                tMaxX = tMaxX + deltaX;
            }
            else if (tMaxY > tMaxZ){
                z = z + StepZ;
                tMaxZ = tMaxZ + deltaZ;
            }
            else{
                x = x + StepX;
                tMaxX = tMaxX + deltaX;
                y = y + StepY;
                tMaxY = tMaxY + deltaY;
                z = z + StepZ;
                tMaxZ = tMaxZ + deltaZ;

            }
        }

        if (x >= 32) {
            x = 0;
            chunkID.chunkx++;
            chunk = chunks[JSON.stringify(chunkID)];
        }

        if (y >= 32) {
            y = 0;
            chunkID.chunky++;
            chunk = chunks[JSON.stringify(chunkID)];
        }

        if (z >= 32) {
            z = 0;
            chunkID.chunkz++;
            chunk = chunks[JSON.stringify(chunkID)];
        }

        if (x < 0) {
            x = 31;
            chunkID.chunkx--;
            chunk = chunks[JSON.stringify(chunkID)];
        }

        if (y < 0) {
            y = 31;
            chunkID.chunky--;
            chunk = chunks[JSON.stringify(chunkID)];
        }

        if (z < 0) {
            z = 31;
            chunkID.chunkz--;
            chunk = chunks[JSON.stringify(chunkID)];
        }

        if (!chunk) {
            console.log("out of bounds");
            break;
        }
    }

    return samples;
}

function writeVoxel(x, y, z, value, chunks) {
    var chunkID = {
        chunkx : Math.floor(x/32),
        chunky : Math.floor(y/32),
        chunkz : Math.floor(z/32),
    };

    x = Math.floor(x - chunkID.chunkx * 32);
    y = Math.floor(y - chunkID.chunky * 32);
    z = Math.floor(z - chunkID.chunkz * 32);

    console.log(chunkID, x, y, z);

    var chunk = chunks[JSON.stringify(chunkID)];
    console.log(chunk);

    if (!chunk) return;

    chunk.data[XYZtoIndex(x, y, z)] = value;
    refreshChunk(chunk);
    chunk.dirty = true;
}
