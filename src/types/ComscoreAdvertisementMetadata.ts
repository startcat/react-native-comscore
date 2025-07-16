import type { ComscoreMetadata, ComscoreDimension } from './ComscoreMetadata';

/*
 *  Tipos de anuncios ComScore según la documentación oficial
 *
 */

export enum ComscoreAdvertisementType {
  // LINEAR - VIDEO ON DEMAND
  onDemandPreRoll = 'onDemandPreRoll',
  onDemandMidRoll = 'onDemandMidRoll',
  onDemandPostRoll = 'onDemandPostRoll',

  // LINEAR - LIVE
  live = 'live',

  // BRANDED ENTERTAINMENT
  brandedOnDemandPreRoll = 'brandedOnDemandPreRoll',
  brandedOnDemandMidRoll = 'brandedOnDemandMidRoll',
  brandedOnDemandPostRoll = 'brandedOnDemandPostRoll',
  brandedAsContent = 'brandedAsContent',
  brandedDuringLive = 'brandedDuringLive',

  // OTHER
  other = 'other',
}

/*
 *  Mecanismos de distribución de anuncios
 *
 */

export enum ComscoreAdvertisementDeliveryType {
  national = 'national', // Distribución nacional
  local = 'local', // Distribución local
  syndication = 'syndication', // Distribución para sindicación
}

/*
 *  Propietarios del anuncio para monetización
 *
 */

export enum ComscoreAdvertisementOwner {
  distributor = 'distributor', // Monetizado por distribuidor (publisherName)
  originator = 'originator', // Monetizado por originador (stationTitle/stationCode)
  multiple = 'multiple', // Monetizado por múltiples propietarios
  none = 'none', // No tiene propietario
}

/*
 *  Metadatos personalizados del anuncio
 *
 */

export type CustomComscoreAdvertisementMetadata = {
  [id: string]: string;
};

/*
 *  Interfaz principal para metadatos de anuncios ComScore
 *  Basada en la documentación oficial de ComScore Streaming Tag
 *
 */

export type ComscoreAdvertisementMetadata = {
  /**
   * Tipo de anuncio - OBLIGATORIO
   * Crítico para que ComScore pueda distinguir diferentes tipos de streams
   * Comscore API: setMediaType( value ) - V X C (requerido)
   */
  mediaType: ComscoreAdvertisementType;

  /**
   * Duración del anuncio individual en milisegundos - OBLIGATORIO para X V C
   * Si la duración es desconocida, proporcionar 0
   * Ejemplo: 27 segundos = 27000
   * Comscore API: setLength( int length ) - X V C (requerido)
   */
  length: number;

  /**
   * Metadatos del contenido relacionado con el anuncio - OPCIONAL
   * Especifica el contenido para el cual se sirve el anuncio
   * Omitir si el reproductor no sabe qué contenido está relacionado
   * Comscore API: setRelatedContentMetadata( contentMetadataObject ) - V X C (opcional)
   */
  relatedContentMetadata?: ComscoreMetadata;

  /**
   * Identificador único del anuncio - OPCIONAL (OBLIGATORIO para C)
   * Debe ser diferente para diferentes anuncios (para distinguir creativos)
   * Proporcionar "0" si no hay acceso a identificadores únicos
   * Comscore API: setUniqueId( String id ) - C (requerido para Cross Media Audience Measurement)
   */
  uniqueId?: string;

  /**
   * Mecanismo de distribución del anuncio - OPCIONAL
   * Especifica cómo se distribuye el anuncio
   * Comscore API: setDeliveryType( value ) - X C (opcional)
   */
  deliveryType?: ComscoreAdvertisementDeliveryType;

  /**
   * Propietario del anuncio para monetización - OPCIONAL
   * Especifica quién monetiza el anuncio
   * Comscore API: setOwner( value ) - X C (opcional)
   */
  owner?: ComscoreAdvertisementOwner;

  /**
   * Clasificar como stream de solo audio - OPCIONAL
   * true si el anuncio es solo audio, false o omitir si es video (con o sin audio)
   * Ayuda a ComScore a identificar anuncios de solo audio
   * Comscore API: classifyAsAudioStream( Boolean value ) - V X C (opcional)
   */
  classifyAsAudioStream?: boolean;

  /**
   * ID de la campaña publicitaria - OPCIONAL
   * Proporciona un ID para la campaña publicitaria que se está entregando
   * Comscore API: setServerCampaignId( String id ) - X C (opcional)
   */
  serverCampaignId?: string;

  /**
   * ID del placement - OPCIONAL
   * Proporciona un ID para el placement donde se entrega la campaña
   * Comscore API: setPlacementId( String id ) - X C (opcional)
   */
  placementId?: string;

  /**
   * ID del sitio - OPCIONAL
   * Proporciona un ID para el sitio donde se entrega la campaña
   * Comscore API: setSiteId( String id ) - X C (opcional)
   */
  siteId?: string;

  /**
   * Servidor/proveedor de publicidad - OPCIONAL
   * Proporciona un nombre para el servidor/proveedor de publicidad
   * Ejemplo: "Freewheel"
   * Comscore API: setServer( String name ) - X C (opcional)
   */
  server?: string;

  /**
   * Título del anuncio - OPCIONAL
   * Proporciona un título para el anuncio (nombre de la campaña o creativo)
   * Ejemplo: "Summer sale 2019"
   * Comscore API: setTitle( String title ) - X C (opcional)
   */
  title?: string;

  /**
   * URL de call-to-action - OPCIONAL
   * URL que se cargará cuando se haga clic en el anuncio
   * Ejemplo: "http://example.com/landing_page"
   * Comscore API: setCallToActionUrl( String url ) - C (opcional)
   */
  callToActionUrl?: string;

  /**
   * URL del clip del anuncio - OPCIONAL
   * URL (o ruta/nombre de archivo) del stream del anuncio
   * Ejemplo: "http://streaming.example.com/asset/13784"
   * Comscore API: setClipUrl( String url ) - C (opcional)
   */
  clipUrl?: string;

  /**
   * Dimensiones del video del anuncio - OPCIONAL
   * Ancho y alto del video del anuncio en píxeles
   * Ejemplo: { width: 1280, height: 720 }
   * Comscore API: setVideoDimensions( int pixelsWide, int pixelsHigh ) - C (opcional)
   */
  videoDimensions?: ComscoreDimension;

  /**
   * Etiquetas personalizadas - OPCIONAL
   * Colección de pares nombre/valor de metadatos personalizados
   * Ejemplo: { "campaign_type": "display", "advertiser": "brand_name" }
   * Comscore API: setCustomLabels( Map labels ) - V X C (opcional)
   */
  customLabels?: CustomComscoreAdvertisementMetadata;
};
