# Documentación del ComscorePlaybackHandler

Este documento describe el handler especializado para la gestión de eventos de reproducción en el sistema de tracking de ComScore.

## Descripción General

El `ComscorePlaybackHandler` es responsable de gestionar todos los eventos relacionados con la reproducción de contenido, incluyendo play, pause, stop, seeking, buffering, cambios de velocidad y eventos de progreso. Actúa como intermediario entre el reproductor de video y el sistema de tracking de ComScore.

## Arquitectura del Handler

| Componente | Descripción | Responsabilidad |
|------------|-------------|----------------|
| **ComscorePlaybackHandler** | Handler principal | Gestión de eventos de reproducción |
| **State Coordination** | Coordinación de estados | Sincronización con StateManager |
| **Playback Events** | Eventos de reproducción | Manejo de play, pause, stop |
| **Seeking Events** | Eventos de búsqueda | Manejo de seek, seeking, seeked |
| **Buffer Management** | Gestión de buffering | Control de eventos de buffer |
| **Source Management** | Gestión de fuente | Cambios de contenido y metadatos |

## Eventos de Reproducción Soportados

### Eventos Básicos de Reproducción

| Evento | Método | Descripción | Estado Resultante |
|--------|--------|-------------|------------------|
| **Play** | `handlePlay()` | Inicio de reproducción | `VIDEO` o `ADVERTISEMENT` |
| **Pause** | `handlePause()` | Pausa de reproducción | `PAUSED_VIDEO` o `PAUSED_AD` |
| **Stop** | `handleStop()` | Detención de reproducción | `STOPPED` |
| **End** | `handleEnd()` | Final de reproducción | `STOPPED` + ended flag |

### Eventos de Navegación

| Evento | Método | Descripción | Acción en ComScore |
|--------|--------|-------------|-------------------|
| **Seek** | `handleSeek()` | Búsqueda a posición específica | `notifySeekStart()` + `startFromPosition()` |
| **Seeking** | `handleSeeking()` | Inicio de búsqueda | `notifySeekStart()` |
| **Seeked** | `handleSeeked()` | Finalización de búsqueda | `startFromPosition()` |

### Eventos de Estado

| Evento | Método | Descripción | Acción en ComScore |
|--------|--------|-------------|-------------------|
| **Buffering** | `handleBuffering()` | Cambio de estado de buffer | `notifyBufferStart()` / `notifyBufferStop()` |
| **Rate Change** | `handleRateChange()` | Cambio de velocidad | `notifyChangePlaybackRate()` |
| **Progress** | `handleProgress()` | Progreso de reproducción | Actualización interna |

### Eventos de Contenido

| Evento | Método | Descripción | Acción |
|--------|--------|-------------|--------|
| **Source Change** | `handleSourceChange()` | Cambio de fuente | Reset + nueva sesión |
| **Metadata Loaded** | `handleMetadataLoaded()` | Metadatos cargados | Configuración DVR si es live |
| **Duration Change** | `handleDurationChange()` | Cambio de duración | Detección live/VOD |

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

### Métodos de Reproducción Básica

#### handlePlay()

Maneja el evento de inicio de reproducción.

```typescript
handlePlay(): void
```

**Funcionalidad:**
- ✅ Verifica si el contenido ha terminado
- ✅ Maneja reproducción después del final
- ✅ Transiciona al estado apropiado (VIDEO/ADVERTISEMENT)
- ✅ Ignora eventos después de post-roll
- ✅ Notifica play a ComScore

**Lógica Especial:**
- Si `ended === true`, llama a `handlePlayAfterEnd()`
- Si `adOffset < 0.0`, ignora el evento (post-roll terminado)

#### handlePause()

Maneja el evento de pausa de reproducción.

```typescript
handlePause(): void
```

**Funcionalidad:**
- ✅ Transiciona al estado pausado apropiado
- ✅ Mantiene contexto de anuncio vs contenido

#### handleStop()

Maneja el evento de detención de reproducción.

```typescript
handleStop(): void
```

**Funcionalidad:**
- ✅ Transiciona al estado STOPPED
- ✅ Limpia estado de reproducción

#### handleEnd()

