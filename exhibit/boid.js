

function InitBoids(camera, boids, num_boids) {
    for (var i = 0; i < num_boids; i++) {
        boids[i] = {
            pos: new Vector3([40 * (Math.random() - 0.5), 40 * (Math.random() - 0.5), 40 * (Math.random() - 0.5)]),
            vel: new Vector3([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]).normalize(),
        };
        boids[i].pos.add(camera.pos);
    }
}

var flip = 0;
function UpdateBoids(ctx, camera, boid_buf, boids) {
    if (flip == 0) {
        flip = 1;
    } else {
        flip = 0;
    }

    //Do boid stuff
    for (var i = flip; i < boids.length; i += 2) {
        var pos = boids[i].pos;
        var vel = boids[i].vel;

        var delta = new Vector3().set(vel);
        delta.mul(0.1);
        pos.add(delta);

        var cohesion = new Vector3().set(camera.pos);
        cohesion.sub(pos);
        cohesion.mul(0.02);

        var repellant = new Vector3().set(pos);
        repellant.sub(camera.pos);
        repellant.mul(0.002 * (1/cohesion.magnitude()));

        //vel.add(cohesion);
        vel.add(repellant);
        vel.normalize();

        var diff = new Vector3().set(camera.pos).sub(pos);

        if (diff.magnitude() > 20) {
            diff.mul(1.9);
            pos.add(diff);
        }

    }


    var models = [];
    for (var i = 0; i < boids.length; i++) {
        var model = new Matrix4();
        model.setIdentity();
        model.translate(boids[i].pos.elements[0], boids[i].pos.elements[1], boids[i].pos.elements[2]);

        model.concat(new Matrix4().setLookAt(0, 0, 0,
            boids[i].vel.elements[0], boids[i].vel.elements[1], boids[i].vel.elements[2],
            0, 1, 0).invert());

        model.scale(0.2, 0.2, 0.2);

        models.push(...model.elements);
    }

    helpers.SubVerts(ctx, boid_buf, 0, models);
}

var aoe = 3;
function lazer(camera, boids, chunks) {
    var collision = ChunkRaycast(
        camera.pos.elements[0], camera.pos.elements[1], camera.pos.elements[2],
        camera.dir.elements[0], camera.dir.elements[1], camera.dir.elements[2],
        150, chunks);

    var dirty_chunks = {};

    var curr_chunk = "";
    var chunk = null;


    for (var i = 0; i < collision.length; i++) {
        var [sample, value] = collision[i];

        var spos = new Vector3(sample);
        
        for (var j = 0; j < boids.length; j++) {
            var pos = boids[j].pos;
            var vel = boids[j].vel;

            var diff = new Vector3().set(pos).sub(spos);

            if (diff.magnitude() < 5.0) {
                diff.mul(1.0);
                vel.add(diff);
            }
        }

        for (var x = sample[0] - aoe; x <= sample[0] + aoe; x++) {
            for (var y = sample[1] - aoe; y <= sample[1] + aoe; y++) {
                for (var z = sample[2] - aoe; z <= sample[2] + aoe; z++) {
                    var chunkID = {
                        chunkx : Math.floor(x/32),
                        chunky : Math.floor(y/32),
                        chunkz : Math.floor(z/32),
                    };
                    dirty_chunks[JSON.stringify(chunkID)] = true;

                    if (curr_chunk != JSON.stringify(chunkID)) {
                        chunk = chunks[JSON.stringify(chunkID)];
                        curr_chunk = JSON.stringify(chunkID);
                    } else {
                    }

                    if (chunk) {
                        var ch_x = Math.floor(x - chunkID.chunkx * 32);
                        var ch_y = Math.floor(y - chunkID.chunky * 32);
                        var ch_z = Math.floor(z - chunkID.chunkz * 32);

                        chunk.data[XYZtoIndex(ch_x, ch_y, ch_z)] = 0;
                        chunk.dirty = true;
                    }
                }
            }
        }

    }

    var keys = Object.keys(dirty_chunks);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]; 
        if (chunks[key]) {
            refreshChunk(chunks[key]);
        }
    }

}

