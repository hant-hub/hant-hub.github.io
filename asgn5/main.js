import * as THREE from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50 );

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//amient light
{
    const skyColor = 0xB1E1FF;  // light blue
    const groundColor = 0xB97A20;  // brownish orange
    const intensity = 0.5;
    const light = new THREE.AmbientLight(skyColor, intensity);
    scene.add(light);
}

//sun
{
    const color = 0xFFFFFF;
    const intensity = 20;
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(0, -5, 10);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add(light);
}

//secondary light
{
    const color = 0xFFFFFF;
    const intensity = 10;
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(-5, 5, -5);
    light.castShadow = false;
    scene.add(light);
}

//load textures
const loader = new THREE.TextureLoader();
const materials = [
  new THREE.MeshPhongMaterial({map: loadColorTexture('img/container.jpg'), shininess: 20.0}),
  new THREE.MeshPhongMaterial({map: loadColorTexture('img/container.jpg'), shininess: 20.0}),
  new THREE.MeshPhongMaterial({map: loadColorTexture('img/container.jpg'), shininess: 20.0}),
  new THREE.MeshPhongMaterial({map: loadColorTexture('img/container.jpg'), shininess: 20.0}),
  new THREE.MeshPhongMaterial({map: loadColorTexture('img/container.jpg'), shininess: 20.0}),
  new THREE.MeshPhongMaterial({map: loadColorTexture('img/container.jpg'), shininess: 20.0}),
];

function loadColorTexture( path ) {
  const texture = loader.load( path );
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

//background
{
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'img/right.png',
    'img/left.png',
    'img/top.png',
    'img/bottom.png',
    'img/front.png',
    'img/back.png',
  ]);
  scene.background = texture;
}

//load models
const mtlLoader = new MTLLoader();
mtlLoader.load('models/tree/materials.mtl', (mtl) => {
    mtl.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(mtl);
    objLoader.load('models/tree/model.obj', (root) => {
        root.position.x = 2.0;
        root.rotateZ(-Math.PI/2);

        root.castShadow = true;
        root.receiveShadow = true;

        scene.add(root);
    });
});





//create planet
const cube_geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const geometry = new THREE.IcosahedronGeometry( 1.0, 32);
const material = new THREE.MeshPhongMaterial( { color: 0xffffff, shininess: 200, vertexColors: true } );


//distort surface
{
    var noise = new SimplexNoise();
    var colors = [];

    for (var i = 0; i < geometry.attributes.position.count; i++) {
        var pos = {
            x: geometry.attributes.position.getX(i),
            y: geometry.attributes.position.getY(i),
            z: geometry.attributes.position.getZ(i),
        };
        
        //var r = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);

        //var theta = Math.acos(pos.z/r);
        //var phi = Math.atan(pos.y/pos.x);

        //theta /= 1.0;
        //phi /= 1.0;

        var n = noise.noise3d(pos.x, pos.y, pos.z);
        var mul = 1.0;
        for (var j = 0; j < 5; j++) {
            mul *= 2.0;
            n += (1.0/mul) * noise.noise3d(mul * (pos.x + j), mul * (pos.y - j), mul * pos.z);
        }

        n = (2.0 * n) + 10.0;
        n /= 10.0;

        pos.x *= n;
        pos.y *= n; 
        pos.z *= n;

        geometry.attributes.position.setXYZ(i, pos.x, pos.y, pos.z);

        if (n > 1.2) colors.push(1.0, 1.0, 1.0);
        else if (n > 1.1) colors.push(0.2, 0.2, 0.2);
        else colors.push(0.0, 0.8, 0.0);

        //add stuff

        var v = Math.random(); 

        //random boxes
        if ((v + Math.max(0.1 * pos.y, 0.0)) < 0.001) {
            const cube = new THREE.Mesh( cube_geo, materials );
            cube.castShadow = true;
            cube.receiveShadow = true;
            cube.position.x = pos.x;
            cube.position.y = pos.y;
            cube.position.z = pos.z;

            cube.lookAt(new THREE.Vector3(0,0,0));

            scene.add( cube );
        }

        //random bushes
        var r = Math.random();
        if ((r + Math.max(0.1 * pos.y, 0.0)) < 0.001) {
            let x = pos.x;
            let y = pos.y;
            let z = pos.z;

            mtlLoader.load('models/tree/materials.mtl', (mtl) => {

                const objLoader = new OBJLoader();
                mtl.preload();
                objLoader.setMaterials(mtl);
                objLoader.load('models/tree/model.obj', (root) => {
                    root.position.x = 2.0;
                    root.castShadow = true;
                    root.receiveShadow = true;

                    root.position.x = x * 1.2;
                    root.position.y = y * 1.2;
                    root.position.z = z * 1.2;
                    root.scale.multiplyScalar(0.2);

                    root.lookAt(new THREE.Vector3(0, 0, 0));
                    root.rotateX(-Math.PI/2);

                    scene.add(root);
                });
            });
        }


    }

    mtlLoader.load('models/rose/materials.mtl', (mtl) => {
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('models/rose/model.obj', (root) => {

            var n = noise.noise3d(0, 1, 0);
            var mul = 1.0;
            for (var j = 0; j < 5; j++) {
                mul *= 2.0;
                n += (1.0/mul) * noise.noise3d(mul * (0 + j), mul * (1 - j), mul * 0);
            }

            n = (2.0 * n) + 10.0;
            n /= 10.0;

            root.position.y = n + 0.05;

            root.scale.multiplyScalar(0.2);

            root.castShadow = true;
            root.receiveShadow = true;

            scene.add(root);
        });
    });

    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

    console.log(geometry);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.computeVertexNormals();


}


