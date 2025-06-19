# react-native-comscore

Módulo de ComScore Analytics para React Native

## Instalación

```sh
npm install react-native-comscore
```

## Tipos de Funcionamiento

Esta librería soporta dos tipos principales de analíticas:

### 1. Analíticas de ComScore

Funcionalidad básica de tracking y medición de audiencia de ComScore para aplicaciones móviles. Permite:

- Medición de páginas vistas y eventos de aplicación
- Tracking de usuarios únicos y sesiones
- Reportes de uso y engagement
- Configuración personalizada de metadatos

#### Uso Básico

```js
import { ComscoreConnector } from 'react-native-comscore';

// Configuración e inicialización
const comscore = new ComscoreConnector(appContext);
```

### 2. ComScore Streaming Tag - Player OTT

Funcionalidad especializada para el tracking de contenido de video streaming y reproductores OTT (Over-The-Top). Esta implementación permite:

- Medición detallada de reproducción de video
- Tracking de eventos de streaming (play, pause, buffer, etc.)
- Métricas de calidad de reproducción
- Análisis de audiencia para contenido OTT

#### Gestión de Eventos

El Player OTT debe gestionar diversos eventos durante la reproducción de contenido. Para obtener información detallada sobre todos los eventos disponibles y su implementación, consulta:

 **[Documentación de Eventos del Player OTT](docs/events.md)**

#### Configuración para Streaming

```js
import { ComscoreStreamingTag } from 'react-native-comscore';

// Configuración para streaming
const streamingTag = new ComscoreStreamingTag({
  // Configuración específica para OTT
});
```

## Contribución

Consulta la [guía de contribución](CONTRIBUTING.md) para aprender cómo contribuir al repositorio y el flujo de desarrollo.

## Licencia

MIT

---

Creado con [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
