"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/imageCompressor";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { Ornament, OrnamentDivider } from "@/components/ui/Ornament";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

interface Photo {
  id: string;
  url_foto: string;
}

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const TABLE = "fotos_galeria_karen";
// Bucket compartido entre invitaciones -> cada foto va bajo `<id>/gallery/`.
const BUCKET = "invitation_assets";

// `crypto.randomUUID()` solo existe en contexto seguro (HTTPS o localhost);
// al probar desde el celular contra la IP local no existe. Este id solo
// evita colisiones de nombre de archivo, no necesita Web Crypto.
function randomFileId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Galería compartida -- misma lógica que xv-andrea-carolina: subida
 * directa a Storage (compresión client-side), fila en `fotos_galeria_karen`,
 * últimas 30 fotos, Realtime para que otros invitados las vean sin
 * refrescar + optimistic update para quien sube. Sin moderación (decisión
 * de la clienta): una foto indebida se borra a mano desde Supabase.
 *
 * Diseño Karen: título + ornamento dorado; las fotos se ven DENTRO del
 * marco ovalado dorado (`visuals.galleryFrame`), una a la vez, deslizando o
 * con flechas; la escalera de palacio subiendo hacia el marco y el espejo
 * de mano al costado; el botón de subir debajo.
 */
export function GallerySection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const folder = `${config.id}/gallery`;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from(TABLE)
      .select("id, url_foto")
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (active && data) setPhotos(data);
        if (active) setIsLoading(false);
      });

    const channel = supabase
      .channel(`${TABLE}_realtime`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          const photo = payload.new as Photo;
          setPhotos((prev) =>
            prev.some((p) => p.id === photo.id) ? prev : [photo, ...prev],
          );
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Lightbox abierta: bloquear el scroll del fondo y cerrar con Escape.
  useEffect(() => {
    if (!selected) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const count = photos.length;
  // `index` puede quedar fuera de rango tras un insert por Realtime.
  const current = count > 0 ? photos[Math.min(index, count - 1)] : null;
  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;

  const go = (dir: 1 | -1) => {
    if (count < 2) return;
    setDirection(dir);
    setIndex((safeIndex + dir + count) % count);
  };

  const handleUpload = async (rawFile: File) => {
    if (!rawFile.type.startsWith("image/")) {
      setStatus("error");
      setError("Solo se aceptan imágenes.");
      return;
    }

    setStatus("uploading");
    setError(null);

    // Una foto de celular de 5-8MB baja a ~1MB / 1200px antes de subirse.
    const file = await compressImage(rawFile);

    if (file.size > MAX_FILE_BYTES) {
      setStatus("error");
      setError("La imagen pesa demasiado (máximo 8MB).");
      return;
    }

    const path = `${folder}/${randomFileId()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file);
    if (uploadError) {
      setStatus("error");
      setError("No se pudo subir la foto. Intenta de nuevo.");
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);
    const { data: inserted, error: insertError } = await supabase
      .from(TABLE)
      .insert({ url_foto: publicUrl.publicUrl })
      .select("id, url_foto")
      .single();

    if (insertError) {
      setStatus("error");
      setError("La foto se subió pero no se pudo registrar. Intenta de nuevo.");
      return;
    }

    // Se agrega de una vez a la vista local -- no depende de que Realtime
    // esté habilitado para que quien subió vea su propia foto (el handler
    // de Realtime evita duplicarla si el evento también llega).
    if (inserted) {
      setPhotos((prev) =>
        prev.some((p) => p.id === inserted.id) ? prev : [inserted, ...prev],
      );
    }
    setDirection(1);
    setIndex(0);
    setStatus("idle");
  };

  return (
    <section className="relative pt-8 pb-16 px-6 flex flex-col items-center overflow-hidden">
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        <SectionHeader
          eyebrow="Captura el momento"
          title="Galería"
          colors={colors}
          // `mb-2!`: pisa el mb-8 propio de SectionHeader.
          className="mb-2!"
        />
        <OrnamentDivider src={ASSETS.ornamento} className="mb-3" />
        <p
          className="font-display italic text-lg md:text-xl leading-snug text-center mb-1 max-w-sm"
          style={{ color: colors.ink, opacity: 0.85 }}
        >
          Comparte tus fotos favoritas de la noche y construyamos juntos el
          álbum de recuerdos.
        </p>

        {/* Marco ovalado dorado (1000x1347 recortado). Hueco transparente
            medido sobre el asset: 18.6-82.3% del ancho, 16.6-79.4% del
            alto -> la foto va DETRÁS del marco, apenas más grande que el
            hueco para que el borde dorado la tape sin dejar aire. */}
        <div className="relative w-[min(68vw,320px)] aspect-[1000/1347]">
          {/* Escalera de palacio subiendo hacia el retrato por la izquierda
              (detrás del marco: el retrato queda "en lo alto"). Más baja
              que el marco, para que se separe de él sin salirse de la
              pantalla en móvil. */}
          <Ornament
            src={ASSETS.escaleras}
            className="-left-[42%] md:-left-[62%] -bottom-[18%] md:-bottom-[10%] w-[58%] md:w-[62%] aspect-square"
            sizes="(max-width: 768px) 45vw, 210px"
            motion="none"
          />
          {/* Espejo de mano al costado derecho del marco, inclinado. */}
          <div
            aria-hidden="true"
            className="absolute -right-15 md:-right-24 bottom-[2%] w-24 h-45 md:w-20 md:h-50 rotate-12 pointer-events-none"
          >
            {/* Flota (hijo propio: el wrapper ya tiene su `rotate`). */}
            <div className="absolute inset-0 animate-float-medium">
              <Image
                src={trimmedAsset(ASSETS.espejo, 300)}
                alt=""
                fill
                sizes="92px"
                className="object-contain"
              />
            </div>
          </div>

          <div
            className="absolute overflow-hidden rounded-[50%]"
            style={{
              left: "17.5%",
              top: "15.5%",
              width: "65.5%",
              height: "65%",
              background: `radial-gradient(ellipse at 50% 40%, ${colors.paper} 0%, ${colors.accentSoft} 100%)`,
            }}
          >
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <RotateCw
                  size={26}
                  className="animate-spin"
                  color={colors.accent}
                />
              </div>
            ) : !current ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-6 text-center">
                <Camera size={22} strokeWidth={1.3} color={colors.gold} />
                <p
                  className="font-script text-3xl md:text-4xl leading-tight"
                  style={{ color: colors.accent }}
                >
                  Tus recuerdos
                </p>
                <p
                  className="font-display italic text-sm md:text-base leading-snug"
                  style={{ color: colors.ink, opacity: 0.7 }}
                >
                  aparecerán aquí. ¡Sé el primero!
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false} custom={direction}>
                <motion.button
                  type="button"
                  key={current.id}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: `${d * -100}%`, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  drag={count > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) go(1);
                    else if (info.offset.x > 60) go(-1);
                  }}
                  onClick={() => setSelected(current.url_foto)}
                  aria-label="Ampliar foto"
                  className="absolute inset-0 cursor-zoom-in"
                >
                  {/* Foto de invitado: URL dinámica de Storage, next/image no aplica */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.url_foto}
                    alt="Recuerdo de la fiesta"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </motion.button>
              </AnimatePresence>
            )}
          </div>

          <div className="absolute inset-0 pointer-events-none">
            {config.visuals.galleryFrame && (
              <Image
                src={trimmedAsset(config.visuals.galleryFrame, 700)}
                alt=""
                fill
                sizes="330px"
                className="object-contain"
              />
            )}
          </div>
        </div>

        {count > 1 && (
          <div className="flex items-center gap-6 mt-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="w-11 h-11 rounded-full flex items-center justify-center border-[1.5px]"
              style={{
                borderColor: colors.gold,
                color: colors.accent,
                backgroundColor: "rgba(255,255,255,0.85)",
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className="font-mono text-xs tracking-widest"
              style={{ color: colors.accent }}
            >
              {safeIndex + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="w-11 h-11 rounded-full flex items-center justify-center border-[1.5px]"
              style={{
                borderColor: colors.gold,
                color: colors.accent,
                backgroundColor: "rgba(255,255,255,0.85)",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
        {count > 0 && (
          <p
            className="font-sans text-[0.6rem] uppercase tracking-[0.2em] mt-3"
            style={{ color: colors.ink, opacity: 0.55 }}
          >
            Toca la foto para ampliarla
          </p>
        )}

        <label
          className="mt-6 flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-sans text-[0.7rem] uppercase tracking-[0.25em] font-semibold shadow-md cursor-pointer transition-opacity"
          style={{
            backgroundColor: colors.accent,
            color: colors.paper,
            boxShadow: `0 10px 22px ${colors.accent}40`,
            opacity: status === "uploading" ? 0.7 : 1,
          }}
        >
          {status === "uploading" ? (
            <>
              <RotateCw size={15} className="animate-spin" /> Subiendo foto...
            </>
          ) : (
            <>
              <Camera size={15} /> Subir una foto
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={status === "uploading"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
        </label>
        <p
          role="alert"
          className="min-h-5 mt-2 font-sans text-xs text-center"
          style={{ color: "#B3261E" }}
        >
          {error}
        </p>
      </div>

      {/* Lightbox portaleada a <body>: relativa al viewport, no a la
          sección (`overflow-hidden`). */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {selected && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Foto ampliada"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                style={{ backgroundColor: "rgba(0,0,0,0.9)" }}
                onClick={() => setSelected(null)}
              >
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                  }}
                  onClick={() => setSelected(null)}
                >
                  <X size={20} />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected}
                  alt="Foto ampliada"
                  className="max-w-full max-h-[85vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
