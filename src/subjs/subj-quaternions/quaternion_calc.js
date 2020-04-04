import * as THREE from 'three';

export function add(l, r) {
    return new THREE.Quaternion(l.x + r.x, l.y + r.y, l.z + r.z, l.w + r.w);
}

export function scalarMultiply(q, s) {
    return new THREE.Quaternion(q.x * s, q.y * s, q.z * s, q.w * s);
}

// Quaternion.slerp() annoyingly choose the one with shortest angle
// between original target and its antipodal counterpart, which can
// cause errors when doing squad. So I implement the standard slerp here.
// See "Other Issues" in http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
export function slerp(l, r, t) {
    if (t === 0) return new THREE.Quaternion().copy(l);
    if (t === 1) return new THREE.Quaternion().copy(r);

    var x = l._x, y = l._y, z = l._z, w = l._w;

    var cosHalfTheta = w * r._w + x * r._x + y * r._y + z * r._z;

    if (cosHalfTheta >= 1.0) {
        return new THREE.Quaternion().copy(l);
    }

    var res = new THREE.Quaternion();
    res.copy(r);

    var sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {

        var s = 1 - t;
        res._w = s * w + t * res._w;
        res._x = s * x + t * res._x;
        res._y = s * y + t * res._y;
        res._z = s * z + t * res._z;

        res.normalize();
        return res;
    }

    var sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
        ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    res._w = (w * ratioA + res._w * ratioB);
    res._x = (x * ratioA + res._x * ratioB);
    res._y = (y * ratioA + res._y * ratioB);
    res._z = (z * ratioA + res._z * ratioB);

    return res;
}

export function log(q) {
    const a = Math.acos(q.w);
    const sin = Math.sin(a);
    if (sin === 0)
        return new THREE.Quaternion(0, 0, 0, 0);

    const t = a / sin;
    return new THREE.Quaternion(t * q.x, t * q.y, t * q.z, 0);
}

export function exp(q) {
    const a = q.length();
    if (a === 0)
        return new THREE.Quaternion(0, 0, 0, 1);

    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const t = sin / a;
    return new THREE.Quaternion(t * q.x, t * q.y, t * q.z, cos);
}
