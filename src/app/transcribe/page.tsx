// app/transcribe/page.tsx
// Page for Audio Recording - No CSS right now
import SimpleAudioRecorder from "@/components/SimpleAudioRecorder";

export default function TranscribePage() {
  return (
    <div>
      <h1>Audio Transcription</h1>
      <SimpleAudioRecorder />
    </div>
  );
}
