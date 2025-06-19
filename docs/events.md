# Eventos Requeridos para ComScore Streaming Tag

## Introducción

Para desarrollar un plugin de ComScore Streaming Tag con react-native-video, necesitas asegurar que el player emita todos los eventos necesarios para el seguimiento completo de analytics. ComScore requiere que uses un media player que tenga una API que permita detectar el estado del player y acceder a detalles como la posición actual de reproducción y metadatos relevantes del contenido.

## Categorías de Eventos

### 1. **Eventos de Sesión de Reproducción (Playback Events)**

Estos eventos rastrean el estado del reproductor de video a nivel de sesión.

| Evento                       | Método ComScore           | Descripción                                              | Datos Requeridos                                                                                                     |
| ---------------------------- | ------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **VideoPlaybackStarted**     | `createPlaybackSession()` | **CRÍTICO**: Inicializa la sesión de ComScore            | `session_id`, `position`, `total_length`, `content_asset_ids[]`, `content_pod_ids[]`, `ad_asset_id[]`, `ad_pod_id[]` |
| **VideoPlaybackPaused**      | `notifyPause()`           | Se dispara cuando el usuario pausa el video              | `session_id`, `position`                                                                                             |
| **VideoPlaybackResumed**     | `notifyPlay()`            | Se dispara cuando se reanuda la reproducción             | `session_id`, `position`                                                                                             |
| **VideoPlaybackCompleted**   | `notifyEnd()`             | Se dispara cuando termina toda la sesión de reproducción | `session_id`, `position`                                                                                             |
| **VideoPlaybackInterrupted** | `notifyEnd()`             | Se dispara cuando se interrumpe la reproducción          | `session_id`, `position`, `method` (user, system, error)                                                             |

### 2. **Eventos de Buffering**

Esenciales para medir la calidad de la experiencia de streaming.

| Evento                           | Método ComScore       | Descripción               | Datos Requeridos         |
| -------------------------------- | --------------------- | ------------------------- | ------------------------ |
| **VideoPlaybackBufferStarted**   | `notifyBufferStart()` | Inicio de buffering/carga | `session_id`, `position` |
| **VideoPlaybackBufferCompleted** | `notifyBufferStop()`  | Fin del buffering         | `session_id`, `position` |

### 3. **Eventos de Búsqueda (Seek)**

Para rastrear cuando los usuarios saltan a diferentes posiciones.

| Evento                         | Método ComScore                        | Descripción                 | Datos Requeridos              |
| ------------------------------ | -------------------------------------- | --------------------------- | ----------------------------- |
| **VideoPlaybackSeekStarted**   | `notifySeekStart()`                    | Inicio de operación de seek | `session_id`, `seek_position` |
| **VideoPlaybackSeekCompleted** | `startFromPosition()` + `notifyPlay()` | Finalización del seek       | `session_id`, `position`      |

### 4. **Eventos de Contenido**

Para rastrear segmentos específicos de contenido dentro de la reproducción.

| Evento                    | Método ComScore              | Descripción                              | Datos Requeridos                                                                                       |
| ------------------------- | ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **VideoContentStarted**   | `notifyPlay()` con metadatos | Inicio de un segmento de contenido       | `session_id`, `content_asset_id`, `content_pod_id`, `position`, `title`, `publisher`, `c3`, `c4`, `c6` |
| **VideoContentCompleted** | `notifyEnd()`                | Finalización de un segmento de contenido | `session_id`, `content_asset_id`, `content_pod_id`, `position`                                         |

### 5. **Eventos de Publicidad**

Si planeas soportar ads, estos eventos son esenciales.

| Evento               | Método ComScore                    | Descripción                    | Datos Requeridos                                                |
| -------------------- | ---------------------------------- | ------------------------------ | --------------------------------------------------------------- |
| **VideoAdStarted**   | `notifyPlay()` con metadatos de ad | Inicio de un anuncio           | `session_id`, `ad_asset_id`, `ad_pod_id`, `ad_type`, `position` |
| **VideoAdCompleted** | `notifyEnd()`                      | Finalización de un anuncio     | `session_id`, `ad_asset_id`, `ad_pod_id`, `position`            |
| **VideoAdSkipped**   | `notifyEnd()`                      | Anuncio omitido por el usuario | `session_id`, `ad_asset_id`, `ad_pod_id`, `position`            |

## Propiedades de Datos Esenciales

### **Propiedades del Evento de Sesión**

