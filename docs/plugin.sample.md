# Ejemplo de Plugin ComScore Streaming Tag

Este documento muestra un ejemplo completo de implementación de un plugin de ComScore Streaming Tag para el [Player OTT](https://github.com/startcat/react-native-video) (Over-The-Top) en React Native.

## Propósito del Plugin

La función `createComscorePlugin` actúa como un **adaptador/mapper** que convierte los datos de contenido de tu proyecto (que pueden venir en cualquier formato) a los metadatos requeridos por ComScore. 

**Importante**: Los tipos de datos de entrada (`MediaContentType` en este ejemplo) **deben ser adaptados por cada desarrollador** según la estructura específica de datos de su proyecto. El objetivo es mapear los datos de tu API/sistema al formato que espera ComScore.

## Implementación del Plugin

```typescript
import {
    ComscoreMediaType,
    ComscorePlugin,
    ComscoreUsagePropertiesAutoUpdateMode,
    ComscoreUserConsent,
    type ComscoreConfiguration,
    type ComscoreMetadata,
} from "react-native-comscore";

import Config from "react-native-config";

// Constantes de configuración específicas de tu proyecto
const STATION_CODE = {
    MAIN_CHANNEL: "1",
    SECONDARY_CHANNEL: "2",
    SPORTS_CHANNEL: "3",
    NEWS_CHANNEL: "4",
    // Adaptar según los canales/estaciones de tu proyecto
};

const CONTENT_FORMAT = {
    "Full Program": "0001",
    "Program Segment": "0002",
    "Extra Content": "0003",
    "Promotional": "0004",
    // Adaptar según los formatos de contenido de tu proyecto
};

export const createComscorePlugin = (mediaData: MediaContentType | null): ComscorePlugin | null => {
    if (!mediaData) {
        return null;
    }

    // Validación de configuración requerida
    if (!Config.COMSCORE_PUBLISHER_ID) {
        console.warn(
            `[ComScore] createComscorePlugin error: Falta la clave de publisher (Config.COMSCORE_PUBLISHER_ID)`
        );
        return null;
    }

    if (!Config.COMSCORE_APPLICATION) {
        console.warn(
            `[ComScore] createComscorePlugin error: Falta la clave de aplicación (Config.COMSCORE_APPLICATION)`
        );
        return null;
    }

    // Configuración base del plugin
    const configuration: ComscoreConfiguration = {
        publisherId: Config.COMSCORE_PUBLISHER_ID!,
        applicationName: Config.COMSCORE_APPLICATION!,
        userConsent: ComscoreUserConsent.granted, // Ajustar según consentimiento del usuario
        usagePropertiesAutoUpdateMode: ComscoreUsagePropertiesAutoUpdateMode.foregroundAndBackground,
        debug: __DEV__, // Solo en desarrollo
    };

    // Metadatos del contenido
    const metadata: ComscoreMetadata = {
        // Tipo de media: live para directo, longFormOnDemand para VOD
        mediaType: mediaData.isLive ? ComscoreMediaType.live : ComscoreMediaType.longFormOnDemand,
        
        // ID único del contenido
        uniqueId: mediaData.id,
        
        // Duración en milisegundos (5 minutos por defecto para live)
        length: mediaData.isLive ? 300 * 1000 : mediaData.duration * 1000,
        
        // Metadatos básicos requeridos
        c3: "YOUR_ORGANIZATION", // Nombre de tu organización
        c4: mediaData.title,     // Título del contenido
        c6: "*null",             // Clasificación adicional (opcional)
        
        // Información de la estación/canal
        stationTitle: "YOUR_STATION_NAME",
        stationCode: getStationCode(mediaData.channel),
        
        // Título del programa (obligatorio)
        programTitle: mediaData.title,
        
        // Título del episodio (opcional)
        episodeTitle: mediaData.episodeTitle || "",
        
        // Número de temporada (opcional)
        episodeSeasonNumber: mediaData.seasonNumber?.toString(),
        
        // Número de episodio (opcional, recomendado con 2-3 dígitos)
        episodeNumber: mediaData.episodeNumber?.toString().padStart(2, '0'),
        
        // Género del contenido (opcional, múltiples valores separados por comas)
        genreName: mediaData.genres?.join(', ') || "*null",
        
        // Indica si lleva la misma carga publicitaria que TV
        carryTvAdvertisementLoad: mediaData.hasAds || false,
        
        // Indica si es un episodio completo
        classifyAsCompleteEpisode: mediaData.isCompleteEpisode || true,
        
        // Hora de producción (opcional)
        timeOfProduction: mediaData.productionTime ? {
            hours: mediaData.productionTime.getHours(),
            minutes: mediaData.productionTime.getMinutes()
        } : undefined,
        
        // Fecha de emisión en TV (opcional pero recomendado para VOD)
        dateOfTvAiring: mediaData.tvAiringDate ? {
            year: mediaData.tvAiringDate.getFullYear(),
            month: mediaData.tvAiringDate.getMonth() + 1,
            day: mediaData.tvAiringDate.getDate()
        } : undefined,
        
        // Fecha de disponibilidad digital (opcional)
        dateOfDigitalAiring: mediaData.digitalAiringDate ? {
            year: mediaData.digitalAiringDate.getFullYear(),
            month: mediaData.digitalAiringDate.getMonth() + 1,
            day: mediaData.digitalAiringDate.getDate()
        } : undefined,
        
        // Indica si es solo audio (false para video)
        classifyAsAudioStream: mediaData.isAudioOnly || false,
        
        // Etiquetas personalizadas
        customLabels: {
            cs_ufcr: "1", // User consent (ajustar según consentimiento real)
            fp_offset: "0", // First party offset
            ns_ap_an: Config.COMSCORE_APPLICATION, // Nombre de la aplicación
            ns_ap_b: "", // Brand de la aplicación (opcional)
            ns_st_ty: getContentFormat(mediaData.type), // Tipo de contenido
            // Añadir más etiquetas personalizadas según necesidades
        },
    };

    return new ComscorePlugin(metadata, configuration);
};

// Función auxiliar para obtener el código de estación
const getStationCode = (channel: string): string => {
    return STATION_CODE[channel as keyof typeof STATION_CODE] || STATION_CODE.MAIN_CHANNEL;
};

// Función auxiliar para obtener el formato de contenido
const getContentFormat = (contentType: string): string => {
    switch (contentType) {
        case 'full':
            return CONTENT_FORMAT["Full Program"];
        case 'segment':
            return CONTENT_FORMAT["Program Segment"];
        case 'extra':
            return CONTENT_FORMAT["Extra Content"];
        case 'promo':
            return CONTENT_FORMAT["Promotional"];
        default:
            return CONTENT_FORMAT["Full Program"];
    }
};

## Explicación del Plugin

### 1. **Validación de Configuración**

```typescript
if (!Config.COMSCORE_PUBLISHER_ID || !Config.COMSCORE_APPLICATION) {
    console.warn('[ComScore] Faltan claves de configuración');
    return null;
}
```

- Verifica que las variables de entorno necesarias estén configuradas
- Devuelve `null` si falta alguna configuración crítica

### 2. **Configuración Base**

```typescript
const configuration: ComscoreConfiguration = {
    publisherId: Config.COMSCORE_PUBLISHER_ID!,
    applicationName: Config.COMSCORE_APPLICATION!,
    userConsent: ComscoreUserConsent.granted,
    usagePropertiesAutoUpdateMode: ComscoreUsagePropertiesAutoUpdateMode.foregroundAndBackground,
    debug: __DEV__,
};
```

**Parámetros principales:**
- **`publisherId`**: Tu ID de publisher de ComScore
- **`applicationName`**: Nombre de tu aplicación
- **`userConsent`**: Estado del consentimiento del usuario
- **`usagePropertiesAutoUpdateMode`**: Modo de actualización automática
- **`debug`**: Habilita logs detallados (solo en desarrollo)

### 3. **Metadatos del Contenido**

#### Metadatos Obligatorios:
- **`mediaType`**: Tipo de contenido (live/VOD)
- **`uniqueId`**: Identificador único del contenido
- **`length`**: Duración en milisegundos
- **`c3`**: Identificador de la organización
- **`c4`**: Título del contenido
- **`programTitle`**: Título del programa

#### Metadatos Opcionales pero Recomendados:
- **`episodeTitle`**: Título del episodio específico
- **`genreName`**: Género(s) del contenido
- **`dateOfTvAiring`**: Fecha de emisión en TV
- **`classifyAsCompleteEpisode`**: Si es un episodio completo

📋 **Para consultar todos los parámetros disponibles de `ComscoreMetadata`, consulta: [Documentación Completa de Tipos](arc/api/types/README.md)**

### 4. **Etiquetas Personalizadas**

```typescript
customLabels: {
    cs_ufcr: "1",        // Consentimiento del usuario
    fp_offset: "0",      // Offset de first party
    ns_ap_an: "MyApp",   // Nombre de la aplicación
    ns_st_ty: "0001",    // Tipo de contenido
}
```

Permite añadir metadatos específicos de tu implementación.

## Adaptación de Tipos de Datos

### ⚠️ Punto Clave: Personalización Obligatoria

La función `createComscorePlugin` es **un ejemplo de adaptador** que debes personalizar completamente según tu proyecto:

```typescript
// Ejemplo original del proyecto de referencia:
export const createComscorePlugin = (mediaData: MediaDto | StreamDto | null): ComscorePlugin | null => {}

// Tu implementación será diferente, por ejemplo:
export const createComscorePlugin = (contentInfo: YourContentType | null): ComscorePlugin | null => {}
// o
export const createComscorePlugin = (video: VideoModel, channel: ChannelInfo): ComscorePlugin | null => {}
// o
export const createComscorePlugin = (playbackData: PlaybackData): ComscorePlugin | null => {}
```

### Proceso de Adaptación

1. **Analiza tus datos**: Identifica qué información tienes disponible sobre el contenido a reproducir
2. **Define tu interfaz**: Crea tipos TypeScript que reflejen la estructura de tus datos
3. **Mapea los campos**: Conecta tus datos con los metadatos requeridos por ComScore
4. **Maneja valores faltantes**: Define valores por defecto para campos opcionales

## Adaptación a Tu Proyecto

### 1. **Constantes de Configuración**

```typescript
// Adapta según tus canales/estaciones
const STATION_CODE = {
    YOUR_MAIN_CHANNEL: "1",
    YOUR_SPORTS_CHANNEL: "2",
    // ...
};

// Adapta según tus tipos de contenido
const CONTENT_FORMAT = {
    "Full Episode": "0001",
    "Clip": "0002",
    // ...
};
```

### 2. **Estructura de Datos**

Modifica la interfaz `MediaContentType` según la estructura de datos de tu API o sistema de contenidos.

### 3. **Lógica de Mapeo**

```typescript
// Personaliza la lógica según tus necesidades
const getStationCode = (channel: string): string => {
    // Tu lógica específica para mapear canales
};

const getContentFormat = (type: string): string => {
    // Tu lógica específica para tipos de contenido
};
```

### 4. **Consentimiento del Usuario**

```typescript
// Ajusta según el estado real del consentimiento
userConsent: userHasConsented ? 
    ComscoreUserConsent.granted : 
    ComscoreUserConsent.denied,
```

## Uso del Plugin

Para ver un ejemplo completo de la gestión de plugins con eventos del Player OTT, consulta:

📋 **[Ejemplo de Gestor de Plugins](plugin.manager.sample.md)**

## Consideraciones Importantes

### **Privacidad y Consentimiento**
- Asegúrate de tener el consentimiento del usuario antes de habilitar el tracking
- Actualiza `cs_ufcr` dinámicamente según el estado del consentimiento

### **Rendimiento**
- El modo `foregroundAndBackground` puede afectar la batería
- Considera usar `foregroundOnly` si es apropiado para tu caso

### **Validación de Datos**
- Siempre valida que los datos del contenido estén disponibles
- Maneja casos donde falten metadatos opcionales

### **Testing**
- Usa `debug: true` durante el desarrollo para ver logs detallados
- Desactiva el debug en producción para mejor rendimiento

---

**Nota**: Este ejemplo debe adaptarse según la estructura específica de datos de tu proyecto y los requisitos de tu reproductor de video.