Maneja el evento de finalización de reproducción.

```typescript
handleEnd(): void
```

**Funcionalidad:**
- ✅ Transiciona al estado STOPPED
- ✅ Marca contenido como terminado (`ended = true`)

### Métodos de Navegación

#### handleSeek()

Maneja navegación a una posición específica.

```typescript
handleSeek(currentTime?: number, duration?: number): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `currentTime` | `number` | Posición de destino en segundos | ❌ No |
| `duration` | `number` | Duración total del contenido | ❌ No |

**Funcionalidad:**
- ✅ Notifica inicio de seek a ComScore
- ✅ Calcula posición en milisegundos
- ✅ Diferencia entre contenido VOD y live
- ✅ Usa `startFromPosition()` para posicionamiento

**Lógica de Detección:**
- **VOD**: `duration > 0` → Usa posición absoluta
- **Live**: `duration === 0` o `isNaN(duration)` → Usa posición con DVR

#### handleSeeking()

Maneja el inicio de una operación de búsqueda.

```typescript
handleSeeking(): void
```

**Funcionalidad:**
- ✅ Notifica inicio de seek a ComScore
- ✅ Prepara para operación de búsqueda

#### handleSeeked()

Maneja la finalización de una operación de búsqueda.

```typescript
handleSeeked(currentTime?: number, duration?: number): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `currentTime` | `number` | Posición final en segundos | ❌ No |
| `duration` | `number` | Duración total del contenido | ❌ No |

**Funcionalidad:**
- ✅ Establece posición final después de seek
- ✅ Maneja contenido live con DVR
- ✅ Convierte tiempo a milisegundos

### Métodos de Estado

#### handleBuffering()

Maneja cambios en el estado de buffering.

```typescript
handleBuffering(isBuffering: boolean): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `isBuffering` | `boolean` | Si está bufferizando | ✅ Sí |

**Funcionalidad:**
- ✅ Verifica cambio de estado de buffering
- ✅ Considera contexto de anuncio vs contenido
- ✅ Notifica buffer start/stop a ComScore
- ✅ Actualiza estado interno

**Lógica de Validación:**
```typescript
if (isBuffering !== this.stateManager.getBuffering()) {
  // Solo procesa si hay cambio real de estado
  if ((currentState === ComscoreState.ADVERTISEMENT && inAd) ||
      (currentState === ComscoreState.VIDEO && !inAd)) {
    // Procesar cambio de buffering
  }
}
```

#### handleRateChange()

Maneja cambios en la velocidad de reproducción.

```typescript
handleRateChange(rate: number): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `rate` | `number` | Nueva velocidad de reproducción | ✅ Sí |

**Funcionalidad:**
- ✅ Notifica cambio de velocidad a ComScore
- ✅ Soporta velocidades como 0.5x, 1x, 1.5x, 2x

#### handleProgress()

Maneja eventos de progreso de reproducción.

```typescript
handleProgress(currentTime: number, duration?: number): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `currentTime` | `number` | Tiempo actual en segundos | ✅ Sí |
| `duration` | `number` | Duración total del contenido | ❌ No |

**Funcionalidad:**
- ✅ Actualiza métricas internas
- ✅ Detecta contenido live para cálculos DVR
- ✅ No genera notificaciones directas a ComScore

### Métodos de Gestión de Contenido

#### handleSourceChange()

Maneja cambios en la fuente de contenido.

```typescript
handleSourceChange(): void
```

**Funcionalidad:**
- ✅ Resetea completamente el estado
- ✅ Transiciona a estado INITIALIZED
- ✅ Limpia metadatos de contenido
- ✅ Crea nueva sesión de reproducción

#### handleMetadataLoaded()

Maneja la carga de metadatos del contenido.

```typescript
handleMetadataLoaded(): void
```

**Funcionalidad:**
- ✅ Configura información específica para live streams
- ✅ Detecta ventana DVR si está disponible
- ✅ Prepara configuración para tipo de contenido

#### handleDurationChange()

Maneja cambios en la duración del contenido.

```typescript
handleDurationChange(duration?: number): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `duration` | `number` | Nueva duración en segundos | ❌ No |

