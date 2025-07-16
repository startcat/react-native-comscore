/*
 *  Utilidades para trabajar con estados
 *
 */

import { ComscoreState } from '../types';

export class StateUtils {
  /*
   * Verifica si un estado es un estado de reproducción activa
   *
   */

  static isPlayingState(state: ComscoreState): boolean {
    return (
      state === ComscoreState.VIDEO || state === ComscoreState.ADVERTISEMENT
    );
  }

  /*
   * Verifica si un estado es un estado de pausa
   *
   */

  static isPausedState(state: ComscoreState): boolean {
    return (
      state === ComscoreState.PAUSED_VIDEO || state === ComscoreState.PAUSED_AD
    );
  }

  /*
   * Verifica si un estado está relacionado con anuncios
   *
   */

  static isAdState(state: ComscoreState): boolean {
    return (
      state === ComscoreState.ADVERTISEMENT || state === ComscoreState.PAUSED_AD
    );
  }

  /*
   * Verifica si un estado está relacionado con contenido
   *
   */

  static isContentState(state: ComscoreState): boolean {
    return (
      state === ComscoreState.VIDEO || state === ComscoreState.PAUSED_VIDEO
    );
  }

  /*
   * Obtiene el estado de pausa correspondiente a un estado de reproducción
   *
   */

  static getPausedStateFor(playingState: ComscoreState): ComscoreState | null {
    switch (playingState) {
      case ComscoreState.VIDEO:
        return ComscoreState.PAUSED_VIDEO;
      case ComscoreState.ADVERTISEMENT:
        return ComscoreState.PAUSED_AD;
      default:
        return null;
    }
  }

  /*
   * Obtiene el estado de reproducción correspondiente a un estado de pausa
   *
   */

  static getPlayingStateFor(pausedState: ComscoreState): ComscoreState | null {
    switch (pausedState) {
      case ComscoreState.PAUSED_VIDEO:
        return ComscoreState.VIDEO;
      case ComscoreState.PAUSED_AD:
        return ComscoreState.ADVERTISEMENT;
      default:
        return null;
    }
  }
}
