import { useEffect, useState } from "react";
import { ChaoticAmazon } from "./pages/ChaoticAmazon";
import { ChaoticNews } from "./pages/ChaoticNews";
import { MicOverlay } from "./components/MicOverlay";
import { Toaster } from "./components/Toaster";
import { DiagnosticModal } from "./components/DiagnosticModal";
import { showToast } from "./components/Toaster";
import {
  DEFAULT_PROFILE,
  saveProfile,
  buildProfileBaseline,
  clearProfile,
} from "./lib/profile";
import { applyPlan, reset } from "./lib/engine";
import type { UserProfile } from "./lib/profile";

function getDemo() {
  return window.location.pathname.startsWith("/news") ? "news" : "amazon";
}

export default function App() {
  // Demo behavior: every page load starts with a fresh, uncalibrated profile.
  // This guarantees the "Calibrate for your needs" CTA is always visible
  // on reload, and no stale changes carry over between test runs.
  const [profile, setProfile] = useState<UserProfile>(() => ({ ...DEFAULT_PROFILE }));
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const demo = getDemo();

  // On mount: wipe any persisted profile from localStorage and clear any
  // DOM mutations left by HMR or a prior session.
  useEffect(() => {
    clearProfile();
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleProfileComplete(p: UserProfile) {
    saveProfile(p);
    setProfile(p);
    setDiagnosticOpen(false);
    reset();
    const baseline = buildProfileBaseline(p);
    if (baseline.actions.length > 0) {
      applyPlan(baseline);
      showToast(baseline.reason_short, "info");
    }
  }

  return (
    <>
      {demo === "news" ? <ChaoticNews /> : <ChaoticAmazon />}
      <Toaster />
      <MicOverlay
        profile={profile}
        onOpenDiagnostic={() => setDiagnosticOpen(true)}
      />
      {diagnosticOpen && (
        <DiagnosticModal
          initial={profile}
          onComplete={handleProfileComplete}
          onDismiss={() => setDiagnosticOpen(false)}
        />
      )}
    </>
  );
}
