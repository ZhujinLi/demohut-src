import '/three/build/three.min.js';
import '/three/examples/js/loaders/GLTFLoader.js';

export class World {
    constructor(w, h, renderCallback) {
        this._scene = new THREE.Scene();

        this._camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        this._camera.position.set(5, 5, 5);
        this._camera.lookAt(0, 0, 0);
        this._camera.up.set(0, 1, 0);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this._scene.add(ambientLight);

        const axesHelper = new THREE.AxesHelper(5);
        this._scene.add(axesHelper);

        const loader = new THREE.GLTFLoader();
        loader.load(
            '/models/Jet/Jet.gltf',
            (gltf) => {
                this._obj = gltf.scene;
                this._scene.add(gltf.scene);
                if (renderCallback) {
                    requestAnimationFrame(renderCallback);
                }
            },
            null,
            (error) => { console.log(error); }
        );
    }

    scene() { return this._scene; }
    camera() { return this._camera; }
    obj() { return this._obj; }
}
