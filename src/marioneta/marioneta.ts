import '../scss/estilos.scss';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { iniciarCamara } from '../ayudas';
import { dimsCamara } from '../constantes';

let reloj = 0;
const lienzo = document.createElement('canvas');
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const vision = await FilesetResolver.forVisionTasks();
const marcadores = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: '/modelos/pose_landmarker_lite.task', delegate: 'GPU' },
  runningMode: 'VIDEO',
  numPoses: 1,
  // outputSegmentationMasks: true
});
const marcasDelCuerpo = PoseLandmarker.POSE_CONNECTIONS;

async function inicio() {
  const { ancho, alto } = dimsCamara();
  const escala = ancho / 2 / alto;
  const ancho2 = window.innerWidth / 2;
  const alto2 = ancho2 * escala;
  const camara = (await iniciarCamara(ancho2 - 10, alto2)) as HTMLVideoElement;
  if (!camara) return;

  document.body.appendChild(lienzo);
  escalar(camara);
  const pintor = new DrawingUtils(ctx);
  reloj = requestAnimationFrame(espejitoEspejito);
  const color = ctx.createLinearGradient(0, 0, ancho2, 0);
  color.addColorStop(0, 'darkblue');
  color.addColorStop(0.5, 'lightblue');
  color.addColorStop(1, 'darkblue');
  // ctx.fillStyle = color;
  function espejitoEspejito(ahora: number) {
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    const poses = marcadores.detectForVideo(camara, ahora);

    if (poses.landmarks.length) {
      poses.landmarks.forEach((puntos) => {
        pintor.drawConnectors(puntos, marcasDelCuerpo, {
          lineWidth: 1,
          color: color,
        });
      });
    }

    reloj = requestAnimationFrame(espejitoEspejito);
  }
}

inicio().catch(console.error);

function escalar(camara: HTMLVideoElement) {
  lienzo.width = camara.videoWidth;
  lienzo.height = camara.videoHeight;
  ctx.fillStyle = '#e6f5ff';
}

// Transformar desde puntos en Canvas: https://codepen.io/TP24/pen/zVWYGX

// const landmarks = marcadores.detect(image);
/**
0 - nose
1 - left eye (inner)
2 - left eye
3 - left eye (outer)
4 - right eye (inner)
5 - right eye
6 - right eye (outer)
7 - left ear
8 - right ear
9 - mouth (left)
10 - mouth (right)
11 - left shoulder
12 - right shoulder
13 - left elbow
14 - right elbow
15 - left wrist
16 - right wrist
17 - left pinky
18 - right pinky
19 - left index
20 - right index
21 - left thumb
22 - right thumb
23 - left hip
24 - right hip
25 - left knee
26 - right knee
27 - left ankle
28 - right ankle
29 - left heel
30 - right heel
31 - left foot index
32 - right foot index
 */
