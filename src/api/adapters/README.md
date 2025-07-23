# Documentación del Adaptador ComScore

Este documento describe el sistema de adaptadores para la integración de ComScore en React Native.

## Descripción General

El módulo de adaptadores proporciona una capa de abstracción de bajo nivel para interactuar directamente con el SDK nativo de ComScore. Está diseñado para casos de uso avanzados que requieren control granular sobre las instancias de ComScore.

## Arquitectura del Módulo

| Componente | Responsabilidad | Archivo |
|------------|-----------------|----------|
| **ComscoreConnectorAdapter** | Implementación del adaptador principal | `ComscoreConnectorAdapter.ts` |
| **IComscoreConnectorAdapter** | Interfaz que define el contrato del adaptador | `types.ts` |
| **Exports** | Exportaciones públicas del módulo | `index.ts` |

## ComscoreConnectorAdapter

Clase principal que implementa la interfaz `IComscoreConnectorAdapter` y proporciona acceso directo al SDK nativo de ComScore.

### Diferencias con ComscoreConnector

| Aspecto | ComscoreConnector | ComscoreConnectorAdapter |
|---------|-------------------|---------------------------|
| **Gestión de ID** | Automática | Manual (requiere `instanceId`) |
| **Nivel de abstracción** | Alto nivel, recomendado | Bajo nivel, casos avanzados |
| **Facilidad de uso** | Simplificado | Control granular |
| **Casos de uso** | Integración estándar | Implementaciones personalizadas |

### Características Principales

- ✅ **Gestión manual de instancias** con control total sobre `instanceId`
- ✅ **Acceso directo al SDK nativo** sin capas adicionales de abstracción
- ✅ **Implementación de interfaz tipada** (`IComscoreConnectorAdapter`)
- ✅ **Logging integrado** para debugging en modo desarrollo
- ✅ **Verificación de disponibilidad** del módulo nativo
- ✅ **Organización por categorías** de métodos (configuración, eventos, lifecycle)

### Funcionalidades Disponibles

#### Configuración y Metadatos
- Inicialización con metadatos y configuración
- Actualización dinámica de metadatos
- Establecimiento de metadatos específicos

#### Etiquetas Persistentes
- Configuración individual de etiquetas
- Configuración masiva de múltiples etiquetas

#### Eventos de Reproducción
- Control de estados de reproducción (play, pause, end)
- Gestión de sesiones de reproducción

#### Eventos de Buffering
- Notificación de inicio y fin de buffering

#### Eventos de Seeking
- Control de operaciones de búsqueda
- Inicio desde posiciones específicas
- Soporte para ventana DVR

#### Streaming en Vivo
- Configuración de ventana DVR
- Soporte para contenido en tiempo real

#### Control de Velocidad
- Notificación de cambios en velocidad de reproducción

#### Gestión de Lifecycle
- Obtención de ID de instancia
- Destrucción y limpieza de recursos

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

## Interfaz IComscoreConnectorAdapter

Todos los métodos del adaptador están definidos en la interfaz `IComscoreConnectorAdapter`, que garantiza un contrato consistente y facilita el testing y la extensibilidad.

```typescript
export interface IComscoreConnectorAdapter {
  // Configuration & Metadata
  update(metadata: ComscoreMetadata): void;
  setMetadata(metadata: ComscoreMetadata): void;
  
  // Persistent Labels
  setPersistentLabel(label: string, value: string): void;
  setPersistentLabels(labels: { [key: string]: string }): void;
  
  // Playback Events
  notifyPlay(): void;
  notifyPause(): void;
  notifyEnd(): void;
  createPlaybackSession(): void;
  
  // Buffering Events
  notifyBufferStart(): void;
  notifyBufferStop(): void;
  
  // Seeking Events
  notifySeekStart(): void;
  startFromPosition(position: number): void;
  startFromDvrWindowOffset(offset: number): void;
  
  // Live Streaming
  setDvrWindowLength(length: number): void;
  
  // Playback Rate
  notifyChangePlaybackRate(rate: number): void;
  
  // Lifecycle
  getInstanceId(): number;
  destroy(): void;
}
```