const planet = new THREE.Mesh( geometry, material );
planet.castShadow = true;
planet.receiveShadow = true;

scene.add( planet );


camera.position.z = 5;
const controls = new FlyControls(camera, renderer.domElement);
controls.dragToLook = true;
controls.rollSpeed = Math.PI / 2;
controls.movementSpeed = 1;
controls.verticalMax = Math.PI;


const atmosphere = {
    uniforms: {
        tDiffuse: { value: null },
        tDepth:   { value: null },
        color:    { value: new THREE.Color(0x88CCFF) },
        center:   { value: new THREE.Vector3(0, 0, 0) },
        world_mat:  { value: new THREE.Matrix4() },
        proj_inv:  { value: new THREE.Matrix4() },
        sun_pos: { value: new THREE.Vector3(0, -5, 10) },
    },
    vertexShader: `
    varying vec2 vUv;


    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
    `
    ,
    fragmentShader: `
    #include <packing>
    varying vec2 vUv;

    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;

    uniform vec3 color;
    uniform vec3 center;

    uniform mat4 world_mat;
    uniform mat4 proj_inv;

    uniform vec3 sun_pos;

    const float atm_radius = 8.0;
    const float planet_radius = 1.0;

    const vec3 wave = vec3(700, 530, 440);
    const float scatterStrength = 4.0;

    const vec3 scattering = vec3(
        pow(400.0 / wave.x, 4.0) * scatterStrength,
        pow(400.0 / wave.y, 4.0) * scatterStrength,
        pow(400.0 / wave.z, 4.0) * scatterStrength
    );


    //Thanks to Inigo Quilez
    // sphere of size ra centered at point ce
    vec2 sphIntersect( in vec3 ro, in vec3 rd, in vec3 ce, float ra )
    {
        vec3 oc = ro - ce;
        float b = dot( oc, rd );
        vec3 qc = oc - b*rd;
        float h = ra*ra - dot( qc, qc );
        if( h<0.0 ) return vec2(-1.0); // no intersection
        h = sqrt( h );
        return vec2( -b-h, -b+h );
    }

    //Atmosphere rendering based on video by Sebastian Lague who
    //based his work on an article in GPU Gems about real time
    //atmospheric scattering
    float getDensity(vec3 pos) {
        float height = length(pos) - 0.5;
        height = height/(atm_radius - 0.5);
        float local_density = exp(-height * 8.0) * (1.0 - height);
        return local_density;
    }

    float calcDepth(vec3 ro, vec3 rd, float len) {
        int num_samples = 10;

        vec3 pos = ro;
        float step = len/float(num_samples - 1);
        float depth = 0.0;

        for (int i = 0; i < num_samples; i++) {
            depth += getDensity(pos) * step;
            pos += step * rd;
        }

        return depth;
    }

    vec3 calcLight(vec3 ro, vec3 rd, float len, vec3 color) {
        int num_samples = 10;

        vec3 pos = ro;
        float step = len/float(num_samples - 1);
        float view_depth = 0.0;

        vec3 in_light = vec3(0.0);

        for (int i = 0; i < num_samples; i++) {
            vec3 sundir = normalize(sun_pos - pos);
            float sun_len = sphIntersect(pos, sundir, vec3(0.0), atm_radius).y;
            float optical_depth = calcDepth(pos, sundir, sun_len);
            view_depth = calcDepth(pos, -rd, step * float(i));

            float density = getDensity(pos);
            vec3 trans = exp(-(optical_depth + view_depth) * scattering);
            in_light += trans * density * step * scattering;

            pos += rd * step;
        }

        float original_trans = exp(-view_depth);

        return color * original_trans + in_light;
    }

    void main() {
        vec4 previousPassColor = texture2D(tDiffuse, vUv);

        //float normalizedDepth = unpackRGBAToDepth(  texture2D( tDepth, vUv) );

        float fragCoordZ = unpackRGBAToDepth(texture2D( tDepth, vUv));
        float viewZ = perspectiveDepthToViewZ( fragCoordZ, 0.1, 50.0 );
        float normalizedDepth = viewZToOrthographicDepth( viewZ, 0.1, 50.0 );


        vec3 oc = center;
        vec3 rd = normalize((proj_inv * vec4(vUv*2. - 1., 0.0, 1)).xyz);
        rd = (world_mat * vec4(rd, 0)).xyz;
        rd = normalize(rd);

        vec2 t = sphIntersect(center, rd, vec3(0.0), atm_radius);

        if (t.y > 0.0) {
            float near = t.x;
            if (t.x < 0.0) near = 0.0;
            float through = min(t.y - near, (normalizedDepth * 50.0) - near);
            //float through = t.y - near;

            vec3 origin = center + (near + 0.01) * rd;
            vec3 light = calcLight(origin, rd, (through - 0.01), previousPassColor.xyz);

            //gl_FragColor = mix(previousPassColor, vec4(1.0), light);
            gl_FragColor = vec4(light, 1.0);

            //if (1.0) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            //else 
            //gl_FragColor = vec4(through/4.0);
            //gl_FragColor.w = 1.0;

            return;
        }

        gl_FragColor = previousPassColor;
    }
    `
    ,
};

