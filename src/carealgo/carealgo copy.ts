import '../scss/estilos.scss';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { DrawingUtils } from '@mediapipe/tasks-vision';
import { iniciarCamara } from '../ayudas';
import { dimsCamara } from '../constantes';

let reloj = 0;
const lienzo = document.createElement('canvas');
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const videoCargado = document.getElementById('video') as HTMLVideoElement;
const vision = await FilesetResolver.forVisionTasks();
const marcadores = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: { modelAssetPath: '/modelos/face_landmarker.task', delegate: 'GPU' },
  runningMode: 'VIDEO',
  numFaces: 1,
  // outputSegmentationMasks: true
});
const contornoBoca = FaceLandmarker.FACE_LANDMARKS_LIPS;
const contornoOjoIzq = FaceLandmarker.FACE_LANDMARKS_LEFT_EYE;
const contornoOjoDer = FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE;
const contornoTeselado = FaceLandmarker.FACE_LANDMARKS_TESSELATION;
const siluetaCara = FaceLandmarker.FACE_LANDMARKS_FACE_OVAL;
const contornoCara = [...contornoBoca, ...contornoOjoDer, ...contornoOjoIzq];
const lienzo2 = new OffscreenCanvas(0, 0);
const ctx2 = lienzo2.getContext('2d') as OffscreenCanvasRenderingContext2D;
let reproduciendo = false;

videoCargado.onplaying = (evento) => {
  reproduciendo = true;
};

videoCargado.onpause = (evento) => {
  reproduciendo = false;
};

//console.log(contornoCara);
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
  const ojoManual = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
  function espejitoEspejito(ahora: number) {
    ctx2.clearRect(0, 0, lienzo.width, lienzo.height);

    //ctx.drawImage(camara, 0, 0);
    ctx.drawImage(videoCargado, 0, 0);

    const poses = marcadores.detectForVideo(camara, ahora);

    if (reproduciendo) {
      const posesPersonaje = marcadores.detectForVideo(videoCargado, ahora + 1 / 1000);
      ctx.fillStyle = 'black';
      //ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      posesPersonaje.faceLandmarks.forEach((puntos) => {
        ctx2.beginPath();
        console.log(contornoOjoDer);
        ojoManual.forEach((indice, i) => {
          const punto = puntos[indice];

          const x = punto.x * lienzo.width;
          const y = punto.y * lienzo.height;

          if (i === 0) {
            ctx2.moveTo(x, y);
            // ctx2.lineTo(x2, y2);
          } else {
            ctx2.lineTo(x, y);
            // ctx2.lineTo(x2, y2);
          }

          // if (i === 0 || i === contornoOjoDer.length - 1 || i === contornoOjoDer.length - 2)
          //   ctx2.fillText(`${start}`, x, y);
        });

        siluetaCara.forEach(({ start }, i) => {
          const punto = puntos[start];
          const x = punto.x * lienzo.width;
          const y = punto.y * lienzo.height;
          if (i === 0) {
            ctx2.moveTo(x, y);
          } else {
            ctx2.lineTo(x, y);
          }
        });

        contornoBoca.forEach(({ start }, i) => {
          const punto = puntos[start];
          const x = punto.x * lienzo.width;
          const y = punto.y * lienzo.height;
          if (i === 0) {
            ctx2.moveTo(x, y);
          } else {
            ctx2.lineTo(x, y);
          }
        });

        contornoOjoIzq.forEach(({ start, end }, i) => {
          const punto = puntos[start];
          const puntoFinal = puntos[end];
          const x = punto.x * lienzo.width;
          const y = punto.y * lienzo.height;
          //console.log(puntos);
          if (i === 0) {
            ctx2.moveTo(x, y);
          } else {
            ctx2.lineTo(x, y);
          }
        });

        ctx2.closePath();
        // console.log('---');
        ctx2.fill();

        // pintor.drawConnectors(puntos, contornoTeselado, {
        //   lineWidth: 1,
        //   color: color,
        //   fillColor: 'black',
        // });
      });

      ctx.save();
      // ctx.globalCompositeOperation = 'destination-in';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(lienzo2, 0, 0);
      ctx.restore();
    }

    const verCamara = true;

    if (verCamara) {
      if (poses.faceLandmarks.length) {
        poses.faceLandmarks.forEach((puntos) => {
          ctx2.beginPath();

          siluetaCara.forEach(({ start }, i) => {
            const punto = puntos[start];
            const x = punto.x * lienzo.width;
            const y = punto.y * lienzo.height;
            if (i === 0) {
              ctx2.moveTo(x, y);
            } else {
              ctx2.lineTo(x, y);
            }
          });
          /* 
          contornoBoca.forEach(({ start }, i) => {
            const punto = puntos[start];
            const x = punto.x * lienzo.width;
            const y = punto.y * lienzo.height;
            if (i === 0) {
              ctx2.moveTo(x, y);
            } else {
              ctx2.lineTo(x, y);
            }
          });

          contornoOjoIzq.forEach(({ start, end }, i) => {
            const punto = puntos[start];
            const puntoFinal = puntos[end];
            const x = punto.x * lienzo.width;
            const y = punto.y * lienzo.height;
            //console.log(puntos);
            if (i === 0) {
              ctx2.moveTo(x, y);
            } else {
              ctx2.lineTo(x, y);
            }
          });

          contornoOjoDer.forEach(({ start }, i) => {
            const punto = puntos[start];
            const x = punto.x * lienzo.width;
            const y = punto.y * lienzo.height;
            if (i === 0) {
              ctx2.moveTo(x, y);
            } else {
              ctx2.lineTo(x, y);
            }
          }); */

          ctx2.fill();
        });
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(lienzo2, 0, 0);
        ctx.restore();
      }
    }

    reloj = requestAnimationFrame(espejitoEspejito);
  }
}

inicio().catch(console.error);

function escalar(camara: HTMLVideoElement) {
  lienzo.width = lienzo2.width = videoCargado.videoWidth;
  lienzo.height = lienzo2.height = videoCargado.videoHeight;
  ctx.fillStyle = '#e6f5ff';
  ctx2.fillStyle = 'black';
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
