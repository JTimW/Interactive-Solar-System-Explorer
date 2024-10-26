import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject } from 'https://cdn.skypack.dev/three/examples/jsm/renderers/CSS2DRenderer.js';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load high-res textures for planets and background
const textureLoader = new THREE.TextureLoader();
const mercuryTexture = textureLoader.load('assets/high_res_mercury.jpg');
const venusTexture = textureLoader.load('assets/high_res_venus.jpg');
const earthTexture = textureLoader.load('assets/high_res_earth.jpg');
const marsTexture = textureLoader.load('assets/high_res_mars.jpg');
const jupiterTexture = textureLoader.load('assets/high_res_jupiter.jpg');
const saturnTexture = textureLoader.load('assets/high_res_saturn.jpg');
const uranusTexture = textureLoader.load('assets/high_res_uranus.jpg');
const neptuneTexture = textureLoader.load('assets/high_res_neptune.jpg');
const sunTexture = textureLoader.load('assets/high_res_sun.jpg');
const spaceTexture = textureLoader.load('assets/star_background.jpg');
scene.background = spaceTexture;

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // Brighter ambient light
scene.add(ambientLight);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets data with high-res textures, realistic speeds, and emissive colors
const planets = [
    { name: "Mercury", size: 0.4, texture: mercuryTexture, distance: 6, speed: 0.015, rotationSpeed: 0.0003 },
    { name: "Venus", size: 0.9, texture: venusTexture, distance: 8, speed: 0.004, rotationSpeed: 0.0001 },
    { name: "Earth", size: 1, texture: earthTexture, distance: 10, speed: 0.00298, rotationSpeed: 0.01 },
    { name: "Mars", size: 0.8, texture: marsTexture, distance: 13, speed: 0.00241, rotationSpeed: 0.01 },
    { name: "Jupiter", size: 3.5, texture: jupiterTexture, distance: 20, speed: 0.0013, rotationSpeed: 0.02 },
    { name: "Saturn", size: 3, texture: saturnTexture, distance: 28, speed: 0.0009, rotationSpeed: 0.015 },
    { name: "Uranus", size: 2.5, texture: uranusTexture, distance: 35, speed: 0.0006, rotationSpeed: 0.017 },
    { name: "Neptune", size: 2.5, texture: neptuneTexture, distance: 40, speed: 0.0005, rotationSpeed: 0.018 }
];

// Create each planet with orbit rings and enhanced colors
planets.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 16, 16);
    const material = new THREE.MeshPhongMaterial({ 
        map: planet.texture, 
        emissive: new THREE.Color(planet.emissiveColor || 0x000000), 
        emissiveIntensity: 0.3 
    });
    const mesh = new THREE.Mesh(geometry, material);

    // Set initial position and properties
    mesh.position.x = planet.distance;
    mesh.userData = { distance: planet.distance, speed: planet.speed, angle: 0 };
    mesh.name = planet.name;

    // Create orbit rings
    const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    scene.add(mesh);
    planet.mesh = mesh;
});

// Camera and controls
camera.position.z = window.innerWidth < 600 ? 70 : 50;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;

// Animation loop
let previousTime = Date.now();
function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const deltaTime = (currentTime - previousTime) / 1000;
    previousTime = currentTime;

    planets.forEach((planet) => {
        planet.mesh.userData.angle += deltaTime * planet.mesh.userData.speed * 100;
        planet.mesh.position.x = Math.cos(planet.mesh.userData.angle) * planet.mesh.userData.distance;
        planet.mesh.position.z = Math.sin(planet.mesh.userData.angle) * planet.mesh.userData.distance;
        planet.mesh.rotation.y += planet.rotationSpeed;  // Planet rotation
    });

    renderer.render(scene, camera);
}

animate();
