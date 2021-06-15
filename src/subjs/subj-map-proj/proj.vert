
uniform float u_ratioGlobe;
uniform float u_ratioEquirectangular;
uniform float u_ratioMercator;

varying vec2 v_uv;

const float PI = 3.14159265;
const float DEG2RAD = PI / 180.0;

vec3 globe(float lon, float lat) {
	float z = sin(lat * DEG2RAD);
	float r = cos(lat * DEG2RAD);
	float x = r * cos((lon - 90.0) * DEG2RAD);
	float y = r * sin((lon - 90.0) * DEG2RAD);
	return vec3(x, y, z);
}

vec3 equirectangular(float lon, float lat) {
	float x = lon / 90.0;
	float z = lat / 90.0;
	return vec3(x, -1.0, z);
}

vec3 mercator(float lon, float lat) {
	lat = max(min(lat, 85.05), -85.05);

	// Standard representation: top-left is (0,0) and bottom-right is (1,1)
	float x = (lon + 180.0) / 360.0;
	float z = (PI - log(tan(PI / 4.0 + lat / 2.0 * DEG2RAD))) / (2.0 * PI);

	x = (x - 0.5) * 4.0;
	z = (0.5 - z) * 4.0;

	return vec3(x, -1.0, z);
}

void main() {
	float lon = position.x;
	float lat = position.y;

	float u = (lon + 180.0) / 360.0;
	float v = (lat + 90.0) / 180.0;
	v_uv = vec2(u, v);

	vec3 pos = u_ratioGlobe * globe(lon, lat)
		+ u_ratioEquirectangular * equirectangular(lon, lat)
		+ u_ratioMercator * mercator(lon, lat);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}