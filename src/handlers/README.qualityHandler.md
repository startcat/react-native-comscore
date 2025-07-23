# Documentación del ComscoreQualityHandler

Este documento describe el handler especializado para la gestión de calidad de video, audio, volumen y subtítulos en el sistema de tracking de ComScore.

## Descripción General

El `ComscoreQualityHandler` es responsable de gestionar todos los aspectos relacionados con la calidad de reproducción, incluyendo cambios de calidad de video, bitrate, resolución, pistas de audio, volumen, silencio y subtítulos. Mantiene historial de cambios y estadísticas para análisis de rendimiento.

## Arquitectura del Handler

| Componente | Descripción | Responsabilidad |
|------------|-------------|----------------|
| **ComscoreQualityHandler** | Handler principal | Gestión completa de calidad |
| **Quality Tracking** | Seguimiento de calidad | Monitoreo de calidad de video |
| **Audio Management** | Gestión de audio | Control de pistas y volumen |
| **Subtitle Management** | Gestión de subtítulos | Control de subtítulos y visibilidad |
| **Statistics Engine** | Motor de estadísticas | Análisis y métricas de calidad |
| **History Management** | Gestión de historial | Registro de cambios para análisis |

## Tipos de Eventos Soportados

### Eventos de Calidad de Video

| Evento | Método | Descripción | Datos Incluidos |
|--------|--------|-------------|----------------|
| **Quality Change** | `handleQualityChange()` | Cambio de calidad general | quality, width, height, bitrate |
| **Bitrate Change** | `handleBitrateChange()` | Cambio específico de bitrate | bitrate, previousBitrate, adaptive |
| **Resolution Change** | `handleResolutionChange()` | Cambio de resolución | width, height |

### Eventos de Audio

| Evento | Método | Descripción | Datos Incluidos |
|--------|--------|-------------|----------------|
| **Audio Track Change** | `handleAudioTrackChange()` | Cambio de pista de audio | trackIndex, trackLabel, language |
| **Volume Change** | `handleVolumeChange()` | Cambio de volumen | volume |
| **Mute Change** | `handleMuteChange()` | Cambio de silencio | muted |
| **Playback Rate Change** | `handlePlaybackRateChange()` | Cambio de velocidad | rate |

### Eventos de Subtítulos

| Evento | Método | Descripción | Datos Incluidos |
|--------|--------|-------------|----------------|
| **Subtitle Track Change** | `handleSubtitleTrackChange()` | Cambio de pista de subtítulos | trackIndex, trackLabel, language |
| **Subtitle Show** | `handleSubtitleShow()` | Mostrar subtítulos | visible: true |
| **Subtitle Hide** | `handleSubtitleHide()` | Ocultar subtítulos | visible: false |

## API del Handler

### Constructor

```typescript
constructor(context: HandlerContext, stateManager: ComscoreStateManager)
```

#### Parámetros del Constructor

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |
| `stateManager` | `ComscoreStateManager` | Gestor de estados de ComScore | ✅ Sí |

### Métodos de Calidad de Video

#### handleQualityChange()

Maneja cambios generales de calidad de video.

