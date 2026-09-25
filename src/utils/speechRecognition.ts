/**
 * Native Browser Speech Recognition Utility for Karigar Setu
 * Language-Aware Speech Recognition for 26 Indian Languages using Web Speech API
 */

import { INDIAN_LANGUAGES } from '../i18n/languages';

export function getSpeechRecognitionClass(): any {
  if (typeof window === 'undefined') return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionClass());
}

/**
 * Standard BCP-47 locale mapping for Indian Languages
 */
export const LANGUAGE_VOICE_LOCALES: Record<string, string> = {
  en: 'en-IN',   // English (India)
  hi: 'hi-IN',   // Hindi
  mr: 'mr-IN',   // Marathi
  bn: 'bn-IN',   // Bengali
  ta: 'ta-IN',   // Tamil
  te: 'te-IN',   // Telugu
  gu: 'gu-IN',   // Gujarati
  kn: 'kn-IN',   // Kannada
  ml: 'ml-IN',   // Malayalam
  pa: 'pa-IN',   // Punjabi
  or: 'or-IN',   // Odia
  as: 'as-IN',   // Assamese
  ur: 'ur-IN',   // Urdu
  sa: 'sa-IN',   // Sanskrit
  kok: 'kok-IN', // Konkani
  ne: 'ne-NP',   // Nepali
  ks: 'ks-IN',   // Kashmiri
  sd: 'sd-IN',   // Sindhi
  mai: 'mai-IN', // Maithili
  doi: 'doi-IN', // Dogri
  brx: 'brx-IN', // Bodo
  mni: 'mni-IN', // Manipuri
  sat: 'sat-IN', // Santali
  bho: 'bho-IN', // Bhojpuri
  hne: 'hne-IN', // Chhattisgarhi
  raj: 'raj-IN', // Rajasthani
};

/**
 * Maps each language code to its standard BCP-47 speech recognition locale tag
 */
export function getSpeechLocale(langCode?: string): string {
  const code = langCode || 'en';
  return LANGUAGE_VOICE_LOCALES[code] || `${code}-IN`;
}

/**
 * Localized "Speak in [Language]" prompt strings
 */
export function getSpeakInLanguageLabel(langCode?: string): string {
  const code = langCode || 'en';
  const langObj = INDIAN_LANGUAGES.find((l) => l.code === code);
  const native = langObj?.nativeName || 'your language';

  const localizedPrompts: Record<string, string> = {
    en: '🎙️ Speak in English',
    hi: '🎙️ हिंदी में बोलें',
    mr: '🎙️ मराठीत बोला',
    bn: '🎙️ বাংলায় বলুন',
    ta: '🎙️ தமிழில் பேசுங்கள்',
    te: '🎙️ తెలుగులో మాట్లాడండి',
    gu: '🎙️ ગુજરાતીમાં બોલો',
    kn: '🎙️ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ',
    ml: '🎙️ മലയാളത്തിൽ സംസാരിക്കൂ',
    pa: '🎙️ ਪੰਜਾਬੀ ਵਿੱਚ ਬੋਲੋ',
    or: '🎙️ ଓଡ଼ିଆରେ କୁହନ୍ତୁ',
    as: '🎙️ অসমীয়াত কওক',
    ur: '🎙️ اردو میں بولیں',
    sa: '🎙️ संस्कृते वदतु',
    kok: '🎙️ कोंकणीत उलययात',
    ne: '🎙️ नेपालीमा बोल्नुहोस्',
    bho: '🎙️ भोजपुरी में बोलीं',
    hne: '🎙️ छत्तीसगढ़ी म गोठियाव',
    raj: '🎙️ राजस्थानी में बोलो',
    mai: '🎙️ मैथिली मे बाजू',
  };

  return localizedPrompts[code] || `🎙️ Speak in ${native}`;
}

/**
 * Localized "Listening in [Language]..." listening status label
 */
export function getListeningLabel(langCode?: string): string {
  const code = langCode || 'en';
  const langObj = INDIAN_LANGUAGES.find((l) => l.code === code);
  const native = langObj?.nativeName || 'your language';

  const labels: Record<string, string> = {
    en: '🔴 Listening...',
    hi: '🔴 सुन रहा हूँ...',
    mr: '🔴 ऐकत आहे...',
    bn: '🔴 শুনছি...',
    ta: '🔴 கேட்கிறது...',
    te: '🔴 వింటున్నాము...',
    gu: '🔴 સાંભળી રહ્યા છીએ...',
    kn: '🔴 ಕೇಳುತ್ತಿದ್ದೇವೆ...',
    ml: '🔴 കേൾക്കുന്നു...',
    pa: '🔴 ਸੁਣ ਰਹੇ ਹਾਂ...',
    or: '🔴 ଶୁଣୁଛୁ...',
    as: '🔴 শুনি আছো...',
    ur: '🔴 سن رہے ہیں...',
    sa: '🔴 शृण्वन् अस्मि...',
    kok: '🔴 आयकता...',
    ne: '🔴 सुन्दैछु...',
    bho: '🔴 सुन रहल बानी...',
    hne: '🔴 सुनत हवंव...',
    raj: '🔴 सुण रह्या हां...',
    mai: '🔴 सुनि रहल छी...',
  };

  return labels[code] || `🔴 Listening in ${native}...`;
}

/**
 * Localized "Try Again" button label
 */
