export interface GeneratedStory {
  text: string;
  title?: string;
}

export interface GenerationState {
  status: 'idle' | 'analyzing' | 'writing' | 'speaking' | 'complete' | 'error';
  message?: string;
}

export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}
