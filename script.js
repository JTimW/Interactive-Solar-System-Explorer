import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject } from 'https://cdn.skypack.dev/three/examples/jsm/renderers/CSS2DRenderer.js';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load textures for planets and background
const textureLoader = new THREE.TextureLoader();
const mercuryTexture = textureLoader.load('assets/mercury_texture.jpg');
const venusTexture = textureLoader.load('assets/venus_texture.jpg');
const earthTexture = textureLoader.load('assets/earth_texture.jpg');
const marsTexture = textureLoader.load('assets/mars_texture.jpg');
const jupiterTexture = textureLoader.load('assets/jupiter_texture.jpg');
const saturnTexture = textureLoader.load('assets/saturn_texture.jpg');
const uranusTexture = textureLoader.load('assets/uranus_texture.jpg');
const neptuneTexture = textureLoader.load('assets/neptune_texture.jpg');
const spaceTexture = textureLoader.load('assets/star_background.jpg');
scene.background = spaceTexture;

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets data
const planets = [
    { name: "Mercury", size: 0.4, texture: mercuryTexture, distance: 6, speed: 0.04 },
    { name: "Venus", size: 0.9, texture: venusTexture, distance: 8, speed: 0.02 },
    { name: "Earth", size: 1, texture: earthTexture, distance: 10, speed: 0.01 },
    { name: "Mars", size: 0.8, texture: marsTexture, distance: 13, speed: 0.008 },
    { name: "Jupiter", size: 3.5, texture: jupiterTexture, distance: 20, speed: 0.005 },
    { name: "Saturn", size: 3, texture: saturnTexture, distance: 28, speed: 0.003 },
    { name: "Uranus", size: 2.5, texture: uranusTexture, distance: 35, speed: 0.002 },
    { name: "Neptune", size: 2.5, texture: neptuneTexture, distance: 40, speed: 0.0018 }
];

// Create each planet with its properties and add orbit rings for Saturn and Uranus
planets.forEach((planet) => {
    const geometry = new THREE.SphereGeometry(planet.size, 16, 16);
    const material = new THREE.MeshPhongMaterial({ map: planet.texture });
    const mesh = new THREE.Mesh(geometry, material);

    // Set initial position of the planet
    mesh.position.x = planet.distance;
    mesh.userData = { distance: planet.distance, speed: planet.speed, angle: 0 };
    mesh.name = planet.name;

    // Create orbit rings
    const orbitGeometry = new THREE.RingGeometry(planet.distance - 0.1, planet.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);

    // Add rings for Saturn and Uranus
    if (planet.name === "Saturn" || planet.name === "Uranus") {
        const ringGeometry = new THREE.RingGeometry(planet.size + 0.5, planet.size + 1, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd2b48c, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }

    scene.add(mesh);
    planet.mesh = mesh;

    // Add label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = planet.name;
    labelDiv.style.color = '#fff';
    const label = new CSS2DObject(labelDiv);
    mesh.add(label);
});

// Camera position and controls
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
        planet.mesh.rotation.y += 0.01;  // Planet rotation
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
    const planetInfo = getPlanetInfo(planetName);
    infoPanel.style.display = 'block';
    document.getElementById('planet-name').innerText = planetName;
    document.getElementById('planet-details').innerText = planetInfo;
}

// Fetch planet information
function getPlanetInfo(planetName) {
    const planetDetails = {
        Mercury: "Mercury is the closest planet to the Sun.",
        Venus: "Venus is the second planet from the Sun and has a thick atmosphere.",
        Earth: "Earth is the third planet from the Sun and the only known planet with life.",
        Mars: "Mars is the fourth planet and is often called the Red Planet.",
        Jupiter: "Jupiter is the largest planet in the Solar System.",
        Saturn: "Saturn is known for its prominent ring system.",
        Uranus: "Uranus rotates on its side and has faint rings.",
        Neptune: "Neptune is the farthest planet from the Sun and is blue in color."
    };
    return planetDetails[planetName] || "Unknown planet";
}

// Tooltip for hovering over planets
window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const hoveredPlanet = intersects[0].object;
        showTooltip(event.clientX, event.clientY, hoveredPlanet.name);
    } else {
        hideTooltip();
    }
});

function showTooltip(x, y, name) {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'block';
    tooltip.style.left = `${x + 10}px`;
    tooltip.style.top = `${y + 10}px`;
    tooltip.innerText = name;
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

// Info panel close function
function closeInfoPanel() {
    document.getElementById('info-panel').style.display = 'none';
}
