"use client";

import { useEffect, useState } from "react";
import { Smartphone, Share2, PlusSquare, ArrowRight, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function checkIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth <= 767 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

function checkIsIos(): boolean {
  if (typeof window === "undefined") return false;
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function checkShouldShow(): boolean {
  if (typeof window === "undefined") return false;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return false;
  const alreadyDone = localStorage.getItem("jnanana_pwa_installed_v1");
  if (alreadyDone) return false;
  return checkIsMobile();
}

export function InstallPwaModal() {
  const [show, setShow] = useState<boolean>(() => checkShouldShow());
  const [isIos] = useState<boolean>(() => checkIsIos());
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !show) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [show]);

  if (!show) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("jnanana_pwa_installed_v1", "true");
    setShow(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(20, 18, 16, 0.85)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#F6EBDB",
          border: "2px solid #141210",
          boxShadow: "6px 6px 0 #141210",
          padding: "24px 20px",
          color: "#141210",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span
            style={{
              background: "#0B6B44",
              color: "#FFFFFF",
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "4px 10px",
              border: "1.5px solid #141210",
              boxShadow: "2px 2px 0 #141210",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "inline-block",
              marginBottom: "12px",
            }}
          >
            ⚡ First-Time Mobile Setup
          </span>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 6px", color: "#141210" }}>
            Add Jnanana App to Phone
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#6A675F", margin: 0, lineHeight: 1.4 }}>
            Install Jnanana as a fast, 1-tap mobile app on your home screen.
          </p>
        </div>

        {/* Android / Chrome native prompt button */}
        {!isIos && deferredPrompt && (
          <div style={{ margin: "20px 0", textAlign: "center" }}>
            <button
              type="button"
              onClick={handleInstallClick}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "#F5B921",
                color: "#141210",
                fontWeight: 800,
                fontSize: "0.95rem",
                border: "1.5px solid #141210",
                boxShadow: "3px 3px 0 #141210",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <Smartphone size={20} /> Install App Now 🚀
            </button>
          </div>
        )}

        {/* Success message if installed */}
        {installed && (
          <div
            style={{
              margin: "16px 0",
              padding: "12px",
              background: "#0B6B44",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1.5px solid #141210",
            }}
          >
            <CheckCircle2 size={18} /> Jnanana App successfully added to your home screen!
          </div>
        )}

        {/* iOS Safari step-by-step instructions */}
        {isIos && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #141210",
              padding: "16px",
              margin: "16px 0",
              fontSize: "0.85rem",
              color: "#141210",
            }}
          >
            <strong style={{ display: "block", marginBottom: "10px", fontSize: "0.9rem" }}>
              🍏 Safari on iOS Instructions:
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#F5B921",
                    border: "1.5px solid #141210",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  1
                </div>
                <span>
                  Tap the <strong>Share</strong> button <Share2 size={16} style={{ display: "inline", verticalAlign: "middle" }} /> at the bottom of Safari.
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#F5B921",
                    border: "1.5px solid #141210",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  2
                </div>
                <span>
                  Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={16} style={{ display: "inline", verticalAlign: "middle" }} />.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* General fallback instructions for standard browsers */}
        {!isIos && !deferredPrompt && !installed && (
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #141210",
              padding: "14px",
              margin: "16px 0",
              fontSize: "0.85rem",
              color: "#6A675F",
              lineHeight: 1.4,
            }}
          >
            <strong style={{ color: "#141210", display: "block", marginBottom: "4px" }}>
              🌐 Add via Browser Menu:
            </strong>
            Tap your browser menu (⋮) and select <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
          </div>
        )}

        {/* Completion Action */}
        <button
          type="button"
          onClick={handleComplete}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "12px 18px",
            background: "#0B6B44",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.9rem",
            border: "1.5px solid #141210",
            boxShadow: "3px 3px 0 #141210",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span>Continue to Jnanana</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
