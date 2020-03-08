import '/three/build/three.min.js';

export function motion(canvasId, onRender) {
    const W = 1000, H = 150;

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector(canvasId), antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);
    renderer.setScissorTest(true);

    const scene = new THREE.Scene();

    const top = 1;
    const bottom = -1;
    const left = -1;
    const right = left + (top - bottom) / H * W;
    const camera = new THREE.OrthographicCamera(left, right, top, bottom, 0, 2);
    camera.position.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    const circle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20),
        new THREE.MeshBasicMaterial({ color: 'white' }));
    const lastCircle = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20),
        new THREE.MeshBasicMaterial({ color: 'white' }));

    let frameCount = 0;

    requestAnimationFrame(render);

    function render() {
        const info = onRender(frameCount);

        // Draw last frame
        scene.add(lastCircle);
        const lastX = info.lastRatio * (right - left);
        lastCircle.position.set(lastX, 0, 0);
        renderer.setScissor(0, 0, W, H * info.tearing);
        renderer.render(scene, camera);
        scene.remove(lastCircle);

        // Draw current frame
        scene.add(circle);
        const x = info.ratio * (right - left);
        circle.position.set(x, 0, 0);
        renderer.setScissor(0, H * info.tearing, W, H - H * info.tearing);
        renderer.render(scene, camera);
        scene.remove(circle);

        requestAnimationFrame(render);

        frameCount = (frameCount + 1) % 60;
    }

}
