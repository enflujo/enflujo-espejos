import '../scss/estilos.scss';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { iniciarCamara } from '../ayudas';
import { dimsCamara } from '../constantes';

let reloj = 0;
const lienzo = document.createElement('canvas');
const lienzoImg = document.createElement('canvas');
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const ctxImg = lienzoImg.getContext('2d') as CanvasRenderingContext2D;

const imagenes = ['petromanos', 'palomamanos', 'cabalmanos', 'duquemanos'];
const aleatorio = Math.floor(Math.random() * imagenes.length);

const vision = await FilesetResolver.forVisionTasks();
const marcadores = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: '/modelos/pose_landmarker_lite.task', delegate: 'GPU' },
  runningMode: 'VIDEO',
  numPoses: 1,
  // outputSegmentationMasks: true
});

const marcadoresImg = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: '/modelos/pose_landmarker_lite.task', delegate: 'GPU' },
  runningMode: 'IMAGE',
  numPoses: 1,
  // outputSegmentationMasks: true
});
const marcasDelCuerpo = PoseLandmarker.POSE_CONNECTIONS;
const imagen = document.getElementById('foto') as HTMLImageElement;

console.log(aleatorio);
imagen.src = `${imagenes[aleatorio]}.jpg`; // 'duquemanos.jpg';

imagen.onload = function () {
  inicio().catch(console.error);
};

async function inicio() {
  const { ancho, alto } = dimsCamara();
  const escala = ancho / 2 / alto;
  const ancho2 = window.innerWidth / 2;
  const alto2 = ancho2 * escala;
  const camara = (await iniciarCamara(ancho2 - 10, alto2)) as HTMLVideoElement;

  let puntosImg;

  if (!camara) return;

  document.body.appendChild(lienzo);
  document.body.appendChild(lienzoImg);
  escalar(camara, imagen);
  document.body.append(imagen);
  const pintor = new DrawingUtils(ctx);
  reloj = requestAnimationFrame(espejitoEspejito);

  const color = ctx.createLinearGradient(0, 0, ancho2, 0);
  color.addColorStop(0, 'darkblue');
  color.addColorStop(0.5, 'lightblue');
  color.addColorStop(1, 'darkblue');

  ctxImg.fillStyle = 'white';

  function espejitoEspejito(ahora: number) {
    //ctx.scale(-1, 1);

    ctx.drawImage(camara, 0, 0);
    detectarPoseImg();
    const poses = marcadores.detectForVideo(camara, ahora);

    let compararPuntos = (puntos) => {
      return (
        Math.sqrt(Math.pow(puntos[0].x - puntosImg[0].x, 2)) < 0.05 && // nariz
        Math.sqrt(Math.pow(puntos[0].y - puntosImg[0].y, 2)) < 0.05 &&
        Math.sqrt(Math.pow(puntos[9].x - puntosImg[9].x, 2)) < 0.05 && // boca izq
        Math.sqrt(Math.pow(puntos[9].y - puntosImg[9].y, 2)) < 0.05 &&
        Math.sqrt(Math.pow(puntos[10].x - puntosImg[10].x, 2)) < 0.05 && // boca der
        Math.sqrt(Math.pow(puntos[10].y - puntosImg[10].y, 2)) < 0.05 &&
        Math.sqrt(Math.pow(puntos[15].x - puntosImg[15].x, 2)) < 0.05 && // muñeca izquierda
        Math.sqrt(Math.pow(puntos[15].y - puntosImg[15].y, 2)) < 0.05 &&
        Math.sqrt(Math.pow(puntos[16].x - puntosImg[16].x, 2)) < 0.05 && // muñeca derecha
        Math.sqrt(Math.pow(puntos[16].y - puntosImg[16].y, 2)) < 0.05
      );
    };

    if (poses.landmarks.length) {
      poses.landmarks.forEach((puntos) => {
        if (compararPuntos(puntos)) {
          ctxImg.drawImage(imagen, 0, 0, lienzoImg.width, lienzoImg.height);
        } else {
          ctxImg.fillRect(0, 0, lienzoImg.width, lienzoImg.height);
        }
        pintor.drawConnectors(puntos, marcasDelCuerpo, {
          lineWidth: 2,
          color: color,
        });
      });
    }

    reloj = requestAnimationFrame(espejitoEspejito);
  }

  function detectarPoseImg() {
    const posesImg = marcadoresImg.detect(imagen);

    if (posesImg.landmarks.length) {
      posesImg.landmarks.forEach((puntos) => {
        pintor.drawConnectors(puntos, marcasDelCuerpo, {
          lineWidth: 2,
          color: 'pink',
        });
        puntosImg = puntos;
      });
    }
    // console.log(`x: ${puntosImg[15].x}, y: ${puntosImg[15].x}`);
    return puntosImg;
  }

  detectarPoseImg();
}

function escalar(camara: HTMLVideoElement, imagen: HTMLImageElement) {
  lienzo.width = lienzoImg.width = camara.videoWidth;
  lienzo.height = lienzoImg.height = camara.videoHeight;
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