export function getTryAgainLabel(langCode?: string): string {
  const code = langCode || 'en';
  const labels: Record<string, string> = {
    en: '🎙️ Try Again',
    hi: '🎙️ फिर से प्रयास करें',
    mr: '🎙️ पुन्हा प्रयत्न करा',
    bn: '🎙️ আবার চেষ্টা করুন',
    ta: '🎙️ மீண்டும் முயற்சிக்கவும்',
    te: '🎙️ మళ్లీ ప్రయత్నించండి',
    gu: '🎙️ ફરી પ્રયાસ કરો',
    kn: '🎙️ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    ml: '🎙️ വീണ്ടും ശ്രമിക്കുക',
    pa: '🎙️ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    or: '🎙️ ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ',
    as: '🎙️ পুনৰ চেষ্টা কৰক',
    ur: '🎙️ دوبارہ کوشش کریں',
  };
  return labels[code] || '🎙️ Try Again';
}

/**
 * Localized "Type Instead" button label
 */
export function getTypeInsteadLabel(langCode?: string): string {
  const code = langCode || 'en';
  const labels: Record<string, string> = {
    en: '⌨️ Type Instead',
    hi: '⌨️ टाइप करें',
    mr: '⌨️ टाईप करा',
    bn: '⌨️ টাইপ করুন',
    ta: '⌨️ தட்டச்சு செய்யவும்',
    te: '⌨️ టైప్ చేయండి',
    gu: '⌨️ ટાઇપ કરો',
    kn: '⌨️ ಟೈಪ್ ಮಾಡಿ',
    ml: '⌨️ ടൈപ്പ് ചെയ്യുക',
    pa: '⌨️ ਟਾਈਪ ਕਰੋ',
    or: '⌨️ ଟାଇପ୍ କରନ୍ତୁ',
    as: '⌨️ টাইপ কৰক',
    ur: '⌨️ ٹائپ کریں',
  };
  return labels[code] || '⌨️ Type Instead';
}

/**
 * Localized "Stop" button label
 */
export function getStopLabel(langCode?: string): string {
  const code = langCode || 'en';
  const labels: Record<string, string> = {
    en: 'Stop',
    hi: 'रोकें',
    mr: 'थांबवा',
    bn: 'থামান',
    ta: 'நிறுத்து',
    te: 'ఆపు',
    gu: 'રોકો',
    kn: 'ನಿಲ್ಲಿಸಿ',
    ml: 'നിർത്തുക',
    pa: 'ਰੋਕੋ',
    or: 'ରୋକନ୍ତୁ',
    as: 'ৰখাওক',
    ur: 'روکیں',
  };
  return labels[code] || 'Stop';
}

/**
 * Artisan-friendly error messages localized per selected language
 */
export function getSpeechErrorMessage(errorCode?: string, langCode: string = 'en'): string {
  const code = langCode || 'en';

  if (errorCode === 'not-allowed') {
    if (code === 'hi') {
      return 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया माइक्रोफ़ोन की अनुमति दें या लिखकर भेजें।';
    }
    if (code === 'mr') {
      return 'मायक्रोफोनची परवानगी मिळाली नाही. कृपया परवानगी द्या किंवा लिहून पाठवा.';
    }
    if (code === 'bn') {
      return 'মাইক্রোফোনের অনুমতি পাওয়া যায়নি। অনুগ্রহ করে অনুমতি দিন অথবা টাইপ করুন।';
    }
    return 'Microphone permission was not granted. Please allow microphone access or type below.';
  }

  if (errorCode === 'no-speech') {
    if (code === 'hi') {
      return 'कोई आवाज़ सुनाई नहीं दी। कृपया माइक दबाकर दोबारा बोलें।';
    }
    if (code === 'mr') {
      return 'कोणताही आवाज ऐकू आला नाही. कृपया माइक दाबून पुन्हा बोला.';
    }
    if (code === 'bn') {
      return 'কোনো শব্দ শোনা যায়নি। দয়া করে মাইক চেপে আবার বলুন।';
    }
    return 'No voice was heard. Please tap the microphone and speak again.';
  }

  if (errorCode === 'language-not-supported') {
    if (code === 'hi') {
      return 'इस ब्राउज़र में इस भाषा के लिए आवाज़ पहचान उपलब्ध नहीं है। आप लिखकर भेज सकते हैं।';
    }
    if (code === 'mr') {
      return 'या ब्राउझरमध्ये या भाषेसाठी व्हॉइस इनपुट उपलब्ध नाही. आपण टाईप करू शकता.';
    }
    if (code === 'bn') {
      return 'এই ব্রাউজারে এই ভাষার জন্য ভয়েস ইনপুট উপলব্ধ নয়। আপনি টাইপ করতে পারেন।';
    }
    return 'Voice input is not available for this language on this browser. You can type instead.';
  }

  // Graceful fallback
  if (code === 'hi') {
    return 'आवाज़ पहचानने में समस्या हुई। कृपया दोबारा प्रयास करें।';
  }
  if (code === 'mr') {
    return 'आवाज ओळखण्यात समस्या आली. कृपया पुन्हा प्रयत्न करा.';
  }
  if (code === 'bn') {
    return 'ভয়েস শনাক্তকরণে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।';
  }
  return 'Voice recognition encountered an issue. Please try again or type instead.';
}



