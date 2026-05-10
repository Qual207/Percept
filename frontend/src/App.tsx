import { useState, useEffect } from "react";
import { ChaoticAmazon } from "./pages/ChaoticAmazon";
import { MicOverlay } from "./components/MicOverlay";
import { Toaster } from "./components/Toaster";
import { DiagnosticModal } from "./components/DiagnosticModal";
import { showToast } from "./components/Toaster";
import { loadProfile, saveProfile, buildProfileBaseline } from "./lib/profile";
import { applyPlan, reset } from "./lib/engine";
import type { UserProfile } from "./lib/profile";

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // On mount: always start completely fresh — clear any DOM mutations left
  // by HMR or a previous session. Profile preferences are NOT auto-applied
  // here; they only take effect when the user explicitly completes the form.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — only runs on first mount

  function handleProfileComplete(p: UserProfile) {
    saveProfile(p);
    setProfile(p);
    setDiagnosticOpen(false);

    // Reset any previously applied engine state, then immediately apply
    // the new profile as a visual baseline so the user sees the effect
    // of their choices right away — not just on future voice requests.
    reset();
    const baseline = buildProfileBaseline(p);
    if (baseline.actions.length > 0) {
      applyPlan(baseline);
      showToast(baseline.reason_short, "info");
    }
  }

  return (
    <>
      <ChaoticAmazon />
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
