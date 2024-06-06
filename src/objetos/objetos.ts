import '../scss/estilos.scss';
import {
  FilesetResolver,
  PoseLandmarker,
  ObjectDetector,
  ObjectDetectorResult,
  Detection,
} from '@mediapipe/tasks-vision';
// import { DrawingUtils } from '@mediapipe/tasks-vision';
// import { iniciarCamara } from '../ayudas';
// import { dimsCamara } from '../constantes';

// let reloj = 0;
// const lienzo = document.createElement('canvas');
// const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
// const vision = await FilesetResolver.forVisionTasks();
// const marcadores = await PoseLandmarker.createFromOptions(vision, {
//   baseOptions: { modelAssetPath: '/modelos/pose_landmarker_lite.task', delegate: 'GPU' },
//   runningMode: 'IMAGE',
//   numPoses: 1,
//   // outputSegmentationMasks: true
// });

const seccionDemos = document.getElementById('demos') as HTMLElement;

let detectorDeObjeto: ObjectDetector;
let runningMode = 'IMAGE';

// Initialize the object detector
const initializeObjectDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm'
  );
  detectorDeObjeto = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite`,
      delegate: 'GPU',
    },
    scoreThreshold: 0.5,
    runningMode: 'IMAGE',
  });
  seccionDemos.classList.remove('invisible');
};
initializeObjectDetector();

const contenedoresImagen = document.getElementsByClassName('detectOnClick');

for (let contenedorImagen of contenedoresImagen) {
  contenedorImagen.children[0].addEventListener('click', handleClick);
}

/**
 * Detectar objetos en la imagen al hacer click
 */
async function handleClick(event) {
  const resaltadores = event.target.parentNode.getElementsByClassName('resaltador');
  while (resaltadores[0]) {
    resaltadores[0].parentNode.removeChild(resaltadores[0]);
  }

  const infos = event.target.parentNode.getElementsByClassName('info');
  while (infos[0]) {
    infos[0].parentNode.removeChild(infos[0]);
  }

  if (!detectorDeObjeto) {
    alert('el detector de objetos está cargando, por favor intente de nuevo.');
    return;
  }

  // if video mode is initialized, set runningMode to image
  //   if (runningMode === 'VIDEO') {
  //     runningMode = 'IMAGE';
  //     await objectDetector.setOptions({ runningMode: 'IMAGE' });
  //   }

  const ratio = event.target.height / event.target.naturalHeight;

  // detectorDeObjeto.detect devuelve una promesa que, cuando se resuelve, es un array de objetos Detection
  const detecciones = detectorDeObjeto.detect(event.target);
  displayImageDetections(detecciones, event.target);
}

function displayImageDetections(resultado: ObjectDetectorResult, elementoResultante: HTMLImageElement) {
  const ratio = elementoResultante.height / elementoResultante.naturalHeight;
  //console.log(ratio);

  for (let deteccion of resultado.detections) {
    // Descripción
    const p = document.createElement('p');
    p.setAttribute('class', 'info');
    p.innerText =
      deteccion.categories[0].categoryName +
      ' - con un ' +
      Math.round(deteccion.categories[0].score * 100) +
      '% de fiabilidad.';

    // Positioned at the top left of the bounding box.
    // Height is whatever the text takes up.
    // Width subtracts text padding in CSS so fits perfectly.
    if (!deteccion.boundingBox) return;
    p.style.left = `${deteccion.boundingBox.originX * ratio}px`;
    p.style.top = `${deteccion.boundingBox.originY * ratio}px`;
    p.style.width = `${deteccion.boundingBox.width * ratio - 10}px`;

    const resaltador = document.createElement('div');
    resaltador.setAttribute('class', 'resaltador');

    resaltador.style.left = `${deteccion.boundingBox.originX * ratio}px`;
    resaltador.style.top = `${deteccion.boundingBox.originY * ratio}px`;
    resaltador.style.width = `${deteccion.boundingBox.width * ratio}px`;
    resaltador.style.height = `${deteccion.boundingBox.height * ratio}px`;

    if (!elementoResultante.parentNode) return;
    elementoResultante.parentNode.appendChild(resaltador);
    elementoResultante.parentNode.appendChild(p);
  }
}

//const marcasDelCuerpo = PoseLandmarker.POSE_CONNECTIONS;

// async function inicio() {
//   const { ancho, alto } = dimsCamara();
//   const escala = ancho / 2 / alto;
//   const ancho2 = window.innerWidth / 2;
//   const alto2 = ancho2 * escala;
//   const camara = (await iniciarCamara(ancho2 - 10, alto2)) as HTMLVideoElement;
//   if (!camara) return;

//   document.body.appendChild(lienzo);
//   escalar(camara);
//   const pintor = new DrawingUtils(ctx);
//   reloj = requestAnimationFrame(espejitoEspejito);
//   const color = ctx.createLinearGradient(0, 0, ancho2, 0);
//   color.addColorStop(0, 'darkblue');
//   color.addColorStop(0.5, 'lightblue');
//   color.addColorStop(1, 'darkblue');
//   // ctx.fillStyle = color;
//   function espejitoEspejito(ahora: number) {
//     ctx.fillRect(0, 0, lienzo.width, lienzo.height);
//     const poses = marcadores.detectForVideo(camara, ahora);

//     if (poses.landmarks.length) {
//       poses.landmarks.forEach((puntos) => {
//         pintor.drawConnectors(puntos, marcasDelCuerpo, {
//           lineWidth: 1,
//           color: color,
//         });
//       });
//     }

//     reloj = requestAnimationFrame(espejitoEspejito);
//   }
// }

//inicio().catch(console.error);

// function escalar(camara: HTMLVideoElement) {
//   lienzo.width = camara.videoWidth;
//   lienzo.height = camara.videoHeight;
//   ctx.fillStyle = '#e6f5ff';
// }
