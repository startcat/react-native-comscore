# Documentación de ComscorePlugin

Este documento describe cómo funciona el plugin de ComScore para integración con reproductores de medios en React Native.

## Descripción

`ComscorePlugin` es un plugin diseñado para conectar reproductores multimedia con el SDK de ComScore, facilitando el análisis y seguimiento de la reproducción de contenido audiovisual. Utiliza una **arquitectura de handlers** que orquesta diferentes aspectos del seguimiento (reproducción, publicidad, calidad, errores, metadatos y aplicación).

## Información del Plugin

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | ComscorePlugin |
| **Versión** | 0.1.5 |
| **Arquitectura** | Basada en handlers especializados |

## Constructor

El plugin se inicializa mediante su constructor:

```typescript
constructor(
  metadata: ComscoreMetadata,
  configuration: ComscoreConfiguration,
  pluginConfig?: ComscorePluginConfig
)
```

### Parámetros del Constructor

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `metadata` | `ComscoreMetadata` | ✅ | Metadatos iniciales del contenido |
| `configuration` | `ComscoreConfiguration` | ✅ | Configuración del SDK de ComScore |
| `pluginConfig` | `ComscorePluginConfig` | ❌ | Configuración opcional del plugin |

## Configuración del Plugin (ComscorePluginConfig)

El plugin permite configuración opcional para personalizar su comportamiento:

### Handlers Habilitados

| Handler | Tipo | Por Defecto | Descripción |
|---------|------|-------------|-------------|
| `playback` | `boolean` | `true` | Maneja eventos de reproducción |
| `application` | `boolean` | `true` | Maneja eventos de aplicación |
| `advertisement` | `boolean` | `true` | Maneja eventos de publicidad |
| `metadata` | `boolean` | `true` | Maneja metadatos del contenido |
| `quality` | `boolean` | `true` | Maneja cambios de calidad |
| `errors` | `boolean` | `true` | Maneja errores del reproductor |

### Configuración del Logger

| Opción | Tipo | Por Defecto | Descripción |
|--------|------|-------------|-------------|
| `enableVerboseLogging` | `boolean` | `true` | Habilita logging detallado |
| `filterComponents` | `string[]` | `[]` | Filtros para componentes específicos |

### Configuración del StateManager

| Opción | Tipo | Por Defecto | Descripción |
|--------|------|-------------|-------------|
| `validateTransitions` | `boolean` | `true` | Valida transiciones de estado |
| `enableVerboseLogging` | `boolean` | `true` | Habilita logging del estado |

## Métodos Principales

### Métodos de ComscorePluginInterface

| Método | Parámetros | Descripción |
|--------|------------|-------------|
| `update()` | `metadata: ComscoreMetadata` | Actualiza los metadatos del contenido |
| `setPersistentLabel()` | `label: string, value: string` | Establece una etiqueta persistente individual |
| `setPersistentLabels()` | `labels: { [key: string]: string }` | Establece múltiples etiquetas persistentes |
| `getInstanceId()` | - | Obtiene el ID único de la instancia |
| `reset()` | - | Resetea completamente el estado interno del plugin para reutilizarlo |
| `destroy()` | - | Libera recursos del plugin |

### Métodos de Debugging

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `getStateSnapshot()` | `object` | Obtiene snapshot del estado actual |
| `logCurrentState()` | `void` | Registra el estado actual en logs |
| `getEnabledHandlers()` | `string[]` | Lista de handlers habilitados |

## Eventos del Reproductor

El plugin implementa una amplia gama de eventos para capturar todos los aspectos de la reproducción:

### Eventos Básicos de Reproducción

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onSourceChange()` | - | Cambio de fuente del contenido |
| `onCreatePlaybackSession()` | - | Creación de nueva sesión de reproducción |
| `onPlay()` | - | Inicio de reproducción |
| `onPause()` | - | Pausa de reproducción |
| `onEnd()` | - | Finalización de reproducción |
| `onStop()` | `StopParams` | Detención de reproducción |

### Eventos de Metadatos

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onMetadataLoaded()` | `MetadataParams` | Carga inicial de metadatos |
| `onMetadataUpdate()` | `MetadataParams` | Actualización de metadatos |
| `onDurationChange()` | `DurationChangeParams` | Cambio en la duración del contenido |

