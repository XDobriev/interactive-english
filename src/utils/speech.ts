/**
 * Web Speech API speech synthesis utility.
 * Delivers natural pronunciation of English words and phrases with custom accents and rate.
 */

export function speakEnglish(
  text: string, 
  options: { 
    lang?: 'en-US' | 'en-GB'; 
    rate?: number; 
    pitch?: number;
    onEnd?: () => void;
  } = {}
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'en-US';
  utterance.rate = options.rate ?? 0.88; // Slightly slower than natural for learner clarity
  utterance.pitch = options.pitch ?? 1.0;

  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }

  // Attempt to select the best available natural English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (v) => (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) &&
           (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
  );

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopEnglishSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
