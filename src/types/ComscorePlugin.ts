import { type ComscoreMetadata } from './ComscoreMetadata';
import { type ComscoreConfiguration } from './ComscoreConfiguration';
import { type ComscoreAdvertisementMetadata } from './ComscoreAdvertisementMetadata';
import { type PlayerPlugin } from './AnalyticsPlugin';

export enum ComscoreState {
  INITIALIZED = 'initialized',
  STOPPED = 'stopped',
  PAUSED_AD = 'paused_ad',
  PAUSED_VIDEO = 'paused_video',
  ADVERTISEMENT = 'advertisement',
  VIDEO = 'video',
}

export interface ComscoreMetadataParams {
  metadata: ComscoreMetadata; // Metadatos específicos de ComScore
}

export interface ComscoreAdMetadataParams {
  adMetadata: ComscoreAdvertisementMetadata; // Metadatos del anuncio para ComScore
  contentMetadata?: ComscoreMetadata; // Metadatos del contenido relacionado (opcional)
}

interface ComscorePluginInitializeParams {
  config: ComscoreConfiguration; // Configuración específica de ComScore
  instanceId?: number; // ID de instancia (opcional, se puede generar)
}

interface StartFromPositionParams {
  position: number; // Posición de inicio en milisegundos (REQUERIDO)
}

interface StartFromDvrWindowOffsetParams {
  offset: number; // Offset de la ventana DVR en milisegundos (REQUERIDO)
}

interface SetDvrWindowLengthParams {
  length: number; // Longitud de la ventana DVR en milisegundos (REQUERIDO)
}

interface DvrWindowOffsetChangeParams {
  offset: number; // Nuevo offset en milisegundos (REQUERIDO)
  previousOffset?: number; // Offset anterior (opcional)
}

interface SetPersistentLabelParams {
  label: string; // Nombre de la etiqueta (REQUERIDO)
  value: string; // Valor de la etiqueta (REQUERIDO)
}

interface SetPersistentLabelsParams {
  labels: { [key: string]: string }; // Objeto con etiquetas (REQUERIDO)
}

interface UpdateConfigurationParams {
  config: Partial<ComscoreConfiguration>; // Configuración parcial a actualizar
}

export interface ComscorePluginInterface extends PlayerPlugin {
  // Métodos específicos de ComScore
  update(metadata: ComscoreMetadata): void;
  setPersistentLabel(label: string, value: string): void;
  setPersistentLabels(labels: { [key: string]: string }): void;
  getInstanceId(): number;
  reset(): void;

  // Eventos específicos de ComScore (sobrescribir tipos genéricos)
  onPluginInitialize?: (params: ComscorePluginInitializeParams) => void;
  onSetContentMetadata?: (params: ComscoreMetadataParams) => void;
  onSetAdvertisementMetadata?: (params: ComscoreAdMetadataParams) => void;
  onMetadataLoaded?: (params: ComscoreMetadataParams) => void;
  onMetadataUpdate?: (params: ComscoreMetadataParams) => void;

  // Eventos específicos de DVR (solo para ComScore)
  onStartFromPosition?: (params: StartFromPositionParams) => void;
  onStartFromDvrWindowOffset?: (params: StartFromDvrWindowOffsetParams) => void;
  onSetDvrWindowLength?: (params: SetDvrWindowLengthParams) => void;
  onDvrWindowOffsetChange?: (params: DvrWindowOffsetChangeParams) => void;

  // Eventos específicos de etiquetas persistentes (solo para ComScore)
  onSetPersistentLabel?: (params: SetPersistentLabelParams) => void;
  onSetPersistentLabels?: (params: SetPersistentLabelsParams) => void;
  onUpdateConfiguration?: (params: UpdateConfigurationParams) => void;

  // Eventos específicos de estado de aplicación (solo para ComScore)
  onApplicationForeground?: () => void;
  onApplicationBackground?: () => void;
  onApplicationActive?: () => void;
  onApplicationInactive?: () => void;
}
