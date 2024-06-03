/**
 * Resolución de la cámara en su máxima resolución
 */
const camaraMaxRes = { ancho: 1920, alto: 1080 };

/**
 * Pedir dimensiones de la cámara
 *
 * @param escala Valor de 0 a 1 para escalar la resolución. 1 es máxima resolución.
 * @returns Objeto dims
 */
export const dimsCamara = (escala = 1) => {
  return {
    ancho: camaraMaxRes.ancho * escala,
    alto: camaraMaxRes.alto * escala,
  };
};
