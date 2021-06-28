
uniform float u_ratioGlobe;
uniform float u_ratioEquirectangular;
uniform float u_ratioMercator;
uniform float u_ratioTransverseMercator;
uniform float u_ratioWinkelIII;
uniform float u_ratioBonne;
uniform float u_ratioDonut;

varying vec2 v_uv;

const float PI = 3.14159;	// It's low precision so that calls like tan(PI) can always work
const float DEG2RAD = PI / 180.0;
const float GLOBE_RADIUS = 2.0 / PI;	// To make the globe's equatorial circumference equal to 4,
										// which is the width of equirectangle projection.

float sinc(float x) { return sin(x) / x; }
float cot(float x) { return 1.0 / tan(x); }
float sec(float x) { return 1.0 / cos(x); }

vec3 globe(float lambda, float phi) {
	float z = sin(phi);
	float r = cos(phi);
	float x = r * cos((lambda - 0.5 * PI));
	float y = r * sin((lambda - 0.5 * PI));
	return vec3(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
}

vec3 equirectangular(float lambda, float phi) {
	float x = lambda / PI * 2.0;
	float z = phi / PI * 2.0;
	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 mercator(float lambda, float phi) {
	phi = max(min(phi, 85.05 * DEG2RAD), -85.05 * DEG2RAD);

	// Standard representation: top-left is (0,0) and bottom-right is (1,1)
	float x = (lambda + PI) / PI / 2.0;
	float z = (PI - log(tan(PI / 4.0 + phi / 2.0))) / (2.0 * PI);

	x = (x - 0.5) * 4.0;
	z = (0.5 - z) * 4.0;

	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 tmercator(float lambda, float phi) {
	float x = 0.5 * log((1.0 + sin(lambda) * cos(phi)) / (1.0 - sin(lambda) * cos(phi)));
	float z = atan(sec(lambda) * tan(phi));
	if (sec(lambda) < 0.0) {
		z -= PI * sign(z);
	}

	// Normalize to [-2, +2] for display
	float a = 2.0 / PI;
	x = clamp(a * x, -2.0, 2.0);
	z *= a;

	// Lerp to allieviate z-fighting caused by precision error
	float y = mix(-GLOBE_RADIUS, globe(lambda, phi).y, 0.1);

	return vec3(x, y, z);
}

vec3 _winkeliiiStd(float lambda, float phi) {
	float phi1 = acos(2.0 / PI);
	float alpha = acos(cos(phi) * cos(lambda / 2.0));

	float x = 0.5 * (lambda * cos(phi1) + 2.0 * cos(phi) * sin(lambda / 2.0) / sinc(alpha));
	float z = 0.5 * (phi + sin(phi) / sinc(alpha));

	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 winkeliii(float lambda, float phi) {
	vec3 p = _winkeliiiStd(lambda, phi);

	// Normalize for display
	float xmax = _winkeliiiStd(PI, 0.0).x;
	float ratio = 2.0 / xmax;
	p.x *= ratio;
	p.z *= ratio;
	
	return p;
}

vec3 _bonneStd(float lambda, float phi) {
	float lambda0 = 0.0;
	float phi1 = 45.0 * DEG2RAD;
	float rho = cot(phi1) + phi1 - phi;
	float E = (lambda - lambda0) * cos(phi) / rho;

	float x = rho * sin(E);
	float z = cot(phi1) - rho * cos(E);
	
	return vec3(x, -GLOBE_RADIUS, z);
}

vec3 bonne(float lambda, float phi) {
	vec3 p = _bonneStd(lambda, phi);

	// Normalize for display
	float zmax = _bonneStd(0.0, PI * 0.5).z;
	float zmin = _bonneStd(0.0, -PI * 0.5).z;

	float scale = 2.0 / (zmax - zmin);
	p.z = (p.z - (zmax + zmin) / 2.0) * scale;
	p.x *= scale;
	
	return p;
}

vec3 donut(float lambda, float phi) {
	float centerX = GLOBE_RADIUS * cos((lambda - 0.5 * PI));
	float centerY = GLOBE_RADIUS * sin((lambda - 0.5 * PI));

	vec3 basisX = vec3(centerX * 0.5, centerY * 0.5, 0.0);
	vec3 basisY = vec3(0.0, 0.0, GLOBE_RADIUS * 0.5);

	vec3 local = cos(phi * 2.0) * basisX + sin(phi * 2.0) * basisY;
	return local + vec3(centerX, centerY, 0.0);
}

void main() {
	float lon = position.x;
	float lat = position.y;

	float u = (lon + 180.0) / 360.0;
	float v = (lat + 90.0) / 180.0;
	v_uv = vec2(u, v);

	// Adopt Wiki's notation...
	float lambda = lon * DEG2RAD;
	float phi = lat * DEG2RAD;

	vec3 pos = u_ratioGlobe * globe(lambda, phi)
		+ u_ratioEquirectangular * equirectangular(lambda, phi)
		+ u_ratioMercator * mercator(lambda, phi)
		+ u_ratioTransverseMercator * tmercator(lambda, phi)
		+ u_ratioWinkelIII * winkeliii(lambda, phi)
		+ u_ratioBonne * bonne(lambda, phi)
		+ u_ratioDonut * donut(lambda, phi);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}