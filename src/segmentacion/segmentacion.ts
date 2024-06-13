import { InteractiveSegmenter, FilesetResolver, MPMask } from '@mediapipe/tasks-vision';

const demosSection = document.getElementById('demos');

let interactiveSegmenter: InteractiveSegmenter;

const lienzoImg = document.getElementById('lienzo') as HTMLCanvasElement;

// Before we can use InteractiveSegmenter class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createSegmenter = async () => {
  const filesetResolver = await FilesetResolver.forVisionTasks();
  interactiveSegmenter = await InteractiveSegmenter.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite`,
      delegate: 'GPU',
    },
    outputCategoryMask: true,
    outputConfidenceMasks: false,
  });
  demosSection?.classList.remove('invisible');
};
createSegmenter();

/********************************************************************
   // Demo 1: Grab a bunch of images from the page and detection them
   // upon click.
   ********************************************************************/

// In this demo, we have put all our clickable images in divs with the
// CSS class 'detectionOnClick'. Lets get all the elements that have
// this class.
const imageContainers = document.getElementsByClassName('detectOnClick');
const uploadFile = document.getElementById('uploadFile') as HTMLInputElement;
const imageUpload = document.getElementById('imageUpload') as HTMLImageElement;

// Handle the upload file event
uploadFile.addEventListener('change', uploadedImage, false);

function uploadedImage(event) {
  const reader = new FileReader();
  reader.onload = function () {
    const src = reader.result;

    if (!imageUpload) return;
    imageUpload.src = `${src}`;
    imageUpload.style.display = 'block';
    const canvas = imageUpload.parentElement?.getElementsByClassName('canvas-segmentation')[0] as HTMLCanvasElement;

    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    const clickPoint = imageUpload.parentElement?.getElementsByClassName('click-point')[0] as HTMLElement;
    clickPoint.style.display = 'none';
  };
  reader.readAsDataURL(event.target.files[0]);
}

// Handle clicks on the demo images
for (let i = 0; i < imageContainers.length; i++) {
  imageContainers[i].children[0].addEventListener('click', handleClick);
}

/**
 * Detect segmentation on click
 */
async function handleClick(event) {
  if (!interactiveSegmenter) {
    alert('InteractiveSegmenter still loading. Try again shortly.');
    return;
  }

  interactiveSegmenter.segment(
    event.target,
    {
      keypoint: {
        x: event.offsetX / event.target.width,
        y: event.offsetY / event.target.height,
      },
    },
    (result) => {
      if (!result.categoryMask) return;
      drawSegmentation(result.categoryMask, event.target.parentElement);
      drawClickPoint(event.target.parentElement, event);
    }
  );
}

/**
 * Draw segmentation result
 */
function drawSegmentation(mask: MPMask, targetElement: HTMLElement) {
  const width = mask.width;
  const height = mask.height;
  const maskData = mask.getAsFloat32Array();
  const canvas = targetElement.getElementsByClassName('canvas-segmentation')[0] as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;

  console.log('Start visualization');

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  if (!ctx) return;

  ctx.fillStyle = '#00000000';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(18, 181, 203, 0.7)';

  maskData.map((category, index) => {
    if (Math.round(category * 255.0) === 0) {
      const x = (index + 1) % width;
      const y = (index + 1 - x) / width;
      ctx.fillRect(x, y, 1, 1);
    }
  });
}

/**
 * Draw click point
 */
function drawClickPoint(targetElement: HTMLElement, event: MouseEvent) {
  const clickPoint = targetElement.getElementsByClassName('click-point')[0] as HTMLElement;
  clickPoint.style.top = `${event.offsetY - 8}px`;
  clickPoint.style.left = `${event.offsetX - 8}px`;
  clickPoint.style.display = 'block';
}

/* const img = document.getElementById('i') as HTMLImageElement;

img.src = './petro2.jpeg';
img.onload = function () {
  lienzoImg.width = img?.width;
  lienzoImg.height = img?.height;
  // ctxImg?.drawImage(img, 0, 0, img.width, img.height);
};

const ctxImg = lienzoImg?.getContext('2d') as CanvasRenderingContext2D;
ctxImg.drawImage(img, 0, 0);
const imageData = ctxImg.getImageData(0, 0, lienzoImg?.width, lienzoImg?.height);
const uint8ClampedArray = imageData.data;

console.log('img: ', imageData); */
