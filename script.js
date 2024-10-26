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

    if (planetData.distance > 0) {
        const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.02, planetData.distance + 0.02, 50);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
    }

    if (planetData.name === "Saturn") {
        const ringGeometry = new THREE.RingGeometry(planetData.size + 0.5, planetData.size + 1, 32);

        // Load the texture for Saturn's ring
        const ringTexture = textureLoader.load('assets/saturnRing_texture.png'); // Specify the correct path to texture file
        // Apply the texture to the material
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,  // Enables transparency if the texture has an alpha channel
            opacity: 1
        });

        // Create and add the ring mesh for Saturn
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Rotate to align with planet
        mesh.add(ring);
        
    } else if (planetData.name === "Uranus") {
        const ringGeometry = new THREE.RingGeometry(planetData.size + 0.1, planetData.size + 0.3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: '#3A3A3C', 
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });

        // Create and add the ring mesh for Neptune
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2; // Rotate to align with planet
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

// Smooth zoom function to move camera to planet
function zoomToPlanet(planetName) {
    const selectedPlanet = planets.find(planet => planet.name === planetName);
    if (!selectedPlanet) return; // Exit if no planet is selected

    const targetPosition = new THREE.Vector3(
        selectedPlanet.mesh.position.x,
        selectedPlanet.mesh.position.y,
        selectedPlanet.mesh.position.z + 5 // Offset to avoid zooming too close
    );

    console.log("Zooming to planet:", planetName, "Target position:", targetPosition);
    
    // Create a tween for smooth camera transition
    new TWEEN.Tween(camera.position)
        .to({ x: targetPosition.x, y: targetPosition.y, z: targetPosition.z }, 2000) // Duration of 2 seconds
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(selectedPlanet.mesh.position); // Keep camera focused on the planet
        })
        .start();

    // Update controls target if using OrbitControls
    controls.target.copy(selectedPlanet.mesh.position);
    controls.update();
}

// Include TWEEN.js animation update in the animation loop
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

    renderer.render(scene, camera);
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
    const infoPanel = document.getElementById('info-panel');

    // Ignore clicks within the info panel itself
    if (infoPanel.contains(event.target)) {
        return;
    }
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

// Expand description when "Read more" is clicked
function expandDescription(event) {
    event.preventDefault();
    document.getElementById('short-description').style.display = 'none';
    document.getElementById('full-description').style.display = 'inline';
    document.getElementById('read-more').style.display = 'none';
    document.getElementById('read-less').style.display = 'inline';
    document.getElementById('info-panel').style.display = 'block';
}

