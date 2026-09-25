/**
 * Voice & Speech Transcription Service for Karigar Setu
 * Primary Engine: Microphone -> MediaRecorder -> Gemini Audio AI Multimodal Transcription
 * Optional Fallback: Web Speech API & Graceful Manual Typing
 */

import { getSpeechLocale, getSpeechRecognitionClass } from '../utils/speechRecognition';

export interface AudioRecordingSession {
  stop: () => Promise<{ blob: Blob; base64: string; mimeType: string }>;
  cancel: () => void;
}

/**
 * Detect supported audio MIME type for MediaRecorder in the current browser
 */
export function getSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'audio/webm';
  }
  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
    'audio/aac',
  ];

  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

/**
 * Convert Blob to Base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract pure base64
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Start recording microphone audio using MediaRecorder
 */
export async function startMediaRecording(
  onTimeUpdate?: (seconds: number) => void,
  maxDurationSeconds: number = 25
): Promise<AudioRecordingSession> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone access is not supported in this browser.');
  }

  // Request audio stream with echo cancellation and noise suppression
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const mimeType = getSupportedAudioMimeType();
  const mediaRecorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);

  const chunks: BlobPart[] = [];
  let startTime = Date.now();
  let timerInterval: any = null;
  let autoStopTimer: any = null;

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const cleanupTracks = () => {
    if (timerInterval) clearInterval(timerInterval);
    if (autoStopTimer) clearTimeout(autoStopTimer);
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {
        // Ignored
      }
    });
  };

  // Start timer tick
  if (onTimeUpdate) {
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      onTimeUpdate(elapsed);
    }, 500);
  }

  mediaRecorder.start(250); // Slice into 250ms chunks

  const stopPromise = new Promise<{ blob: Blob; base64: string; mimeType: string }>(
    (resolve, reject) => {
      mediaRecorder.onstop = async () => {
        cleanupTracks();
        try {
          const finalMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
          const audioBlob = new Blob(chunks, { type: finalMime });
          if (audioBlob.size === 0) {
            reject(new Error("We couldn't hear anything. Please try again."));
            return;
          }
          const base64 = await blobToBase64(audioBlob);
          resolve({
            blob: audioBlob,
            base64,
            mimeType: finalMime,
          });
        } catch (err) {
          reject(err);
        }
      };

      mediaRecorder.onerror = (event: any) => {
        cleanupTracks();
        reject(new Error(event?.error?.message || 'Audio recording failed.'));
      };
    }
  );

  // Auto-stop safety timeout so UI never hangs indefinitely
  autoStopTimer = setTimeout(() => {
    if (mediaRecorder.state === 'recording') {
      try {
        mediaRecorder.stop();
      } catch {
        // Ignored
      }
    }
  }, maxDurationSeconds * 1000);

  return {
    stop: async () => {
      if (mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      return stopPromise;
    },
    cancel: () => {
      cleanupTracks();
      if (mediaRecorder.state === 'recording') {
        try {
          mediaRecorder.stop();
        } catch {
          // Ignored
        }
      }
    },
  };
}

/**
 * Send recorded audio to AI transcription endpoint
 */
export async function transcribeAudioWithAI(
  audioBase64: string,
  mimeType: string,
  languageCode: string = 'en'
): Promise<{ success: boolean; transcript: string; error?: string }> {
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioBase64,
        mimeType,
        languageHint: languageCode,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.transcript && data.transcript.trim()) {
        return {
          success: true,
          transcript: data.transcript.trim(),
        };
      }
    }
  } catch (err) {
    console.warn('AI Audio Transcription endpoint unreachable, falling back...', err);
  }

  return {
    success: false,
    transcript: '',
    error: 'Voice input is temporarily unavailable. You can type your message instead.',
  };
}
