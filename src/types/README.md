# Documentación de Tipos ComScore

Este documento proporciona una explicación detallada de todos los tipos definidos en la integración de ComScore para React Native.

## Tabla de Contenidos

- [Tipos de Configuración](#tipos-de-configuración)
  - [ComscoreConfiguration](#comscoreconfiguration)
  - [ComscoreUserConsent](#comscoreuserconsent)
  - [ComscoreUsagePropertiesAutoUpdateMode](#comscoreusagepropertiesautoupdatemode)
- [Tipos de Metadatos de Contenido](#tipos-de-metadatos-de-contenido)
  - [ComscoreMetadata](#comscoremetadata)
  - [CustomComscoreMetadata](#customcomscoremetadata)
  - [ComscoreMediaType](#comscoremediatype)
  - [ComscoreFeedType](#comscorefeedtype)
  - [ComscoreDeliveryMode](#comscoredeliverymode)
  - [ComscoreDeliverySubscriptionType](#comscoredeliverysubscriptiontype)
  - [ComscoreDeliveryComposition](#comscoredeliverycomposition)
  - [ComscoreDeliveryAdvertisementCapability](#comscoredeliveryadvertisementcapability)
  - [ComscoreMediaFormat](#comscoremediaformat)
  - [ComscoreDistributionModel](#comscoredistributionmodel)
  - [ComscoreDate](#comscoredate)
  - [ComscoreTime](#comscoretime)
  - [ComscoreDimension](#comscoredimension)
- [Tipos de Metadatos de Publicidad](#tipos-de-metadatos-de-publicidad)
  - [ComscoreAdvertisementMetadata](#comscoreAdvertisementMetadata)
  - [CustomComscoreAdvertisementMetadata](#customcomscoreAdvertisementMetadata)
  - [ComscoreAdvertisementType](#comscoreAdvertisementType)
  - [ComscoreAdvertisementDeliveryType](#comscoreAdvertisementDeliveryType)
  - [ComscoreAdvertisementOwner](#comscoreAdvertisementOwner)
- [Tipos de Plugin y Eventos](#tipos-de-plugin-y-eventos)
  - [PlayerPlugin](#playerplugin)
  - [ComscorePluginInterface](#comscoreplugininterface)
  - [ComscoreState](#comscorestate)
  - [Parámetros de Eventos](#parámetros-de-eventos)
- [Tipos de Conector](#tipos-de-conector)
  - [ComscoreConnector](#comscoreconnector)

## Tipos de Configuración

### ComscoreConfiguration

La interfaz principal de configuración para la analítica de ComScore.

| Propiedad                     | Tipo                                  | Descripción                                                                           | Requerido |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------- | --------- |
| publisherId                   | string                                | También conocido como el valor c2                                                     | Sí        |
| applicationName               | string                                | Nombre de la aplicación                                                               | Sí        |
| userConsent                   | ComscoreUserConsent                   | Consentimiento del usuario para la recolección de datos                               | Sí        |
| usagePropertiesAutoUpdateMode | ComscoreUsagePropertiesAutoUpdateMode | Modo de actualización automática de propiedades de uso. Por defecto es foregroundOnly | No        |
| debug                         | boolean                               | Habilita el modo de depuración                                                        | No        |

### ComscoreUserConsent

Enumeración que define los valores de consentimiento del usuario para la recolección de datos.

| Valor   | Descripción                                       |
| ------- | ------------------------------------------------- |
| denied  | '0' - El usuario ha denegado el consentimiento    |
| granted | '1' - El usuario ha otorgado consentimiento       |
| unknown | '-1' - El estado de consentimiento es desconocido |

### ComscoreUsagePropertiesAutoUpdateMode

Enumeración que define cuándo se deben actualizar automáticamente las propiedades de uso.

| Valor                   | Descripción                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| foregroundOnly          | Actualiza las propiedades solo cuando la aplicación está en primer plano |
| foregroundAndBackground | Actualiza las propiedades tanto en primer plano como en segundo plano    |
| disabled                | Desactiva las actualizaciones automáticas de propiedades                 |

## Tipos de Metadatos de Contenido

### ComscoreMetadata

La interfaz principal para los metadatos que se envían a ComScore.

#### Propiedades Obligatorias

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `mediaType` | `ComscoreMediaType` | Tipo de clasificación del contenido |
| `uniqueId` | `string` | Identificador único del contenido |
| `length` | `number` | Duración del contenido en milisegundos |
| `stationTitle` | `string` | Nombre del canal o estación |
| `classifyAsAudioStream` | `boolean` | Indica si es contenido solo de audio |

#### Propiedades de Clasificación VMX (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `c3` | `string` | Diccionario VMX (nivel 1) |
| `c4` | `string` | Diccionario VMX (nivel 2) |
| `c6` | `string` | Diccionario VMX (nivel 3) |

#### Propiedades de Identificación (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `stationCode` | `string` | Código del canal o estación |
| `networkAffiliate` | `string` | Código de afiliación de la estación |
| `publisherName` | `string` | Nombre de la marca del editor |

#### Propiedades de Contenido (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `programTitle` | `string` | Título del programa |
| `episodeTitle` | `string` | Título del episodio |
| `genreName` | `string` | Género del contenido |
| `seriesTitle` | `string` | Título de la serie |
| `seasonNumber` | `number` | Número de temporada |
| `episodeNumber` | `number` | Número de episodio |
| `contentProviderName` | `string` | Nombre del proveedor de contenido |
| `contentProviderBrand` | `string` | Marca del proveedor de contenido |

#### Propiedades de Entrega (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `deliveryMode` | `ComscoreDeliveryMode` | Modo de entrega (lineal o bajo demanda) |
| `deliverySubscriptionType` | `ComscoreDeliverySubscriptionType` | Tipo de suscripción |
| `deliveryComposition` | `ComscoreDeliveryComposition` | Composición de la entrega |
| `deliveryAdvertisementCapability` | `ComscoreDeliveryAdvertisementCapability` | Capacidad publicitaria |

#### Propiedades de Fechas y Tiempos (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `dateOfProduction` | `ComscoreDate` | Fecha de producción |
| `timeOfProduction` | `ComscoreTime` | Hora de producción |
| `dateOfTvAiring` | `ComscoreDate` | Fecha de emisión en TV |
| `timeOfTvAiring` | `ComscoreTime` | Hora de emisión en TV |
| `dateOfDigitalAiring` | `ComscoreDate` | Fecha de emisión digital |
| `timeOfDigitalAiring` | `ComscoreTime` | Hora de emisión digital |

#### Propiedades Técnicas (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `feedType` | `ComscoreFeedType` | Tipo de feed para streams en vivo |
| `mediaFormat` | `ComscoreMediaFormat` | Formato del contenido multimedia |
| `distributionModel` | `ComscoreDistributionModel` | Modelo de distribución del contenido |
| `playlistTitle` | `string` | Título de la playlist |
| `totalSegments` | `number` | Número total de segmentos |
| `clipUrl` | `string` | URL del clip del contenido |
| `videoDimension` | `ComscoreDimension` | Dimensiones del video en píxeles |

#### Propiedades de Clasificación (Opcionales)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `carryTvAdvertisementLoad` | `boolean` | Indica si lleva la misma carga publicitaria que la TV |
| `classifyAsCompleteEpisode` | `boolean` | Indica si es un episodio completo |
| `isDrm` | `boolean` | Indica si el contenido tiene DRM |

#### Metadatos Personalizados

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `customLabels` | `CustomComscoreMetadata` | Colección de etiquetas personalizadas |

### CustomComscoreMetadata

Tipo para pares de nombre/valor de metadatos personalizados.

```typescript
type CustomComscoreMetadata = {
  [id: string]: string;
};
```

**Descripción**: Permite agregar metadatos personalizados como pares clave-valor donde tanto la clave como el valor deben ser strings.

**Ejemplo**:
```typescript
const customMetadata: CustomComscoreMetadata = {
  "categoria": "deportes",
  "temporada": "2024",
  "liga": "primera_division"
};
```

### ComscoreMediaType

Enumeración que define los tipos de clasificación para el contenido multimedia.

| Valor                          | Descripción                                        |
| ------------------------------ | -------------------------------------------------- |
| longFormOnDemand               | Contenido largo bajo demanda                       |
| shortFormOnDemand              | Contenido corto bajo demanda                       |
| live                           | Contenido en directo                               |
| userGeneratedLongFormOnDemand  | Contenido generado por el usuario de formato largo |
| userGeneratedShortFormOnDemand | Contenido generado por el usuario de formato corto |
| userGeneratedLive              | Contenido en directo generado por el usuario       |
| bumper                         | Bumper                                             |
| other                          | Otro tipo de contenido                             |

### ComscoreFeedType

Enumeración que especifica el tipo de feed proporcionado en una transmisión en directo.

| Valor  | Descripción                       |
| ------ | --------------------------------- |
| eastHD | Feed Este en Alta Definición      |
| westHD | Feed Oeste en Alta Definición     |
| eastSD | Feed Este en Definición Estándar  |
| westSD | Feed Oeste en Definición Estándar |

### ComscoreDeliveryMode

Enumeración que identifica si la entrega de contenido es bajo demanda o lineal.

| Valor    | Descripción                            |
| -------- | -------------------------------------- |
| linear   | Entrega lineal (programación continua) |
| ondemand | Contenido bajo demanda                 |

### ComscoreDeliverySubscriptionType

Enumeración que identifica el tipo de suscripción del usuario.

| Valor           | Descripción                                                            |
| --------------- | ---------------------------------------------------------------------- |
| traditionalMvpd | Distribuidor de programación de video multicanal tradicional (EN VIVO) |
| virtualMvpd     | Distribuidor de programación de video multicanal virtual (EN VIVO)     |
| subscription    | Suscripción                                                            |
| transactional   | Transaccional                                                          |
| advertising     | Publicidad                                                             |
| premium         | Premium                                                                |

### ComscoreDeliveryComposition

Enumeración que indica si los anuncios se entregan como parte del flujo de contenido.

| Valor | Descripción                             |
| ----- | --------------------------------------- |
| clean | Sin anuncios integrados en el contenido |
| embed | Con anuncios integrados en el contenido |

### ComscoreDeliveryAdvertisementCapability

Enumeración que indica qué capacidad está permitida para las ubicaciones de publicidad.

| Valor              | Descripción                    |
| ------------------ | ------------------------------ |
| none               | Sin capacidad publicitaria     |
| dynamicLoad        | Carga dinámica de anuncios     |
| dynamicReplacement | Reemplazo dinámico de anuncios |
| linear1day         | Lineal 1 día                   |
| linear2day         | Lineal 2 días                  |
| linear3day         | Lineal 3 días                  |
| linear4day         | Lineal 4 días                  |
| linear5day         | Lineal 5 días                  |
| linear6day         | Lineal 6 días                  |
| linear7day         | Lineal 7 días                  |

### ComscoreMediaFormat

Enumeración que especifica el tipo de contenido multimedia con más detalle.

| Valor                 | Descripción                     |
| --------------------- | ------------------------------- |
| fullContentEpisode    | Episodio completo               |
| fullContentMovie      | Película completa               |
| fullContentPodcast    | Podcast completo                |
| fullContentGeneric    | Contenido completo genérico     |
| partialContentEpisode | Fragmento de episodio           |
| partialContentMovie   | Fragmento de película           |
| partialContentPodcast | Fragmento de podcast            |
| partialContentGeneric | Fragmento de contenido genérico |
| previewEpisode        | Vista previa de episodio        |
| previewMovie          | Vista previa de película        |
| previewGeneric        | Vista previa genérica           |
| extraEpisode          | Contenido extra de episodio     |
| extraMovie            | Contenido extra de película     |
| extraGeneric          | Contenido extra genérico        |

### ComscoreDistributionModel

Enumeración que especifica dónde se distribuyó el contenido.

| Valor             | Descripción                            |
| ----------------- | -------------------------------------- |
| tvAndOnline       | Distribución tanto en TV como en línea |
| exclusivelyOnline | Distribución exclusivamente en línea   |

### ComscoreDate

Tipo que representa una estructura de fecha.

| Propiedad | Tipo   | Descripción |
| --------- | ------ | ----------- |
| day       | number | Día del mes |
| month     | number | Mes del año |
| year      | number | Año         |

### ComscoreTime

Tipo que representa una estructura de hora.

| Propiedad | Tipo   | Descripción         |
| --------- | ------ | ------------------- |
| hours     | number | Horas (formato 24h) |
| minutes   | number | Minutos             |

### ComscoreDimension

Tipo que representa dimensiones (ancho y alto).

| Propiedad | Tipo   | Descripción      |
| --------- | ------ | ---------------- |
| width     | number | Ancho en píxeles |
| height    | number | Alto en píxeles  |

## Tipos de Metadatos de Publicidad

### ComscoreAdvertisementMetadata

Interfaz principal para los metadatos de anuncios que se envían a ComScore.

#### Propiedades Obligatorias

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `mediaType` | `ComscoreAdvertisementType` | Tipo de anuncio |
| `length` | `number` | Duración del anuncio en milisegundos |

#### Propiedades Opcionales

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `relatedContentMetadata` | `ComscoreMetadata` | Metadatos del contenido relacionado |
| `uniqueId` | `string` | Identificador único del anuncio |
| `deliveryType` | `ComscoreAdvertisementDeliveryType` | Mecanismo de distribución |
| `owner` | `ComscoreAdvertisementOwner` | Propietario del anuncio para monetización |
| `classifyAsAudioStream` | `boolean` | Indica si es anuncio solo de audio |
| `serverCampaignId` | `string` | ID de la campaña publicitaria |
| `placementId` | `string` | ID del placement |
| `siteId` | `string` | ID del sitio |
| `server` | `string` | Servidor/proveedor de publicidad |
| `title` | `string` | Título del anuncio |
| `callToActionUrl` | `string` | URL de call-to-action |
| `clipUrl` | `string` | URL del clip del anuncio |
| `videoDimensions` | `ComscoreDimension` | Dimensiones del video del anuncio |
| `customLabels` | `CustomComscoreAdvertisementMetadata` | Etiquetas personalizadas |

### CustomComscoreAdvertisementMetadata

Tipo para pares de nombre/valor de metadatos personalizados de anuncios.

```typescript
type CustomComscoreAdvertisementMetadata = {
  [id: string]: string;
};
```

### ComscoreAdvertisementType

Enumeración que define los tipos de anuncios según ComScore.

#### Anuncios de Video On Demand

| Valor | Descripción |
|-------|-------------|
| `onDemandPreRoll` | Pre-roll en contenido bajo demanda |
| `onDemandMidRoll` | Mid-roll en contenido bajo demanda |
| `onDemandPostRoll` | Post-roll en contenido bajo demanda |

#### Anuncios en Vivo

| Valor | Descripción |
|-------|-------------|
| `live` | Anuncio durante transmisión en vivo |

#### Branded Entertainment

| Valor | Descripción |
|-------|-------------|
| `brandedOnDemandPreRoll` | Pre-roll con marca en VOD |
| `brandedOnDemandMidRoll` | Mid-roll con marca en VOD |
| `brandedOnDemandPostRoll` | Post-roll con marca en VOD |
| `brandedAsContent` | Contenido de marca |
| `brandedDuringLive` | Marca durante transmisión en vivo |

#### Otros

| Valor | Descripción |
|-------|-------------|
| `other` | Otro tipo de anuncio |

### ComscoreAdvertisementDeliveryType

Enumeración que define los mecanismos de distribución de anuncios.

| Valor | Descripción |
|-------|-------------|
| `national` | Distribución nacional |
| `local` | Distribución local |
| `syndication` | Distribución para sindicación |

### ComscoreAdvertisementOwner

Enumeración que define los propietarios del anuncio para monetización.

| Valor | Descripción |
|-------|-------------|
| `distributor` | Monetizado por distribuidor (publisherName) |
| `originator` | Monetizado por originador (stationTitle/stationCode) |
| `multiple` | Monetizado por múltiples propietarios |
| `none` | No tiene propietario |

## Tipos de Plugin y Eventos


#### Métodos de Eventos de Reproducción

| Método                   | Parámetros                    | Descripción                                    |
| ------------------------ | ----------------------------- | ---------------------------------------------- |
| notifyEnd                | tag: number                   | Notifica el final de la reproducción           |
| notifyPause              | tag: number                   | Notifica la pausa de la reproducción           |
| notifyPlay               | tag: number                   | Notifica el inicio/reanudación de reproducción |
| createPlaybackSession    | tag: number                   | Crea una nueva sesión de reproducción          |
| setDvrWindowLength       | tag: number, length: number   | Establece la longitud de la ventana DVR        |
| notifyBufferStop         | tag: number                   | Notifica el final del buffering                |
| notifySeekStart          | tag: number                   | Notifica el inicio de una operación de seek    |
| startFromDvrWindowOffset | tag: number, offset: number   | Inicia desde un offset en la ventana DVR       |
| startFromPosition        | tag: number, position: number | Inicia la reproducción desde una posición      |
| notifyBufferStart        | tag: number                   | Notifica el inicio del buffering               |
| notifyChangePlaybackRate | tag: number, rate: number     | Notifica un cambio en la velocidad de reprod.  |
| destroyStreaming         | tag: number                   | Destruye una instancia de streaming            |

### ComscoreLabels

Tipo que representa un conjunto de etiquetas personalizadas para ComScore.

```typescript
interface ComscoreLabels {
  [key: string]: string;
}
```

**Descripción**: Un objeto que mapea nombres de etiquetas a valores de cadena. Se utiliza para establecer múltiples etiquetas persistentes de una sola vez.

**Ejemplo de uso**:

```typescript
const labels: ComscoreLabels = {
  userId: '12345',
  contentType: 'premium',
  region: 'europe',
};
```

### PlayerPlugin

Interfaz base que define la estructura básica de un plugin de reproductor multimedia.

#### Propiedades

| Propiedad | Tipo   | Descripción        | Requerido |
| --------- | ------ | ------------------ | --------- |
| name      | string | Nombre del plugin  | Sí        |
| version   | string | Versión del plugin | Sí        |

#### Métodos de Eventos Requeridos

| Método  | Parámetros | Descripción                        |
| ------- | ---------- | ---------------------------------- |
| onStart | ninguno    | Se ejecuta al iniciar el contenido |
| onPlay  | ninguno    | Se ejecuta al reproducir           |
| onPause | ninguno    | Se ejecuta al pausar               |
| onEnd   | ninguno    | Se ejecuta al finalizar            |
| destroy | ninguno    | Limpia recursos del plugin         |

#### Métodos de Eventos Opcionales

| Método                | Parámetros                       | Descripción                               |
| --------------------- | -------------------------------- | ----------------------------------------- |
| onBuffering           | value: boolean                   | Se ejecuta al cambiar estado de buffering |
| onSeek                | value: number                    | Se ejecuta al hacer seek                  |
| onProgress            | value: number, duration?: number | Se ejecuta durante el progreso            |
| onChangeAudioIndex    | index: number, label?: string    | Se ejecuta al cambiar pista de audio      |
| onChangeSubtitleIndex | index: number, label?: string    | Se ejecuta al cambiar subtítulos          |
| onNext                | ninguno                          | Se ejecuta al ir al siguiente             |
| onPrevious            | ninguno                          | Se ejecuta al ir al anterior              |

### ComscorePluginInterface

Interfaz que extiende `PlayerPlugin` con funcionalidad específica de ComScore.

#### Métodos Adicionales de ComScore

| Método              | Parámetros                        | Descripción                                   |
| ------------------- | --------------------------------- | --------------------------------------------- |
| update              | metadata: ComscoreMetadata        | Actualiza los metadatos de ComScore           |
| setPersistentLabel  | label: string, value: string      | Establece una etiqueta persistente individual |
| setPersistentLabels | labels: { [key: string]: string } | Establece múltiples etiquetas persistentes    |
| getInstanceId       | ninguno                           | Obtiene el ID de la instancia de ComScore     |

**Descripción**: Esta interfaz combina la funcionalidad básica de un plugin de reproductor con las capacidades específicas de analítica de ComScore.

### ComscoreState

Enumeración que define los diferentes estados posibles del sistema de ComScore.

| Valor         | Descripción                             |
| ------------- | --------------------------------------- |
| INITIALIZED   | 'initialized' - Sistema inicializado    |
| STOPPED       | 'stopped' - Reproducción detenida       |
| PAUSED_AD     | 'paused_ad' - Anuncio pausado           |
| PAUSED_VIDEO  | 'paused_video' - Video pausado          |
| ADVERTISEMENT | 'advertisement' - Reproduciendo anuncio |
| VIDEO         | 'video' - Reproduciendo video           |

**Uso**: Esta enumeración se utiliza para rastrear y gestionar el estado actual del sistema de ComScore, permitiendo un manejo más preciso de los eventos de analítica según el contexto de reproducción.

**Ejemplo de uso**:

```typescript
if (currentState === ComscoreState.VIDEO) {
  // Lógica específica para cuando se está reproduciendo video
} else if (currentState === ComscoreState.ADVERTISEMENT) {
  // Lógica específica para cuando se está reproduciendo un anuncio
}
```

## Notas de Uso

### Diferencias entre Tipos

- **ComscoreModule**: Interfaz de bajo nivel que representa directamente el módulo nativo
- **PlayerPlugin**: Interfaz base para cualquier plugin de reproductor
- **ComscorePluginInterface**: Interfaz específica que combina plugin de reproductor con ComScore
- **ComscoreLabels**: Tipo de utilidad para manejar múltiples etiquetas
- **ComscoreState**: Enumeración para el manejo de estados del sistema

### Recomendaciones

1. **Para desarrollo de aplicaciones**: Usa `ComscoreConnector` o `ComscoreConnectorAdapter`
2. **Para desarrollo de plugins**: Implementa `ComscorePluginInterface`
3. **Para integración de bajo nivel**: Utiliza `ComscoreModule` directamente
4. **Para gestión de estado**: Utiliza `ComscoreState` para tracking preciso
