// This code sets up Three.js scene, camera, and renderer.
// script.js
import * as THREE from 'three';

// Create a Three.js scene
const scene = new THREE.Scene();

// Set up a camera with perspective view
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Set up a WebGL renderer and add it to the canvas
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solar-system-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create a sun and add it to the scene
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffdd33 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create a planet (Earth) and position it away from the sun
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earthMaterial = new THREE.MeshPhongMaterial({ color: 0x2233ff });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.position.x = 10;
scene.add(earth);

// Add a light source to simulate sunlight
const sunLight = new THREE.PointLight(0xffffff, 1, 100);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Animation loop for rotation and orbit
function animate() {
  requestAnimationFrame(animate);

  // Rotate and orbit the Earth around the Sun
  earth.position.x = Math.cos(Date.now() * 0.001) * 10;
  earth.position.z = Math.sin(Date.now() * 0.001) * 10;

  renderer.render(scene, camera);
}

animate();
