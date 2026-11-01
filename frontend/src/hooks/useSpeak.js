import { useCallback, useEffect, useState } from "react";

export default function useSpeak() {
  const [voices, setVoices] = useState([]);
  const available =
    typeof window !== "undefined" &&
    Boolean(window.speechSynthesis) &&
    voices.some((voice) => voice.lang?.toLowerCase().startsWith("ko"));

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return undefined;
    }

    const speechSynthesis = window.speechSynthesis;
    const updateVoices = () => setVoices(speechSynthesis.getVoices());

    updateVoices();
    speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    };
  }, []);

  const speak = useCallback(
    (text) => {
      if (
        typeof window === "undefined" ||
        !window.speechSynthesis ||
        typeof window.SpeechSynthesisUtterance !== "function" ||
        !text
      ) {
        return;
      }

      const speechSynthesis = window.speechSynthesis;
      const utterance = new window.SpeechSynthesisUtterance(text);
      const koreanVoice = voices.find((voice) =>
        voice.lang?.toLowerCase().startsWith("ko"),
      );
      if (!koreanVoice) return;

      utterance.lang = "ko-KR";
      utterance.rate = 0.9;
      utterance.voice = koreanVoice;

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    },
    [voices],
  );

  return { speak, available };
}
