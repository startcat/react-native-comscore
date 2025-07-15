import {
  type ComscoreMetadata,
  type ComscoreAdvertisementMetadata,
  ComscoreAdvertisementType,
} from '../types';

import { ComscoreAdvertisementMetadataBuilder } from './ComscoreAdvertisementMetadataBuilder';

/*
 *  Utilidades para trabajar con metadatos de anuncios
 *
 */

export class ComscoreAdvertisementMetadataUtils {
  /*
   * Crea metadatos básicos para un pre-roll
   *
   */

  static createPreRollMetadata(
    length: number,
    contentMetadata?: ComscoreMetadata
  ): ComscoreAdvertisementMetadata {
    return new ComscoreAdvertisementMetadataBuilder()
      .setMediaType(ComscoreAdvertisementType.onDemandPreRoll)
      .setLength(length)
      .setRelatedContentMetadata(contentMetadata)
      .build();
  }

  /*
   * Crea metadatos básicos para un mid-roll
   *
   */

  static createMidRollMetadata(
    length: number,
    contentMetadata?: ComscoreMetadata
  ): ComscoreAdvertisementMetadata {
    return new ComscoreAdvertisementMetadataBuilder()
      .setMediaType(ComscoreAdvertisementType.onDemandMidRoll)
      .setLength(length)
      .setRelatedContentMetadata(contentMetadata)
      .build();
  }

  /*
   * Crea metadatos básicos para un post-roll
   *
   */

  static createPostRollMetadata(
    length: number,
    contentMetadata?: ComscoreMetadata
  ): ComscoreAdvertisementMetadata {
    return new ComscoreAdvertisementMetadataBuilder()
      .setMediaType(ComscoreAdvertisementType.onDemandPostRoll)
      .setLength(length)
      .setRelatedContentMetadata(contentMetadata)
      .build();
  }

  /*
   * Crea metadatos para un anuncio live
   */

  static createLiveAdMetadata(
    length: number,
    contentMetadata?: ComscoreMetadata
  ): ComscoreAdvertisementMetadata {
    return new ComscoreAdvertisementMetadataBuilder()
      .setMediaType(ComscoreAdvertisementType.live)
      .setLength(length)
      .setRelatedContentMetadata(contentMetadata)
      .build();
  }

  /*
   * Valida si los metadatos del anuncio están completos para tracking básico
   */

  static validateBasicTracking(
    metadata: ComscoreAdvertisementMetadata
  ): boolean {
    return !!(metadata.mediaType && metadata.length >= 0);
  }

  /*
   * Valida si los metadatos están completos para Cross Media Audience Measurement
   */

  static validateCrossMediaTracking(
    metadata: ComscoreAdvertisementMetadata
  ): boolean {
    return !!(metadata.mediaType && metadata.length >= 0 && metadata.uniqueId);
  }

  /*
   * Convierte segundos a milisegundos (utilidad común)
   */

  static secondsToMilliseconds(seconds: number): number {
    return seconds * 1000;
  }

  /*
   * Convierte metadatos simples a formato ComScore
   */

  static fromSimpleData(data: {
    type: 'preroll' | 'midroll' | 'postroll' | 'live';
    duration: number; // en segundos
    id?: string;
    title?: string;
    campaignId?: string;
  }): ComscoreAdvertisementMetadata {
    const typeMapping = {
      preroll: ComscoreAdvertisementType.onDemandPreRoll,
      midroll: ComscoreAdvertisementType.onDemandMidRoll,
      postroll: ComscoreAdvertisementType.onDemandPostRoll,
      live: ComscoreAdvertisementType.live,
    };

    const builder = new ComscoreAdvertisementMetadataBuilder()
      .setMediaType(typeMapping[data.type])
      .setLength(this.secondsToMilliseconds(data.duration));

    if (data.id) {
      builder.setUniqueId(data.id);
    }

    if (data.title) {
      builder.setTitle(data.title);
    }

    if (data.campaignId) {
      builder.setServerCampaignId(data.campaignId);
    }

    return builder.build();
  }
}
