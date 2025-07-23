# Documentación del Módulo API de ComScore

Este documento describe el módulo API de ComScore para React Native, que proporciona las interfaces principales para interactuar con el SDK nativo de ComScore.

## Descripción General

El módulo `/src/api` contiene los componentes principales para la integración de ComScore en aplicaciones React Native. Está diseñado para proporcionar tanto interfaces de alto nivel como de bajo nivel, permitiendo flexibilidad según las necesidades del proyecto.

## Arquitectura del Módulo

| Componente | Descripción | Archivo | Nivel |
|------------|-------------|---------|-------|
| **ComscoreConnector** | Conector principal con gestión automática de instancias | `ComscoreConnector.ts` | Alto nivel |
| **ComscoreConnectorAdapter** | Adaptador de bajo nivel con gestión manual | `adapters/` | Bajo nivel |
| **Constants** | Valores por defecto y constantes del sistema | `constants.ts` | Utilidades |
| **Exports** | Exportaciones públicas del módulo | `index.ts` | Configuración |

## ComscoreConnector

`ComscoreConnector` es la clase principal recomendada para la mayoría de implementaciones. Actúa como interfaz directa con el módulo nativo de ComScore, gestionando automáticamente los IDs de instancia y proporcionando una API completa para el seguimiento de contenido multimedia.

### Constructor del ComscoreConnector

El `ComscoreConnector` se inicializa con configuración y metadatos, gestionando automáticamente el ID de instancia.

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|----------|
| `configuration` | `ComscoreConfiguration` | Configuración del SDK de ComScore (publisherId, debug, etc.) | ✅ Sí |
| `metadata` | `ComscoreMetadata` | Metadatos iniciales del contenido multimedia | ✅ Sí |

### Características Principales

- ✅ **Gestión automática de instancias** - No requiere manejo manual de IDs
- ✅ **API completa de eventos** - Soporte para todos los eventos de reproducción
- ✅ **Logging integrado** - Registro automático en modo desarrollo
- ✅ **Verificación de seguridad** - Validación del módulo nativo
- ✅ **Interfaz tipada** - Implementa `IComscoreConnector`

## ComscoreConnectorAdapter

Para casos de uso avanzados que requieren control granular sobre las instancias, el proyecto incluye `ComscoreConnectorAdapter`, que proporciona acceso de bajo nivel con gestión manual de IDs de instancia.

### Cuándo Usar el Adaptador

| Escenario | ComscoreConnector | ComscoreConnectorAdapter |
|-----------|-------------------|---------------------------|
| **Integración estándar** | ✅ Recomendado | ❌ Innecesario |
| **Múltiples reproductores** | ⚠️ Limitado | ✅ Ideal |
| **Control granular** | ❌ Limitado | ✅ Control total |
| **Testing avanzado** | ⚠️ Más difícil | ✅ Fácil de mockear |

📚 **Para documentación completa del adaptador**: [ComscoreConnectorAdapter README](./adapters/README.md)

## Constants

El módulo incluye constantes y valores por defecto utilizados en toda la aplicación:

```typescript
export const DEFAULT_VALUES = {
  timestamp: () => Date.now(),
  position: 0,
  duration: 0,
  rate: 1.0,
  volume: 1.0,
  muted: false,
  trackIndex: -1, // -1 indica "sin pista seleccionada"
};
```

## Tipos Utilizados

El módulo API utiliza los siguientes tipos principales:

