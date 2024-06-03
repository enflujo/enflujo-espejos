export async function iniciarCamara(ancho = 180, alto = 320): Promise<HTMLVideoElement | null> {
  const camara = (document.getElementById('camara') as HTMLVideoElement) || document.createElement('video');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Tu explorador no tiene acceso a la cámara web');
  }

  const videoConfig = {
    audio: false,
    video: {
      facingMode: 'user',
      width: ancho,
      height: alto,
      frameRate: { ideal: 60 },
    },
  };

  const stream = await navigator.mediaDevices.getUserMedia(videoConfig);
  camara.srcObject = stream;

  camara.play();

  return new Promise((resolve) => {
    camara.onloadedmetadata = () => {
      resolve(camara);
    };
  });
}
