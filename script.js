import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load textures for planets and background
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('assets/earth_texture.jpg');  // Replace with actual texture path
const marsTexture = textureLoader.load('assets/mars_texture.jpg');    // Replace with actual texture path
const spaceTexture = textureLoader.load('assets/star_background.jpg'); // Replace with actual texture path

// Set the starry background
scene.background = spaceTexture;

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 100);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);  // Soft ambient light
scene.add(ambientLight);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create planets
const planets = [
    { name: "Earth", size: 1, texture: earthTexture, distance: 10, speed: 0.01 },
    { name: "Mars", size: 0.8, texture: marsTexture, distance: 13, speed: 0.008 }
    // Add more planets with textures as needed
];

planets.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ map: planet.texture });
    const mesh = new THREE.Mesh(geometry, material);

    // Set initial position of the planet
    mesh.position.x = planet.distance;
    mesh.userData = { distance: planet.distance, speed: planet.speed, angle: 0 };
    mesh.name = planet.name;

    scene.add(mesh);
    planet.mesh = mesh;
});

// Camera position
camera.position.z = 50;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;

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

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

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
        displayPlanetInfo(clickedPlanet.name);
    }
});

// Display planet information in the info panel
function displayPlanetInfo(planetName) {
    const infoPanel = document.getElementById('info-panel');
    const planetInfo = getPlanetInfo(planetName);  // Fetch planet details
    infoPanel.style.display = 'block';
    document.getElementById('planet-name').innerText = planetName;
    document.getElementById('planet-details').innerText = planetInfo;
}

// Fetch planet information
function getPlanetInfo(planetName) {
    const planetDetails = {
        Earth: "Earth is the third planet from the Sun and the only astronomical object known to harbor life.",
        Mars: "Mars is the fourth planet from the Sun and is often called the 'Red Planet' due to its reddish appearance."
        // Add details for other planets
    };
    return planetDetails[planetName] || "Unknown planet";
}