```javascript
{
  // Identificadores únicos
  session_id: "unique_session_identifier",

  // Posición y duración
  position: 0, // Posición actual en milisegundos
  total_length: 300000, // Duración total en milisegundos

  // Arrays de assets para toda la sesión (solo en VideoPlaybackStarted)
  content_asset_ids: ["content_1", "content_2"],
  content_pod_ids: ["pod_1", "pod_2"],
  ad_asset_id: ["ad_1", "ad_2"],
  ad_pod_id: ["ad_pod_1", "ad_pod_2"],

  // Información del reproductor
  video_player: "react-native-video",
  sound: 75, // Volumen 0-100
  full_screen: false,
  quality: "hd720",
  bitrate: 2500,
  framerate: 29.97,
  livestream: false
}
```

### **Propiedades de Contenido**

```javascript
{
  // Identificadores específicos del contenido actual
  content_asset_id: "content_123",
  content_pod_id: "pod_1",

  // Metadatos del contenido
  title: "Título del Video",
  publisher: "Nombre del Publisher",
  genre: "Entertainment",
  season: "1",
  episode: "5",

  // Etiquetas ComScore obligatorias
  c3: "Brand/Network", // OBLIGATORIO
  c4: "Episode/Show", // OBLIGATORIO
  c6: "Content Classification", // OBLIGATORIO

  // Fechas de emisión
  tv_airdate: "2024-01-15",
  digital_airdate: "2024-01-16",

  // Clasificación de contenido
  content_classification_type: "vc00" // vc00=premium, vc01=user-generated
}
```

## Eventos Adicionales Recomendados

### **Eventos de Estado del Reproductor**

| Evento                  | Descripción                         | Uso en ComScore                  |
| ----------------------- | ----------------------------------- | -------------------------------- |
| **VideoLoadStart**      | Inicia la carga del video           | Preparación de metadatos         |
| **VideoLoadedMetadata** | Metadatos cargados                  | Configuración de duración total  |
| **VideoCanPlay**        | Reproductor listo para reproducir   | Estado de preparación            |
| **VideoError**          | Error en la reproducción            | Finalización de sesión por error |
| **VideoVolumeChanged**  | Cambio de volumen                   | Actualización de propiedades     |
| **VideoRateChanged**    | Cambio de velocidad de reproducción | Actualización de estado          |

### **Eventos de Tiempo (Heartbeat)**

```javascript
// Evento periódico cada 10 segundos durante la reproducción
VideoPlaybackHeartbeat: {
  session_id: "session_123",
  position: 45000, // Posición actual
  content_asset_id: "current_content",
  content_pod_id: "current_pod"
}
```

## Consideraciones Técnicas Importantes

### **1. Gestión de Sesiones**

- **Una sesión = Un reproductor**: Cada instancia del reproductor debe tener su propio `session_id`
- **Persistencia**: El `session_id` debe mantenerse durante toda la reproducción
- **Limpieza**: Llamar a `notifyEnd()` cuando se destruya el componente

### **2. Sincronización de Posición**

- **Precisión**: Las posiciones deben estar en milisegundos
- **Consistencia**: Usar la misma fuente de tiempo para todos los eventos
- **Actualización**: Mantener la posición actualizada en todos los eventos

### **3. Metadatos Obligatorios**

Los campos c3, c4, c6 son obligatorios para todos los eventos de contenido. Los campos no utilizados deben enviarse con el valor literal "\*null".

### **4. Clasificación de Contenido**

- **Contenido**: Usar `contentClassificationType` (vc00 = premium, vc01 = user-generated)
- **Anuncios**: Usar `adClassificationType` (va00 = linear VOD, va01 = linear live)

## Eventos Mínimos Requeridos

Para una implementación básica funcional, **debes implementar al menos**:

1. ✅ **VideoPlaybackStarted** - Obligatorio para inicializar ComScore
2. ✅ **VideoPlaybackPaused** - Para pausas
3. ✅ **VideoPlaybackResumed** - Para reanudar
4. ✅ **VideoPlaybackCompleted** - Para finalización
5. ✅ **VideoContentStarted** - Para contenido específico
6. ✅ **VideoPlaybackBufferStarted/Completed** - Para calidad de experiencia

## Testing y Validación

### **Herramientas de Debug**

- Habilitar logs verbosos en desarrollo
- Verificar que `createPlaybackSession()` se llame correctamente
- Validar que todos los eventos incluyan `session_id` y `position`

### **Casos de Prueba**

- Reproducción completa sin interrupciones
- Pausar y reanudar múltiples veces
- Seek a diferentes posiciones
- Salir de la app durante la reproducción
- Errores de red durante la reproducción

---

_Esta especificación está basada en las mejores prácticas de ComScore Streaming Tag y la especificación estándar de eventos de video de la industria._
