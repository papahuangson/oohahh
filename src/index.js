import * as THREE from 'three';
import './style.css';

const root = document.getElementById('root');

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setClearColor(0xf0f8ff);
renderer.setSize(window.innerWidth, window.innerHeight);
root.appendChild(renderer.domElement);

// Create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

// Add ambient light
const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

// Fun, colorful objects for kids
const objects = [];
const palette = [0xff5e5b, 0xffc914, 0x2ec4b6, 0x6a4cff, 0xf7b32b, 0x3a86ff, 0xff006e];

function randomSphere() {
  const geometry = new THREE.SphereGeometry(Math.random() * 1 + 0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: palette[Math.floor(Math.random() * palette.length)],
    roughness: 0.5,
    metalness: 0.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 16,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );
  mesh.userData = { spin: Math.random() * 0.02 + 0.01 };
  return mesh;
}

function randomCube() {
  const geometry = new THREE.BoxGeometry(Math.random() * 1 + 0.5, Math.random() * 1 + 0.5, Math.random() * 1 + 0.5);
  const material = new THREE.MeshStandardMaterial({
    color: palette[Math.floor(Math.random() * palette.length)],
    roughness: 0.4,
    metalness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 16,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );
  mesh.userData = { spin: Math.random() * 0.02 + 0.01 };
  return mesh;
}

function addRandomObject() {
  const type = Math.random() < 0.5 ? 'sphere' : 'cube';
  let obj;
  if (type === 'sphere') {
    obj = randomSphere();
  } else {
    obj = randomCube();
  }
  scene.add(obj);
  objects.push(obj);
}

// Add some initial objects
for (let i = 0; i < 10; ++i) {
  addRandomObject();
}

// Animate objects
function animateObjects() {
  for (const obj of objects) {
    obj.rotation.x += obj.userData.spin;
    obj.rotation.y += obj.userData.spin;
  }
}

// Fun animated event: burst of objects
function burstObjects(center) {
  for (let i = 0; i < 8; ++i) {
    const obj = Math.random() < 0.5 ? randomSphere() : randomCube();
    obj.position.copy(center || new THREE.Vector3(0, 0, 0));
    // Give them a velocity
    obj.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7
    );
    scene.add(obj);
    objects.push(obj);
  }
}

// Animate burst objects with velocity
function animateBurst() {
  for (const obj of objects) {
    if (obj.userData.velocity) {
      obj.position.add(obj.userData.velocity);
      obj.userData.velocity.multiplyScalar(0.97); // slow down
      if (obj.userData.velocity.length() < 0.01) {
        delete obj.userData.velocity;
      }
    }
  }
}

// Fun animated event: color flash
function flashColors() {
  for (const obj of objects) {
    const orig = obj.material.color.getHex();
    obj.material.color.setHex(palette[Math.floor(Math.random() * palette.length)]);
    setTimeout(() => {
      obj.material.color.setHex(orig);
    }, 400);
  }
}

// Fun animated event: bounce all objects
function bounceObjects() {
  for (const obj of objects) {
    obj.userData.bounce = {
      amplitude: Math.random() * 1 + 0.5,
      phase: Math.random() * Math.PI * 2,
      baseY: obj.position.y,
    };
  }
  setTimeout(() => {
    for (const obj of objects) {
      delete obj.userData.bounce;
    }
  }, 1100);
}

// Animate bounce
function animateBounce(time) {
  for (const obj of objects) {
    if (obj.userData.bounce) {
      obj.position.y = obj.userData.bounce.baseY + Math.sin(time / 200 + obj.userData.bounce.phase) * obj.userData.bounce.amplitude;
    }
  }
}

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Mouse and keyboard events
renderer.domElement.addEventListener('mousemove', (e) => {
  if (Math.random() < 0.04) {
    burstObjects(screenToWorld(e.clientX, e.clientY));
  } else if (Math.random() < 0.1) {
    flashColors();
  }
});

renderer.domElement.addEventListener('click', (e) => {
  burstObjects(screenToWorld(e.clientX, e.clientY));
  flashColors();
});

window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    bounceObjects();
  } else if (e.key === 'b') {
    burstObjects();
  } else if (e.key === 'c') {
    flashColors();
  }
});

// Utility: convert screen coords to world
function screenToWorld(x, y) {
  const ndc = new THREE.Vector2(
    (x / window.innerWidth) * 2 - 1,
    -(y / window.innerHeight) * 2 + 1
  );
  const vec = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
  return vec;
}

// Animation loop
function animate(time) {
  animateObjects();
  animateBurst();
  animateBounce(time || 0);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();