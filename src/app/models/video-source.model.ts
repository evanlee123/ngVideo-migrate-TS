export interface VideoSource {
  type: string;
  src: string;
}

export interface VideoOptions {
  RESTRICT: string;
  REFRESH: number;
  SCREEN_DIRECTIVE: string;
  SCREEN_CHANGE: boolean;
  TIMELINE_CHANGE: boolean;
  VOLUME_STEPS: number;
  VOLUME_MINIMUM: number;
  VOLUME_MAXIMUM: number;
  BUFFER_COLOUR: string;
  BUFFER_HEIGHT: number;
  BUFFER_WIDTH: number;
}

export interface VideoMessage {
  ref: number;
  text: string;
  type: number;
  event: string;
  date?: Date;
}

export const MESSAGE_TYPE = {
  ERROR: 1,
  INFORMATION: 2,
  GENERAL: 3,
} as const;