## Constructor del ComscoreConnectorAdapter

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `instanceId` | `number` | ID único para esta instancia del adaptador (gestión manual) |
| `comscoreMetadata` | `ComscoreMetadata` | Metadatos iniciales del contenido a reproducir |
| `comscoreConfig` | `ComscoreConfiguration` | Configuración de ComScore (publisherId, debug, etc.) |

## API de Métodos por Categoría

### 📊 Configuración y Metadatos

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `update()` | `metadata: ComscoreMetadata` | `void` | Actualiza los metadatos de la instancia existente |
| `setMetadata()` | `metadata: ComscoreMetadata` | `void` | Establece nuevos metadatos para la instancia |

### 🏷️ Etiquetas Persistentes

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `setPersistentLabel()` | `label: string, value: string` | `void` | Establece una etiqueta persistente individual |
| `setPersistentLabels()` | `labels: { [key: string]: string }` | `void` | Establece múltiples etiquetas persistentes de una vez |

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

### 📺 Streaming en Vivo

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `setDvrWindowLength()` | `length: number` | `void` | Establece la longitud de la ventana DVR para contenido en vivo |

### ⚡ Control de Velocidad

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `notifyChangePlaybackRate()` | `rate: number` | `void` | Notifica un cambio en la velocidad de reproducción |

### 🔧 Gestión de Lifecycle

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `getInstanceId()` | - | `number` | Obtiene el ID único de esta instancia |
| `destroy()` | - | `void` | Destruye la instancia y libera todos los recursos |

## Ejemplo de Uso Completo

### Caso de Uso: Implementación Personalizada con Control Granular

```typescript
import { ComscoreConnectorAdapter } from '@comscore/react-native-comscore/adapters';
import type { 
  ComscoreMetadata, 
  ComscoreConfiguration,
  ComscoreMediaType,
  ComscoreUserConsent,
  ComscoreUsagePropertiesAutoUpdateMode 
} from '@comscore/react-native-comscore';

class CustomVideoPlayer {
  private adapter: ComscoreConnectorAdapter;
  private instanceId: number;

  constructor() {
    // 1. Generar ID único para esta instancia (gestión manual)
    this.instanceId = Date.now() + Math.floor(Math.random() * 1000);
    
    // 2. Configuración de ComScore
    const config: ComscoreConfiguration = {
      publisherId: 'your-publisher-id',
      debug: __DEV__, // Solo debug en desarrollo
      userConsent: ComscoreUserConsent.granted,
      usagePropertiesAutoUpdateMode: ComscoreUsagePropertiesAutoUpdateMode.foregroundAndBackground
    };

    // 3. Metadatos iniciales del contenido
    const metadata: ComscoreMetadata = {
      mediaType: ComscoreMediaType.longFormOnDemand,
      uniqueId: 'video-123',
      length: 1800, // 30 minutos en segundos
      stationTitle: 'Mi Canal',
      programTitle: 'Mi Programa',
      episodeTitle: 'Episodio 1',
      genreName: 'Entretenimiento',
      classifyAsAudioStream: false
    };

    // 4. Crear instancia del adaptador
    this.adapter = new ComscoreConnectorAdapter(
      this.instanceId,
      metadata,
      config
    );

    // 5. Configurar etiquetas persistentes
    this.setupPersistentLabels();
  }

  private setupPersistentLabels(): void {
    // Etiqueta individual
    this.adapter.setPersistentLabel('app_version', '1.2.3');
    
    // Múltiples etiquetas
    this.adapter.setPersistentLabels({
      'user_type': 'premium',
      'content_category': 'entertainment',
      'device_type': 'mobile'
    });
  }

  // Métodos del reproductor que integran ComScore
  
  async playVideo(): Promise<void> {
    try {
      // Crear nueva sesión de reproducción
      this.adapter.createPlaybackSession();
      
      // Notificar inicio de reproducción
      this.adapter.notifyPlay();
      
      console.log(`Video iniciado - Instance ID: ${this.adapter.getInstanceId()}`);
    } catch (error) {
      console.error('Error al iniciar video:', error);
    }
  }

  pauseVideo(): void {
    this.adapter.notifyPause();
  }

  resumeVideo(): void {
    this.adapter.notifyPlay();
  }

  seekToPosition(seconds: number): void {
    this.adapter.notifySeekStart();
    this.adapter.startFromPosition(seconds);
  }

  onBufferingStart(): void {
    this.adapter.notifyBufferStart();
  }

  onBufferingEnd(): void {
    this.adapter.notifyBufferStop();
  }

  changePlaybackSpeed(rate: number): void {
    this.adapter.notifyChangePlaybackRate(rate);
  }

  updateContentMetadata(newMetadata: Partial<ComscoreMetadata>): void {
    // Actualizar metadatos durante la reproducción
    const updatedMetadata: ComscoreMetadata = {
      mediaType: ComscoreMediaType.longFormOnDemand,
      uniqueId: 'video-123',
      length: 1800,
      stationTitle: 'Mi Canal',
      programTitle: 'Mi Programa',
      episodeTitle: 'Episodio 1',
      genreName: 'Entretenimiento',
      classifyAsAudioStream: false,
      ...newMetadata // Sobrescribir con nuevos valores
    };
    
    this.adapter.update(updatedMetadata);
  }

  endVideo(): void {
    this.adapter.notifyEnd();
  }

  // Limpieza de recursos
  destroy(): void {
    this.adapter.destroy();
    console.log('Adaptador ComScore destruido');
  }
}

// Uso de la clase personalizada
const player = new CustomVideoPlayer();

// Reproducir video
player.playVideo();

// Simular eventos durante la reproducción
setTimeout(() => player.onBufferingStart(), 5000);
setTimeout(() => player.onBufferingEnd(), 7000);
setTimeout(() => player.seekToPosition(300), 10000); // Seek a 5 minutos
setTimeout(() => player.pauseVideo(), 15000);
setTimeout(() => player.resumeVideo(), 20000);
setTimeout(() => player.changePlaybackSpeed(1.5), 25000); // 1.5x velocidad
setTimeout(() => player.endVideo(), 30000);

// Limpiar al finalizar
setTimeout(() => player.destroy(), 35000);
```

