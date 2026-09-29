"use client";

import { useState } from "react";
import { useEnvelopeSession } from "@/hooks/useEnvelopeSession";
import { EnvelopeScreen } from "@/components/core/EnvelopeScreen";
import { AudioController } from "@/components/core/AudioController";
import { LazyMount } from "@/components/core/LazyMount";
import { HeroSection } from "@/components/sections/HeroSection";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { ParentsSection } from "@/components/sections/ParentsSection";
import { ItinerarySection } from "@/components/sections/ItinerarySection";
import { CountdownSection } from "@/components/sections/CountdownSection";
import { SaveTheDateSection } from "@/components/sections/SaveTheDateSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { DressCodeSection } from "@/components/sections/DressCodeSection";
import { GiftRegistrySection } from "@/components/sections/GiftRegistrySection";
import { WhatsAppRsvpSection } from "@/components/sections/WhatsAppRsvpSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { invitationConfig } from "@/config/invitation";

const pageBackground = invitationConfig.visuals.pageBackground;

export default function Home() {
  const { isOpen, openEnvelope } = useEnvelopeSession();
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <>
      {/* Fondo único de TODA la invitación (pedido explícito): un `div`
          fijo detrás de <main>, y las secciones son transparentes. NO se usa
          `background-attachment: fixed`, que en iOS Safari no funciona o
          repinta todo el fondo en cada frame de scroll; un elemento fijo
          propio se compone una sola vez. */}
      {pageBackground && (
        <div
          aria-hidden="true"
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: `url("${pageBackground.replace("/upload/", "/upload/f_auto,q_auto,w_1600/")}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <EnvelopeScreen
        isOpen={isOpen}
        onOpen={openEnvelope}
        onStartOpen={() => setIsRevealed(true)}
        config={invitationConfig}
      />

      <main
        className={`min-h-screen ${isOpen ? "overflow-auto" : "h-screen overflow-hidden"}`}
      >
        {/* Hero eager; el resto con montaje diferido por viewport (ver
            LazyMount) para no pedir todas las imágenes en la primera carga. */}
        <HeroSection config={invitationConfig} isRevealed={isRevealed} />
        <LazyMount minHeight={560}>
          <QuoteSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={420}>
          <ParentsSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={1300}>
          <ItinerarySection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={520}>
          <CountdownSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={620}>
          <SaveTheDateSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={620}>
          <LocationSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={720}>
          <DressCodeSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={720}>
          <GiftRegistrySection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={700}>
          <WhatsAppRsvpSection config={invitationConfig} />
        </LazyMount>
        <LazyMount minHeight={360}>
          <FooterSection config={invitationConfig} />
        </LazyMount>
        {isOpen && (
          <AudioController
            src={invitationConfig.music.ambientTrack}
            colors={invitationConfig.theme.colors}
          />
        )}
      </main>
    </>
  );
}
