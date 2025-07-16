# Documentación de ComscorePlugin

Este documento describe cómo funciona el plugin de ComScore para integración con reproductores de medios en React Native.

## Descripción

`ComscorePlugin` es un plugin diseñado para conectar reproductores multimedia con el SDK de ComScore, facilitando el análisis y seguimiento de la reproducción de contenido audiovisual. Implementa una interfaz estándar que permite capturar eventos del ciclo de vida del reproductor y transmitirlos al sistema de medición de ComScore.

## Props del Componente

`ComscorePlugin` no es un componente React con props, sino una clase que implementa la interfaz `ComscorePluginInterface`. Se inicializa a través de su constructor con los parámetros necesarios para configurar ComScore.

## Interfaces y Enumeraciones

### ComscorePluginInterface

Esta es la interfaz principal que define los métodos disponibles en el plugin:

| Método              | Parámetros                        | Descripción                                   |
| ------------------- | --------------------------------- | --------------------------------------------- |
| update              | metadata: ComscoreMetadata        | Actualiza los metadatos del contenido         |
| setPersistentLabel  | label: string, value: string      | Establece una etiqueta persistente individual |
| setPersistentLabels | labels: { [key: string]: string } | Establece múltiples etiquetas persistentes    |

Adicionalmente, hereda todos los métodos de la interfaz `PlayerPlugin`:

### PlayerPlugin

| Método                | Parámetros                                 | Descripción                                        |
| --------------------- | ------------------------------------------ | -------------------------------------------------- |
| name                  | string                                     | Nombre del plugin                                  |
| version               | string                                     | Versión del plugin                                 |
| onStart               | () => void                                 | Evento de inicio del reproductor                   |
| onPlay                | () => void                                 | Evento de reproducción                             |
| onPause               | () => void                                 | Evento de pausa                                    |
| onBuffering           | (value: boolean) => void                   | Opcional. Evento de buffering                      |
| onSeek                | (value: number) => void                    | Opcional. Evento de búsqueda                       |
| onProgress            | (value: number, duration?: number) => void | Opcional. Evento de progreso                       |
| onChangeAudioIndex    | (index: number, label?: string) => void    | Opcional. Evento de cambio de pista de audio       |
| onChangeSubtitleIndex | (index: number, label?: string) => void    | Opcional. Evento de cambio de subtítulos           |
| onNext                | () => void                                 | Opcional. Evento para pasar al siguiente contenido |
| onPrevious            | () => void                                 | Opcional. Evento para volver al contenido anterior |
| onEnd                 | () => void                                 | Evento de finalización                             |
| destroy               | () => void                                 | Método para liberar recursos                       |

### ComscoreState

Enumeración que define los posibles estados del plugin durante la reproducción:

| Estado        | Descripción                                |
| ------------- | ------------------------------------------ |
| INITIALIZED   | Plugin inicializado, pero no reproduciendo |
| STOPPED       | Reproducción detenida                      |
| PAUSED_AD     | Publicidad en pausa                        |
| PAUSED_VIDEO  | Contenido en pausa                         |
| ADVERTISEMENT | Reproduciendo publicidad                   |
| VIDEO         | Reproduciendo contenido                    |

## Tipos utilizados

El plugin utiliza los siguientes tipos definidos en la carpeta `/types`:

- **ComscoreConfiguration**: Contiene la configuración necesaria para inicializar el SDK de ComScore.
- **ComscoreMetadata**: Define los metadatos del contenido multimedia que se está reproduciendo.

Para una documentación detallada de estos tipos y sus propiedades, consulta la [documentación de tipos de ComScore](./types/README.md).

## Eventos de Reproductor

El plugin está diseñado para responder a los siguientes eventos del reproductor:

- **handleSourceChange**: Cuando cambia la fuente del contenido
- **handleMetadataLoaded**: Cuando se cargan los metadatos
- **handleDurationChange**: Cuando cambia la duración del contenido
- **handleBuffering**: Al comenzar o terminar el buffering
- **handlePlay**: Al iniciar la reproducción
- **handlePause**: Al pausar la reproducción
- **handleSeeking/handleSeeked**: Al buscar una posición específica
- **handleRateChange**: Al cambiar la velocidad de reproducción
- **handleEnded**: Al finalizar la reproducción
- **handleAdBegin**: Al comenzar un anuncio
- **handleAdBreakBegin**: Al comenzar un bloque de anuncios
- **handleContentResume**: Al reanudar el contenido tras un anuncio
- **handleError**: Al encontrar un error

## Ejemplo de uso

```typescript
import { ComscorePlugin } from './api/ComscorePlugin';
import { ComscoreMediaType } from './api/types/ComscoreMetadata';
import { ComscoreUserConsent } from './api/types/ComscoreConfiguration';

// Crear configuración
const comscoreConfig = {
  publisherId: 'tu-publisher-id',
  applicationName: 'MiAplicación',
  userConsent: ComscoreUserConsent.granted,
  debug: __DEV__,
};

// Crear metadatos
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
const comscorePlugin = new ComscorePlugin(comscoreMetadata, comscoreConfig);

// Conectar a un reproductor
myPlayer.addPlugin(comscorePlugin);

// El plugin recibirá automáticamente eventos como:
// - onPlay
// - onPause
// - onProgress
// - onEnd

// También puedes actualizar los metadatos manualmente
comscorePlugin.update({
  ...comscoreMetadata,
  episodeTitle: 'Episodio 2',
});

// Destruir el plugin cuando ya no se necesita
comscorePlugin.destroy();
```

## Consideraciones importantes

- Este plugin debe usarse junto con un reproductor multimedia compatible que pueda llamar a los métodos de la interfaz `PlayerPlugin`.
- El plugin maneja automáticamente la transición entre estados basados en los eventos del reproductor.
- Es importante destruir el plugin cuando ya no se necesite para liberar recursos.
