# Documentación de ComscoreConnector

Este documento describe cómo funciona el conector principal de ComScore para React Native.

## Descripción

`ComscoreConnector` es una clase que actúa como interfaz directa con el módulo nativo de ComScore. Se encarga de inicializar el SDK nativo de ComScore, actualizar los metadatos y gestionar etiquetas persistentes para el seguimiento de contenido multimedia.

## Constructor

El `ComscoreConnector` no es un componente React con props, sino una clase de TypeScript que se inicializa mediante un constructor.

| Parámetro        | Tipo                  | Descripción                                       | Requerido |
| ---------------- | --------------------- | ------------------------------------------------- | --------- |
| instanceId       | number                | Identificador único de la instancia de ComScore   | Sí        |
| comscoreMetadata | ComscoreMetadata      | Objeto con los metadatos del contenido multimedia | Sí        |
| comscoreConfig   | ComscoreConfiguration | Objeto con la configuración del SDK de ComScore   | Sí        |

## Tipos utilizados

El conector utiliza los siguientes tipos definidos en la carpeta `/types`:

- **ComscoreConfiguration**: Contiene la configuración necesaria para inicializar el SDK de ComScore.
- **ComscoreMetadata**: Define los metadatos del contenido multimedia que se está reproduciendo.

Para una documentación detallada de estos tipos y sus propiedades, consulta la [documentación de tipos de ComScore](./types/README.md).

## Métodos

El conector proporciona los siguientes métodos:

| Método              | Parámetros                        | Descripción                                   |
| ------------------- | --------------------------------- | --------------------------------------------- |
| update              | metadata: ComscoreMetadata        | Actualiza los metadatos del contenido         |
| setPersistentLabel  | label: string, value: string      | Establece una etiqueta persistente individual |
| setPersistentLabels | labels: { [key: string]: string } | Establece múltiples etiquetas persistentes    |
| destroy             | ninguno                           | Destruye la instancia del conector            |

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

// Inicializar el conector
const comscoreConnector = new ComscoreConnector(
  1,
  comscoreMetadata,
  comscoreConfig
);

// Actualizar metadatos (por ejemplo, cuando cambia el contenido)
comscoreConnector.update({
  ...comscoreMetadata,
  uniqueId: 'video-456',
  episodeTitle: 'Episodio 2',
});

// Establecer etiquetas persistentes
comscoreConnector.setPersistentLabel('usuario_id', 'user-123');

// Establecer múltiples etiquetas persistentes
comscoreConnector.setPersistentLabels({
  plan: 'premium',
  dispositivo: 'móvil',
});

// Destruir el conector cuando ya no se necesita
comscoreConnector.destroy();
```

## Consideraciones importantes

- Asegúrate de que el módulo nativo de ComScore está correctamente instalado y configurado en tu proyecto.
- El conector maneja automáticamente los errores y muestra mensajes de depuración cuando `__DEV__` es verdadero.
- Cada instancia de `ComscoreConnector` debe tener un `instanceId` único.
