import { useState, useRef, useCallback, useEffect } from 'react';
import {
  getSpeechRecognitionClass,
  getSpeechErrorMessage,
  getSpeechLocale,
  getSpeakInLanguageLabel,
  getListeningLabel,
  getTryAgainLabel,
  getTypeInsteadLabel,
  getStopLabel,
  isSpeechRecognitionSupported,
} from '../utils/speechRecognition';

export interface UseLanguageAwareVoiceRecognitionOptions {
  currentLang?: string;
  onFinalResult?: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onAutoSubmit?: (transcript: string) => void;
}

export function useLanguageAwareVoiceRecognition(options: UseLanguageAwareVoiceRecognitionOptions = {}) {
  const { currentLang = 'en', onFinalResult, onInterimResult, onAutoSubmit } = options;

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalAccumulatedRef = useRef<string>('');
  const isListeningRef = useRef<boolean>(false);
  const currentLangRef = useRef<string>(currentLang);

  // Keep refs in sync
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    currentLangRef.current = currentLang;
  }, [currentLang]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignored
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    // 1. If existing recognition is running, stop it first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignored
      }
      recognitionRef.current = null;
    }

    setVoiceError(null);
    setInterimTranscript('');
    finalAccumulatedRef.current = '';

    // 2. Check browser support
    const SpeechRecognitionClass = getSpeechRecognitionClass();
    if (!SpeechRecognitionClass) {
      const msg = getSpeechErrorMessage('language-not-supported', currentLangRef.current);
      setVoiceError(msg);
      return;
    }

    try {
      // 3. Create fresh SpeechRecognition instance configured for the selected language
      const recognition = new SpeechRecognitionClass();
      const locale = getSpeechLocale(currentLangRef.current);
      recognition.lang = locale;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // 4. Attach lifecycle listeners
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            final += text + ' ';
          } else {
            interim += text + ' ';
          }
        }

        const trimmedFinal = final.trim();
        const trimmedInterim = interim.trim();

        if (trimmedFinal) {
          finalAccumulatedRef.current = trimmedFinal;
          setFinalTranscript(trimmedFinal);
          onFinalResult?.(trimmedFinal);
        }

        if (trimmedInterim) {
          setInterimTranscript(trimmedInterim);
          onInterimResult?.(trimmedInterim);
        }
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        console.warn(`Speech Recognition (${recognition.lang}) notice:`, err);
        setIsListening(false);

        if (err === 'aborted') {
          // User intentionally stopped or switched, do not show error
          return;
        }

        const message = getSpeechErrorMessage(err, currentLangRef.current);
        setVoiceError(message);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;

        // If we captured a final transcript upon natural completion, notify auto-submit if handler present
        const finalRecorded = finalAccumulatedRef.current.trim();
        if (finalRecorded && onAutoSubmit) {
          onAutoSubmit(finalRecorded);
        }
      };

      recognitionRef.current = recognition;

      // 5. Start listening exactly once
      recognition.start();
    } catch (err: any) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      const message = getSpeechErrorMessage(undefined, currentLangRef.current);
      setVoiceError(message);
    }
  }, [onFinalResult, onInterimResult, onAutoSubmit]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  const clearError = useCallback(() => {
    setVoiceError(null);
  }, []);

  const resetTranscript = useCallback(() => {
    setInterimTranscript('');
    setFinalTranscript('');
    finalAccumulatedRef.current = '';
    setVoiceError(null);
  }, []);

  return {
    isListening,
    interimTranscript,
    finalTranscript,
    voiceError,
    speakPromptLabel: getSpeakInLanguageLabel(currentLang),
    listeningLabel: getListeningLabel(currentLang),
    tryAgainLabel: getTryAgainLabel(currentLang),
    typeInsteadLabel: getTypeInsteadLabel(currentLang),
    stopLabel: getStopLabel(currentLang),
    currentLocale: getSpeechLocale(currentLang),
    startListening,
    stopListening,
    toggleListening,
    clearError,
    resetTranscript,
    isSupported: isSpeechRecognitionSupported(),
  };
}

// Export backwards-compatible alias for existing imports
export const useHindiVoiceRecognition = useLanguageAwareVoiceRecognition;
export type UseHindiVoiceRecognitionOptions = UseLanguageAwareVoiceRecognitionOptions;