### Eventos de Buffering y Seeking

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onBufferStart()` | - | Inicio de buffering |
| `onBufferStop()` | - | Fin de buffering |
| `onSeekStart()` | - | Inicio de búsqueda |
| `onSeekEnd()` | `SeekEndParams` | Fin de búsqueda |

### Eventos de Posición y Progreso

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onPositionChange()` | `PositionChangeParams` | Cambio de posición |
| `onPositionUpdate()` | `PositionUpdateParams` | Actualización de posición |
| `onProgress()` | `ProgressParams` | Progreso de reproducción |
| `onPlaybackRateChange()` | `PlaybackRateChangeParams` | Cambio de velocidad |

### Eventos de Publicidad

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onAdBegin()` | `AdBeginParams` | Inicio de anuncio |
| `onAdEnd()` | `AdEndParams` | Fin de anuncio |
| `onAdBreakBegin()` | `AdBreakBeginParams` | Inicio de bloque publicitario |
| `onAdBreakEnd()` | `AdBreakEndParams` | Fin de bloque publicitario |
| `onContentResume()` | - | Reanudación del contenido |

### Eventos de Error

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onError()` | `ErrorParams` | Error general |
| `onContentProtectionError()` | `ContentProtectionErrorParams` | Error de protección de contenido |
| `onNetworkError()` | `NetworkErrorParams` | Error de red |
| `onStreamError()` | `StreamErrorParams` | Error de streaming |

### Eventos de Calidad y Audio

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onAudioTrackChange()` | `AudioTrackChangeParams` | Cambio de pista de audio |
| `onVolumeChange()` | `VolumeChangeParams` | Cambio de volumen |
| `onMuteChange()` | `MuteChangeParams` | Cambio de silencio |
| `onSubtitleTrackChange()` | `SubtitleTrackChangeParams` | Cambio de subtítulos |
| `onSubtitleShow()` | `SubtitleShowParams` | Mostrar/ocultar subtítulos |
| `onQualityChange()` | `QualityChangeParams` | Cambio de calidad |
| `onBitrateChange()` | `BitrateChangeParams` | Cambio de bitrate |
| `onResolutionChange()` | `ResolutionChangeParams` | Cambio de resolución |

### Eventos Especiales de Streaming

| Evento | Parámetros | Descripción |
|--------|------------|-------------|
| `onStartFromPosition()` | `{ position: number }` | Inicio desde posición específica |
| `onStartFromDvrWindowOffset()` | `{ offset: number }` | Inicio desde offset DVR |
| `onSetDvrWindowLength()` | `{ length: number }` | Configuración de ventana DVR |

## Arquitectura de Handlers

El plugin utiliza una arquitectura modular basada en handlers especializados:

| Handler | Responsabilidad | Habilitado por Defecto |
|---------|-----------------|------------------------|
| **PlaybackHandler** | Gestiona eventos de reproducción (play, pause, end) | ✅ |
| **ApplicationHandler** | Maneja eventos a nivel de aplicación | ✅ |
| **AdvertisementHandler** | Procesa eventos de publicidad y ad breaks | ✅ |
| **MetadataHandler** | Administra metadatos del contenido | ✅ |
| **QualityHandler** | Controla cambios de calidad, bitrate y resolución | ✅ |
| **ErrorHandler** | Gestiona diferentes tipos de errores | ✅ |

## Ejemplo de Uso Básico

```typescript
import { ComscorePlugin } from './plugin/ComscorePlugin';
import { ComscoreMediaType } from './types/ComscoreMetadata';
import { ComscoreUserConsent } from './types/ComscoreConfiguration';

// Configuración de ComScore
const comscoreConfig = {
  publisherId: 'tu-publisher-id',
  applicationName: 'MiAplicación',
  userConsent: ComscoreUserConsent.granted,
  debug: __DEV__,
};

