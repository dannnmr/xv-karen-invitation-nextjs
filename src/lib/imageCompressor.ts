import imageCompression from "browser-image-compression";

/**
 * Comprime una imagen del lado del cliente antes de subirla a Storage.
 * Patrón ya validado en proyectos previos (P2/P3/P5) -- usa un Web Worker
 * para no bloquear el hilo principal. Si falla, degrada con gracia
 * devolviendo el archivo original (no bloquea la subida).
 */
export async function compressImage(file: File, maxWidthOrHeight = 1200, maxSizeMB = 1): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    const compressedBlob = await imageCompression(file, { maxSizeMB, maxWidthOrHeight, useWebWorker: true });
    const nameWithoutExtension = file.name.replace(/\.[^./]+$/, "");
    return new File([compressedBlob], `${nameWithoutExtension}_compressed.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("compressImage: la compresión falló, se sube el archivo original", error);
    return file;
  }
}
