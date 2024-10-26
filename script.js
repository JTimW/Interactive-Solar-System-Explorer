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
    { name: "Sun", size: 3, distance: 0, speed: 0 },
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
        ? new THREE.MeshBasicMaterial({
              map: planetTextures.Sun,
              emissive: new THREE.Color(0xffff00),
              emissiveIntensity: 1.5
          }) 
        : new THREE.MeshStandardMaterial({ map: planetTextures[planetData.name] });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planetData.distance;
    mesh.userData = { distance: planetData.distance, speed: planetData.speed, angle: 0 };
    mesh.name = planetData.name;

    scene.add(mesh);

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
            planet.mesh.rotation.y += 0.01;
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
    } else {
        hidePlanetInfo(); // Hide the info panel if clicked elsewhere
    }
});

// Display planet information in the info panel
function displayPlanetInfo(planetName) {
    const infoPanel = document.getElementById('info-panel');
    const planetInfo = getPlanetInfo(planetName);

    document.getElementById('planet-name').innerText = planetName;

    const shortDescription = planetInfo.length > 100 ? planetInfo.substring(0, 100) + '...' : planetInfo;
    document.getElementById('short-description').innerText = shortDescription;

    document.getElementById('full-description').innerText = planetInfo;
    document.getElementById('full-description').style.display = 'none';

    if (planetInfo.length > 100) {
        document.getElementById('read-more').style.display = 'inline';
        document.getElementById('read-less').style.display = 'none';
    } else {
        document.getElementById('read-more').style.display = 'none';
    }

    infoPanel.style.display = 'block';
    setTimeout(() => infoPanel.classList.add('show'), 10);
}

// Expand and collapse description functions
function expandDescription(event) {
    event.preventDefault();
    document.getElementById('short-description').style.display = 'none';
    document.getElementById('full-description').style.display = 'inline';
    document.getElementById('read-more').style.display = 'none';
    document.getElementById('read-less').style.display = 'inline';
}

function collapseDescription(event) {
    event.preventDefault();
    document.getElementById('short-description').style.display = 'inline';
    document.getElementById('full-description').style.display = 'none';
    document.getElementById('read-more').style.display = 'inline';
    document.getElementById('read-less').style.display = 'none';
}

// Hide the info panel
function hidePlanetInfo() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.remove('show');
    setTimeout(() => infoPanel.style.display = 'none', 500);
}

// Fetch planet information
function getPlanetInfo(planetName) {
    const planetDetails = {
        Sun: "The Sun is a massive, glowing ball of hydrogen and helium at the center of our solar system...",
        Mercury: "Mercury, the smallest and closest planet to the Sun...",
        Venus: "Venus, the second planet from the Sun...",
        Earth: "Earth, the third planet from the Sun, is unique in the solar system...",
        Mars: "Mars, the fourth planet from the Sun, is a cold, desert-like world...",
        Jupiter: "Jupiter, the fifth and largest planet in our solar system...",
        Saturn: "Saturn, the sixth planet from the Sun...",
        Uranus: "Uranus, the seventh planet from the Sun...",
        Neptune: "Neptune, the eighth and farthest known planet from the Sun..."
    };
    return planetDetails[planetName] || "Unknown planet";
}