// Metadatos del contenido
const comscoreMetadata = {
  mediaType: ComscoreMediaType.longFormOnDemand,
  uniqueId: 'video-123',
  length: 360000,
  stationTitle: 'Mi Canal',
  programTitle: 'Mi Programa',
  episodeTitle: 'Episodio 1',
  genreName: 'Entretenimiento',
  classifyAsAudioStream: false,
};

// Inicializar el plugin
const comscorePlugin = new ComscorePlugin(
  comscoreMetadata,
  comscoreConfig
);

// Conectar a un reproductor
myPlayer.addPlugin(comscorePlugin);
```

## Ejemplo de Uso Avanzado con Configuración

```typescript
import { ComscorePlugin } from './plugin/ComscorePlugin';
import type { ComscorePluginConfig } from './plugin/types';

// Configuración personalizada del plugin
const pluginConfig: ComscorePluginConfig = {
  enabledHandlers: {
    playback: true,
    advertisement: true,
    metadata: true,
    quality: false, // Deshabilitar handler de calidad
    errors: true,
    application: true,
  },
  loggerConfig: {
    enableVerboseLogging: false,
    filterComponents: ['QualityHandler'], // Filtrar logs específicos
  },
  stateManagerConfig: {
    validateTransitions: true,
    enableVerboseLogging: false,
  },
};

// Inicializar con configuración personalizada
const comscorePlugin = new ComscorePlugin(
  comscoreMetadata,
  comscoreConfig,
  pluginConfig
);

// Métodos de debugging
console.log('Handlers habilitados:', comscorePlugin.getEnabledHandlers());
console.log('ID de instancia:', comscorePlugin.getInstanceId());
console.log('Estado actual:', comscorePlugin.getStateSnapshot());

// Actualizar metadatos dinámicamente
comscorePlugin.update({
  ...comscoreMetadata,
  episodeTitle: 'Episodio 2',
  customLabels: {
    'categoria': 'premium',
    'temporada': '1',
  },
});

// Establecer etiquetas persistentes
comscorePlugin.setPersistentLabel('userId', 'user123');
comscorePlugin.setPersistentLabels({
  'deviceType': 'mobile',
  'subscriptionType': 'premium',
});

// Limpiar recursos
comscorePlugin.destroy();
```

## Reutilización del Plugin con reset()

El método `reset()` permite reutilizar una instancia del plugin para reproducir nuevo contenido sin necesidad de crear una nueva instancia. Esto es especialmente útil en escenarios de playlist o navegación entre contenidos.

### ¿Cuándo usar reset()?

- **Cambio de contenido**: Al cambiar de un video a otro en una playlist
- **Navegación entre episodios**: Al pasar de un episodio a otro en una serie
- **Reinicio de sesión**: Al reiniciar la reproducción desde cero
- **Limpieza de estado**: Cuando necesitas limpiar el estado sin destruir el plugin

### ¿Qué hace reset()?

El método `reset()` realiza las siguientes acciones:

1. **Notifica fin de sesión**: Llama a `notifyEnd()` en ComScore para cerrar la sesión actual
2. **Resetea StateManager**: Vuelve el estado a `INITIALIZED` y limpia flags internos
3. **Resetea handlers**:
   - `MetadataHandler`: Limpia metadatos cargados y estadísticas
   - `QualityHandler`: Resetea contadores de cambios de calidad
   - `ErrorHandler`: Limpia contadores de errores
4. **Mantiene configuración**: La configuración del plugin y las etiquetas persistentes se mantienen

### Ejemplo de uso con Playlist

```typescript
import { ComscorePlugin } from './plugin/ComscorePlugin';

// Inicializar el plugin una vez
const comscorePlugin = new ComscorePlugin(
  initialMetadata,
  comscoreConfig
);

// Función para cambiar de contenido
function playNextVideo(newMetadata: ComscoreMetadata) {
  // 1. Resetear el plugin
  comscorePlugin.reset();
  
  // 2. Actualizar con los nuevos metadatos
  comscorePlugin.update(newMetadata);
  
  // 3. Crear nueva sesión de reproducción
  comscorePlugin.onCreatePlaybackSession?.();
  
  // 4. Iniciar reproducción del nuevo contenido
  comscorePlugin.onPlay?.();
}