| Tipo | Descripción | Documentación |
|------|-------------|---------------|
| **ComscoreConfiguration** | Configuración del SDK de ComScore | [Tipos README](../types/README.md#comscoreconfiguration) |
| **ComscoreMetadata** | Metadatos del contenido multimedia | [Tipos README](../types/README.md#comscoremmetadata) |
| **ComscoreLabels** | Etiquetas persistentes (key-value) | [Tipos README](../types/README.md#comscorelabels) |
| **IComscoreConnector** | Interfaz del conector principal | [Tipos README](../types/README.md#icomscoreconnector) |

## API del ComscoreConnector

### 🔧 Gestión de Instancia y Configuración

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `getInstanceId()` | - | `number` | Obtiene el ID único de esta instancia (generado automáticamente) |
| `update()` | `metadata: ComscoreMetadata` | `void` | Actualiza los metadatos del contenido durante la reproducción |
| `setMetadata()` | `metadata: ComscoreMetadata` | `void` | Establece nuevos metadatos para el contenido |

### 🏷️ Gestión de Etiquetas Persistentes

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `setPersistentLabel()` | `label: string, value: string` | `void` | Establece una etiqueta persistente individual |
| `setPersistentLabels()` | `labels: ComscoreLabels` | `void` | Establece múltiples etiquetas persistentes de una vez |

### ▶️ Eventos de Reproducción

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `notifyPlay()` | - | `void` | Notifica el inicio o reanudación de la reproducción |
| `notifyPause()` | - | `void` | Notifica la pausa de la reproducción |
| `notifyEnd()` | - | `void` | Notifica el final de la reproducción |
| `createPlaybackSession()` | - | `void` | Crea una nueva sesión de reproducción |

### ⏳ Eventos de Buffering

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `notifyBufferStart()` | - | `void` | Notifica el inicio del buffering |
| `notifyBufferStop()` | - | `void` | Notifica el final del buffering |

### 🔍 Eventos de Seeking

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `notifySeekStart()` | - | `void` | Notifica el inicio de una operación de seek |
| `startFromPosition()` | `position: number` | `void` | Inicia la reproducción desde una posición específica (en segundos) |
| `startFromDvrWindowOffset()` | `offset: number` | `void` | Inicia desde un offset específico en la ventana DVR |

### 📺 Contenido en Vivo

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `setDvrWindowLength()` | `length: number` | `void` | Establece la longitud de la ventana DVR para contenido en vivo |

### ⚡ Control de Velocidad

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `notifyChangePlaybackRate()` | `rate: number` | `void` | Notifica un cambio en la velocidad de reproducción |

### 🗑️ Gestión de Lifecycle

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `destroy()` | - | `void` | Destruye la instancia del conector y libera todos los recursos |

## Ejemplo de Uso Completo

### Implementación Básica con ComscoreConnector

```typescript
import { ComscoreConnector } from '@comscore/react-native-comscore/api';
import type { 
  ComscoreConfiguration,
  ComscoreMetadata,
  ComscoreMediaType,
  ComscoreUserConsent 
} from '@comscore/react-native-comscore';

class VideoPlayerIntegration {
  private connector: ComscoreConnector;

  constructor() {
    // 1. Configuración de ComScore
    const config: ComscoreConfiguration = {
      publisherId: 'your-publisher-id',
      applicationName: 'MiAplicación',
      userConsent: ComscoreUserConsent.granted,
      debug: __DEV__, // Solo debug en desarrollo
    };

    // 2. Metadatos del contenido
    const metadata: ComscoreMetadata = {
      mediaType: ComscoreMediaType.longFormOnDemand,
      uniqueId: 'video-123',
      length: 360000, // 6 minutos en milisegundos
      stationTitle: 'Mi Canal',
      programTitle: 'Mi Programa',
      episodeTitle: 'Episodio 1',
      genreName: 'Entretenimiento',
      classifyAsAudioStream: false,
    };

    // 3. Crear conector (ID gestionado automáticamente)
    this.connector = new ComscoreConnector(config, metadata);
    
    console.log(`ComScore inicializado - Instance ID: ${this.connector.getInstanceId()}`);
  }

  // Métodos del reproductor
  
  startPlayback(): void {
    this.connector.createPlaybackSession();
    this.connector.notifyPlay();
  }

  pausePlayback(): void {
    this.connector.notifyPause();
  }

  resumePlayback(): void {
    this.connector.notifyPlay();
  }

  endPlayback(): void {
    this.connector.notifyEnd();
  }

  seekTo(seconds: number): void {
    this.connector.notifySeekStart();
    this.connector.startFromPosition(seconds * 1000); // Convertir a ms
  }

  onBufferingStart(): void {
    this.connector.notifyBufferStart();
  }

  onBufferingEnd(): void {
    this.connector.notifyBufferStop();
  }

  changeSpeed(rate: number): void {
    this.connector.notifyChangePlaybackRate(rate);
  }

  updateMetadata(newMetadata: Partial<ComscoreMetadata>): void {
    this.connector.update({
      mediaType: ComscoreMediaType.longFormOnDemand,
      uniqueId: 'video-123',
      length: 360000,
      stationTitle: 'Mi Canal',
      programTitle: 'Mi Programa',
      episodeTitle: 'Episodio 1',
      genreName: 'Entretenimiento',
      classifyAsAudioStream: false,
      ...newMetadata
    });
  }

  setCustomLabels(): void {
    // Etiqueta individual
    this.connector.setPersistentLabel('user_type', 'premium');
    
    // Múltiples etiquetas
    this.connector.setPersistentLabels({
      'content_category': 'entertainment',
      'device_type': 'mobile',
      'app_version': '1.0.0'
    });
  }

  // Limpieza
  cleanup(): void {
    this.connector.destroy();
    console.log('ComScore connector destruido');
  }
}

// Uso de la integración
const player = new VideoPlayerIntegration();

// Configurar etiquetas personalizadas
player.setCustomLabels();

// Simular flujo de reproducción
player.startPlayback();
setTimeout(() => player.onBufferingStart(), 2000);
setTimeout(() => player.onBufferingEnd(), 4000);
setTimeout(() => player.pausePlayback(), 10000);
setTimeout(() => player.resumePlayback(), 15000);
setTimeout(() => player.seekTo(30), 20000); // Seek a 30 segundos
setTimeout(() => player.changeSpeed(1.5), 25000); // 1.5x velocidad
setTimeout(() => player.endPlayback(), 30000);

// Limpiar al finalizar
setTimeout(() => player.cleanup(), 35000);
```

### Ejemplo para Contenido en Vivo

```typescript
// Configuración específica para contenido en vivo
const liveMetadata: ComscoreMetadata = {
  mediaType: ComscoreMediaType.live,
  uniqueId: 'live-stream-123',
  length: 0, // Para live, length puede ser 0
  stationTitle: 'Canal en Vivo',
  programTitle: 'Transmisión en Directo',
  classifyAsAudioStream: false,
};

const liveConnector = new ComscoreConnector(config, liveMetadata);

// Configurar ventana DVR para contenido en vivo
liveConnector.setDvrWindowLength(1800000); // 30 minutos de DVR

// Iniciar desde una posición específica en la ventana DVR
liveConnector.startFromDvrWindowOffset(-300000); // 5 minutos atrás

// Resto del flujo normal...
liveConnector.notifyPlay();
```

## Comparación de Componentes del API

### ComscoreConnector vs ComscoreConnectorAdapter

| Aspecto | ComscoreConnector | ComscoreConnectorAdapter |
|---------|-------------------|---------------------------|
| **Gestión de ID** | ✅ Automática | ⚠️ Manual (requiere `instanceId`) |
| **Facilidad de uso** | ✅ Alta - Plug & play | ⚠️ Media - Requiere más configuración |
| **Casos de uso** | ✅ Mayoría de implementaciones | ⚠️ Casos avanzados específicos |
| **Múltiples instancias** | ⚠️ Posible pero limitado | ✅ Diseñado para múltiples instancias |
| **Testing** | ⚠️ Más difícil de mockear | ✅ Fácil de testear y mockear |
| **Control granular** | ❌ Limitado | ✅ Control total sobre instancias |
| **Recomendación** | ✅ **Recomendado para la mayoría** | ⚠️ Solo para casos específicos |

### Cuándo Usar Cada Componente

#### ✅ Usa ComscoreConnector cuando:
- Tienes **un solo reproductor** en tu aplicación
- Quieres una **integración rápida y sencilla**
- No necesitas **control granular** sobre instancias
- Prefieres que el sistema **gestione automáticamente** los IDs

#### ⚠️ Usa ComscoreConnectorAdapter cuando:
- Necesitas **múltiples reproductores simultáneos**
- Requieres **control total** sobre los IDs de instancia
- Estás implementando **arquitecturas complejas**
- Necesitas **testing avanzado** con mocking específico

## Mejores Prácticas

### 🔄 Gestión del Lifecycle

```typescript
class VideoComponent {
  private connector?: ComscoreConnector;

  componentDidMount() {
    this.connector = new ComscoreConnector(config, metadata);
  }

  componentWillUnmount() {
    // ⚠️ IMPORTANTE: Siempre destruir la instancia
    this.connector?.destroy();
  }
}
```

### 📊 Logging y Debugging

```typescript
// Habilitar logging en desarrollo
const config: ComscoreConfiguration = {
  publisherId: 'your-id',
  debug: __DEV__, // Solo en desarrollo
  // ... otras configuraciones
};

// Verificar estado de la instancia
if (__DEV__) {
  console.log('ComScore Instance ID:', connector.getInstanceId());
}
```

### 🏷️ Gestión de Etiquetas

```typescript
// ✅ Buena práctica: Agrupar etiquetas relacionadas
connector.setPersistentLabels({
  'user_type': 'premium',
  'content_category': 'sports',
  'device_type': 'mobile'
});

// ❌ Evitar: Múltiples llamadas individuales
// connector.setPersistentLabel('user_type', 'premium');
// connector.setPersistentLabel('content_category', 'sports');
// connector.setPersistentLabel('device_type', 'mobile');
```

### ⚡ Optimización de Rendimiento

- **Reutiliza instancias** cuando sea posible
- **Evita crear/destruir** conectores frecuentemente
- **Agrupa actualizaciones** de metadatos
- **Usa etiquetas persistentes** para datos que no cambian frecuentemente

## Referencias y Documentación Adicional

- 📚 **[ComscoreConnectorAdapter](./adapters/README.md)** - Documentación completa del adaptador de bajo nivel
- 📝 **[Tipos ComScore](../types/README.md)** - Documentación de todos los tipos utilizados
- 🔌 **[Plugin ComScore](../plugin/ComscorePlugin.readme.md)** - Integración de alto nivel con handlers automáticos
- 📊 **[Logger ComScore](../logger/README.md)** - Sistema de logging integrado

## Soporte y Troubleshooting

### Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| "ComScore native module not available" | Módulo nativo no vinculado | Verificar instalación y linking |
| Memory leaks | `destroy()` no llamado | Siempre llamar `destroy()` en cleanup |
| Eventos no registrados | Instancia no inicializada | Verificar parámetros del constructor |
| IDs duplicados | Múltiples instancias sin cleanup | Gestionar lifecycle correctamente |

### Debugging

```typescript
// Verificar disponibilidad del módulo nativo
import { NativeModules } from 'react-native';

if (!NativeModules.Comscore) {
  console.error('ComScore native module not available');
} else {
  console.log('ComScore native module loaded successfully');
}
```
