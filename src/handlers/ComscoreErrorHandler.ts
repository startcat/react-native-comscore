import { type HandlerContext } from '../handlers/types';
import { type ComscoreStateManager } from './ComscoreStateManager';
import { type ComponentLogger } from '../logger/types';
import { type ComscoreErrorInfo } from './types';
import { StateUtils } from './StateUtils';
import {
  type ErrorParams,
  type ContentProtectionErrorParams,
  type NetworkErrorParams,
  type StreamErrorParams,
} from '../types/AnalyticsPlugin';

export class ComscoreErrorHandler {
  private context: HandlerContext;
  private stateManager: ComscoreStateManager;
  private logger: ComponentLogger;

  // Registro de errores para debugging
  private errorHistory: ComscoreErrorInfo[] = [];
  private maxErrorHistory = 50;

  // Contadores de errores
  private errorCounts = {
    playback: 0,
    network: 0,
    drm: 0,
    stream: 0,
    other: 0,
  };

  // Estado de error actual
  private currentError: ComscoreErrorInfo | null = null;
  private inErrorState = false;

  constructor(context: HandlerContext, stateManager: ComscoreStateManager) {
    this.context = context;
    this.stateManager = stateManager;
    this.logger = context.logger.forComponent('ErrorHandler');
  }

  // Manejo de errores generales
  handleError(params: ErrorParams): void {
    if (__DEV__) {
      this.logger.error('❌ handleError', params);
    }

    const errorInfo = this.createErrorInfo(params, 'general');
    this.processError(errorInfo);

    // Actualizar contadores
    this.updateErrorCounts(params.errorType || 'other');

    // Si es un error fatal, detener el tracking
    if (params.isFatal) {
      this.handleFatalError(errorInfo);
    }
  }

  // Errores de protección de contenido (DRM)
  handleContentProtectionError(params: ContentProtectionErrorParams): void {
    if (__DEV__) {
      this.logger.error('🔒 handleContentProtectionError', params);
    }

    const errorInfo = this.createErrorInfo(params, 'drm');
    errorInfo.sessionContext = {
      drmType: params.drmType,
    };

    this.processError(errorInfo);
    this.updateErrorCounts('drm');

    // Los errores de DRM son generalmente fatales
    if (params.isFatal !== false) {
      this.handleFatalError(errorInfo);
    }
  }

  // Errores de red
  handleNetworkError(params: NetworkErrorParams): void {
    if (__DEV__) {
      this.logger.error('🌐 handleNetworkError', params);
    }

    const errorInfo = this.createErrorInfo(params, 'network');
    errorInfo.sessionContext = {
      statusCode: params.statusCode,
      url: params.url,
    };

    this.processError(errorInfo);
    this.updateErrorCounts('network');

    // Evaluar si el error de red es recuperable
    if (this.isNetworkErrorFatal(params)) {
      this.handleFatalError(errorInfo);
    } else {
      this.handleRecoverableNetworkError(params);
    }
  }

  // Errores de stream
  handleStreamError(params: StreamErrorParams): void {
    if (__DEV__) {
      this.logger.error('📡 handleStreamError', params);
    }

    const errorInfo = this.createErrorInfo(params, 'stream');
    errorInfo.sessionContext = {
      streamUrl: params.streamUrl,
      bitrate: params.bitrate,
    };

    this.processError(errorInfo);
    this.updateErrorCounts('stream');

    // Los errores de stream pueden requerir reinicio del tracking
    if (params.isFatal) {
      this.handleFatalError(errorInfo);
    } else {
      this.handleStreamRecovery(params);
    }
  }

  // Métodos privados para procesamiento de errores
  private createErrorInfo(
    params: ErrorParams,
    category: string
  ): ComscoreErrorInfo {
    return {
      errorCode: params.errorCode || 'UNKNOWN',
      errorMessage: params.errorMessage || 'Unknown error occurred',
      errorType: params.errorType || category,
      isFatal: params.isFatal || false,
      timestamp: Date.now(),
      currentState: this.stateManager.getCurrentState(),
      sessionContext: {},
    };
  }

