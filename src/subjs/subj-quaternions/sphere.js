import * as THREE from 'three';

export class Sphere {
    constructor(w, h) {
        this._scene = new THREE.Scene();

        this._camera = new THREE.PerspectiveCamera(30, w / h, 0.01, 10);
        this._camera.position.z = 4;
        this._camera.lookAt(0, 0, 0);
        this._camera.up.set(0, 1, 0);

        const targetGeometry = new THREE.SphereBufferGeometry(0.02);
        const targetMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

        this._target = new THREE.Mesh(targetGeometry, targetMaterial);
        this._scene.add(this._target);

        const sphereMaterialOld = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true, transparent: true, opacity: 0.3 });
        this._sphereOld = new THREE.Mesh(new THREE.Geometry(), sphereMaterialOld);
        this._scene.add(this._sphereOld);

        const sphereMaterialNew = new THREE.MeshBasicMaterial({ color: 0xff8080, wireframe: true, transparent: true, opacity: 0.3 });
        this._sphereNew = new THREE.Mesh(new THREE.SphereBufferGeometry(1, 32, 32), sphereMaterialNew);
        this._scene.add(this._sphereNew);

        this._TRACE_MAX = 500;
        const positions = new Float32Array(this._TRACE_MAX * 3);
        const traceGeo = new THREE.BufferGeometry();
        traceGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        traceGeo.setDrawRange(0, 0);
        this._trace = new THREE.Line(traceGeo, new THREE.LineBasicMaterial({ color: 0x00ff00 }));
        this._scene.add(this._trace);
    }

    scene() { return this._scene; }
    camera() { return this._camera; }

    setTarget(quat) {
        const pos = new THREE.Vector3(quat.x, quat.y, quat.z);
        const radius = pos.length();

        this._sphereOld.geometry = this._sphereNew.geometry;
        this._sphereNew.geometry = new THREE.SphereBufferGeometry(radius, 32, 32);

        this._target.position.copy(pos);
    }

    addTrace(quat) {
        const count = this._trace.geometry.drawRange.count;
        const arr = this._trace.geometry.attributes.position.array;
        let index;
        if (count == this._TRACE_MAX) {
            for (let i = 0; i < count - 1; i++) {
                // Shift
                arr[i * 3 + 0] = arr[(i + 1) * 3 + 0];
                arr[i * 3 + 1] = arr[(i + 1) * 3 + 1];
                arr[i * 3 + 2] = arr[(i + 1) * 3 + 2];
            }
            index = count - 1;
        } else {
            index = count;
        }

        arr[index * 3 + 0] = quat.x;
        arr[index * 3 + 1] = quat.y;
        arr[index * 3 + 2] = quat.z;

        this._trace.geometry.setDrawRange(0, index + 1);
        this._trace.geometry.attributes.position.needsUpdate = true;
    }

}