atmosphere.uniforms.color.value.r = 1.0;
atmosphere.uniforms.color.value.g = 0.5;
atmosphere.uniforms.color.value.b = 0.5;

var atmospherePass = new ShaderPass(atmosphere); 

var depthRenderTarget = new THREE.WebGLRenderTarget( window.innerWidth,  window.innerHeight );
depthRenderTarget.texture.format = THREE.RGBAFormat;
depthRenderTarget.texture.minFilter = THREE.NearestFilter;
depthRenderTarget.texture.magFilter = THREE.NearestFilter;
depthRenderTarget.texture.generateMipmaps = false;
depthRenderTarget.stencilBuffer = false;
depthRenderTarget.depthBuffer = true;
depthRenderTarget.depthTexture = new THREE.DepthTexture();
depthRenderTarget.depthTexture.type = THREE.UnsignedShortType;

atmospherePass.uniforms.tDepth.value = depthRenderTarget.depthTexture;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(atmospherePass);
composer.addPass(new OutputPass());


var clock = new THREE.Timer();
function animate( time ) {
    //renderer.render( scene, camera );
    clock.update();

    var deltaTime = clock.getDelta();

    controls.update(deltaTime);


    camera.updateMatrixWorld();

    atmospherePass.uniforms.center.value.set(camera.position.x, camera.position.y, camera.position.z);

    atmospherePass.uniforms.proj_inv.value.copy(camera.projectionMatrixInverse);
    atmospherePass.uniforms.world_mat.value.copy(camera.matrixWorld);

    //console.log(atmospherePass.uniforms.world_mat.value);
    //console.log(atmospherePass.uniforms.center.value);
    renderer.setRenderTarget(depthRenderTarget);
    renderer.render(scene, camera);
    composer.render();
}
renderer.setAnimationLoop( animate );