  private processError(errorInfo: ComscoreErrorInfo): void {
    // Registrar en el historial
    this.addToErrorHistory(errorInfo);

    // Establecer como error actual
    this.currentError = errorInfo;
    this.inErrorState = true;

    // Logging detallado en desarrollo
    if (__DEV__) {
      this.logger.error('Error processed', {
        code: errorInfo.errorCode,
        message: errorInfo.errorMessage,
        type: errorInfo.errorType,
        fatal: errorInfo.isFatal,
        state: errorInfo.currentState,
        context: errorInfo.sessionContext,
      });
    }

    // ComScore no tiene métodos específicos de error en su connector,
    // pero podemos registrar el error en los metadatos para debugging
    if (this.context.configuration.debug) {
      this.logErrorToMetadata(errorInfo);
    }
  }

  private handleFatalError(errorInfo: ComscoreErrorInfo): void {
    if (__DEV__) {
      this.logger.error('Fatal error encountered', errorInfo);
    }

    // Notificar a ComScore sobre el error fatal
    this.notifyErrorToComScore(
      {
        errorCode: errorInfo.errorCode,
        errorMessage: errorInfo.errorMessage,
        errorType: errorInfo.errorType as any,
        isFatal: true,
      },
      'fatal'
    );

    // Detener el tracking de ComScore
    this.stateManager.transitionToStopped('fatal_error');

    // En caso de error fatal, podríamos necesitar crear una nueva sesión
    // cuando se recupere la reproducción
    if (__DEV__) {
      this.logger.warn(
        'Fatal error may require new playback session on recovery'
      );
    }
  }

  private handleRecoverableNetworkError(params: NetworkErrorParams): void {
    if (__DEV__) {
      this.logger.info('Handling recoverable network error', params);
    }

    // Para errores de red recuperables, podemos pausar temporalmente
    // el tracking hasta que se resuelva
    const currentState = this.stateManager.getCurrentState();

    if (StateUtils.isPlayingState(currentState)) {
      // Pausar temporalmente si estamos reproduciendo
      this.stateManager.transitionToPaused('network_error_recovery');
    }

    // Notificar a ComScore sobre el error de red si es relevante
    this.notifyErrorToComScore(params, 'network_recoverable');

    if (__DEV__) {
      this.logger.debug('Network error recovery initiated', {
        currentState,
        statusCode: params.statusCode,
        url: params.url,
      });
    }

    // El error se resolverá cuando la reproducción se reanude normalmente
  }

  private handleStreamRecovery(params: StreamErrorParams): void {
    if (__DEV__) {
      this.logger.info('Handling stream recovery', params);
    }

    const currentState = this.stateManager.getCurrentState();

    // Para errores de stream, podríamos necesitar reiniciar desde una posición específica
    if (
      params.streamUrl &&
      params.streamUrl !== this.context.metadata.uniqueId
    ) {
      // Si cambió la URL del stream, crear nueva sesión
      this.context.connector.createPlaybackSession();

      if (__DEV__) {
        this.logger.info(
          'New playback session created due to stream URL change',
          {
            oldUniqueId: this.context.metadata.uniqueId,
            newStreamUrl: params.streamUrl,
          }
        );
      }
    }

    // Notificar a ComScore sobre el error de stream
    this.notifyErrorToComScore(params, 'stream_recovery');

    // Si estábamos reproduciendo, pausar temporalmente durante la recuperación
    if (StateUtils.isPlayingState(currentState)) {
      this.stateManager.transitionToPaused('stream_error_recovery');
    }
  }

