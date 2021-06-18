
uniform float u_ratioGlobe;
uniform float u_ratioEquirectangular;
uniform float u_ratioMercator;
uniform float u_ratioWinkelIII;

varying vec2 v_uv;

const float PI = 3.14159265;
const float DEG2RAD = PI / 180.0;
const float GLOBE_RADIUS = 2.0 / PI;	// To make the globe's equatorial circumference equal to 4,
										// which is the width of equirectangle projection.

float sinc(float x) {
	return sin(x) / x;
}

vec3 globe(float lon, float lat) {
	float z = sin(lat * DEG2RAD);
	float r = cos(lat * DEG2RAD);
	float x = r * cos((lon - 90.0) * DEG2RAD);
	float y = r * sin((lon - 90.0) * DEG2RAD);
	return vec3(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
}

vec3 equirectangular(float lon, float lat) {
	float x = lon / 90.0;
	float z = lat / 90.0;
	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 mercator(float lon, float lat) {
	lat = max(min(lat, 85.05), -85.05);

	// Standard representation: top-left is (0,0) and bottom-right is (1,1)
	float x = (lon + 180.0) / 360.0;
	float z = (PI - log(tan(PI / 4.0 + lat / 2.0 * DEG2RAD))) / (2.0 * PI);

	x = (x - 0.5) * 4.0;
	z = (0.5 - z) * 4.0;

	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 _winkeliiiStd(float lon, float lat) {
	// Adopting wiki's notations...
	float lambda = lon * DEG2RAD;
	float phi = lat * DEG2RAD;
	float phi1 = acos(2.0 / PI);
	float alpha = acos(cos(phi) * cos(lambda / 2.0));

	float x = 0.5 * (lambda * cos(phi1) + 2.0 * cos(phi) * sin(lambda / 2.0) / sinc(alpha));
	float z = 0.5 * (phi + sin(phi) / sinc(alpha));

	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 winkeliii(float lon, float lat) {
	vec3 p = _winkeliiiStd(lon, lat);

	// Normalize for display
	float xmax = _winkeliiiStd(180.0, 0.0).x;
	float ratio = 2.0 / xmax;
	p.x *= ratio;
	p.z *= ratio;
	
	return p;
}

void main() {
	float lon = position.x;
	float lat = position.y;

	float u = (lon + 180.0) / 360.0;
	float v = (lat + 90.0) / 180.0;
	v_uv = vec2(u, v);

	vec3 pos = u_ratioGlobe * globe(lon, lat)
		+ u_ratioEquirectangular * equirectangular(lon, lat)
		+ u_ratioMercator * mercator(lon, lat)
		+ u_ratioWinkelIII * winkeliii(lon, lat);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}