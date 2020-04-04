
export function loadTexture(gl, params) {
    let pixel;
    if (params.bleeding)
        pixel = new Uint8Array([
            255, 0, 0, 0,
            255, 0, 0, 255,
            255, 0, 0, 255,
            255, 0, 0, 0,
        ]);
    else if (params.green)
        if (params.pma)
            pixel = new Uint8Array([
                0, 25, 0, 25,
                255, 0, 0, 255,
                255, 0, 0, 255,
                0, 25, 0, 25,
            ]);
        else
            pixel = new Uint8Array([
                0, 255, 0, 25,
                255, 0, 0, 255,
                255, 0, 0, 255,
                0, 255, 0, 25,
            ]);
    else
        pixel = new Uint8Array([
            0, 0, 0, 0,
            255, 0, 0, 255,
            255, 0, 0, 255,
            0, 0, 0, 0,
        ]);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 2;
    const height = 2;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.generateMipmap(gl.TEXTURE_2D);

    return texture;
}