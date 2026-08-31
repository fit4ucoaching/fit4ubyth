import { Audio } from "expo-av";
import { useRef, useState } from "react";

/** Enregistrement vocal court pour le message vocal Teddy (Volume 4 : "voix"). */
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async (): Promise<void> => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") return;

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    recordingRef.current = recording;
    setIsRecording(true);
  };

  const stopRecording = async (): Promise<FormData | null> => {
    const recording = recordingRef.current;
    if (!recording) return null;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    recordingRef.current = null;
    if (!uri) return null;

    const formData = new FormData();
    formData.append("audio", { uri, name: "voice-message.m4a", type: "audio/m4a" } as unknown as Blob);
    return formData;
  };

  return { isRecording, startRecording, stopRecording };
}
