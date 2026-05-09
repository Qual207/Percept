import { ChaoticAmazon } from "./pages/ChaoticAmazon";
import { MicOverlay } from "./components/MicOverlay";
import { Toaster } from "./components/Toaster";

export default function App() {
  return (
    <>
      <ChaoticAmazon />
      <Toaster />
      <MicOverlay />
    </>
  );
}
