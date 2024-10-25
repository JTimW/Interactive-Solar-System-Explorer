import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add lighting
const light = new THREE.PointLight(0xffffff, 2, 100);
light.position.set(0, 0, 0);
scene.add(light);

// Optionally add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Define planet properties
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

// Create planet meshes
planets.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: planet.color });
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.x = planet.distance;
    mesh.userData = { distance: planet.distance, speed: planet.speed, angle: 0 };
    mesh.name = planet.name;

    scene.add(mesh);
    planet.mesh = mesh;
});

// Camera position
camera.position.z = 50;

// Animation loop
let previousTime = Date.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const deltaTime = (currentTime - previousTime) / 1000;  // Convert to seconds
    previousTime = currentTime;

    planets.forEach((planet) => {
        planet.mesh.userData.angle += deltaTime * planet.mesh.userData.speed * 100;
        planet.mesh.position.x = Math.cos(planet.mesh.userData.angle) * planet.mesh.userData.distance;
        planet.mesh.position.z = Math.sin(planet.mesh.userData.angle) * planet.mesh.userData.distance;
    });

    renderer.render(scene, camera);
}

animate();

// Raycasting for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        alert(`You clicked on ${clickedPlanet.name}`);
    }
});

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
