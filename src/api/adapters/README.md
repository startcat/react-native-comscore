# Adaptador del Conector ComScore para React Native

Este documento describe cómo funciona el adaptador del conector ComScore para React Native.

## Descripción del Adaptador

El `ComscoreConnectorAdapter` es un componente que sirve como capa de adaptación entre tu aplicación React Native y el SDK nativo de ComScore. Este adaptador facilita la inicialización, configuración y gestión de las métricas de ComScore en aplicaciones React Native.

El adaptador permite:

- Inicializar una instancia de ComScore con metadatos y configuración
- Actualizar los metadatos durante la reproducción
- Establecer etiquetas persistentes individualmente o en grupo
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

| Método              | Parámetros                        | Descripción                                      |
| ------------------- | --------------------------------- | ------------------------------------------------ |
| update              | metadata: ComscoreMetadata        | Actualiza los metadatos del contenido multimedia |
| setPersistentLabel  | label: string, value: string      | Establece una etiqueta persistente individual    |
| setPersistentLabels | labels: { [key: string]: string } | Establece múltiples etiquetas persistentes       |
| destroy             | ninguno                           | Destruye la instancia del conector               |

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

// Crear instancia del adaptador
const comscoreAdapter = new ComscoreConnectorAdapter(
  1, // instanceId
  comscoreMetadata,
  comscoreConfig
);

// Actualizar metadatos
comscoreAdapter.update({
  ...comscoreMetadata,
  stationTitle: 'Nuevo Canal',
});

// Establecer etiquetas persistentes
comscoreAdapter.setPersistentLabel('customKey', 'customValue');

// Destruir instancia cuando ya no se necesite
comscoreAdapter.destroy();
```
