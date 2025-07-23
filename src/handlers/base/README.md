# Documentación del Sistema Base de Handlers

Este documento describe el sistema base de handlers de ComScore, que proporciona la infraestructura común para todos los handlers especializados del proyecto.

## Descripción General

El módulo `/src/handlers/base` contiene la infraestructura fundamental que permite la implementación de handlers especializados para diferentes aspectos del tracking de ComScore. Utiliza un patrón de contexto compartido y factory para proporcionar dependencias comunes a todos los handlers.

## Arquitectura del Módulo Base

| Componente | Descripción | Archivo | Responsabilidad |
|------------|-------------|---------|----------------|
| **HandlerContext** | Interfaz de contexto | `../types/index.ts` | Define el contrato del contexto compartido |
| **MutableHandlerContext** | Contexto mutable | `../types/index.ts` | Extiende el contexto para permitir actualizaciones |
| **DefaultMutableHandlerContext** | Implementación del contexto | `DefaultMutableHandlerContext.ts` | Implementación concreta del contexto mutable |
| **HandlerContextFactory** | Factory de contextos | `../types/index.ts` | Interfaz para crear contextos |
| **DefaultHandlerContextFactory** | Factory por defecto | `DefaultHandlerContextFactory.ts` | Implementación del factory |
| **HandlerContextUtils** | Utilidades | `HandlerContextUtils.ts` | Funciones de utilidad para contextos |

## HandlerContext

El `HandlerContext` es la interfaz central que define las dependencias compartidas entre todos los handlers.

### Interfaz HandlerContext

```typescript
export interface HandlerContext {
  readonly connector: IComscoreConnector;
  readonly metadata: ComscoreMetadata;
  readonly configuration: ComscoreConfiguration;
  readonly logger: IComscoreLogger;
  readonly instanceId: number;
}
```

### Propiedades del Contexto

| Propiedad | Tipo | Descripción | Acceso |
|-----------|------|-------------|--------|
| `connector` | `IComscoreConnector` | Conector principal de ComScore | Solo lectura |
| `metadata` | `ComscoreMetadata` | Metadatos del contenido actual | Solo lectura |
| `configuration` | `ComscoreConfiguration` | Configuración de ComScore | Solo lectura |
| `logger` | `IComscoreLogger` | Sistema de logging | Solo lectura |
| `instanceId` | `number` | ID único de la instancia | Solo lectura |

## MutableHandlerContext

Para casos donde los handlers necesitan actualizar metadatos, se proporciona una versión mutable del contexto.

### Interfaz MutableHandlerContext

```typescript
export interface MutableHandlerContext extends Omit<HandlerContext, 'metadata'> {
  metadata: ComscoreMetadata;
  updateMetadata(newMetadata: ComscoreMetadata): void;
}
```

### Métodos Adicionales

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `updateMetadata()` | `newMetadata: ComscoreMetadata` | `void` | Actualiza los metadatos del contexto |

## DefaultMutableHandlerContext

Implementación concreta del contexto mutable que proporciona funcionalidad completa.

### Constructor

```typescript
constructor(
  connector: IComscoreConnector,
  metadata: ComscoreMetadata,
  configuration: ComscoreConfiguration,
  logger: IComscoreLogger
)
```

### Parámetros del Constructor

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `connector` | `IComscoreConnector` | Instancia del conector ComScore | ✅ Sí |
| `metadata` | `ComscoreMetadata` | Metadatos iniciales del contenido | ✅ Sí |
| `configuration` | `ComscoreConfiguration` | Configuración de ComScore | ✅ Sí |
| `logger` | `IComscoreLogger` | Sistema de logging | ✅ Sí |

### Implementación de updateMetadata

```typescript
updateMetadata(newMetadata: ComscoreMetadata): void {
  this.metadata = newMetadata;
  this.logger.debug('HandlerContext', 'Metadata updated', newMetadata);
}
```

## HandlerContextFactory

El factory pattern permite la creación consistente de contextos para handlers.

### Interfaz HandlerContextFactory

```typescript
export interface HandlerContextFactory {
  create(
    connector: IComscoreConnector,
    metadata: ComscoreMetadata,
    configuration: ComscoreConfiguration,
    logger: IComscoreLogger
  ): HandlerContext;
}
```

### Método create

| Parámetro | Tipo | Descripción | Retorno |
|-----------|------|-------------|---------|
| `connector` | `IComscoreConnector` | Conector ComScore | `HandlerContext` |
| `metadata` | `ComscoreMetadata` | Metadatos del contenido | |
| `configuration` | `ComscoreConfiguration` | Configuración | |
| `logger` | `IComscoreLogger` | Sistema de logging | |

## Tipos de Información Compartidos

El sistema base define varios tipos de información que los handlers pueden utilizar:

### QualityInfo

Información sobre la calidad del video:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `quality` | `string` | Identificador de calidad | ✅ Sí |
| `width` | `number` | Ancho en píxeles | ❌ No |
| `height` | `number` | Alto en píxeles | ❌ No |
| `bitrate` | `number` | Bitrate en bps | ❌ No |
| `timestamp` | `number` | Timestamp del cambio | ✅ Sí |

### AudioInfo