// Uso en una playlist
const playlist = [video1Metadata, video2Metadata, video3Metadata];
let currentIndex = 0;

function onVideoEnd() {
  currentIndex++;
  if (currentIndex < playlist.length) {
    playNextVideo(playlist[currentIndex]);
  }
}
```

### Ejemplo de uso con Navegación entre Episodios

```typescript
// Hook personalizado para gestionar ComScore en una serie
function useComscoreForSeries(seriesConfig: ComscoreConfiguration) {
  const pluginRef = useRef<ComscorePlugin | null>(null);
  
  const playEpisode = useCallback((episodeMetadata: ComscoreMetadata) => {
    if (!pluginRef.current) {
      // Primera vez: crear plugin
      pluginRef.current = new ComscorePlugin(
        episodeMetadata,
        seriesConfig
      );
    } else {
      // Episodios siguientes: resetear y actualizar
      pluginRef.current.reset();
      pluginRef.current.update(episodeMetadata);
    }
    
    // Iniciar nueva sesión
    pluginRef.current.onCreatePlaybackSession?.();
  }, [seriesConfig]);
  
  useEffect(() => {
    return () => {
      // Limpiar al desmontar
      pluginRef.current?.destroy();
    };
  }, []);
  
  return { plugin: pluginRef.current, playEpisode };
}

// Uso del hook
const { plugin, playEpisode } = useComscoreForSeries(comscoreConfig);

// Cambiar de episodio
playEpisode(episode1Metadata);
// ... más tarde
playEpisode(episode2Metadata);
```

### Diferencia entre reset() y destroy()

| Aspecto | `reset()` | `destroy()` |
|---------|-----------|-------------|
| **Propósito** | Reutilizar el plugin con nuevo contenido | Liberar recursos completamente |
| **Estado del plugin** | Vuelve a `INITIALIZED`, listo para usar | Plugin inutilizable después |
| **Configuración** | Se mantiene | Se pierde |
| **Etiquetas persistentes** | Se mantienen | Se pierden |
| **Instancia de ComScore** | Se mantiene | Se destruye |
| **Uso típico** | Cambio de contenido en playlist | Desmontaje del componente |

### Consideraciones al usar reset()

⚠️ **Importante**: 
- Siempre llama a `reset()` **antes** de cargar nuevo contenido
- Después de `reset()`, actualiza los metadatos con `update()` antes de iniciar reproducción
- No uses `reset()` durante la reproducción activa, primero pausa o detén el contenido
- Si necesitas cambiar la configuración del plugin, usa `destroy()` y crea una nueva instancia

✅ **Buenas prácticas**:
```typescript
// ✅ CORRECTO: Reset antes de nuevo contenido
plugin.reset();
plugin.update(newMetadata);
plugin.onCreatePlaybackSession?.();
plugin.onPlay?.();

// ❌ INCORRECTO: No resetear antes de cambiar contenido
plugin.update(newMetadata); // Estado inconsistente
plugin.onPlay?.();

// ❌ INCORRECTO: Reset durante reproducción activa
plugin.onPlay?.();
plugin.reset(); // Puede causar problemas de tracking
```

## Consideraciones Importantes

### Integración con Reproductores
- El plugin implementa la interfaz estándar de `AnalyticsPlugin` para máxima compatibilidad
- Debe conectarse a reproductores que soporten el sistema de eventos definido
- Los eventos se procesan automáticamente a través de los handlers correspondientes

### Gestión de Estado
- El plugin mantiene un estado interno gestionado por `ComscoreStateManager`
- Las transiciones de estado se validan automáticamente (configurable)
- Proporciona métodos de debugging para inspeccionar el estado actual

### Rendimiento y Recursos
- Los handlers pueden habilitarse/deshabilitarse individualmente para optimizar rendimiento
- El logging detallado puede configurarse por componente
- Es **crítico** llamar a `destroy()` para liberar recursos correctamente

### Debugging y Monitoreo
- Utiliza el sistema de logging integrado con niveles configurables
- Proporciona snapshots del estado para debugging
- Incluye validación de transiciones de estado en modo desarrollo
