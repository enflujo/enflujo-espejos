// Basado en: https://webglfundamentals.org/webgl/lessons/webgl-qna-create-image-warping-effect-in-webgl.html

import '../scss/estilos.scss';
import { iniciarCamara } from '../ayudas';
type Modos = 'vertical' | 'horizontal';

const lienzo = document.getElementById('lienzo') as HTMLCanvasElement;
const ctx = lienzo.getContext('2d') as CanvasRenderingContext2D;
const opciones = document.getElementById('opciones') as HTMLUListElement;
const opcionVertical = document.getElementById('vertical') as HTMLLIElement;
const opcionhorizontal = document.getElementById('horizontal') as HTMLLIElement;
let modo: Modos = 'vertical';
let ancho = 0;
let alto = 0;

opcionVertical.onclick = () => {
  opciones.querySelector('.actual')?.classList.remove('actual');
  cambiarModo('vertical');
  opcionVertical.classList.add('actual');
};

opcionhorizontal.onclick = () => {
  opciones.querySelector('.actual')?.classList.remove('actual');
  cambiarModo('horizontal');
  opcionhorizontal.classList.add('actual');
};

inicio().catch(console.error);

async function inicio() {
  escalar();
  const camara = await iniciarCamara(ancho / 2, alto / 2);
  if (!camara) return;

  const anchoVideo = camara.videoWidth;
  const altoVideo = camara.videoHeight;

  const bucle = (tiempoActual: number) => {
    const t1 = tiempoActual * 0.001;
    const t2 = t1 * 0.37;

    if (modo === 'vertical') {
      for (let posY = 0; posY < alto; posY++) {
        const v = posY / alto;
        const intensidadOnda = 20; //  Math.random() * 20;
        const posY1 = Math.sin((v + 0.5) * mezclar(3, 12, moverY(t1))) * intensidadOnda;
        const posY2 = Math.sin((v + 0.5) * mezclar(3, 12, moverY(t2))) * intensidadOnda;
        const desplazamiento = posY1 + posY2;
        const _y = (posY * altoVideo) / alto + desplazamiento;

        // Contener y dentro del lienzo
        const y = Math.max(0, Math.min(altoVideo - 1, _y));

        // pintar una línea
        ctx.drawImage(camara, 0, y, anchoVideo, 1, 0, posY, ancho, 1);
      }
    } else if (modo === 'horizontal') {
      for (let posX = 0; posX < ancho; posX++) {
        const v = posX / ancho;
        const intensidadOnda = 80; //  Math.random() * 20;
        const posX1 = Math.cos((v + 0.5) * mezclar(3, 12, moverY(t1))) * intensidadOnda;
        const posX2 = Math.cos((v + 0.5) * mezclar(3, 12, moverY(t2))) * intensidadOnda;
        const desplazamiento = posX1 + posX2;
        const _x = (posX * anchoVideo) / ancho + desplazamiento;

        // Contener y dentro del lienzo
        const x = Math.max(0, Math.min(anchoVideo - 1, _x));

        // pintar una línea
        ctx.drawImage(camara, x, 0, 1, altoVideo, posX, 0, 1, alto);
      }
    }

    requestAnimationFrame(bucle);
  };

  requestAnimationFrame(bucle);

  window.addEventListener('resize', escalar);
}

function escalar() {
  ancho = lienzo.width = window.innerWidth;
  alto = lienzo.height = window.innerHeight;
}

function mezclar(a: number, b: number, l: number) {
  return a + (b - a) * l;
}

function moverY(v: number) {
  return Math.sin(v) * 0.5 + 0.5;
}

function cambiarModo(m: Modos) {
  modo = m;
}
