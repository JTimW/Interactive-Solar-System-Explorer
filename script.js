// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Load textures with debugging
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load(
    'assets/star_background.jpg',
    () => console.log("Background texture loaded successfully"),
    undefined,
    (error) => console.error("Error loading background texture:", error)
);
scene.background = spaceTexture;

// Planet textures with error logging
const planetTextures = {
    Sun: textureLoader.load('assets/sun_texture.jpg', null, null, error => console.error("Error loading Sun texture:", error)),
    Mercury: textureLoader.load('assets/mercury_texture.jpg', null, null, error => console.error("Error loading Mercury texture:", error)),
    Venus: textureLoader.load('assets/venus_texture.jpg', null, null, error => console.error("Error loading Venus texture:", error)),
    Earth: textureLoader.load('assets/earth_texture.jpg', null, null, error => console.error("Error loading Earth texture:", error)),
    Mars: textureLoader.load('assets/mars_texture.jpg', null, null, error => console.error("Error loading Mars texture:", error)),
    Jupiter: textureLoader.load('assets/jupiter_texture.jpg', null, null, error => console.error("Error loading Jupiter texture:", error)),
    Saturn: textureLoader.load('assets/saturn_texture.jpg', null, null, error => console.error("Error loading Saturn texture:", error)),
    Uranus: textureLoader.load('assets/uranus_texture.jpg', null, null, error => console.error("Error loading Uranus texture:", error)),
    Neptune: textureLoader.load('assets/neptune_texture.jpg', null, null, error => console.error("Error loading Neptune texture:", error))
};

// Lighting
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x404040, 1.0); // Increased intensity for visibility
scene.add(ambientLight);

// Planet data
const planetsData = [
    { name: "Sun", size: 10, distance: 0, speed: 0 },
    { name: "Mercury", size: 0.2, distance: 14, speed: 0.004 },
    { name: "Venus", size: 0.4, distance: 16, speed: 0.003 },
    { name: "Earth", size: 0.45, distance: 19, speed: 0.002 },
    { name: "Mars", size: 0.35, distance: 23, speed: 0.0018 },
    { name: "Jupiter", size: 1.8, distance: 33, speed: 0.001 },
    { name: "Saturn", size: 1.5, distance: 43, speed: 0.0008 },
    { name: "Uranus", size: 1.2, distance: 53, speed: 0.0006 },
    { name: "Neptune", size: 1.2, distance: 63, speed: 0.0005 }
];

// Create Sun and planets with optional rings
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

    if (planetData.distance > 0) {
        const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.02, planetData.distance + 0.02, 50);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
    }

    // Saturn and Uranus rings
    if (planetData.name === "Saturn" || planetData.name === "Uranus") {
        const ringSize = planetData.name === "Saturn" ? 1.5 : 0.8;
        const ringGeometry = new THREE.RingGeometry(planetData.size + 0.5, planetData.size + ringSize, 32);
        const ringTexture = textureLoader.load(
            `assets/${planetData.name.toLowerCase()}Ring_texture.png`, 
            () => console.log(`${planetData.name} ring texture loaded successfully`),
            undefined,
            error => console.error(`Error loading ${planetData.name} ring texture:`, error)
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
    }
    return { ...planetData, mesh };
});

// Set camera position and controls
camera.position.z = 100; // Further back for a better overview
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 200;

// Smooth zoom function to move camera to planet and display information
function zoomToPlanet(planetName) {
    const selectedPlanet = planets.find(planet => planet.name === planetName);
    if (!selectedPlanet) return;

    const targetPosition = new THREE.Vector3(
        selectedPlanet.mesh.position.x,
        selectedPlanet.mesh.position.y,
        selectedPlanet.mesh.position.z + 5
    );

    new TWEEN.Tween(camera.position)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(selectedPlanet.mesh.position);
        })
        .start();

    controls.target.copy(selectedPlanet.mesh.position);
    controls.update();
}

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

    TWEEN.update();
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

// Dropdown event listener
const planetSelector = document.getElementById('planet-selector');
planetSelector.addEventListener('change', (event) => {
    const selectedPlanet = event.target.value;
    if (selectedPlanet) {
        zoomToPlanet(selectedPlanet);
        displayPlanetInfo(selectedPlanet);
    }
});

// Raycasting for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel.contains(event.target)) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        displayPlanetInfo(clickedPlanet.name);
    } else {
        hidePlanetInfo();
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
    document.getElementById('short-description').style.display = 'inline';
    document.getElementById('full-description').style.display = 'none';

    if (planetInfo.length > 100) {
        document.getElementById('read-more').style.display = 'inline';
        document.getElementById('read-less').style.display = 'none';
    } else {
        document.getElementById('read-more').style.display = 'none';
    }

    infoPanel.style.display = 'block';
    infoPanel.classList.add('show');
}

// Expand and collapse description
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

// Hide the info panel with fade-out effect
function hidePlanetInfo() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.remove('show');
    setTimeout(() => infoPanel.style.display = 'none', 500);
}

// Fetch planet information
function getPlanetInfo(planetName) {
    const planetDetails = {
        Sun: "The Sun is a massive, glowing ball of hydrogen and helium at the center...",
        Mercury: "Mercury, the smallest and closest planet to the Sun...",
        Venus: "Venus, the second planet from the Sun and Earth’s “sister planet”...",
        Earth: "Earth, the third planet from the Sun, is unique in the solar system...",
        Mars: "Mars, the fourth planet from the Sun, is a cold, desert-like world...",
        Jupiter: "Jupiter, the fifth and largest planet in our solar system...",
        Saturn: "Saturn, the sixth planet from the Sun, is best known for its rings...",
        Uranus: "Uranus, the seventh planet from the Sun, is an ice giant with a pale blue color...",
        Neptune: "Neptune, the eighth and farthest known planet from the Sun..."
    };
    return planetDetails[planetName] || "Unknown planet";
}
