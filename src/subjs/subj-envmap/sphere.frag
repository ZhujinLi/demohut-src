// Note: the symbols mostly conforms to the book

// Indexed from 0 to 5 in JS code
uniform sampler2D u_texPosX;
uniform sampler2D u_texNegX;
uniform sampler2D u_texPosY;
uniform sampler2D u_texNegY;
uniform sampler2D u_texPosZ;
uniform sampler2D u_texNegZ;

varying vec2 v_xy;  // [-1, +1], where (0, 0) is geodetic center

const float PI = 3.14159265;

vec3 rayFromLonLat(float lon, float lat) {
    float y = sin(lat);
    float a = cos(lat);
    float x = a * cos(lon + PI / 2.);
    float z = -a * sin(lon + PI / 2.);
    return vec3(x, y, z);
}

void main() {
    float x = v_xy.x;
    float y = v_xy.y;
    float xyMag2 = x*x + y*y;
    if (xyMag2 >= 1.)
        discard;

    // Calculate z on the semi-sphere
    float z = sqrt(1. - xyMag2);

    vec3 n = vec3(x, y, z);
    vec3 v = vec3(0., 0., 1.);
    vec3 r = n * 2. * dot(n, v) - v;

    vec3 ray = vec3(r.x, r.y, -r.z);    // Reverse z for demo consistency
    float absX = abs(ray.x);
    float absY = abs(ray.y);
    float absZ = abs(ray.z);
    if (absX >= absY && absX >= absZ) {
        if (ray.x > 0.) {
            gl_FragColor = texture2D(u_texPosX, vec2(ray.z, ray.y)/ray.x * 0.5 + 0.5);
        } else {
            gl_FragColor = texture2D(u_texNegX, vec2(-ray.z, ray.y)/-ray.x * 0.5 + 0.5);
        }
    } else if (absY >= absX && absY >= absZ) {
        if (ray.y > 0.) {
            gl_FragColor = texture2D(u_texPosY, vec2(ray.x, ray.z)/ray.y * 0.5 + 0.5);
        } else {
            gl_FragColor = texture2D(u_texNegY, vec2(ray.x, -ray.z)/-ray.y * 0.5 + 0.5);
        }
    } else {
        if (ray.z > 0.) {
            gl_FragColor = texture2D(u_texPosZ, vec2(-ray.x, ray.y)/ray.z * 0.5 + 0.5);
        } else {
            gl_FragColor = texture2D(u_texNegZ, vec2(ray.x, ray.y)/-ray.z * 0.5 + 0.5);
        }
    }
}