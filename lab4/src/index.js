// set up webgl variables
let gl = setupWebGL();
let program = connectVariablesToGLSL(gl);
gl.clearColor(0, 0, 0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

let teapot = new Model(gl, "../teapot.obj");

// prettier-ignore
function renderAllShapes(time) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //stats.begin();


  let m = new Matrix4();
  m.translate(-4.0, 0.0, 1.0);
  teapot.matrix = m;

  teapot.color = [1.0, 1.0, 1.0, 1.0];
  teapot.render(gl, program);
 
  m.translate(8.0, 0.0, 0.0);
  m.rotate(180, 0.0, 1.0, 0.0);
  teapot.matrix = m;

  teapot.color = [1.0, 0.0, 1.0, 1.0];
  teapot.render(gl, program);

  // send uniforms to shader
  gl.uniformMatrix4fv(program.u_ProjectionMatrix, false, projectionMatrix.elements);
  gl.uniformMatrix4fv(program.u_ViewMatrix, false, viewMatrix.elements);
  gl.uniform3fv(program.u_CameraPos, camera.eye);

  //stats.end();
  requestAnimationFrame(renderAllShapes);
}

renderAllShapes();
