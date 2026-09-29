import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.31"],

  images: {
    // `next/image` NO pasa por el optimizador de Next: usa el loader custom
    // (src/lib/cloudinaryLoader.ts), que pide directo al CDN de Cloudinary
    // con `f_auto,q_auto,w_`. Cloudinary ya es un CDN global con transform
    // on-the-fly; meterlo detrás de `/_next/image` era el cuello de botella
    // de la primera carga. `remotePatterns` queda por si algún día se agrega
    // un <Image> que sí quiera el optimizador local.
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