**Funcionalidad:**
- ✅ Detecta cambios entre live y VOD
- ✅ Registra información para debugging
- ✅ Actualiza configuración interna

## Flujos de Estados de Reproducción

### 1. **Flujo Básico de Reproducción**

```mermaid
graph TD
    A[INITIALIZED] --> B[handlePlay()]
    B --> C[VIDEO]
    C --> D[handlePause()]
    D --> E[PAUSED_VIDEO]
    E --> F[handlePlay()]
    F --> C
    C --> G[handleEnd()]
    G --> H[STOPPED + ended]
```

### 2. **Flujo de Seeking**

```mermaid
graph TD
    A[VIDEO] --> B[handleSeeking()]
    B --> C[notifySeekStart()]
    C --> D[handleSeeked()]
    D --> E[startFromPosition()]
    E --> F[VIDEO]
```

### 3. **Flujo de Buffering**

```mermaid
graph TD
    A[VIDEO] --> B[handleBuffering(true)]
    B --> C[notifyBufferStart()]
    C --> D[VIDEO + buffering]
    D --> E[handleBuffering(false)]
    E --> F[notifyBufferStop()]
    F --> G[VIDEO]
```

### 4. **Flujo de Cambio de Fuente**

```mermaid
graph TD
    A[Cualquier Estado] --> B[handleSourceChange()]
    B --> C[reset()]
    C --> D[INITIALIZED]
    D --> E[createPlaybackSession()]
    E --> F[Listo para nuevo contenido]
```

## Ejemplos de Uso

### Ejemplo 1: Integración Básica con Reproductor

```typescript
import { ComscorePlaybackHandler } from './ComscorePlaybackHandler';

// Configuración del handler
const playbackHandler = new ComscorePlaybackHandler(context, stateManager);

// Integración con eventos del reproductor
const setupPlayerEvents = (player: VideoPlayer) => {
  player.on('play', () => {
    playbackHandler.handlePlay();
  });

  player.on('pause', () => {
    playbackHandler.handlePause();
  });

  player.on('ended', () => {
    playbackHandler.handleEnd();
  });

  player.on('seeking', () => {
    playbackHandler.handleSeeking();
  });

  player.on('seeked', () => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    playbackHandler.handleSeeked(currentTime, duration);
  });
};
```

### Ejemplo 2: Manejo de Buffering

```typescript
// Manejo de eventos de buffering
const setupBufferingEvents = (player: VideoPlayer) => {
  let isBuffering = false;

  player.on('waiting', () => {
    if (!isBuffering) {
      isBuffering = true;
      playbackHandler.handleBuffering(true);
    }
  });

  player.on('canplay', () => {
    if (isBuffering) {
      isBuffering = false;
      playbackHandler.handleBuffering(false);
    }
  });

  player.on('canplaythrough', () => {
    if (isBuffering) {
      isBuffering = false;
      playbackHandler.handleBuffering(false);
    }
  });
};
```

### Ejemplo 3: Seeking con Validación

```typescript
// Seeking con validación de parámetros
const handleUserSeek = (targetTime: number) => {
  const player = getVideoPlayer();
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();

  // Validar que el seek es válido
  if (targetTime >= 0 && targetTime <= duration) {
    // Notificar inicio de seek
    playbackHandler.handleSeek(targetTime, duration);
    
    // Ejecutar seek en el reproductor
    player.seekTo(targetTime);
  } else {
    console.warn('Posición de seek inválida:', targetTime);
  }
};

// Manejar finalización de seek
const handleSeekComplete = () => {
  const player = getVideoPlayer();
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  
  playbackHandler.handleSeeked(currentTime, duration);
};
```

### Ejemplo 4: Cambio de Velocidad de Reproducción

```typescript
// Manejo de cambios de velocidad
const setupPlaybackRateControls = (player: VideoPlayer) => {
  const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  rates.forEach(rate => {
    const button = document.getElementById(`rate-${rate}`);
    button?.addEventListener('click', () => {
      // Cambiar velocidad en el reproductor
      player.setPlaybackRate(rate);
      
      // Notificar a ComScore
      playbackHandler.handleRateChange(rate);
      
      console.log(`Velocidad cambiada a ${rate}x`);
    });
  });
};
```

