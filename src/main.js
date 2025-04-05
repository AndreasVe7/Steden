import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const API_KEY = 'badaa819b71869f5e964f8570bfb2683';

// Three.js Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '0';
document.body.appendChild(renderer.domElement);

// Create container for earth and markers
const earthContainer = new THREE.Object3D();
scene.add(earthContainer);

// Earth Setup
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
const normalMap = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg');

const earthMaterial = new THREE.MeshPhongMaterial({ 
    map: earthTexture,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.85, 0.85)
});

const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthContainer.add(earthMesh);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Add atmosphere
const atmosphereGeometry = new THREE.SphereGeometry(1.01, 64, 64);
const atmosphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x0077ff,
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
earthContainer.add(atmosphere);

// OrbitControls Setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 4;
controls.enableZoom = true;
controls.enablePan = false;
controls.rotateSpeed = 0.5;

// City data
const cityData = [
    { name: "Tokyo", continent: "Azië", lat: 35.6764, lon: 139.6500 },
    { name: "New York", continent: "Noord-Amerika", lat: 40.7128, lon: -74.0060 },
    { name: "Rio de Janeiro", continent: "Zuid-Amerika", lat: -22.9068, lon: -43.1729 },
    { name: "Kaapstad", continent: "Afrika", lat: -33.9249, lon: 18.4241 },
    { name: "Sydney", continent: "Oceanië", lat: -33.8688, lon: 151.2093 }
];

// Add City Markers
const cityMarkers = [];

cityData.forEach(city => {
    const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
    const markerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.5
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);

    const latRad = city.lat * (Math.PI / 180);
    const lonRad = -city.lon * (Math.PI / 180);
    const radius = 1.01;

    marker.position.x = radius * Math.cos(latRad) * Math.cos(lonRad);
    marker.position.y = radius * Math.sin(latRad);
    marker.position.z = radius * Math.cos(latRad) * Math.sin(lonRad);

    const glowGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    marker.add(glow);

    marker.userData = city;
    cityMarkers.push(marker);
    earthContainer.add(marker);
});

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Click handler
function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cityMarkers, true);

    if (intersects.length > 0) {
        const marker = intersects[0].object.parent || intersects[0].object;
        const cityData = marker.userData;
        showCityInfo(cityData);
    }
}

// Show city info
function showCityInfo(cityData) {
    const cityInfo = document.getElementById('city-info');
    const cityContent = cityInfo.querySelector('.city-content');
    const cityName = cityContent.querySelector('h2');
    const cityContinent = cityContent.querySelector('.continent');
    const weatherInfo = cityContent.querySelector('.weather-info');

    cityName.textContent = cityData.name;
    cityContinent.textContent = cityData.continent;
    weatherInfo.innerHTML = '<div class="loader"></div>';
    cityInfo.classList.add('visible');

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cityData.lat}&lon=${cityData.lon}&units=metric&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            weatherInfo.innerHTML = `
                <p>${data.main.temp.toFixed(1)}°C</p>
                <p>${data.weather[0].description}</p>
            `;
        })
        .catch(error => {
            console.error('Weather fetch error:', error);
            weatherInfo.innerHTML = '<p>Weer niet beschikbaar</p>';
        });
}

// Mouse move handler
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cityMarkers, true);

    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
}

// Event listeners
window.addEventListener('click', onClick);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('resize', onWindowResize);

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();