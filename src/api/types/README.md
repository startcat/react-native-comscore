# Documentación de Tipos ComScore

Este documento proporciona una explicación detallada de todos los tipos definidos en la integración de ComScore para React Native.

## Tabla de Contenidos

- [Tipos de Configuración](#tipos-de-configuración)
  - [ComscoreConfiguration](#comscoreconfiguration)
  - [ComscoreUserConsent](#comscoreuserconsent)
  - [ComscoreUsagePropertiesAutoUpdateMode](#comscoreusagepropertiesautoupdatemode)
- [Tipos de Metadatos](#tipos-de-metadatos)
  - [ComscoreMetadata](#comscoremetadata)
  - [CustomComscoreMetadata](#customcomscoremetadata)
  - [ComscoreMediaType](#comscoremediatype)
  - [ComscoreFeedType](#comscorefeedtype)
  - [ComscoreDeliveryMode](#comscoredeliverymode)
  - [ComscoreDeliverySubscriptionType](#comscoredeliverysubscriptiontype)
  - [ComscoreDeliveryComposition](#comscoredeliverycomposition)
  - [ComscoreDeliveryAdvertisementCapability](#comscoredeliveryadvertisementcapability)
  - [ComscoreMediaFormat](#comscoremediaformat)
  - [ComscoreDistributionModel](#comscoreDistributionModel)
  - [ComscoreDate](#comscoredate)
  - [ComscoreTime](#comscoretime)
  - [ComscoreDimension](#comscoredimension)

## Tipos de Configuración

### ComscoreConfiguration

La interfaz principal de configuración para la analítica de ComScore.

| Propiedad | Tipo | Descripción | Requerido |
|-----------|------|-------------|----------|
| publisherId | string | También conocido como el valor c2 | Sí |
| applicationName | string | Nombre de la aplicación | Sí |
| userConsent | ComscoreUserConsent | Consentimiento del usuario para la recolección de datos | Sí |
| usagePropertiesAutoUpdateMode | ComscoreUsagePropertiesAutoUpdateMode | Modo de actualización automática de propiedades de uso. Por defecto es foregroundOnly | No |
| debug | boolean | Habilita el modo de depuración | No |

### ComscoreUserConsent

Enumeración que define los valores de consentimiento del usuario para la recolección de datos.

| Valor | Descripción |
|-------|-------------|
| denied | '0' - El usuario ha denegado el consentimiento |
| granted | '1' - El usuario ha otorgado consentimiento |
| unknown | '-1' - El estado de consentimiento es desconocido |

### ComscoreUsagePropertiesAutoUpdateMode

Enumeración que define cuándo se deben actualizar automáticamente las propiedades de uso.

| Valor | Descripción |
|-------|-------------|
| foregroundOnly | Actualiza las propiedades solo cuando la aplicación está en primer plano |
| foregroundAndBackground | Actualiza las propiedades tanto en primer plano como en segundo plano |
| disabled | Desactiva las actualizaciones automáticas de propiedades |

## Tipos de Metadatos

### ComscoreMetadata

La interfaz principal para los metadatos que se envían a ComScore.

| Propiedad | Tipo | Descripción | Requerido |
|-----------|------|-------------|----------|
| mediaType | ComscoreMediaType | Tipo de clasificación, obligatorio | Sí |
| uniqueId | string | ID único para el contenido | Sí |
| length | number | Duración del clip en milisegundos | Sí |
| c3 | string | Diccionario VMX (nivel 1) | No |
| c4 | string | Diccionario VMX (nivel 2) | No |
| c6 | string | Diccionario VMX (nivel 3) | No |
| stationTitle | string | Nombre del canal | Sí |
| stationCode | string | Código del canal | No |
| networkAffiliate | string | Código de afiliación de la estación | No |
| publisherName | string | Nombre de la marca del editor | No |
| programTitle | string | Nombre del programa | Sí |
| programId | string | ID del programa | No |
| episodeTitle | string | Título del episodio | Sí |
| episodeId | string | ID del episodio | No |
| episodeSeasonNumber | string | Número de temporada | No |
| episodeNumber | string | Número de episodio | No |
| genreName | string | Descripción del género | Sí |
| genreId | string | ID del género | No |
| carryTvAdvertisementLoad | boolean | Indica si la transmisión lleva la misma carga publicitaria que la TV | No |
| classifyAsCompleteEpisode | boolean | Indica si el medio es un episodio completo | No |
| dateOfProduction | ComscoreDate | Fecha de producción | No |
| timeOfProduction | ComscoreTime | Hora de producción | No |
| dateOfTvAiring | ComscoreDate | Fecha de emisión en TV | No |
| timeOfTvAiring | ComscoreTime | Hora de emisión en TV | No |
| dateOfDigitalAiring | ComscoreDate | Fecha de disponibilidad para streaming | No |
| timeOfDigitalAiring | ComscoreTime | Hora de disponibilidad para streaming | No |

### CustomComscoreMetadata

Un tipo para pares de nombre/valor de metadatos personalizados.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| [id: string] | string | Pares clave-valor para metadatos personalizados |

### ComscoreMediaType

Enumeración que define los tipos de clasificación para el contenido multimedia.

| Valor | Descripción |
|-------|-------------|
| longFormOnDemand | Contenido largo bajo demanda |
| shortFormOnDemand | Contenido corto bajo demanda |
| live | Contenido en directo |
| userGeneratedLongFormOnDemand | Contenido generado por el usuario de formato largo |
| userGeneratedShortFormOnDemand | Contenido generado por el usuario de formato corto |
| userGeneratedLive | Contenido en directo generado por el usuario |
| bumper | Bumper |
| other | Otro tipo de contenido |

### ComscoreFeedType

Enumeración que especifica el tipo de feed proporcionado en una transmisión en directo.

| Valor | Descripción |
|-------|-------------|
| eastHD | Feed Este en Alta Definición |
| westHD | Feed Oeste en Alta Definición |
| eastSD | Feed Este en Definición Estándar |
| westSD | Feed Oeste en Definición Estándar |

### ComscoreDeliveryMode

Enumeración que identifica si la entrega de contenido es bajo demanda o lineal.

| Valor | Descripción |
|-------|-------------|
| linear | Entrega lineal (programación continua) |
| ondemand | Contenido bajo demanda |

### ComscoreDeliverySubscriptionType

Enumeración que identifica el tipo de suscripción del usuario.

| Valor | Descripción |
|-------|-------------|
| traditionalMvpd | Distribuidor de programación de video multicanal tradicional (EN VIVO) |
| virtualMvpd | Distribuidor de programación de video multicanal virtual (EN VIVO) |
| subscription | Suscripción |
| transactional | Transaccional |
| advertising | Publicidad |
| premium | Premium |

### ComscoreDeliveryComposition

Enumeración que indica si los anuncios se entregan como parte del flujo de contenido.

| Valor | Descripción |
|-------|-------------|
| clean | Sin anuncios integrados en el contenido |
| embed | Con anuncios integrados en el contenido |

### ComscoreDeliveryAdvertisementCapability

Enumeración que indica qué capacidad está permitida para las ubicaciones de publicidad.

| Valor | Descripción |
|-------|-------------|
| none | Sin capacidad publicitaria |
| dynamicLoad | Carga dinámica de anuncios |
| dynamicReplacement | Reemplazo dinámico de anuncios |
| linear1day | Lineal 1 día |
| linear2day | Lineal 2 días |
| linear3day | Lineal 3 días |
| linear4day | Lineal 4 días |
| linear5day | Lineal 5 días |
| linear6day | Lineal 6 días |
| linear7day | Lineal 7 días |

### ComscoreMediaFormat

Enumeración que especifica el tipo de contenido multimedia con más detalle.

| Valor | Descripción |
|-------|-------------|
| fullContentEpisode | Episodio completo |
| fullContentMovie | Película completa |
| fullContentPodcast | Podcast completo |
| fullContentGeneric | Contenido completo genérico |
| partialContentEpisode | Fragmento de episodio |
| partialContentMovie | Fragmento de película |
| partialContentPodcast | Fragmento de podcast |
| partialContentGeneric | Fragmento de contenido genérico |
| previewEpisode | Vista previa de episodio |
| previewMovie | Vista previa de película |
| previewGeneric | Vista previa genérica |
| extraEpisode | Contenido extra de episodio |
| extraMovie | Contenido extra de película |
| extraGeneric | Contenido extra genérico |

### ComscoreDistributionModel

Enumeración que especifica dónde se distribuyó el contenido.

| Valor | Descripción |
|-------|-------------|
| tvAndOnline | Distribución tanto en TV como en línea |
| exclusivelyOnline | Distribución exclusivamente en línea |

### ComscoreDate

Tipo que representa una estructura de fecha.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| day | number | Día del mes |
| month | number | Mes del año |
| year | number | Año |

### ComscoreTime

Tipo que representa una estructura de hora.

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| hours | number | Horas (formato 24h) |
| minutes | number | Minutos |

### ComscoreDimension

Tipo que representa dimensiones (ancho y alto).

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| width | number | Ancho en píxeles |
| height | number | Alto en píxeles |
