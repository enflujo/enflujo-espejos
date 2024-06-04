import '../scss/estilos.scss';
import { iniciarCamara } from '../ayudas';
import { dimsCamara } from '../constantes';
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
// ellos si lo hicieron: https://codepen.io/SarahC/pen/maGzMG
async function inicio() {
  escalar();
  const dims = dimsCamara(0.5);
  console.log(dims);
  const camara = await iniciarCamara(dims.ancho, dims.alto);
  if (!camara) return;
  const guardarFotogramas = dims.alto / 60;
  const anchoVideo = camara.videoWidth;
  const altoVideo = camara.videoHeight;
  const tamañoRendija = 1;
  const numeroRendijas = Math.ceil(altoVideo / tamañoRendija);
  const rendijas: { lienzo: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D }[] = [];
  console.log(altoVideo, numeroRendijas);
  for (let i = 0; i < numeroRendijas; i += tamañoRendija) {
    const lienzoFuera = new OffscreenCanvas(ancho, alto);
    const ctx = lienzoFuera.getContext('2d') as OffscreenCanvasRenderingContext2D;
    rendijas.push({ lienzo: lienzoFuera, ctx });
  }
  let i = 0;
  let y = 0;
  let tiempoVideo = 0;
  let nuevoFotograma = false;
  let primeraFotoCompleta = true;
  const pasoAlto = altoVideo / alto;
  console.log(pasoAlto);
  const bucle = (tiempoActual: number) => {
    console.log;
    if (!nuevoFotograma) {
      if (camara.currentTime !== tiempoVideo) {
        //const y = i * tamañoRendija;
        rendijas[i].ctx.drawImage(camara, 0, 0, anchoVideo, altoVideo, 0, 0, ancho, alto);
        //ctx.drawImage(camara, 0, y, anchoVideo, 1, 0, y, ancho, 1);

        if (i < altoVideo - 1) {
          i++;
        } else {
          i = 0;
          nuevoFotograma = true;
          primeraFotoCompleta = true;
        }

        tiempoVideo = camara.currentTime;
      }
    }

    if (primeraFotoCompleta) {
      rendijas.forEach((rendija, i) => {
        ctx.drawImage(rendija.lienzo, 0, i, anchoVideo, 1, 0, i, ancho, pasoAlto);
      });
      nuevoFotograma = false;
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

function cambiarModo(m: Modos) {
  modo = m;
}
