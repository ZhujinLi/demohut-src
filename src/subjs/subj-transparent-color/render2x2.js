import { createProgram } from "./program.js";
import { createVB } from "./vb.js";
import { loadTexture } from "./texture.js";

export function render2x2(view, params) {
    const canvas = document.querySelector(view);

    const gl = canvas.getContext("webgl");
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    }

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Here I disable the alpha channel otherwise the canvas surface would be
    // blended with the page background, which brings more complexity
    // to my demonstration.
    gl.colorMask(true, true, true, false);

    gl.enable(gl.BLEND);
    if (params.pma)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    else
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const programInfo = createProgram(gl);
    gl.useProgram(programInfo.program);

    const buffers = createVB(gl);
    const numComponents = 2;  // pull out 2 values per iteration
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);

    const texture = loadTexture(gl, params);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}