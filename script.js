// Import necessary modules if using a bundler or load Three.js via a CDN in the HTML

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(0, 0, 0);
scene.add(light);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Define planet properties (size, color, distance from sun, and speed)
const planets = [
    { name: "Mercury", size: 0.5, color: 0xaaaaaa, distance: 5, speed: 0.02 },
    { name: "Venus", size: 0.9, color: 0xffdd44, distance: 7, speed: 0.015 },
    { name: "Earth", size: 1, color: 0x0066ff, distance: 10, speed: 0.01 },
    { name: "Mars", size: 0.8, color: 0xff5500, distance: 13, speed: 0.008 },
    { name: "Jupiter", size: 2, color: 0xffa07a, distance: 17, speed: 0.005 },
    { name: "Saturn", size: 1.8, color: 0xffddaa, distance: 22, speed: 0.004 },
    { name: "Uranus", size: 1.2, color: 0x66ccff, distance: 26, speed: 0.003 },
    { name: "Neptune", size: 1.2, color: 0x3333ff, distance: 30, speed: 0.002 }
];

// Create planet meshes and add them to the scene
planets.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);

    // Set initial position of the planet
    mesh.position.x = planet.distance;
    mesh.userData = { distance: planet.distance, speed: planet.speed };
    mesh.name = planet.name; // Assign name for click events or debugging

    // Add planet to scene and store in the array for animation
    scene.add(mesh);
    planet.mesh = mesh;
});

// Set the camera position
camera.position.z = 50;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate each planet around the Sun
    planets.forEach((planet) => {
        const angle = Date.now() * planet.speed;
        planet.mesh.position.x = Math.cos(angle) * planet.mesh.userData.distance;
        planet.mesh.position.z = Math.sin(angle) * planet.mesh.userData.distance;
    });

    renderer.render(scene, camera);
}

animate();