### Ejemplo Simplificado para Testing

```typescript
import { ComscoreConnectorAdapter } from '@comscore/react-native-comscore/adapters';

// Configuración mínima para testing
const testAdapter = new ComscoreConnectorAdapter(
  999, // ID de test
  {
    mediaType: ComscoreMediaType.longFormOnDemand,
    uniqueId: 'test-video',
    length: 120
  },
  {
    publisherId: 'test-publisher',
    debug: true
  }
);

// Flujo básico de eventos
testAdapter.createPlaybackSession();
testAdapter.notifyPlay();
testAdapter.notifyPause();
testAdapter.notifyPlay();
testAdapter.notifyEnd();
testAdapter.destroy();
```

## Cuándo Usar ComscoreConnectorAdapter

### ✅ Casos de Uso Recomendados

| Escenario | Descripción | Beneficio |
|-----------|-------------|----------|
| **Múltiples instancias** | Necesitas gestionar varios reproductores simultáneamente | Control total sobre IDs de instancia |
| **Implementación personalizada** | Integración con reproductores de terceros | Flexibilidad máxima en la integración |
| **Testing avanzado** | Pruebas unitarias que requieren control granular | Facilita mocking y testing |
| **Arquitectura compleja** | Sistemas con múltiples capas de abstracción | Se integra mejor en arquitecturas existentes |
| **Debugging específico** | Necesitas rastrear instancias específicas | Logging más detallado por instancia |

### ❌ Cuándo NO Usar el Adaptador

| Escenario | Razón | Alternativa Recomendada |
|-----------|-------|------------------------|
| **Integración simple** | Complejidad innecesaria | Usar `ComscoreConnector` |
| **Un solo reproductor** | Gestión automática de ID es suficiente | Usar `ComscoreConnector` |
| **Prototipado rápido** | Configuración más compleja | Usar `ComscoreConnector` |
| **Equipos junior** | Requiere más conocimiento técnico | Usar `ComscoreConnector` |

## Mejores Prácticas

### 🔒 Gestión de Recursos

