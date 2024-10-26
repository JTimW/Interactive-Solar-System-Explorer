// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Load background texture
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load('assets/star_background.jpg');
scene.background = spaceTexture; // Set background to space texture

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

// Lighting setup
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
sunLight.position.set(0, 0, 0);
scene.add(sunLight); // Adds sunlight to the center for the Sun's light effect

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight); // Adds ambient light for overall brightness

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

// Create planets and orbits
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

    // Optional: Add orbit rings for planets
    if (planetData.distance > 0) {
        const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.02, planetData.distance + 0.02, 50);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
    }

    return { ...planetData, mesh };
});

// Set camera position and controls
camera.position.z = 50; // Start camera a bit farther out
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;

// Function to zoom to selected planet
function zoomToPlanet(planetName) {
    const selectedPlanet = planets.find(planet => planet.name === planetName);
    if (!selectedPlanet) return;

    const targetPosition = new THREE.Vector3(
        selectedPlanet.mesh.position.x,
        selectedPlanet.mesh.position.y,
        selectedPlanet.mesh.position.z + 5 // Offset to avoid zooming too close
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

// Animation loop with planet orbits and TWEEN updates
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

    TWEEN.update(); // Update TWEEN animations

    renderer.render(scene, camera); // Render the scene and camera view
}

animate(); // Start the animation loop

// Adjust renderer and camera on window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
