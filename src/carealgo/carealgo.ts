import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { FaceMeshFaceGeometry } from '../ayudas/face';
import {
  WebGLRenderer,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  VideoTexture,
  SRGBColorSpace,
} from 'three';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import GumAudioVideo from '../ayudas/gum-av';

const av = document.querySelector('gum-av') as GumAudioVideo;
const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const status = document.querySelector('#status');
const video = document.getElementById('video') as HTMLVideoElement;

// Set a background color, or change alpha to false for a solid canvas.
const renderer = new WebGLRenderer({ antialias: true, alpha: true, canvas });
// renderer.setClearColor(0x202020);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = SRGBColorSpace;

const scene = new Scene();
const camera = new OrthographicCamera(1, 1, 1, 1, -1000, 1000);

// Change to renderer.render(scene, debugCamera); for interactive view.
const debugCamera = new PerspectiveCamera(75, 1, 0.1, 1000);
debugCamera.position.set(300, 300, 300);
debugCamera.lookAt(scene.position);
const controls = new OrbitControls(debugCamera, renderer.domElement);

let width = 0;
let height = 0;

function resize() {
  const videoAspectRatio = width / height;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const windowAspectRatio = windowWidth / windowHeight;
  let adjustedWidth;
  let adjustedHeight;
  if (videoAspectRatio > windowAspectRatio) {
    adjustedWidth = windowWidth;
    adjustedHeight = windowWidth / videoAspectRatio;
  } else {
    adjustedWidth = windowHeight * videoAspectRatio;
    adjustedHeight = windowHeight;
  }
  renderer.setSize(adjustedWidth, adjustedHeight);
  debugCamera.aspect = videoAspectRatio;
  debugCamera.updateProjectionMatrix();
}

window.addEventListener('resize', () => {
  resize();
});
resize();
renderer.render(scene, camera);

// Create wireframe material for debugging.
const wireframeMaterial = new MeshBasicMaterial({
  color: 0xff00ff,
  wireframe: true,
});

// Create material for faces.
const material = new MeshBasicMaterial({
  color: 0xffffff,
  map: null, // Will be created when the video is ready.
  side: DoubleSide,
});

// Create a new geometry helper, specifying that the texture coordinates are to be based on the same video as the model input.
const faceGeometry1 = new FaceMeshFaceGeometry({ useVideoTexture: true, normalizeCoords: false });
const faceGeometry2 = new FaceMeshFaceGeometry({ useVideoTexture: true, normalizeCoords: false });

// Create face meshes.
const face1 = new Mesh(faceGeometry1, material);
scene.add(face1);

const face2 = new Mesh(faceGeometry2, material);
scene.add(face2);

// Enable wireframe to debug the mesh on top of the material.
let wireframe = false;

// Defines if the source should be flipped horizontally.
let flipCamera = true;

async function render(model) {
  // Wait for video to be ready (loadeddata).
  // if (!av) return;
  await av.ready();

  // Flip video element horizontally if necessary.
  av.video.style.transform = flipCamera ? 'scaleX(-1)' : 'scaleX(1)';
  av.style.opacity = '1';

  // Resize orthographic camera to video dimensions if necessary.
  if (width !== av.video.videoWidth || height !== av.video.videoHeight) {
    const w = av.video.videoWidth;
    const h = av.video.videoHeight;
    camera.left = -0.5 * w;
    camera.right = 0.5 * w;
    camera.top = 0.5 * h;
    camera.bottom = -0.5 * h;
    camera.updateProjectionMatrix();
    width = w;
    height = h;
    resize();
    faceGeometry1.setSize(w, h);
    faceGeometry2.setSize(w, h);
  }

  // Wait for the model to return a face.

  const faces = await model.estimateFaces(av.video, false, flipCamera);
  if (!status) return;
  status.textContent = '';

  // There's at least one face.
  if (faces.length == 2) {
    // Update face mesh geometry with new data.
    faceGeometry1.update(faces[0], flipCamera);
    faceGeometry2.update(faces[1], flipCamera);
    // Switch uv coordinates.
    for (let j = 0; j < faceGeometry1.uvs.length; j++) {
      const v = faceGeometry1.uvs[j];
      faceGeometry1.uvs[j] = faceGeometry2.uvs[j];
      faceGeometry2.uvs[j] = v;
    }
    faceGeometry1.getAttribute('uv').needsUpdate = true;
    faceGeometry2.getAttribute('uv').needsUpdate = true;
  } else {
    if (!status) return;
    status.textContent = "Can't detect two faces to switch...";
  }

  if (wireframe) {
    // Render the faces.
    renderer.autoClear = true;
    face1.material = material;
    renderer.render(scene, camera);
    // Prevent renderer from clearing the color buffer.
    renderer.autoClear = false;
    renderer.clear(false, true, false);
    face1.material = wireframeMaterial;
    // Render again with the wireframe material.
    renderer.render(scene, camera);
    renderer.autoClear = true;
  } else {
    // Render the scene normally.
    renderer.render(scene, camera);
  }

  requestAnimationFrame(() => render(model));
}

// Init the demo, loading dependencies.
async function init() {
  await tf.setBackend('webgl');
  await av.ready();
  const videoTexture = new VideoTexture(av.video);
  material.map = videoTexture;
  if (!status) return;
  status.textContent = 'Loading model...';
  const model = await facemesh.load({ maxFaces: 2 });
  status.textContent = 'Detecting face...';
  render(model);
}

init();
