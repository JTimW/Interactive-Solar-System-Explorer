// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Load textures
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load('assets/star_background.jpg'); // Background
const planetTextures = {
    Sun: new THREE.MeshBasicMaterial({ color: 0xffdd00 }),
    Mercury: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/mercury_texture.jpg') }),
    Venus: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/venus_texture.jpg') }),
    Earth: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/earth_texture.jpg') }),
    Mars: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/mars_texture.jpg') }),
    Jupiter: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/jupiter_texture.jpg') }),
    Saturn: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/saturn_texture.jpg') }),
    Uranus: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/uranus_texture.jpg') }),
    Neptune: new THREE.MeshPhongMaterial({ map: textureLoader.load('assets/neptune_texture.jpg') })
};

// Set the starry background
scene.background = spaceTexture;

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 300);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Planet data
const planetsData = [
    { name: "Sun", size: 3, distance: 0, speed: 0 },
    { name: "Mercury", size: 0.3, distance: 5, speed: 0.04 },
    { name: "Venus", size: 0.6, distance: 7, speed: 0.03 },
    { name: "Earth", size: 0.7, distance: 10, speed: 0.02 },
    { name: "Mars", size: 0.5, distance: 13, speed: 0.018 },
    { name: "Jupiter", size: 1.5, distance: 17, speed: 0.01 },
    { name: "Saturn", size: 1.2, distance: 22, speed: 0.008 },
    { name: "Uranus", size: 1.0, distance: 27, speed: 0.006 },
    { name: "Neptune", size: 1.0, distance: 30, speed: 0.005 }
];

// Create planets and add them to the scene
const planets = planetsData.map((planetData) => {
    const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
    const material = planetData.name === "Sun" ? planetTextures.Sun : planetTextures[planetData.name];
    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.x = planetData.distance;
    mesh.userData = { distance: planetData.distance, speed: planetData.speed, angle: 0 };
    mesh.name = planetData.name;

    scene.add(mesh);
    return { ...planetData, mesh };
});

// Set camera position
camera.position.z = 50;

// Add OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    planets.forEach((planet) => {
        if (planet.distance > 0) { // Skip the Sun
            planet.mesh.userData.angle += planet.speed;
            planet.mesh.position.x = Math.cos(planet.mesh.userData.angle) * planet.distance;
            planet.mesh.position.z = Math.sin(planet.mesh.userData.angle) * planet.distance;
        }
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

// Raycasting for detecting clicks on planets
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
        Sun: "The Sun is the star at the center of our Solar System.",
        Mercury: "Mercury is the closest planet to the Sun.",
        Venus: "Venus is the second planet from the Sun and has a thick atmosphere.",
        Earth: "Earth is the third planet from the Sun and the only one known to support life.",
        Mars: "Mars is the fourth planet from the Sun, known as the Red Planet.",
        Jupiter: "Jupiter is the largest planet in our Solar System.",
        Saturn: "Saturn is known for its prominent ring system.",
        Uranus: "Uranus is tilted on its axis, resulting in extreme seasons.",
        Neptune: "Neptune is the farthest planet from the Sun."
    };
    return planetDetails[planetName] || "Unknown planet";
}
