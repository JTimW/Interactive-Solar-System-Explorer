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
              emissiveIntensity: 1.5   // Adjust this for desired glow level
          }) 
        : new THREE.MeshStandardMaterial({ map: planetTextures[planetData.name] });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = planetData.distance;
    mesh.userData = { distance: planetData.distance, speed: planetData.speed, angle: 0 };
    mesh.name = planetData.name;

    scene.add(mesh);

    if (planetData.distance > 0) {  // Create orbit line for planets, excluding Sun
        const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.1, planetData.distance + 0.1, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;  // Align to XY plane
        scene.add(orbit);
    }

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
    } else {
        hidePlanetInfo(); // Hide the info panel if clicked elsewhere
    }
});

// Display planet information in the info panel
function displayPlanetInfo(planetName) {
    const infoPanel = document.getElementById('info-panel');
    const planetInfo = getPlanetInfo(planetName);

    document.getElementById('planet-name').innerText = planetName;

    // Show shortened version of the description
    const shortDescription = planetInfo.length > 100 ? planetInfo.substring(0, 100) + '...' : planetInfo;
    document.getElementById('short-description').innerText = shortDescription;

    // Full description (hidden initially)
    document.getElementById('full-description').innerText = planetInfo;

    // Show 'Read more' link if the text is truncated
    if (planetInfo.length > 100) {
        document.getElementById('read-more').style.display = 'inline';
    } else {
        document.getElementById('read-more').style.display = 'none';
    }

    infoPanel.style.display = 'block';
    setTimeout(() => infoPanel.classList.add('show'), 10); // Delay for fade-in effect
}

// Expand description when "Read more" is clicked
function expandDescription(event) {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById('short-description').style.display = 'none';
    document.getElementById('full-description').style.display = 'inline';
    document.getElementById('read-more').style.display = 'none'; // Hide the 'Read more' link
}

// Hide the info panel with fade-out effect
function hidePlanetInfo() {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.classList.remove('show');
    setTimeout(() => infoPanel.style.display = 'none', 500); // Delay for fade-out effect
}

// Fetch planet information
function getPlanetInfo(planetName) {
    const planetDetails = {
        Sun: "The Sun is a massive, glowing ball of hydrogen and helium at the center of our solar system, providing the energy needed to sustain life on Earth. Its core, where nuclear fusion occurs, generates enormous energy by fusing hydrogen atoms into helium, releasing heat and light that radiates into space. The Sun's surface, called the photosphere, reaches about 5,500 degrees Celsius (9,932 degrees Fahrenheit), while temperatures in its core soar to over 15 million degrees Celsius. This energy drives Earth's climate and weather systems, influencing everything from photosynthesis in plants to the formation of weather patterns. As a star, the Sun is about halfway through its life cycle, estimated to last roughly 10 billion years, and it has already been shining for about 4.6 billion years.",
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