```typescript
class VideoPlayerManager {
  private adapters = new Map<number, ComscoreConnectorAdapter>();
  
  createPlayer(videoId: string): number {
    const instanceId = this.generateUniqueId();
    const adapter = new ComscoreConnectorAdapter(instanceId, metadata, config);
    this.adapters.set(instanceId, adapter);
    return instanceId;
  }
  
  destroyPlayer(instanceId: number): void {
    const adapter = this.adapters.get(instanceId);
    if (adapter) {
      adapter.destroy();
      this.adapters.delete(instanceId);
    }
  }
  
  // Limpieza global
  destroyAll(): void {
    this.adapters.forEach(adapter => adapter.destroy());
    this.adapters.clear();
  }
}
```

### 📊 Logging y Debugging

```typescript
class DebugComscoreAdapter {
  private adapter: ComscoreConnectorAdapter;
  
  constructor(instanceId: number, metadata: ComscoreMetadata, config: ComscoreConfiguration) {
    this.adapter = new ComscoreConnectorAdapter(instanceId, metadata, config);
    
    if (__DEV__) {
      console.log(`[ComScore] Adapter creado con ID: ${instanceId}`);
    }
  }
  
  notifyPlay(): void {
    if (__DEV__) {
      console.log(`[ComScore] Play - Instance: ${this.adapter.getInstanceId()}`);
    }
    this.adapter.notifyPlay();
  }
  
  // Wrapper para todos los métodos con logging...
}
```

### ⚡ Optimización de Rendimiento

- **Reutiliza instancias** cuando sea posible
- **Agrupa llamadas** de `setPersistentLabels` en lugar de múltiples `setPersistentLabel`
- **Evita crear/destruir** adaptadores frecuentemente
- **Usa pooling** para aplicaciones con muchos reproductores

## Recomendaciones Generales

### 🎯 Selección de Herramienta

| Necesidad | ComscoreConnector | ComscoreConnectorAdapter |
|-----------|-------------------|---------------------------|
| **Simplicidad** | ✅ Recomendado | ❌ Demasiado complejo |
| **Control granular** | ❌ Limitado | ✅ Control total |
| **Múltiples instancias** | ⚠️ Posible pero limitado | ✅ Diseñado para esto |
| **Integración rápida** | ✅ Plug & play | ❌ Requiere más código |
| **Testing avanzado** | ⚠️ Más difícil de mockear | ✅ Fácil de testear |

### 🛡️ Consideraciones de Seguridad

- **Valida siempre** la disponibilidad del módulo nativo antes de usar
- **Maneja errores** en la inicialización y llamadas a métodos
- **No hardcodees** información sensible en metadatos
- **Usa configuración** apropiada para producción vs desarrollo

### 🔄 Migración desde ComscoreConnector

Si necesitas migrar de `ComscoreConnector` a `ComscoreConnectorAdapter`:

1. **Identifica puntos** donde necesitas control de instancia
2. **Genera IDs únicos** para cada instancia
3. **Actualiza llamadas** para incluir gestión manual de lifecycle
4. **Añade logging** para debugging durante la transición
5. **Testa exhaustivamente** la nueva implementación

## Referencias Adicionales

- 📚 **[Documentación de Tipos](../types/README.md)** - Información detallada sobre `ComscoreMetadata`, `ComscoreConfiguration` y otros tipos
- 🔌 **[Documentación del Plugin](../../plugin/ComscorePlugin.readme.md)** - Integración de alto nivel con manejo automático
- 📝 **[Documentación del Logger](../../logger/README.md)** - Sistema de logging integrado
- 🔗 **[ComscoreConnector](../../types/README.md#comscoreconnector)** - Alternativa de alto nivel recomendada

## Soporte y Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| "ComScore native module not available" | Módulo nativo no vinculado | Verificar instalación y linking |
| Eventos no se registran | Instancia no inicializada correctamente | Verificar parámetros del constructor |
| Memory leaks | `destroy()` no llamado | Siempre llamar `destroy()` en cleanup |
| IDs duplicados | Generación de ID no única | Implementar generador de ID robusto |

### Debugging

```typescript
// Habilitar logs detallados
const config: ComscoreConfiguration = {
  publisherId: 'your-id',
  debug: true // Habilita logging nativo
};

// Verificar estado del adaptador
console.log('Instance ID:', adapter.getInstanceId());
console.log('Native module available:', !!NativeModules.Comscore);
