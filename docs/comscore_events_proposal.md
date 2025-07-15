# Propuesta de Eventos para playerPlugin.ts - ComScore Streaming Tag

## Resumen Ejecutivo

Esta propuesta detalla todos los eventos que el `playerPlugin.ts` debería lanzar para completar el tracking de ComScore Streaming Tag según su documentación oficial. Los eventos están organizados por categorías funcionales y incluyen tanto eventos obligatorios como opcionales.

---

## 1. Eventos de Gestión de Sesión y Metadata

### 1.1 Eventos de Inicialización

- **`onPluginInitialize`**: Inicialización del plugin con configuración
- **`onSourceChange`**: Cambio de fuente de contenido
- **`onCreatePlaybackSession`**: Creación de nueva sesión de reproducción
- **`onMetadataLoaded`**: Carga de metadatos del contenido
- **`onMetadataUpdate`**: Actualización de metadatos durante la reproducción

### 1.2 Eventos de Metadata

- **`onSetContentMetadata`**: Configuración de metadatos de contenido
- **`onSetAdvertisementMetadata`**: Configuración de metadatos de anuncio
- **`onDurationChange`**: Cambio en la duración del contenido

---

## 2. Eventos de Estado de Reproducción

### 2.1 Eventos Básicos de Reproducción

- **`onPlay`**: Inicio o reanudación de la reproducción
- **`onPause`**: Pausa de la reproducción
- **`onEnd`**: Finalización de la reproducción
- **`onStop`**: Detención de la reproducción

### 2.2 Eventos de Buffering

- **`onBufferStart`**: Inicio del buffering
- **`onBufferStop`**: Finalización del buffering

### 2.3 Eventos de Seeking

- **`onSeekStart`**: Inicio de búsqueda de posición
- **`onSeekEnd`**: Finalización de búsqueda de posición
- **`onPositionChange`**: Cambio de posición de reproducción

### 2.4 Eventos de Velocidad

- **`onPlaybackRateChange`**: Cambio de velocidad de reproducción

---

## 3. Eventos de Publicidad

### 3.1 Eventos de Anuncios Individuales

- **`onAdBegin`**: Inicio de un anuncio
- **`onAdEnd`**: Finalización de un anuncio
- **`onAdPause`**: Pausa de un anuncio
- **`onAdResume`**: Reanudación de un anuncio
- **`onAdSkip`**: Salto de un anuncio

### 3.2 Eventos de Bloques de Anuncios

- **`onAdBreakBegin`**: Inicio de un bloque de anuncios
- **`onAdBreakEnd`**: Finalización de un bloque de anuncios
- **`onContentResume`**: Reanudación del contenido tras anuncio

---

## 4. Eventos de Posición y Progreso

### 4.1 Eventos de Posición

- **`onStartFromPosition`**: Inicio desde posición específica
- **`onStartFromDvrWindowOffset`**: Inicio desde offset de ventana DVR
- **`onPositionUpdate`**: Actualización continua de posición
- **`onProgress`**: Progreso de reproducción (para reportes)

### 4.2 Eventos de Live+DVR

- **`onSetDvrWindowLength`**: Configuración de longitud de ventana DVR
- **`onDvrWindowOffsetChange`**: Cambio en el offset de ventana DVR

---

## 5. Eventos de Configuración Avanzada

### 5.1 Eventos de Configuración

- **`onSetPersistentLabel`**: Configuración de etiqueta persistente
- **`onSetPersistentLabels`**: Configuración de múltiples etiquetas persistentes
- **`onUpdateConfiguration`**: Actualización de configuración del plugin

### 5.2 Eventos de Estado de Aplicación

- **`onApplicationForeground`**: Aplicación en primer plano
- **`onApplicationBackground`**: Aplicación en segundo plano
- **`onApplicationActive`**: Aplicación activa
- **`onApplicationInactive`**: Aplicación inactiva

---

## 6. Eventos de Manejo de Errores

### 6.1 Eventos de Error

- **`onError`**: Error general de reproducción
- **`onContentProtectionError`**: Error de protección de contenido
- **`onNetworkError`**: Error de red
- **`onStreamError`**: Error de streaming

---

## 7. Eventos de Audio y Subtítulos

### 7.1 Eventos de Audio

- **`onAudioTrackChange`**: Cambio de pista de audio
- **`onVolumeChange`**: Cambio de volumen
- **`onMuteChange`**: Cambio de estado de silencio

### 7.2 Eventos de Subtítulos

