
function XYZtoIndex(x, y, z) {
    return x + (y << 5) + (z << 10); 
}

function IndextoXYZ(index) {
    var x = index & (32 - 1);
    var y = (index >> 5) & (32 - 1);
    var z = (index >> 10) & (32 - 1);

    return [x, y, z]; 
}


/*
    Meshes a 32x32x32 chunk
*/
    function MeshChunk(pos_buf, uv_buf, data) {

        for (var idx = 0; idx < XYZtoIndex(31, 31, 31); idx++) {
            const [x, y, z] = IndextoXYZ(idx);

            //skip empty voxels
            if (!data[idx]) {
                continue;
            }

            //build geometry

            //flip coords based on face orientation

            //+x
            if (x >= 31 || !data[XYZtoIndex(x + 1, y, z)]) {
                pos_buf.push(
                    x + 1, 1 + y, 1 + z,
                    x + 1, 1 + y, 0 + z,
                    x + 1, 0 + y, 0 + z,

                    x + 1, 0 + y, 0 + z,
                    x + 1, 0 + y, 1 + z,
                    x + 1, 1 + y, 1 + z
                );

                uv_buf.push(
                    1, 1,
                    1, 0,
                    0, 0,
                    0, 0,
                    0, 1,
                    1, 1,
                );
            }


            //-x
            if (x <= 0 || !data[XYZtoIndex(x - 1, y, z)]) {
                pos_buf.push(
                    0 + x, 0 + y, 1 + z,
                    0 + x, 1 + y, 0 + z,
                    0 + x, 1 + y, 1 + z,

                    0 + x, 1 + y, 0 + z,
                    0 + x, 0 + y, 1 + z,
                    0 + x, 0 + y, 0 + z
                );

                uv_buf.push(
                    0, 1,
                    1, 0,
                    1, 1,
                    1, 0,
                    0, 1,
                    0, 0,
                );
            }

            //+y
            if (y >= 31 || !data[XYZtoIndex(x, y + 1, z)]) {
                pos_buf.push(
                    0 + x, y + 1, 0 + z,
                    1 + x, y + 1, 0 + z,
                    1 + x, y + 1, 1 + z,

                    1 + x, y + 1, 1 + z,
                    0 + x, y + 1, 1 + z,
                    0 + x, y + 1, 0 + z
                );

                uv_buf.push(
                    0, 0,
                    1, 0,
                    1, 1,
                    1, 1,
                    0, 1,
                    0, 0,
                );
            } 

            //-y
            if (y <= 0 || !data[XYZtoIndex(x, y - 1, z)]) {
                pos_buf.push(
                    0 + x, y + 0, 0 + z,
                    1 + x, y + 0, 1 + z,
                    1 + x, y + 0, 0 + z,

                    1 + x, y + 0, 1 + z,
                    0 + x, y + 0, 0 + z,
                    0 + x, y + 0, 1 + z
                );

                uv_buf.push(
                    0, 0,
                    1, 1,
                    1, 0,
                    1, 1,
                    0, 0,
                    0, 1,
                );
            }


            //+z
            if (z >= 31 || !data[XYZtoIndex(x, y, z + 1)]) {
                pos_buf.push(
                    0 + x, 0 + y, z + 1,
                    1 + x, 1 + y, z + 1,
                    1 + x, 0 + y, z + 1,

                    1 + x, 1 + y, z + 1,
                    0 + x, 0 + y, z + 1,
                    0 + x, 1 + y, z + 1
                );

                uv_buf.push(
                    0, 0,
                    1, 1,
                    1, 0,
                    1, 1,
                    0, 0,
                    0, 1,
                );
            }

            //-z
            if (z <= 0 || !data[XYZtoIndex(x, y, z - 1)]) {
                pos_buf.push(
                    0 + x, 0 + y, z + 0,
                    1 + x, 0 + y, z + 0,
                    1 + x, 1 + y, z + 0,

                    1 + x, 1 + y, z + 0,
                    0 + x, 1 + y, z + 0,
                    0 + x, 0 + y, z + 0
                );

                uv_buf.push(
                    0, 0,
                    1, 0,
                    1, 1,
                    1, 1,
                    0, 1,
                    0, 0,
                );
            }
        }

    }