// Collapse description when "Read Less" is clicked
function collapseDescription(event) {
    event.preventDefault();
    document.getElementById('short-description').style.display = 'inline';
    document.getElementById('full-description').style.display = 'none';
    document.getElementById('read-more').style.display = 'inline';
    document.getElementById('read-less').style.display = 'none';
    document.getElementById('info-panel').style.display = 'block';
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
        Sun: "The Sun is a massive, glowing ball of hydrogen and helium at the center of our solar system, " +
             "providing the energy needed to sustain life on Earth. Its core, where nuclear fusion occurs, " +
             "generates enormous energy by fusing hydrogen atoms into helium, releasing heat and light that radiates into space. " +
             "The Sun's surface, called the photosphere, reaches about 5,500 degrees Celsius (9,932 degrees Fahrenheit), " +
             "while temperatures in its core soar to over 15 million degrees Celsius. " +
             "This energy drives Earth's climate and weather systems, influencing everything from photosynthesis in plants " +
             "to the formation of weather patterns. As a star, the Sun is about halfway through its life cycle, " +
             "estimated to last roughly 10 billion years, and it has already been shining for about 4.6 billion years.",

        Mercury: "Mercury, the smallest and closest planet to the Sun, is a rocky world with a massive iron core, " +
                 "giving it remarkable density. With extreme temperatures fluctuating from 430°C (800°F) on its sunlit side " +
                 "to -180°C (-290°F) on its dark side, Mercury’s lack of atmosphere results in vast temperature contrasts. " +
                 "Its thin exosphere, made of elements like oxygen and sodium, is constantly replenished by solar wind and meteorite impacts. " +
                 "Mercury’s orbit around the Sun takes 88 Earth days, but its slow rotation creates long days and nights. " +
                 "Although it has a weak magnetic field, its partially liquid core suggests a complex internal structure. " +
                 "Space missions like Mariner 10 and Messenger have provided detailed insights into its cratered surface, composition, " +
                 "and magnetic field, revealing Mercury as a fascinating planet for scientific exploration.",

        Venus: "Venus, the second planet from the Sun and Earth’s “sister planet” due to their similar size and structure, " +
               "is a scorching, inhospitable world with an incredibly dense atmosphere composed mainly of carbon dioxide, " +
               "along with clouds of sulfuric acid. This thick atmosphere creates a runaway greenhouse effect, " +
               "trapping heat and raising surface temperatures to around 475°C (900°F), hotter than any other planet. " +
               "Venus’s surface pressure is 90 times that of Earth’s, equivalent to being nearly a kilometer underwater. " +
               "It rotates very slowly and in the opposite direction of most planets, taking 243 Earth days for one rotation, " +
               "while a year on Venus lasts 225 Earth days. Space missions such as NASA’s Magellan have mapped Venus’s volcanic plains " +
               "and mountain ranges, revealing a geologically active surface shaped by volcanic activity and tectonic movements " +
               "beneath its dense, cloudy veil.",

        Earth: "Earth, the third planet from the Sun, is unique in the solar system as it supports abundant life " +
               "due to its perfect blend of liquid water, atmosphere, and favorable temperatures. " +
               "With 71% of its surface covered by oceans and a protective atmosphere rich in nitrogen and oxygen, " +
               "Earth sustains a wide variety of ecosystems and complex life forms. Earth's moderate greenhouse effect, " +
               "driven by atmospheric gases like carbon dioxide and water vapor, regulates its climate, " +
               "while its magnetic field protects the surface from harmful solar radiation. " +
               "The planet’s tectonic activity and volcanic eruptions constantly reshape its surface, " +
               "creating mountains, valleys, and new land. A single orbit around the Sun takes Earth 365 days, " +
               "and it rotates once every 24 hours, giving us the cycle of day and night. " +
               "Earth’s dynamic systems and diverse biosphere make it the only known planet capable of sustaining life.",

        Mars: "Mars, the fourth planet from the Sun, is a cold, desert-like world often called the “Red Planet” " +
              "due to its iron-rich, rust-colored soil. Slightly over half the size of Earth, " +
              "Mars has a thin atmosphere composed mostly of carbon dioxide, with traces of nitrogen and argon, " +
              "providing little insulation and resulting in extreme temperatures that range from 20°C (68°F) during the day " +
              "to -125°C (-195°F) at night. Its surface features massive volcanoes, like Olympus Mons, the largest in the solar system, " +
              "and deep valleys such as Valles Marineris, hinting at a geologically active past. Mars has polar ice caps that contain water " +
              "and carbon dioxide ice, which expand and contract with the seasons. With its days slightly longer than Earth's, " +
              "a Martian year is about 687 Earth days. Mars has been a focus of exploration by rovers and orbiters, " +
              "like NASA’s Curiosity and Perseverance, which seek signs of past water and potential life, " +
              "making it a prime candidate for future human exploration.",

        Jupiter: "Jupiter, the fifth and largest planet in our solar system, is a massive gas giant with a diameter 11 times that of Earth " +
                 "and a composition primarily of hydrogen and helium. Known for its iconic Great Red Spot, a giant storm " +
                 "that has raged for centuries, Jupiter has a dynamic atmosphere with powerful winds and colorful bands created by fast-moving clouds. " +
                 "It emits more heat than it receives from the Sun due to gravitational compression and has a faint ring system " +
                 "and a powerful magnetic field that is the strongest of any planet, trapping intense radiation around it. " +
                 "Jupiter has at least 79 moons, including four large ones—Io, Europa, Ganymede, and Callisto—each with unique features, " +
                 "from volcanic activity on Io to a possible subsurface ocean on Europa. Its immense size, complex atmosphere, and diverse moons " +
                 "make Jupiter a captivating target for space exploration, with missions like Juno providing detailed insights into its structure and composition.",

        Saturn: "Saturn, the sixth planet from the Sun, is best known for its spectacular ring system, made up of countless icy particles " +
                "ranging from tiny grains to large chunks. As the second-largest planet in the solar system, Saturn is a gas giant primarily composed " +
                "of hydrogen and helium, with a density so low it could float in water if such a large ocean existed. " +
                "Saturn’s rapid rotation creates strong winds in its upper atmosphere, forming bands and storms, including a persistent hexagonal storm " +
                "at its north pole. It has a powerful magnetic field and at least 83 known moons, with Titan, its largest, featuring a thick atmosphere " +
                "and lakes of liquid methane and ethane. Saturn has been explored extensively by missions like Cassini, which revealed many details about its rings, " +
                "atmosphere, and moons, solidifying Saturn's place as one of the most visually stunning and scientifically intriguing planets in our solar system.",

        Uranus: "Uranus, the seventh planet from the Sun, is an ice giant with a pale blue color due to methane in its atmosphere, " +
                "which absorbs red light and reflects blue. Unique among planets, Uranus rotates on its side with an axial tilt of 98 degrees, " +
                "likely caused by a massive collision in its early history, giving it extreme seasonal variations. " +
                "Its atmosphere, composed mainly of hydrogen, helium, and methane, is the coldest of any planet, with temperatures plunging to -224°C (-371°F). " +
                "Uranus has faint rings and at least 27 moons, most of which are named after characters from Shakespeare’s plays. " +
                "Voyager 2 is the only spacecraft to have visited Uranus, revealing a bland, featureless surface, though recent observations suggest dynamic weather patterns " +
                "and possible storms. Uranus’s unique tilt, icy composition, and complex magnetic field make it a fascinating object of study in the outer solar system.",

        Neptune: "Neptune, the eighth and farthest known planet from the Sun, is an intense blue ice giant with an atmosphere rich in hydrogen, helium, " +
                 "and methane, the latter giving it its striking color. Known for its dynamic weather, Neptune has the strongest winds in the solar system, " +
                 "reaching speeds of up to 2,100 kilometers (1,300 miles) per hour, and features large storms, including the now-vanished Great Dark Spot observed " +
                 "by Voyager 2 in 1989. With temperatures plummeting to around -214°C (-353°F), it’s one of the coldest planets, yet its interior likely generates heat " +
                 "that drives atmospheric activity. Neptune has a faint ring system and at least 14 moons, with Triton, its largest, having a retrograde orbit and geysers " +
                 "that suggest a possibly active surface. Despite being visited only once by Voyager 2, Neptune remains a source of intrigue, with its extreme weather and " +
                 "mysterious interior inviting further exploration."
    };
    return planetDetails[planetName] || "Unknown planet";
}

