import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add lighting
const sunLight = new THREE.PointLight(0xffffff, 5, 200);  // Increase intensity
sunLight.position.set(0, 0, 0);  // Make sure it's centered
scene.add(sunLight);

// Add ambient light to ensure planets are visible even in low light
const ambientLight = new THREE.AmbientLight(0x404040, 1.0);
scene.add(ambientLight);

// Test planets without textures first
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0066ff });  // Simple color material
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.x = 10;
scene.add(earth);

// Set the camera position
camera.position.z = 50;

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.minDistance = 10;
controls.maxDistance = 100;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.01;  // Rotate Earth to see some movement
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
