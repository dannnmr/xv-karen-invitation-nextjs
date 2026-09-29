"use client";

import { useState } from "react";

/**
 * Decisión de producto aprobada para esta invitación: apertura = "always".
 * A diferencia de los 4 proyectos de referencia (donde la falta de
 * persistencia era un defecto no resuelto), aquí es intencional: el sobre
 * se muestra siempre, en cada carga. No se agrega sessionStorage/localStorage
 * a propósito.
 */
export function useEnvelopeSession() {
  const [isOpen, setIsOpen] = useState(false);

  const openEnvelope = () => setIsOpen(true);

  return { isOpen, openEnvelope };
}
