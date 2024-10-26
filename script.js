// Setup scene, camera, and renderer with debugging
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100; // Ensure the camera is far enough back to see the scene
console.log("Camera initialized at position:", camera.position);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
console.log("Renderer initialized with size:", renderer.getSize());

// Load textures with error logging
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load(
    'assets/star_background.jpg',
    () => console.log("Background texture loaded successfully"),
    undefined,
    (error) => console.error("Error loading background texture:", error)
);
scene.background = spaceTexture;

const planetTextures = {
    Sun: textureLoader.load('assets/sun_texture.jpg', () => console.log("Sun texture loaded"), undefined, error => console.error("Error loading Sun texture:", error)),
    Mercury: textureLoader.load('assets/mercury_texture.jpg', () => console.log("Mercury texture loaded"), undefined, error => console.error("Error loading Mercury texture:", error)),
    Venus: textureLoader.load('assets/venus_texture.jpg', () => console.log("Venus texture loaded"), undefined, error => console.error("Error loading Venus texture:", error)),
    Earth: textureLoader.load('assets/earth_texture.jpg', () => console.log("Earth texture loaded"), undefined, error => console.error("Error loading Earth texture:", error)),
    Mars: textureLoader.load('assets/mars_texture.jpg', () => console.log("Mars texture loaded"), undefined, error => console.error("Error loading Mars texture:", error)),
    Jupiter: textureLoader.load('assets/jupiter_texture.jpg', () => console.log("Jupiter texture loaded"), undefined, error => console.error("Error loading Jupiter texture:", error)),
    Saturn: textureLoader.load('assets/saturn_texture.jpg', () => console.log("Saturn texture loaded"), undefined, error => console.error("Error loading Saturn texture:", error)),
    Uranus: textureLoader.load('assets/uranus_texture.jpg', () => console.log("Uranus texture loaded"), undefined, error => console.error("Error loading Uranus texture:", error)),
    Neptune: textureLoader.load('assets/neptune_texture.jpg', () => console.log("Neptune texture loaded"), undefined, error => console.error("Error loading Neptune texture:", error))
};

// Lighting with increased ambient light for visibility
const sunLight = new THREE.PointLight(0xffffff, 2, 500);
scene.add(sunLight);
const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Higher intensity for visibility
scene.add(ambientLight);

// Check if any errors occur when adding lights
console.log("Lights added to the scene:", sunLight, ambientLight);

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

    console.log(`Planet ${planetData.name} added to scene at position:`, mesh.position);

    return { ...planetData, mesh };
});

// Orbit controls for camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 200;

// Animation loop with logging to confirm it runs
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

    controls.update();
    renderer.render(scene, camera);
    console.log("Rendering frame"); // Log each frame for confirmation
}

// Start the animation loop
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Log any errors on the window
window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global error caught:", message, "at", source, ":", lineno, ":", colno);
};