```typescript
handleQualityChange(params: QualityChangeParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `QualityChangeParams` | Parámetros del cambio de calidad | ✅ Sí |

**Estructura de QualityChangeParams:**

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `quality` | `string` | Identificador de calidad (ej: "720p", "1080p") | ✅ Sí |
| `width` | `number` | Ancho en píxeles | ❌ No |
| `height` | `number` | Alto en píxeles | ❌ No |
| `bitrate` | `number` | Bitrate en bps | ❌ No |

**Funcionalidad:**
- ✅ Actualiza calidad actual
- ✅ Incrementa contador de cambios
- ✅ Agrega al historial
- ✅ Actualiza metadatos si es cambio significativo
- ✅ Registra evento para debugging

#### handleBitrateChange()

Maneja cambios específicos de bitrate.

```typescript
handleBitrateChange(params: BitrateChangeParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `BitrateChangeParams` | Parámetros del cambio de bitrate | ✅ Sí |

**Estructura de BitrateChangeParams:**

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `bitrate` | `number` | Nuevo bitrate en bps | ✅ Sí |
| `previousBitrate` | `number` | Bitrate anterior | ❌ No |
| `adaptive` | `boolean` | Si es cambio adaptativo | ❌ No |

**Funcionalidad:**
- ✅ Actualiza bitrate en calidad actual
- ✅ Agrega al historial de bitrate
- ✅ Evalúa si es cambio significativo (>20% por defecto)
- ✅ Actualiza metadatos si es necesario

### Métodos de Audio

#### handleAudioTrackChange()

Maneja cambios de pista de audio.

```typescript
handleAudioTrackChange(params: AudioTrackChangeParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `AudioTrackChangeParams` | Parámetros del cambio de audio | ✅ Sí |

**Estructura de AudioTrackChangeParams:**

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `trackIndex` | `number` | Índice de la nueva pista | ✅ Sí |
| `trackLabel` | `string` | Etiqueta de la pista | ❌ No |
| `language` | `string` | Idioma de la pista | ❌ No |

#### handleVolumeChange()

Maneja cambios de volumen.

```typescript
handleVolumeChange(params: VolumeChangeParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `VolumeChangeParams` | Parámetros del cambio de volumen | ✅ Sí |

**Estructura de VolumeChangeParams:**

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `volume` | `number` | Nuevo nivel de volumen (0.0 - 1.0) | ✅ Sí |

### Métodos de Subtítulos

#### handleSubtitleTrackChange()

Maneja cambios de pista de subtítulos.

```typescript
handleSubtitleTrackChange(params: SubtitleTrackChangeParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `SubtitleTrackChangeParams` | Parámetros del cambio de subtítulos | ✅ Sí |

**Estructura de SubtitleTrackChangeParams:**

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `trackIndex` | `number` | Índice de la nueva pista | ✅ Sí |
| `trackLabel` | `string` | Etiqueta de la pista | ❌ No |
| `language` | `string` | Idioma de los subtítulos | ❌ No |

### Métodos de Consulta

#### getCurrentQuality()

Obtiene la información de calidad actual.

```typescript
getCurrentQuality(): QualityInfo | null
```

#### getQualityStatistics()

Obtiene estadísticas completas de calidad.

```typescript
getQualityStatistics(): {
  currentQuality?: string;
  currentBitrate?: number;
  currentResolution?: string;
  qualityChanges: number;
  bitrateChanges: number;
  audioTrackChanges: number;
  subtitleChanges: number;
  averageBitrate?: number;
  currentVolume: number;
  isMuted: boolean;
  hasSubtitles: boolean;
  subtitleLanguage?: string;
  audioLanguage?: string;
}
```

## Estructuras de Datos

### QualityInfo

```typescript
interface QualityInfo {
  quality: string;
  width?: number;
  height?: number;
  bitrate?: number;
  timestamp: number;
}
```

### AudioInfo

```typescript
interface AudioInfo {
  trackIndex: number;
  trackLabel?: string;
  language?: string;
  timestamp: number;
}
```

### VolumeInfo

```typescript
interface VolumeInfo {
  volume: number;
  muted: boolean;
  timestamp: number;
}
```

### SubtitleInfo

```typescript
interface SubtitleInfo {
  trackIndex: number;
  trackLabel?: string;
  language?: string;
  visible: boolean;
  timestamp: number;
}
```

## Criterios de Cambios Significativos

### Cambios de Bitrate

| Criterio | Umbral | Descripción |
|----------|--------|-------------|
| **Cambio Porcentual** | 20% | Diferencia mínima para considerar significativo |
| **Cambio Adaptativo** | Siempre | Cambios adaptativos siempre son significativos |

### Cambios de Volumen

| Criterio | Umbral | Descripción |
|----------|--------|-------------|
| **Cambio Porcentual** | 10% | Diferencia mínima para considerar significativo |
| **Mute/Unmute** | Siempre | Cambios de silencio siempre son significativos |

## Ejemplos de Uso

### Ejemplo 1: Integración Básica

```typescript
import { ComscoreQualityHandler } from './ComscoreQualityHandler';

// Configuración del handler
const qualityHandler = new ComscoreQualityHandler(context, stateManager);

// Integración con eventos del reproductor
const setupQualityEvents = (player: VideoPlayer) => {
  // Cambios de calidad
  player.on('qualitychange', (event) => {
    qualityHandler.handleQualityChange({
      quality: event.quality,
      width: event.width,
      height: event.height,
      bitrate: event.bitrate
    });
  });

  // Cambios de bitrate
  player.on('bitratechange', (event) => {
    qualityHandler.handleBitrateChange({
      bitrate: event.newBitrate,
      previousBitrate: event.previousBitrate,
      adaptive: event.isAdaptive
    });
  });

  // Cambios de volumen
  player.on('volumechange', (event) => {
    qualityHandler.handleVolumeChange({
      volume: event.volume
    });
  });
};
```

### Ejemplo 2: Control de Subtítulos

```typescript
// Configuración de subtítulos
const setupSubtitles = (player: VideoPlayer) => {
  const subtitleTracks = player.getSubtitleTracks();
  const subtitleSelector = document.getElementById('subtitle-selector');
  
  // Opción para desactivar subtítulos
  const offOption = document.createElement('option');
  offOption.value = '-1';
  offOption.textContent = 'Sin subtítulos';
  subtitleSelector.appendChild(offOption);
  
  subtitleTracks.forEach((track, index) => {
    const option = document.createElement('option');
    option.value = index.toString();
    option.textContent = `${track.label} (${track.language})`;
    subtitleSelector.appendChild(option);
  });

  // Manejar cambio de subtítulos
  subtitleSelector.addEventListener('change', (event) => {
    const trackIndex = parseInt(event.target.value);
    
    if (trackIndex === -1) {
      player.hideSubtitles();
      qualityHandler.handleSubtitleHide();
    } else {
      const selectedTrack = subtitleTracks[trackIndex];
      player.setSubtitleTrack(trackIndex);
      player.showSubtitles();
      
      qualityHandler.handleSubtitleTrackChange({
        trackIndex: trackIndex,
        trackLabel: selectedTrack.label,
        language: selectedTrack.language
      });
      
      qualityHandler.handleSubtitleShow({
        visible: true
      });
    }
  });
};
```

### Ejemplo 3: Análisis de Rendimiento

```typescript
// Análisis de rendimiento de calidad
const analyzeQualityPerformance = () => {
  const stats = qualityHandler.getQualityStatistics();
  const qualityHistory = qualityHandler.getQualityHistory();

  console.log('Quality Performance Analysis:', {
    current: {
      quality: stats.currentQuality,
      bitrate: stats.currentBitrate,
      resolution: stats.currentResolution
    },
    changes: {
      quality: stats.qualityChanges,
      bitrate: stats.bitrateChanges
    },
    userExperience: {
      audioLanguage: stats.audioLanguage,
      subtitlesEnabled: stats.hasSubtitles,
      subtitleLanguage: stats.subtitleLanguage,
      volume: stats.currentVolume,
      muted: stats.isMuted
    }
  });
};
```

## Mejores Prácticas

### ✅ **Validación de Parámetros**

```typescript
// CORRECTO: Validar parámetros antes de procesar
const safeHandleQualityChange = (params: QualityChangeParams) => {
  if (!params.quality || typeof params.quality !== 'string') {
    console.warn('Invalid quality parameter:', params);
    return;
  }
  
  if (params.bitrate && (params.bitrate < 0 || params.bitrate > 100000000)) {
    console.warn('Invalid bitrate value:', params.bitrate);
    return;
  }
  
  qualityHandler.handleQualityChange(params);
};
```

### ✅ **Manejo de Eventos Frecuentes**

```typescript
// CORRECTO: Debounce para eventos muy frecuentes
let bitrateChangeTimeout: NodeJS.Timeout;

const handleBitrateChangeDebounced = (params: BitrateChangeParams) => {
  clearTimeout(bitrateChangeTimeout);
  
  bitrateChangeTimeout = setTimeout(() => {
    qualityHandler.handleBitrateChange(params);
  }, 100); // 100ms debounce
};
```

## Consideraciones de Performance

### 🚀 **Optimizaciones**
- **Historial limitado** - Máximo 50 entradas por tipo
- **Cambios significativos** - Solo actualiza metadatos cuando es necesario
- **Debouncing** - Evita procesamiento excesivo de eventos frecuentes
- **Lazy evaluation** - Cálculos estadísticos bajo demanda

### ⚠️ **Limitaciones**
- **Historial en memoria** - Se pierde al reiniciar la aplicación
- **Umbrales fijos** - Configuración de umbrales no es dinámica
- **Un estado por tipo** - Solo mantiene estado actual de cada tipo

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Cambios no se registran | Parámetros inválidos | Validar estructura de parámetros |
| Metadatos no se actualizan | Cambio no significativo | Verificar umbrales de significancia |
| Historial muy grande | Muchos cambios frecuentes | Usar `resetStatistics()` |
| Audio/subtítulos incorrectos | Índices de pista erróneos | Verificar índices de pistas |

### Debugging

```typescript
// Información del estado de calidad
const debugQualityState = () => {
  const stats = qualityHandler.getQualityStatistics();
  
  console.log('Quality Handler Debug:', {
    current: {
      quality: qualityHandler.getCurrentQuality(),
      audio: qualityHandler.getCurrentAudio(),
      volume: qualityHandler.getCurrentVolume(),
      subtitle: qualityHandler.getCurrentSubtitle()
    },
    statistics: stats,
    history: {
      qualityChanges: qualityHandler.getQualityHistory().length,
      bitrateChanges: qualityHandler.getBitrateHistory().length
    }
  });
};
```

## 🔗 Referencias

- 📚 **Tipos**: [Handler Types](./types/index.ts)
- 🎯 **Analytics**: [AnalyticsPlugin Types](../types/AnalyticsPlugin.ts)
- 🔧 **Base**: [Sistema base de handlers](./base/README.md)
- 📊 **State Manager**: [ComscoreStateManager](./README.stateManager.md)
- 📝 **Logging**: [Sistema de logging](../logger/README.md)
