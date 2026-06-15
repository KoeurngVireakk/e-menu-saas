const muteKey = "emenu.kitchen.soundMuted";

export function getKitchenSoundMuted() {
  return localStorage.getItem(muteKey) === "1";
}

export function setKitchenSoundMuted(muted) {
  localStorage.setItem(muteKey, muted ? "1" : "0");
}

export function playKitchenBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return Promise.reject(new Error("Audio is not supported."));
  }

  const audio = new AudioContextClass();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + 0.18);

  return audio.resume().finally(() => {
    window.setTimeout(() => audio.close(), 250);
  });
}
