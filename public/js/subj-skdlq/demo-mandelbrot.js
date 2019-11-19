import '/three/build/three.min.js';
import '/three/examples/js/controls/OrbitControls.js';

// Note: Although all the calculations are within a 2D plane, I have to comply with
// an assumption that y is upwards in three.js, in order to use interactive controls.
// So it is a xz plane and there might be some strange coordinate conversion.

const vsString = `
    varying vec2 v_xy;

    void main() {
        v_xy = position.xz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    }
`;

const fsString = `
    varying vec2 v_xy;

    const int MAX_ITER = 160;

    float mandelbrot(vec2 c) {
        vec2 z = vec2(0.0);
        float n = 0.0;
        for (int i = 0; i < MAX_ITER; i++) {
            z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
            if (dot(z, z) > 4.0)
                break;
            else
                n++;
        }

        return n;
    }

    void main() {
        float m = mandelbrot(v_xy);
        float c = 1.0 - m / float(MAX_ITER);
        if (c > 0.)
            c = 1. - c;
        gl_FragColor = vec4(c, c, c, 1.0);
    }
`;

export function showDemoMandelbrot() {
    const W = 600, H = 600;

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#view-mandelbrot'), antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H);

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0, 1000);
    camera.position.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    const rect = new THREE.PlaneGeometry(5, 5); // NDC
    rect.rotateX(Math.PI / 2);
    const mtl = new THREE.ShaderMaterial({
        vertexShader: vsString,
        fragmentShader: fsString,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(rect, mtl);
    scene.add(mesh);

    const controls = new THREE.MapControls(camera, renderer.domElement);

    // Limit the render rate to avoid stutter
    let needsRefresh = false;
    controls.addEventListener('change', () => { needsRefresh = true });

    setInterval(refreshIfNeeded, 16);

    render();

    function refreshIfNeeded() {
        if (needsRefresh) {
            render();
            needsRefresh = false;
        }
    }

    function render() {
        renderer.render(scene, camera);
    }

}