Información sobre pistas de audio:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `trackIndex` | `number` | Índice de la pista | ✅ Sí |
| `trackLabel` | `string` | Etiqueta de la pista | ❌ No |
| `language` | `string` | Idioma de la pista | ❌ No |
| `timestamp` | `number` | Timestamp del cambio | ✅ Sí |

### VolumeInfo

Información sobre el volumen:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `volume` | `number` | Nivel de volumen (0-1) | ✅ Sí |
| `muted` | `boolean` | Estado de silencio | ✅ Sí |
| `timestamp` | `number` | Timestamp del cambio | ✅ Sí |

### SubtitleInfo

Información sobre subtítulos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `trackIndex` | `number` | Índice de la pista | ✅ Sí |
| `trackLabel` | `string` | Etiqueta de la pista | ❌ No |
| `language` | `string` | Idioma de los subtítulos | ❌ No |
| `visible` | `boolean` | Visibilidad de subtítulos | ✅ Sí |
| `timestamp` | `number` | Timestamp del cambio | ✅ Sí |

### ComscoreErrorInfo

Información sobre errores:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `errorCode` | `string \| number` | Código del error | ✅ Sí |
| `errorMessage` | `string` | Mensaje del error | ✅ Sí |
| `errorType` | `string` | Tipo de error | ✅ Sí |
| `isFatal` | `boolean` | Si el error es fatal | ✅ Sí |
| `timestamp` | `number` | Timestamp del error | ✅ Sí |
| `currentState` | `ComscoreState` | Estado actual | ✅ Sí |
| `sessionContext` | `any` | Contexto adicional | ❌ No |

### MetadataChangeInfo

Información sobre cambios de metadatos:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `previousMetadata` | `ComscoreMetadata \| null` | Metadatos anteriores | ✅ Sí |
| `newMetadata` | `ComscoreMetadata` | Nuevos metadatos | ✅ Sí |
| `changeType` | `'update' \| 'load' \| 'duration_change' \| 'complete_change'` | Tipo de cambio | ✅ Sí |
| `timestamp` | `number` | Timestamp del cambio | ✅ Sí |
| `affectedFields` | `string[]` | Campos afectados | ✅ Sí |

## Patrón de Implementación de Handlers

Los handlers que extienden este sistema base siguen un patrón consistente:

### 1. **Inyección de Dependencias**

```typescript
export class MyHandler {
  private context: HandlerContext;
  private logger: ComponentLogger;
  
  constructor(context: HandlerContext) {
    this.context = context;
    this.logger = context.logger.forComponent('MyHandler');
  }
}
```

### 2. **Acceso a Recursos Compartidos**

```typescript
// Acceso al conector
this.context.connector.notifyPlay();

// Acceso a metadatos
const currentMetadata = this.context.metadata;

// Acceso a configuración
const isDebugMode = this.context.configuration.debug;

// Logging con contexto
this.logger.info('Handler action completed', { data });
```

### 3. **Gestión de Estado**

```typescript
// Para handlers que necesitan actualizar metadatos
if (this.context instanceof MutableHandlerContext) {
  this.context.updateMetadata(newMetadata);
}
```

## Ventajas del Sistema Base

### 🏗️ **Arquitectura Consistente**
- **Patrón unificado** para todos los handlers
- **Inyección de dependencias** clara y predecible
- **Separación de responsabilidades** bien definida

### 🔧 **Flexibilidad**
- **Contexto inmutable** para handlers de solo lectura
- **Contexto mutable** para handlers que actualizan estado
- **Factory pattern** para creación personalizada

### 🛡️ **Type Safety**
- **Interfaces TypeScript** completamente tipadas
- **Validación en tiempo de compilación**
- **IntelliSense completo** en IDEs

### 📊 **Observabilidad**
- **Logging integrado** con contexto
- **Información estructurada** para debugging
- **Trazabilidad** de cambios de estado

## Mejores Prácticas

### ✅ **Implementación de Handlers**

```typescript
// CORRECTO: Usar el contexto apropiado
export class MyHandler {
  constructor(private context: HandlerContext) {
    this.logger = context.logger.forComponent('MyHandler');
  }
  
  handleEvent(params: EventParams): void {
    this.logger.info('Handling event', params);
    this.context.connector.someMethod();
  }
}
```

### ✅ **Gestión de Logging**

```typescript
// CORRECTO: Logger específico por componente
private logger = this.context.logger.forComponent('HandlerName');

// CORRECTO: Logging estructurado
this.logger.info('Event processed', {
  eventType: 'play',
  timestamp: Date.now(),
  metadata: this.context.metadata.uniqueId
});
```

### ✅ **Manejo de Errores**

```typescript
// CORRECTO: Captura y logging de errores
try {
  this.context.connector.notifyPlay();
} catch (error) {
  this.logger.error('Failed to notify play', { error, context: this.context.instanceId });
  throw error;
}
```

## 🔗 Referencias

- 📚 **Tipos**: [Documentación de tipos](../../types/README.md)
- 🔌 **API**: [Documentación del módulo API](../../api/README.md)
- 🎛️ **Plugin**: [ComscorePlugin](../../plugin/README.md)
- 📝 **Logger**: [Sistema de logging](../../logger/README.md)