- **`onSubtitleTrackChange`**: Cambio de pista de subtítulos
- **`onSubtitleShow`**: Mostrar subtítulos
- **`onSubtitleHide`**: Ocultar subtítulos

---

## 8. Eventos de Calidad de Video

### 8.1 Eventos de Calidad

- **`onQualityChange`**: Cambio de calidad de video
- **`onBitrateChange`**: Cambio de bitrate
- **`onResolutionChange`**: Cambio de resolución

---

## 9. Implementación Detallada

### 9.1 Estructura del Evento Base

```typescript
interface ComscorePlayerEvent {
  type: string;
  timestamp: number;
  data?: any;
  position?: number;
  duration?: number;
}
```

### 9.2 Prioridad de Implementación

#### **Alta Prioridad (Esenciales)**

1. `onPlay`, `onPause`, `onEnd`
2. `onBufferStart`, `onBufferStop`
3. `onCreatePlaybackSession`
4. `onSetContentMetadata`
5. `onSourceChange`

#### **Media Prioridad (Importantes)**

1. `onSeekStart`, `onPositionChange`
2. `onAdBegin`, `onAdEnd`, `onAdBreakBegin`
3. `onPlaybackRateChange`
4. `onStartFromPosition`
5. `onError`

#### **Baja Prioridad (Opcionales)**

1. `onSetDvrWindowLength`
2. `onAudioTrackChange`, `onSubtitleTrackChange`
3. `onQualityChange`
4. `onApplicationForeground/Background`

### 9.3 Mapeo con Métodos ComScore

| Evento Propuesto             | Método ComScore                    | Obligatorio |
| ---------------------------- | ---------------------------------- | ----------- |
| `onPlay`                     | `notifyPlay()`                     | ✅          |
| `onPause`                    | `notifyPause()`                    | ✅          |
| `onEnd`                      | `notifyEnd()`                      | ✅          |
| `onBufferStart`              | `notifyBufferStart()`              | ✅          |
| `onBufferStop`               | `notifyBufferStop()`               | ✅          |
| `onSeekStart`                | `notifySeekStart()`                | ✅          |
| `onStartFromPosition`        | `startFromPosition(position)`      | ✅          |
| `onPlaybackRateChange`       | `notifyChangePlaybackRate(rate)`   | ✅          |
| `onCreatePlaybackSession`    | `createPlaybackSession()`          | ✅          |
| `onSetContentMetadata`       | `setMetadata(contentMetadata)`     | ✅          |
| `onSetAdvertisementMetadata` | `setMetadata(adMetadata)`          | ✅          |
| `onSetDvrWindowLength`       | `setDvrWindowLength(length)`       | ⚠️          |
| `onStartFromDvrWindowOffset` | `startFromDvrWindowOffset(offset)` | ⚠️          |
| `onSetPersistentLabel`       | `setPersistentLabel(label, value)` | ❌          |

**Leyenda:**

- ✅ = Obligatorio para tracking básico
- ⚠️ = Requerido solo para contenido Live+DVR
- ❌ = Opcional

---

## 10. Consideraciones Especiales

### 10.1 Secuencia de Eventos Crítica

1. `onCreatePlaybackSession` → `onSetContentMetadata` → `onPlay`
2. Para anuncios: `onSetAdvertisementMetadata` → `onAdBegin` → `onPlay`
3. Para seeking: `onSeekStart` → `onStartFromPosition` → `onPlay`

### 10.2 Gestión de Estados

- Mantener coherencia entre estados de ComScore y reproductor
- Manejar transiciones complejas (contenido ↔ anuncio)
- Validar secuencia de eventos para evitar inconsistencias

### 10.3 Optimizaciones

- Agrupar eventos de posición para reducir llamadas frecuentes
- Implementar debouncing para eventos de alta frecuencia
- Cachear metadatos para evitar configuraciones repetitivas

---

## 11. Próximos Pasos

### 11.1 Fase 1: Implementación Básica

- Implementar eventos de alta prioridad
- Validar tracking básico de contenido
- Pruebas con contenido VOD

### 11.2 Fase 2: Funcionalidad Avanzada

- Implementar tracking de anuncios
- Soporte para Live+DVR
- Gestión de errores

### 11.3 Fase 3: Optimización

- Eventos de baja prioridad
- Optimizaciones de rendimiento
- Análisis de métricas

---

## 12. Conclusión

Esta propuesta cubre todos los aspectos del tracking de ComScore Streaming Tag, proporcionando una base sólida para la implementación completa del `playerPlugin.ts`. La implementación por fases permite un desarrollo incremental y validación continua de la funcionalidad.