### Ejemplo 5: Contenido Live con DVR

```typescript
// Configuración específica para contenido live
const setupLiveContent = (player: VideoPlayer) => {
  player.on('loadedmetadata', () => {
    const duration = player.getDuration();
    
    // Detectar contenido live
    if (duration === 0 || isNaN(duration)) {
      console.log('Contenido live detectado');
      
      // Manejar metadatos cargados
      playbackHandler.handleMetadataLoaded();
      
      // Configurar seeking para live con DVR
      const seekableRanges = player.getSeekableRanges();
      if (seekableRanges.length > 0) {
        const dvrStart = seekableRanges.start(0);
        const dvrEnd = seekableRanges.end(0);
        const dvrWindow = dvrEnd - dvrStart;
        
        console.log(`DVR window: ${dvrWindow} segundos`);
      }
    }
  });

  // Seeking en contenido live
  const handleLiveSeek = (targetTime: number) => {
    const seekableRanges = player.getSeekableRanges();
    
    if (seekableRanges.length > 0) {
      const dvrStart = seekableRanges.start(0);
      const dvrEnd = seekableRanges.end(0);
      
      // Validar que el seek está dentro del DVR window
      if (targetTime >= dvrStart && targetTime <= dvrEnd) {
        playbackHandler.handleSeek(targetTime, 0); // duration = 0 para live
        player.seekTo(targetTime);
      } else {
        console.warn('Seek fuera del DVR window:', targetTime);
      }
    }
  };
};
```

### Ejemplo 6: Cambio de Fuente de Contenido

```typescript
// Manejo de cambio de contenido
const changeContent = async (newContentUrl: string, newMetadata: any) => {
  const player = getVideoPlayer();
  
  try {
    // Notificar cambio de fuente
    playbackHandler.handleSourceChange();
    
    // Cambiar fuente en el reproductor
    await player.loadSource(newContentUrl);
    
    // Configurar nuevos metadatos
    await setupContentMetadata(newMetadata);
    
    console.log('Contenido cambiado exitosamente');
    
  } catch (error) {
    console.error('Error cambiando contenido:', error);
  }
};

// Configurar metadatos después del cambio
const setupContentMetadata = async (metadata: any) => {
  // Esperar a que se carguen los metadatos
  const player = getVideoPlayer();
  
  player.once('loadedmetadata', () => {
    const duration = player.getDuration();
    
    // Notificar cambio de duración
    playbackHandler.handleDurationChange(duration);
    
    // Notificar metadatos cargados
    playbackHandler.handleMetadataLoaded();
  });
};
```

### Ejemplo 7: Reproducción Después del Final

```typescript
// Manejo de reproducción después del final
const setupEndOfContentHandling = (player: VideoPlayer) => {
  let hasEnded = false;

  player.on('ended', () => {
    hasEnded = true;
    playbackHandler.handleEnd();
    
    // Mostrar controles de replay
    showReplayControls();
  });

  // Botón de replay
  const replayButton = document.getElementById('replay-button');
  replayButton?.addEventListener('click', () => {
    if (hasEnded) {
      // Esto activará handlePlayAfterEnd() internamente
      playbackHandler.handlePlay();
      
      // Reiniciar reproductor
      player.seekTo(0);
      player.play();
      
      hasEnded = false;
      hideReplayControls();
    }
  });
};
```

## Consideraciones para Diferentes Tipos de Contenido

### Contenido VOD (Video on Demand)

| Característica | Implementación | Consideraciones |
|----------------|----------------|-----------------|
| **Duración** | `duration > 0` | Usar posición absoluta para seeking |
| **Seeking** | Posición en milisegundos | Validar rango 0 - duration |
| **Progress** | Tiempo transcurrido | Útil para analytics |
| **End** | Posición = duración | Marcar como terminado |

### Contenido Live

| Característica | Implementación | Consideraciones |
|----------------|----------------|-----------------|
| **Duración** | `duration === 0` o `isNaN(duration)` | Sin duración fija |
| **DVR Window** | Rangos seekable | Configurar ventana DVR |
| **Seeking** | Offset desde live edge | Validar dentro de DVR |
| **Progress** | Posición en DVR | Relativo a ventana disponible |

