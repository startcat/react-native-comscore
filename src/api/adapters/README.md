# Adaptador del Conector ComScore para React Native

Este documento describe cómo funciona el adaptador del conector ComScore para React Native.

## Descripción del Adaptador

El `ComscoreConnectorAdapter` es una clase de bajo nivel que sirve como capa de adaptación directa con el SDK nativo de ComScore. A diferencia de `ComscoreConnector` (que gestiona automáticamente los IDs de instancia), este adaptador requiere la gestión manual del `instanceId`.

### Diferencias con ComscoreConnector

- **ComscoreConnector**: Clase principal recomendada, gestiona automáticamente los IDs de instancia
- **ComscoreConnectorAdapter**: Clase de bajo nivel, requiere gestión manual del `instanceId`, útil para casos avanzados

### Características del Adaptador

El adaptador permite:

- Inicializar una instancia de ComScore con ID manual, metadatos y configuración
- Actualizar los metadatos durante la reproducción
- Establecer etiquetas persistentes individualmente o en grupo
- Gestionar eventos de reproducción (play, pause, end, buffering, seeking)
- Manejar contenido en vivo con ventana DVR
- Controlar la velocidad de reproducción
- Destruir la instancia cuando ya no se necesite

## Props del ComscoreConnectorAdapter

El adaptador `ComscoreConnectorAdapter` utiliza los siguientes parámetros en su constructor:

| Parámetro        | Tipo                  | Descripción                                     | Requerido |
| ---------------- | --------------------- | ----------------------------------------------- | --------- |
| instanceId       | number                | Identificador único de la instancia de ComScore | Sí        |
| comscoreMetadata | ComscoreMetadata      | Objeto con metadatos del contenido multimedia   | Sí        |
| comscoreConfig   | ComscoreConfiguration | Configuración del SDK de ComScore               | Sí        |

## Configuración y Metadatos

El adaptador utiliza dos tipos principales de objetos para su funcionamiento:

- **ComscoreConfiguration**: Contiene la configuración necesaria para inicializar el SDK de ComScore, como el ID del publisher, nombre de la aplicación, etc.

- **ComscoreMetadata**: Define los metadatos del contenido multimedia que se está reproduciendo.

Para una documentación detallada de estos tipos y sus propiedades, consulta la [documentación de tipos de ComScore](../types/README.md).

Las enumeraciones como `ComscoreUserConsent` y `ComscoreUsagePropertiesAutoUpdateMode` también están documentadas en detalle en la [documentación de tipos de ComScore](../types/README.md).

## Métodos del Adaptador

El adaptador proporciona los siguientes métodos:

### Configuración y Metadatos

| Método              | Parámetros                        | Descripción                                      |
| ------------------- | --------------------------------- | ------------------------------------------------ |
| update              | metadata: ComscoreMetadata        | Actualiza los metadatos del contenido multimedia |
| setMetadata         | metadata: ComscoreMetadata        | Establece los metadatos del contenido            |
| setPersistentLabel  | label: string, value: string      | Establece una etiqueta persistente individual    |
| setPersistentLabels | labels: { [key: string]: string } | Establece múltiples etiquetas persistentes       |

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

### Velocidad de Reproducción

| Método                   | Parámetros   | Descripción                                   |
| ------------------------ | ------------ | --------------------------------------------- |
| notifyChangePlaybackRate | rate: number | Notifica un cambio en la velocidad de reprod. |

### Utilidades

| Método        | Parámetros | Descripción                        |
| ------------- | ---------- | ---------------------------------- |
| getInstanceId | ninguno    | Obtiene el ID de la instancia      |
| destroy       | ninguno    | Destruye la instancia del conector |

## Ejemplo de uso

```typescript
import { ComscoreConnectorAdapter } from 'react-native-comscore';
import { ComscoreUserConsent, ComscoreMediaType } from 'react-native-comscore';

// Configurar ComScore
const comscoreConfig = {
  publisherId: 'YOUR_PUBLISHER_ID',
  applicationName: 'YOUR_APP_NAME',
  userConsent: ComscoreUserConsent.granted,
  usagePropertiesAutoUpdateMode: 'foregroundOnly',
  debug: __DEV__,
};

// Metadatos del contenido
const comscoreMetadata = {
  mediaType: ComscoreMediaType.longFormOnDemand,
  uniqueId: 'unique-content-id-123',
  length: 3600000, // 1 hora en milisegundos
  stationTitle: 'Mi Canal',
  classifyAsAudioStream: false,
};

// Crear instancia del adaptador (requiere gestión manual del ID)
const instanceId = 1;
const comscoreAdapter = new ComscoreConnectorAdapter(
  instanceId,
  comscoreMetadata,
  comscoreConfig
);

// Gestionar eventos de reproducción
comscoreAdapter.notifyPlay(); // Iniciar reproducción
comscoreAdapter.notifyPause(); // Pausar
comscoreAdapter.notifyPlay(); // Reanudar

// Actualizar metadatos durante la reproducción
comscoreAdapter.update({
  ...comscoreMetadata,
  stationTitle: 'Nuevo Canal',
});

// Gestionar buffering
comscoreAdapter.notifyBufferStart(); // Inicio del buffering
comscoreAdapter.notifyBufferStop(); // Fin del buffering

// Gestionar seeking
comscoreAdapter.notifySeekStart();
comscoreAdapter.startFromPosition(30000); // Comenzar desde 30 segundos

// Para contenido en vivo
comscoreAdapter.setDvrWindowLength(1800000); // Ventana DVR de 30 min
comscoreAdapter.startFromDvrWindowOffset(-600000); // 10 min atrás

// Cambiar velocidad de reproducción
comscoreAdapter.notifyChangePlaybackRate(1.5); // 1.5x velocidad

// Establecer etiquetas persistentes
comscoreAdapter.setPersistentLabel('customKey', 'customValue');
comscoreAdapter.setPersistentLabels({
  userId: '12345',
  contentType: 'premium',
});

// Finalizar reproducción
comscoreAdapter.notifyEnd();

// Destruir instancia cuando ya no se necesite
comscoreAdapter.destroy();
```

## Recomendación de Uso

**Para la mayoría de casos de uso, se recomienda utilizar `ComscoreConnector` en lugar del adaptador**, ya que gestiona automáticamente los IDs de instancia y se integra mejor con el contexto de React Native:

```typescript
// Recomendado: ComscoreConnector
import { ComscoreConnector } from 'react-native-comscore';

const connector = new ComscoreConnector(comscoreConfig, comscoreMetadata);
// El ID de instancia se gestiona automáticamente
```

Utiliza `ComscoreConnectorAdapter` solo cuando necesites control específico sobre los IDs de instancia o en implementaciones de bajo nivel.
