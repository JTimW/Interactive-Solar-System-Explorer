// No need to import THREE and OrbitControls if they're already in HTML

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Load textures
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load('assets/star_background.jpg');
scene.background = spaceTexture;

// Planet textures
const planetTextures = {
    Sun: textureLoader.load('assets/sun_texture.jpg'),
    Mercury: textureLoader.load('assets/mercury_texture.jpg'),
    Venus: textureLoader.load('assets/venus_texture.jpg'),
    Earth: textureLoader.load('assets/earth_texture.jpg'),
    Mars: textureLoader.load('assets/mars_texture.jpg'),
    Jupiter: textureLoader.load('assets/jupiter_texture.jpg'),
    Saturn: textureLoader.load('assets/saturn_texture.jpg'),
    Uranus: textureLoader.load('assets/uranus_texture.jpg'),
    Neptune: textureLoader.load('assets/neptune_texture.jpg')
};

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Planet data
const planetsData = [
    { name: "Sun", size: 3, distance: 0, speed: 0},
    { name: "Mercury", size: 0.3, distance: 5, speed: 0.004 },
    { name: "Venus", size: 0.6, distance: 7, speed: 0.003 },
    { name: "Earth", size: 0.7, distance: 10, speed: 0.002 },
    { name: "Mars", size: 0.5, distance: 13, speed: 0.0018 },
    { name: "Jupiter", size: 1.5, distance: 17, speed: 0.001 },
    { name: "Saturn", size: 1.2, distance: 22, speed: 0.0008 },
    { name: "Uranus", size: 1.0, distance: 27, speed: 0.0006 },
    { name: "Neptune", size: 1.0, distance: 30, speed: 0.0005 }
];

// Create Sun and planets
const planets = planetsData.map((planetData) => {
    const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
    const material = planetData.name === "Sun" 
        ? new THREE.MeshPhongMaterial({ 
              emissive: 0xffff00,    // Glowing yellow color
              emissiveIntensity: 2   // You can adjust this for desired glow level
          }) 
        : new THREE.MeshPhongMaterial({ map: planetTextures[planetData.name] });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planetData.distance;
    mesh.userData = { distance: planetData.distance, speed: planetData.speed, angle: 0 };
    mesh.name = planetData.name;

    scene.add(mesh);

    if (planetData.name === "Saturn" || planetData.name === "Uranus") {
        const ringGeometry = new THREE.RingGeometry(planetData.size + 0.5, planetData.size + 1, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd2b48c, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }

    return { ...planetData, mesh };
});

// Set camera position and controls
camera.position.z = 50;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    planets.forEach((planet) => {
        if (planet.distance > 0) {
            planet.mesh.userData.angle += planet.speed;
            planet.mesh.position.x = Math.cos(planet.mesh.userData.angle) * planet.distance;
            planet.mesh.position.z = Math.sin(planet.mesh.userData.angle) * planet.distance;
            planet.mesh.rotation.y += 0.01;  // Planet rotation
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
        Sun: "The Sun is the star at the center of our Solar System.",
        Mercury: "Mercury is the closest planet to the Sun.",
        Venus: "Venus has a thick atmosphere and is the second planet from the Sun.",
        Earth: "Earth is the only planet known to support life.",
        Mars: "Mars is known as the Red Planet.",
        Jupiter: "Jupiter is the largest planet in our Solar System.",
        Saturn: "Saturn has prominent ring systems.",
        Uranus: "Uranus rotates on its side and has faint rings.",
        Neptune: "Neptune is the farthest planet from the Sun."
    };
    return planetDetails[planetName] || "Unknown planet";
}
