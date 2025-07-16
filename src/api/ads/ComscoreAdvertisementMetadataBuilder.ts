import {
  type ComscoreMetadata,
  type ComscoreAdvertisementMetadata,
  type CustomComscoreAdvertisementMetadata,
  ComscoreAdvertisementType,
  ComscoreAdvertisementDeliveryType,
  ComscoreAdvertisementOwner,
} from '../../types';

/*
 *  Builder pattern para crear metadatos de anuncios
 *  Facilita la construcción incremental de metadatos complejos
 *
 */

export class ComscoreAdvertisementMetadataBuilder {
  private metadata: Partial<ComscoreAdvertisementMetadata> = {};

  /*
   * Establece el tipo de anuncio (obligatorio)
   *
   */

  setMediaType(
    mediaType: ComscoreAdvertisementType
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.mediaType = mediaType;
    return this;
  }

  /*
   * Establece la duración del anuncio en milisegundos (obligatorio para la mayoría de casos)
   *
   */

  setLength(length: number): ComscoreAdvertisementMetadataBuilder {
    this.metadata.length = length;
    return this;
  }

  /*
   * Establece los metadatos del contenido relacionado
   *
   */

  setRelatedContentMetadata(
    contentMetadata?: ComscoreMetadata
  ): ComscoreAdvertisementMetadataBuilder {
    if (contentMetadata) {
      this.metadata.relatedContentMetadata = contentMetadata;
    }
    return this;
  }

  /*
   * Establece el ID único del anuncio
   *
   */

  setUniqueId(uniqueId: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.uniqueId = uniqueId;
    return this;
  }

  /*
   * Establece el tipo de distribución
   *
   */

  setDeliveryType(
    deliveryType: ComscoreAdvertisementDeliveryType
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.deliveryType = deliveryType;
    return this;
  }

  /*
   * Establece el propietario del anuncio
   *
   */

  setOwner(
    owner: ComscoreAdvertisementOwner
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.owner = owner;
    return this;
  }

  /*
   * Clasifica como stream de solo audio
   *
   */

  setClassifyAsAudioStream(
    isAudio: boolean
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.classifyAsAudioStream = isAudio;
    return this;
  }

  /*
   * Establece el ID de la campaña del servidor
   *
   */

  setServerCampaignId(
    campaignId: string
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.serverCampaignId = campaignId;
    return this;
  }

  /*
   * Establece el ID del placement
   *
   */

  setPlacementId(placementId: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.placementId = placementId;
    return this;
  }

  /*
   * Establece el ID del sitio
   *
   */

  setSiteId(siteId: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.siteId = siteId;
    return this;
  }

  /*
   * Establece el servidor/proveedor
   *
   */

  setServer(server: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.server = server;
    return this;
  }

  /*
   * Establece el título del anuncio
   *
   */

  setTitle(title: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.title = title;
    return this;
  }

  /*
   * Establece la URL de call-to-action
   *
   */

  setCallToActionUrl(url: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.callToActionUrl = url;
    return this;
  }

  /*
   * Establece la URL del clip
   *
   */

  setClipUrl(url: string): ComscoreAdvertisementMetadataBuilder {
    this.metadata.clipUrl = url;
    return this;
  }

  /*
   * Establece las dimensiones del video
   *
   */

  setVideoDimensions(
    width: number,
    height: number
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.videoDimensions = { width, height };
    return this;
  }

  /*
   * Establece etiquetas personalizadas
   *
   */

  setCustomLabels(
    labels: CustomComscoreAdvertisementMetadata
  ): ComscoreAdvertisementMetadataBuilder {
    this.metadata.customLabels = labels;
    return this;
  }

  /*
   * Añade una etiqueta personalizada individual
   *
   */

  addCustomLabel(
    key: string,
    value: string
  ): ComscoreAdvertisementMetadataBuilder {
    if (!this.metadata.customLabels) {
      this.metadata.customLabels = {};
    }
    this.metadata.customLabels[key] = value;
    return this;
  }

  /*
   * Construye y valida los metadatos del anuncio
   *
   */

  build(): ComscoreAdvertisementMetadata {
    // Validaciones obligatorias
    if (!this.metadata.mediaType) {
      throw new Error(
        'ComscoreAdvertisementMetadata: mediaType es obligatorio'
      );
    }

    if (this.metadata.length === undefined) {
      throw new Error('ComscoreAdvertisementMetadata: length es obligatorio');
    }

    if (this.metadata.length < 0) {
      throw new Error('ComscoreAdvertisementMetadata: length debe ser >= 0');
    }

    return this.metadata as ComscoreAdvertisementMetadata;
  }
}
