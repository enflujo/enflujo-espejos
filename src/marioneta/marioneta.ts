import '../scss/estilos.scss';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { Delaunay } from 'd3-delaunay';
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

// Imagen
const lienzoImg = document.querySelector('#c') as HTMLCanvasElement;

const ctxImg = lienzoImg?.getContext('2d');
const img = document.getElementById('i') as HTMLImageElement;
let anchoImg: number;
let altoImg: number;

const marcadoresImg = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: '/modelos/pose_landmarker_lite.task', delegate: 'GPU' },
  runningMode: 'IMAGE',
  numPoses: 1,
  outputSegmentationMasks: true,
});
const marcasCuerpoImg = PoseLandmarker.POSE_CONNECTIONS;

async function cargarImagen() {
  img.src = './trumpcuerpo.jpg';
  img.onload = function () {
    anchoImg = lienzoImg.width = img.width;
    altoImg = lienzoImg.height = img.height;
    // ctxImg?.drawImage(img, 0, 0, img.width, img.height);
  };
  //document.body.appendChild(lienzoImg);
}

async function inicio() {
  const { ancho, alto } = dimsCamara();
  const escala = ancho / 2 / alto;
  const ancho2 = window.innerWidth / 2;
  const alto2 = ancho2 * escala;
  const camara = (await iniciarCamara(ancho2 - 10, alto2)) as HTMLVideoElement;
  if (!camara) return;

  await cargarImagen();

  document.body.appendChild(lienzo);

  escalar(camara);
  const pintor = new DrawingUtils(ctx);
  const color = ctx.createLinearGradient(0, 0, ancho2, 0);
  color.addColorStop(0, 'darkblue');
  color.addColorStop(0.5, 'lightblue');
  color.addColorStop(1, 'darkblue');
  reloj = requestAnimationFrame(espejitoEspejito);
  // ctx.fillStyle = color;

  function espejitoEspejito(ahora: number) {
    // ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    /* const poses = marcadores.detectForVideo(camara, ahora);

    if (poses.landmarks.length) {
      poses.landmarks.forEach((puntos) => {
        console.log(puntos);
        pintor.drawConnectors(puntos, marcasDelCuerpo, {
          lineWidth: 1,
          color: color,
        });
      });
    }
 */

    //ctx.fillRect(0, 0, anchoImg, altoImg);

    // detectarCuerpoImg();
    if (img.src) {
      const posesImg = marcadoresImg.detect(img);

      if (posesImg.landmarks.length) {
        posesImg.landmarks.forEach((puntos) => {
          const puntosImg = puntos.map((punto) => [punto.x * anchoImg, punto.y * altoImg]);
          calcularVoronoi(puntosImg);
        });
      }

      //listaDelaunay.renderPoints(ctx, 5);
      reloj = requestAnimationFrame(espejitoEspejito);
    }
  }
}

inicio().catch(console.error);

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
svg.setAttribute('width', '1000');
svg.setAttribute('height', '1000');
svg.setAttribute('fill', 'transparent');
svg.setAttribute('stroke', 'black');
svg.appendChild(p);
document.body.appendChild(svg);

function calcularVoronoi(puntosImg: any) {
  const resultado = Delaunay.from(puntosImg);

  //console.log(resultado);

  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';

  const bah = resultado.render();
  let trazo = new Path2D(bah);
  p.setAttribute('d', bah);

  ctx.drawImage(img, 0, 0, img.width, img.height);
  ctx.stroke(trazo);
}

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