### Contenido con Anuncios

| Característica | Implementación | Consideraciones |
|----------------|----------------|-----------------|
| **Estado** | Coordinación con AdvertisementHandler | Verificar `inAd` flag |
| **Buffering** | Solo durante contenido apropiado | No durante transiciones |
| **Seeking** | Puede estar restringido | Validar con ad breaks |
| **Rate Change** | Puede no aplicar a anuncios | Verificar contexto |

## Mejores Prácticas

### ✅ **Sincronización de Estados**

```typescript
// CORRECTO: Verificar estado antes de transiciones
const handlePlayEvent = () => {
  const currentState = stateManager.getCurrentState();
  const inAd = stateManager.getInAd();
  
  if (currentState === ComscoreState.PAUSED_VIDEO && !inAd) {
    playbackHandler.handlePlay();
  } else if (currentState === ComscoreState.PAUSED_AD && inAd) {
    playbackHandler.handlePlay();
  }
};
```

### ✅ **Validación de Parámetros**

```typescript
// CORRECTO: Validar parámetros antes de usar
const handleSeekEvent = (targetTime: number, duration: number) => {
  if (typeof targetTime === 'number' && !isNaN(targetTime)) {
    if (typeof duration === 'number' && duration > 0) {
      // VOD content
      if (targetTime >= 0 && targetTime <= duration) {
        playbackHandler.handleSeek(targetTime, duration);
      }
    } else {
      // Live content
      playbackHandler.handleSeek(targetTime, duration);
    }
  }
};
```

### ✅ **Manejo de Errores**

```typescript
// CORRECTO: Manejar errores en eventos de reproducción
const safeHandlePlay = () => {
  try {
    playbackHandler.handlePlay();
  } catch (error) {
    console.error('Error en handlePlay:', error);
    // Posible recuperación o notificación de error
  }
};
```

### ✅ **Logging Estructurado**

```typescript
// CORRECTO: Logging con contexto
const handlePlayWithLogging = () => {
  const currentState = stateManager.getCurrentState();
  const inAd = stateManager.getInAd();
  
  console.log('Handling play event', {
    currentState,
    inAd,
    timestamp: Date.now()
  });
  
  playbackHandler.handlePlay();
};
```

## Consideraciones de Performance

### 🚀 **Optimizaciones**
- **Event debouncing** - Evita múltiples eventos rápidos
- **State validation** - Solo procesa cambios reales de estado
- **Conditional notifications** - Solo notifica cuando es necesario
- **Minimal calculations** - Cálculos ligeros en eventos frecuentes

### ⚠️ **Limitaciones**
- **Progress events** - Pueden ser muy frecuentes
- **Seeking precision** - Limitado por precisión del reproductor
- **Live DVR** - Requiere soporte del reproductor
- **State synchronization** - Dependiente de StateManager

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Play no funciona después de end | No se resetea flag `ended` | Verificar `handlePlayAfterEnd()` |
| Seeking incorrecto en live | Duración mal detectada | Verificar detección de `duration === 0` |
| Buffering no se reporta | Estado inconsistente | Validar flags `inAd` y `currentState` |
| Rate change no funciona | Parámetro inválido | Validar que `rate` es número válido |

### Debugging

```typescript
// Información del estado de reproducción
const debugPlaybackState = () => {
  console.log('Playback Handler Debug:', {
    currentState: stateManager.getCurrentState(),
    inAd: stateManager.getInAd(),
    ended: stateManager.getEnded(),
    buffering: stateManager.getBuffering(),
    adOffset: stateManager.getCurrentAdOffset()
  });
};
```

## 🔗 Referencias

- 📚 **Estados**: [ComscoreState](../types/README.md)
- 🎯 **State Manager**: [ComscoreStateManager](./README.stateManager.md)
- 🔧 **Base**: [Sistema base de handlers](./base/README.md)
- 📺 **Advertisement**: [ComscoreAdvertisementHandler](./README.advertisementHandler.md)
- 📝 **Analytics**: [AnalyticsPlugin Types](../types/AnalyticsPlugin.ts)