  private isNetworkErrorFatal(params: NetworkErrorParams): boolean {
    // Si está marcado explícitamente como fatal
    if (params.isFatal === true) return true;
    if (params.isFatal === false) return false;

    // Determinar si un error de red es fatal basado en el código de estado
    if (typeof params.statusCode === 'number') {
      // Errores 4xx del cliente generalmente no son recuperables
      if (params.statusCode >= 400 && params.statusCode < 500) {
        // Algunos errores 4xx pueden ser recuperables
        const recoverableClientErrors = [408, 429]; // Request Timeout, Too Many Requests
        return !recoverableClientErrors.includes(params.statusCode);
      }

      // Errores 5xx del servidor pueden ser temporales
      if (params.statusCode >= 500) {
        // Algunos errores 5xx son definitivamente fatales
        const fatalServerErrors = [501, 505]; // Not Implemented, HTTP Version Not Supported
        return fatalServerErrors.includes(params.statusCode);
      }

      // Errores 1xx, 2xx, 3xx generalmente no son fatales
      return false;
    }

    // Sin código de estado, asumir no fatal por defecto
    return false;
  }

  private addToErrorHistory(errorInfo: ComscoreErrorInfo): void {
    this.errorHistory.push(errorInfo);

    // Mantener solo los últimos N errores
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory.shift();
    }
  }

  private updateErrorCounts(errorType: string): void {
    switch (errorType) {
      case 'playback':
        this.errorCounts.playback++;
        break;
      case 'network':
        this.errorCounts.network++;
        break;
      case 'drm':
        this.errorCounts.drm++;
        break;
      case 'stream':
        this.errorCounts.stream++;
        break;
      default:
        this.errorCounts.other++;
    }
  }

  private logErrorToMetadata(errorInfo: ComscoreErrorInfo): void {
    // Agregar información de error a los metadatos para debugging
    const currentMetadata = this.stateManager.getCurrentContentMetadata();

    if (currentMetadata) {
      const errorMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
          lastErrorCode: errorInfo.errorCode.toString(),
          lastErrorType: errorInfo.errorType,
          lastErrorTimestamp: errorInfo.timestamp.toString(),
          lastErrorFatal: errorInfo.isFatal.toString(),
          totalErrors: Object.values(this.errorCounts)
            .reduce((a, b) => a + b, 0)
            .toString(),
        },
      };

      // Actualizar metadatos en ComScore
      this.context.connector.update(errorMetadata);
      this.stateManager.setCurrentContentMetadata(errorMetadata);

      if (__DEV__) {
        this.logger.debug('Error metadata updated in ComScore', {
          errorCode: errorInfo.errorCode,
          errorType: errorInfo.errorType,
          isFatal: errorInfo.isFatal,
        });
      }
    }
  }

  // Método para notificar errores a ComScore a través de metadatos
  private notifyErrorToComScore(
    params:
      | ErrorParams
      | NetworkErrorParams
      | StreamErrorParams
      | ContentProtectionErrorParams,
    errorCategory: string
  ): void {
    const currentMetadata = this.stateManager.getCurrentContentMetadata();

    if (currentMetadata) {
      const errorMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
          currentErrorCode: params.errorCode?.toString() || 'unknown',
          currentErrorMessage: params.errorMessage || 'Unknown error',
          currentErrorType: params.errorType || 'other',
          currentErrorCategory: errorCategory,
          currentErrorFatal: (params.isFatal || false).toString(),
          errorTimestamp: Date.now().toString(),
        },
      };

      // ComScore no tiene un método específico para errores,
      // pero podemos usar metadatos para tracking y debugging
      this.context.connector.update(errorMetadata);

      if (__DEV__) {
        this.logger.debug('Error notified to ComScore via metadata', {
          category: errorCategory,
          code: params.errorCode,
          type: params.errorType,
          fatal: params.isFatal,
        });
      }
    }
  }

  // Método para limpiar metadatos de error cuando se resuelve
  clearErrorFromMetadata(): void {
    const currentMetadata = this.stateManager.getCurrentContentMetadata();

    if (currentMetadata?.customLabels) {
      const cleanedMetadata = {
        ...currentMetadata,
        customLabels: {
          ...currentMetadata.customLabels,
        },
      };

      // Remover metadatos de error actual
      delete cleanedMetadata.customLabels.currentErrorCode;
      delete cleanedMetadata.customLabels.currentErrorMessage;
      delete cleanedMetadata.customLabels.currentErrorType;
      delete cleanedMetadata.customLabels.currentErrorCategory;
      delete cleanedMetadata.customLabels.currentErrorFatal;
      delete cleanedMetadata.customLabels.errorTimestamp;

      this.context.connector.update(cleanedMetadata);
      this.stateManager.setCurrentContentMetadata(cleanedMetadata);

      if (__DEV__) {
        this.logger.debug('Error metadata cleared from ComScore');
      }
    }
  }

  // Métodos públicos de utilidad
  clearErrorState(): void {
    this.currentError = null;
    this.inErrorState = false;

    // Limpiar metadatos de error en ComScore
    this.clearErrorFromMetadata();

    if (__DEV__) {
      this.logger.info('Error state cleared');
    }
  }

  getCurrentError(): ComscoreErrorInfo | null {
    return this.currentError;
  }

  isInErrorState(): boolean {
    return this.inErrorState;
  }

  getErrorHistory(): ComscoreErrorInfo[] {
    return [...this.errorHistory]; // Retornar copia
  }

  getErrorCounts(): typeof this.errorCounts {
    return { ...this.errorCounts }; // Retornar copia
  }

  // Método para reiniciar contadores (útil para testing)
  resetErrorCounts(): void {
    this.errorCounts = {
      playback: 0,
      network: 0,
      drm: 0,
      stream: 0,
      other: 0,
    };

    if (__DEV__) {
      this.logger.debug('Error counts reset');
    }
  }

  // Método para limpiar historial (útil para gestión de memoria)
  clearErrorHistory(): void {
    this.errorHistory = [];

    if (__DEV__) {
      this.logger.debug('Error history cleared');
    }
  }

  // Método para obtener estadísticas de errores
  getErrorStatistics(): {
    totalErrors: number;
    fatalErrors: number;
    recentErrors: number;
    errorsByType: {
      playback: number;
      network: number;
      drm: number;
      stream: number;
      other: number;
    };
    lastErrorTime?: number;
    currentErrorActive: boolean;
  } {
    const totalErrors = Object.values(this.errorCounts).reduce(
      (a, b) => a + b,
      0
    );
    const fatalErrors = this.errorHistory.filter(
      (error) => error.isFatal
    ).length;
    const recentErrors = this.errorHistory.filter(
      (error) => error.timestamp > Date.now() - 300000 // Últimos 5 minutos
    ).length;
    const lastErrorTime = this.currentError?.timestamp;

    return {
      totalErrors,
      fatalErrors,
      recentErrors,
      errorsByType: { ...this.errorCounts },
      lastErrorTime,
      currentErrorActive: this.inErrorState,
    };
  }

  // Método público para notificar que un error se ha resuelto
  notifyErrorResolved(): void {
    if (this.inErrorState) {
      if (__DEV__) {
        this.logger.info('Error resolved, resuming normal operation');
      }

      // Limpiar estado de error
      this.clearErrorState();

      // Si estábamos en pausa por error, verificar si debemos reanudar
      const currentState = this.stateManager.getCurrentState();
      if (StateUtils.isPausedState(currentState)) {
        // Solo reanudar si la pausa fue por error (esto debería manejarse desde el plugin principal)
        if (__DEV__) {
          this.logger.debug(
            'Was in paused state during error, manual resume may be needed'
          );
        }
      }
    }
  }

  // Método para verificar si hay errores activos que bloqueen el tracking
  hasActiveBlockingError(): boolean {
    return this.inErrorState && this.currentError?.isFatal === true;
  }
}
