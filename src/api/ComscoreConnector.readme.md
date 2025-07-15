# Documentación de ComscoreConnector

Este documento describe cómo funciona el conector principal de ComScore para React Native.

## Descripción

`ComscoreConnector` es una clase que actúa como interfaz directa con el módulo nativo de ComScore. Gestiona automáticamente los IDs de instancia y proporciona una API completa para el seguimiento de contenido multimedia, incluyendo eventos de reproducción, buffering, seeking, contenido en vivo y control de velocidad.

## Constructor

El `ComscoreConnector` es una clase de TypeScript que se inicializa mediante un constructor y gestiona automáticamente el ID de instancia.

| Parámetro     | Tipo                  | Descripción                                       | Requerido |
| ------------- | --------------------- | ------------------------------------------------- | --------- |
| configuration | ComscoreConfiguration | Objeto con la configuración del SDK de ComScore   | Sí        |
| metadata      | ComscoreMetadata      | Objeto con los metadatos del contenido multimedia | Sí        |

## Tipos utilizados

El conector utiliza los siguientes tipos definidos en la carpeta `/types`:

- **ComscoreConfiguration**: Contiene la configuración necesaria para inicializar el SDK de ComScore.
- **ComscoreMetadata**: Define los metadatos del contenido multimedia que se está reproduciendo.
- **ComscoreLabels**: Tipo para manejar múltiples etiquetas persistentes.

Para una documentación detallada de estos tipos y sus propiedades, consulta la [documentación de tipos de ComScore](./types/README.md).

## Métodos

### Configuración y Metadatos

| Método              | Parámetros                   | Descripción                                   |
| ------------------- | ---------------------------- | --------------------------------------------- |
| getInstanceId       | ninguno                      | Obtiene el ID único de esta instancia         |
| update              | metadata: ComscoreMetadata   | Actualiza los metadatos del contenido         |
| setMetadata         | metadata: ComscoreMetadata   | Establece los metadatos de contenido          |
| setPersistentLabel  | label: string, value: string | Establece una etiqueta persistente individual |
| setPersistentLabels | labels: ComscoreLabels       | Establece múltiples etiquetas persistentes    |

### Eventos de Reproducción

| Método                | Parámetros | Descripción                                    |
| --------------------- | ---------- | ---------------------------------------------- |
| notifyPlay            | ninguno    | Notifica el inicio/reanudación de reproducción |
| notifyPause           | ninguno    | Notifica la pausa de la reproducción           |
| notifyEnd             | ninguno    | Notifica el final de la reproducción           |
| createPlaybackSession | ninguno    | Crea una nueva sesión de reproducción          |

### Eventos de Buffering

| Método            | Parámetros | Descripción                      |
| ----------------- | ---------- | -------------------------------- |
| notifyBufferStart | ninguno    | Notifica el inicio del buffering |
| notifyBufferStop  | ninguno    | Notifica el final del buffering  |

### Eventos de Seeking

| Método                   | Parámetros       | Descripción                                          |
| ------------------------ | ---------------- | ---------------------------------------------------- |
| notifySeekStart          | ninguno          | Notifica el inicio de una operación de seek          |
| startFromPosition        | position: number | Inicia la reproducción desde una posición específica |
| startFromDvrWindowOffset | offset: number   | Inicia desde un offset específico en la ventana DVR  |

### Contenido en Vivo

| Método             | Parámetros     | Descripción                             |
| ------------------ | -------------- | --------------------------------------- |
| setDvrWindowLength | length: number | Establece la longitud de la ventana DVR |

### Control de Velocidad

| Método                   | Parámetros   | Descripción                                        |
| ------------------------ | ------------ | -------------------------------------------------- |
| notifyChangePlaybackRate | rate: number | Notifica un cambio en la velocidad de reproducción |

### Ciclo de Vida

| Método  | Parámetros | Descripción                                          |
| ------- | ---------- | ---------------------------------------------------- |
| destroy | ninguno    | Destruye la instancia del conector y libera recursos |

## Ejemplo de uso

```typescript
import { ComscoreConnector } from './api/ComscoreConnector';
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
  length: 360000, // 6 minutos en milisegundos
  stationTitle: 'Mi Canal',
  programTitle: 'Mi Programa',
  episodeTitle: 'Episodio 1',
  genreName: 'Entretenimiento',
  classifyAsAudioStream: false,
};

// Crear instancia del conector (el ID se genera automáticamente)
const connector = new ComscoreConnector(comscoreConfig, comscoreMetadata);

// Obtener el ID de instancia generado automáticamente
const instanceId = connector.getInstanceId();
console.log('ID de instancia:', instanceId);

// Eventos de reproducción
connector.notifyPlay(); // Iniciar reproducción
connector.notifyPause(); // Pausar
connector.notifyPlay(); // Reanudar
connector.notifyEnd(); // Finalizar

// Actualizar metadatos durante la reproducción
connector.update({
  ...comscoreMetadata,
  episodeTitle: 'Episodio 2',
});

// Establecer etiquetas persistentes
connector.setPersistentLabel('customLabel', 'customValue');
connector.setPersistentLabels({
  label1: 'value1',
  label2: 'value2',
});

// Eventos de buffering
connector.notifyBufferStart();
connector.notifyBufferStop();

// Eventos de seeking
connector.notifySeekStart();
connector.startFromPosition(30000); // Saltar a 30 segundos

// Contenido en vivo
connector.setDvrWindowLength(1800000); // Ventana DVR de 30 minutos
connector.startFromDvrWindowOffset(-300000); // Reproducir desde 5 minutos atrás

// Control de velocidad
connector.notifyChangePlaybackRate(1.5); // Reproducir a 1.5x
connector.notifyChangePlaybackRate(1.0); // Volver a velocidad normal

// Al finalizar, destruir la instancia
connector.destroy();
```

## Ventajas del ComscoreConnector

- **Gestión automática de ID**: No necesitas manejar manualmente los IDs de instancia
- **API completa**: Incluye todos los eventos de reproducción, buffering, seeking y más
- **Logging automático**: En modo desarrollo, registra automáticamente todas las operaciones
- **Seguridad**: Verifica la disponibilidad del módulo nativo antes de cada operación
- **Flexibilidad**: Permite actualizar metadatos y etiquetas en cualquier momento

## Diferencias con ComscoreConnectorAdapter

| Característica   | ComscoreConnector | ComscoreConnectorAdapter    |
| ---------------- | ----------------- | --------------------------- |
| Gestión de ID    | Automática        | Manual                      |
| Facilidad de uso | Alta              | Media                       |
| Casos de uso     | Mayoría de casos  | Casos avanzados             |
| Recomendación    | ✅ Recomendado    | Solo para casos específicos |

## Recomendaciones

1. **Usa ComscoreConnector** para la mayoría de implementaciones
2. **Gestiona el ciclo de vida** correctamente llamando a `destroy()` cuando termines
3. **Actualiza metadatos** usando `update()` cuando cambien durante la reproducción
4. **Usa etiquetas persistentes** para información que se mantiene entre sesiones
5. **Implementa todos los eventos** relevantes para tu tipo de contenido (live, VOD, etc.)
