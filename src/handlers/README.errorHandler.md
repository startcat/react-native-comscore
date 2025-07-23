# Documentación del ComscoreErrorHandler

Este documento describe el handler especializado para la gestión de errores en el sistema de tracking de ComScore.

## Descripción General

El `ComscoreErrorHandler` es responsable de gestionar todos los tipos de errores que pueden ocurrir durante la reproducción de contenido, incluyendo errores de red, DRM, stream y errores generales de reproducción. Mantiene un historial de errores, estadísticas y maneja la transición de estados cuando ocurren errores fatales.

## Arquitectura del Handler

| Componente | Descripción | Responsabilidad |
|------------|-------------|----------------|
| **ComscoreErrorHandler** | Handler principal | Gestión completa de errores |
| **Error History** | Historial de errores | Registro de errores para debugging |
| **Error Counters** | Contadores por tipo | Estadísticas de errores |
| **Error State Management** | Gestión de estado | Control del estado de error actual |
| **Metadata Integration** | Integración con metadatos | Notificación de errores a ComScore |

## Tipos de Errores Soportados

### Categorías de Errores

| Tipo | Descripción | Handler | Gravedad Típica |
|------|-------------|---------|----------------|
| **General** | Errores generales de reproducción | `handleError()` | Variable |
| **Network** | Errores de conectividad | `handleNetworkError()` | Media |
| **DRM** | Errores de protección de contenido | `handleContentProtectionError()` | Alta |
| **Stream** | Errores de streaming | `handleStreamError()` | Media |

### Estados de Error

| Estado | Descripción | Impacto en Tracking |
|--------|-------------|-------------------|
| **No Error** | Funcionamiento normal | Tracking continúa |
| **Recoverable Error** | Error no fatal | Tracking puede continuar |
| **Fatal Error** | Error que detiene reproducción | Tracking se pausa/detiene |
| **Error Resolved** | Error resuelto | Tracking puede reanudarse |

## API del Handler

### Constructor

```typescript
constructor(context: HandlerContext, stateManager: ComscoreStateManager)
```

#### Parámetros del Constructor

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |
| `stateManager` | `ComscoreStateManager` | Gestor de estados de ComScore | ✅ Sí |

### Manejo de Errores Específicos

#### handleError()

Maneja errores generales de reproducción.

```typescript
handleError(params: ErrorParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `ErrorParams` | Parámetros del error general | ✅ Sí |

**Funcionalidad:**
- ✅ Crea información estructurada del error
- ✅ Actualiza contadores de errores
- ✅ Registra en historial
- ✅ Maneja errores fatales
- ✅ Notifica a ComScore via metadatos

#### handleNetworkError()

Maneja errores de conectividad de red.

```typescript
handleNetworkError(params: NetworkErrorParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `NetworkErrorParams` | Parámetros del error de red | ✅ Sí |

**Funcionalidad:**
- ✅ Evalúa si el error es recuperable
- ✅ Incluye contexto de red (statusCode, url)
- ✅ Maneja recuperación automática
- ✅ Determina fatalidad basada en tipo de error

#### handleContentProtectionError()

Maneja errores de DRM y protección de contenido.

```typescript
handleContentProtectionError(params: ContentProtectionErrorParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `ContentProtectionErrorParams` | Parámetros del error de DRM | ✅ Sí |

**Funcionalidad:**
- ✅ Maneja errores de DRM específicos
- ✅ Incluye tipo de DRM en contexto
- ✅ Trata errores como fatales por defecto
- ✅ Registra información de protección

#### handleStreamError()

Maneja errores relacionados con el streaming.

```typescript
handleStreamError(params: StreamErrorParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `StreamErrorParams` | Parámetros del error de stream | ✅ Sí |

**Funcionalidad:**
- ✅ Maneja errores de streaming
- ✅ Incluye información de stream (URL, bitrate)
- ✅ Evalúa posibilidad de recuperación
- ✅ Puede reiniciar tracking si es necesario

### Métodos de Estado y Consulta

#### getCurrentError()

Obtiene información del error actual.

```typescript
getCurrentError(): ComscoreErrorInfo | null
```

| Retorno | Descripción |
|---------|-------------|
| `ComscoreErrorInfo \| null` | Información del error actual o null si no hay error |

#### isInErrorState()

Verifica si actualmente hay un error activo.

```typescript
isInErrorState(): boolean
```

| Retorno | Descripción |
|---------|-------------|
| `boolean` | true si hay un error activo, false en caso contrario |

#### hasActiveBlockingError()

Verifica si hay un error fatal que bloquee el tracking.

```typescript
hasActiveBlockingError(): boolean
```

| Retorno | Descripción |
|---------|-------------|
| `boolean` | true si hay un error fatal activo, false en caso contrario |

#### getErrorHistory()

Obtiene el historial completo de errores.

```typescript
getErrorHistory(): ComscoreErrorInfo[]
```

| Retorno | Descripción |
|---------|-------------|
| `ComscoreErrorInfo[]` | Array con historial de errores (copia) |

#### getErrorCounts()

Obtiene contadores de errores por tipo.

```typescript
getErrorCounts(): {
  playback: number;
  network: number;
  drm: number;
  stream: number;
  other: number;
}
```

| Retorno | Descripción |
|---------|-------------|
| Objeto con contadores | Número de errores por cada tipo |

#### getErrorStatistics()

Obtiene estadísticas completas de errores.

```typescript
getErrorStatistics(): {
  totalErrors: number;
  fatalErrors: number;
  recentErrors: number;
  errorsByType: ErrorCounts;
  lastErrorTime?: number;
  currentErrorActive: boolean;
}
```

### Métodos de Gestión

#### clearErrorState()

Limpia el estado de error actual.

```typescript
clearErrorState(): void
```

**Funcionalidad:**
- ✅ Limpia error actual
- ✅ Resetea estado de error
- ✅ Limpia metadatos de error en ComScore

#### notifyErrorResolved()

Notifica que un error ha sido resuelto.

```typescript
notifyErrorResolved(): void
```

**Funcionalidad:**
- ✅ Limpia estado de error
- ✅ Evalúa si debe reanudar tracking
- ✅ Registra resolución para debugging

#### resetErrorCounts()

Reinicia todos los contadores de errores.

```typescript
resetErrorCounts(): void
```

#### clearErrorHistory()

Limpia el historial de errores.

```typescript
clearErrorHistory(): void
```

**Funcionalidad:**
- ✅ Libera memoria del historial
- ✅ Útil para gestión de memoria a largo plazo

## Estructura de ComscoreErrorInfo

### Interfaz ComscoreErrorInfo

```typescript
interface ComscoreErrorInfo {
  errorCode: string | number;
  errorMessage: string;
  errorType: string;
  isFatal: boolean;
  timestamp: number;
  currentState: ComscoreState;
  sessionContext?: any;
}
```

### Campos de ComscoreErrorInfo

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `errorCode` | `string \| number` | Código identificador del error | ✅ Sí |
| `errorMessage` | `string` | Mensaje descriptivo del error | ✅ Sí |
| `errorType` | `string` | Tipo/categoría del error | ✅ Sí |
| `isFatal` | `boolean` | Si el error es fatal | ✅ Sí |
| `timestamp` | `number` | Timestamp cuando ocurrió | ✅ Sí |
| `currentState` | `ComscoreState` | Estado de ComScore cuando ocurrió | ✅ Sí |
| `sessionContext` | `any` | Contexto adicional específico del error | ❌ No |

## Flujo de Manejo de Errores

### 1. **Error No Fatal (Recuperable)**

```mermaid
graph TD
    A[Error Ocurre] --> B[handleXXXError()]
    B --> C[createErrorInfo()]
    C --> D[processError()]
    D --> E[addToErrorHistory()]
    E --> F[updateErrorCounts()]
    F --> G[logErrorToMetadata()]
    G --> H[Tracking Continúa]
```

### 2. **Error Fatal**

```mermaid
graph TD
    A[Error Fatal Ocurre] --> B[handleXXXError()]
    B --> C[createErrorInfo()]
    C --> D[processError()]
    D --> E[handleFatalError()]
    E --> F[Pausar/Detener Tracking]
    F --> G[Esperar Resolución]
    G --> H[notifyErrorResolved()]
    H --> I[clearErrorState()]
    I --> J[Reanudar Tracking]
```

### 3. **Error de Red con Recuperación**

```mermaid
graph TD
    A[Network Error] --> B[handleNetworkError()]
    B --> C{Es Fatal?}
    C -->|No| D[handleRecoverableNetworkError()]
    C -->|Sí| E[handleFatalError()]
    D --> F[Intentar Recuperación]
    F --> G[Tracking Continúa]
    E --> H[Pausar Tracking]
```

## Ejemplos de Uso

### Ejemplo 1: Error General de Reproducción

```typescript
import { ComscoreErrorHandler } from './ComscoreErrorHandler';
import { ErrorParams } from '../types/AnalyticsPlugin';

// Configuración del handler
const errorHandler = new ComscoreErrorHandler(context, stateManager);

// Error general de reproducción
const errorParams: ErrorParams = {
  errorCode: 'PLAYBACK_001',
  errorMessage: 'No se pudo inicializar el reproductor',
  errorType: 'playback_initialization',
  isFatal: true
};

errorHandler.handleError(errorParams);

// Verificar estado después del error
const isInError = errorHandler.isInErrorState();
const currentError = errorHandler.getCurrentError();

console.log('En estado de error:', isInError);
console.log('Error actual:', currentError);
```

### Ejemplo 2: Error de Red con Recuperación

```typescript
import { NetworkErrorParams } from '../types/AnalyticsPlugin';

// Error de red recuperable
const networkErrorParams: NetworkErrorParams = {
  errorCode: 'NETWORK_TIMEOUT',
  errorMessage: 'Timeout al cargar el contenido',
  errorType: 'network_timeout',
  isFatal: false,
  statusCode: 408,
  url: 'https://example.com/video.m3u8'
};

errorHandler.handleNetworkError(networkErrorParams);

// El handler intentará recuperación automática
// Verificar estadísticas
const stats = errorHandler.getErrorStatistics();
console.log('Errores de red:', stats.errorsByType.network);
console.log('Errores recientes:', stats.recentErrors);
```

### Ejemplo 3: Error de DRM

```typescript
import { ContentProtectionErrorParams } from '../types/AnalyticsPlugin';

// Error de protección de contenido
const drmErrorParams: ContentProtectionErrorParams = {
  errorCode: 'DRM_LICENSE_ERROR',
  errorMessage: 'No se pudo obtener la licencia DRM',
  errorType: 'drm_license',
  isFatal: true,
  drmType: 'Widevine'
};

errorHandler.handleContentProtectionError(drmErrorParams);

// Los errores de DRM son típicamente fatales
const hasBlockingError = errorHandler.hasActiveBlockingError();
console.log('Error bloqueante activo:', hasBlockingError);
```

### Ejemplo 4: Manejo de Resolución de Errores

```typescript
// Simular resolución de error
try {
  // ... intento de recuperación ...
  
  // Si la recuperación es exitosa
  errorHandler.notifyErrorResolved();
  
  console.log('Error resuelto, tracking reanudado');
  
} catch (recoveryError) {
  console.error('No se pudo recuperar del error:', recoveryError);
  
  // Mantener estado de error
  const currentError = errorHandler.getCurrentError();
  if (currentError?.isFatal) {
    console.log('Error fatal persistente, requiere intervención manual');
  }
}
```

### Ejemplo 5: Monitoreo y Estadísticas

```typescript
// Obtener estadísticas completas
const stats = errorHandler.getErrorStatistics();

console.log('Estadísticas de errores:', {
  total: stats.totalErrors,
  fatales: stats.fatalErrors,
  recientes: stats.recentErrors,
  porTipo: stats.errorsByType,
  ultimoError: stats.lastErrorTime ? new Date(stats.lastErrorTime) : 'Ninguno',
  errorActivo: stats.currentErrorActive
});

// Obtener historial para debugging
const history = errorHandler.getErrorHistory();
const recentErrors = history.slice(-5); // Últimos 5 errores

console.log('Errores recientes:', recentErrors.map(error => ({
  codigo: error.errorCode,
  mensaje: error.errorMessage,
  tipo: error.errorType,
  fatal: error.isFatal,
  tiempo: new Date(error.timestamp)
})));
```

### Ejemplo 6: Limpieza y Mantenimiento

```typescript
// Limpieza periódica para gestión de memoria
setInterval(() => {
  const stats = errorHandler.getErrorStatistics();
  
  // Si hay muchos errores en el historial, limpiar los más antiguos
  if (stats.totalErrors > 100) {
    errorHandler.clearErrorHistory();
    console.log('Historial de errores limpiado por mantenimiento');
  }
  
  // Resetear contadores si es necesario
  if (stats.totalErrors > 1000) {
    errorHandler.resetErrorCounts();
    console.log('Contadores de errores reseteados');
  }
}, 300000); // Cada 5 minutos
```

## Integración con Metadatos de ComScore

### Metadatos de Error Automáticos

El handler automáticamente agrega metadatos de error a ComScore:

| Campo en Metadatos | Descripción | Ejemplo |
|-------------------|-------------|---------|
| `currentErrorCode` | Código del error actual | `"NETWORK_TIMEOUT"` |
| `currentErrorMessage` | Mensaje del error | `"Timeout al cargar contenido"` |
| `currentErrorType` | Tipo de error | `"network_timeout"` |
| `currentErrorCategory` | Categoría del error | `"network"` |
| `currentErrorFatal` | Si es fatal | `"true"` |
| `errorTimestamp` | Timestamp del error | `"1640995200000"` |

### Limpieza de Metadatos

```typescript
// Los metadatos se limpian automáticamente cuando:
// 1. Se resuelve el error
errorHandler.notifyErrorResolved();

// 2. Se limpia el estado manualmente
errorHandler.clearErrorState();

// 3. Se limpia explícitamente
errorHandler.clearErrorFromMetadata();
```

## Mejores Prácticas

### ✅ **Clasificación Apropiada de Errores**

```typescript
// CORRECTO: Clasificar errores apropiadamente
const classifyError = (error: any) => {
  if (error.code?.startsWith('DRM_')) {
    return errorHandler.handleContentProtectionError({
      errorCode: error.code,
      errorMessage: error.message,
      errorType: 'drm_error',
      isFatal: true,
      drmType: error.drmType
    });
  }
  
  if (error.code?.startsWith('NETWORK_')) {
    return errorHandler.handleNetworkError({
      errorCode: error.code,
      errorMessage: error.message,
      errorType: 'network_error',
      isFatal: error.statusCode >= 400,
      statusCode: error.statusCode,
      url: error.url
    });
  }
  
  // Error general
  return errorHandler.handleError({
    errorCode: error.code || 'UNKNOWN',
    errorMessage: error.message,
    errorType: 'general_error',
    isFatal: error.fatal || false
  });
};
```

### ✅ **Manejo de Recuperación**

```typescript
// CORRECTO: Intentar recuperación antes de marcar como fatal
const handlePlayerError = async (error: any) => {
  // Intentar recuperación automática
  try {
    await player.recover();
    
    // Si la recuperación es exitosa, notificar resolución
    if (errorHandler.isInErrorState()) {
      errorHandler.notifyErrorResolved();
    }
    
  } catch (recoveryError) {
    // Si no se puede recuperar, manejar como error fatal
    errorHandler.handleError({
      errorCode: error.code,
      errorMessage: error.message,
      errorType: 'playback_error',
      isFatal: true
    });
  }
};
```

### ✅ **Monitoreo y Alertas**

```typescript
// CORRECTO: Monitorear errores críticos
const monitorCriticalErrors = () => {
  const stats = errorHandler.getErrorStatistics();
  
  // Alertar si hay muchos errores fatales
  if (stats.fatalErrors > 5) {
    console.warn('Alto número de errores fatales detectado:', stats.fatalErrors);
    // Enviar alerta a sistema de monitoreo
  }
  
  // Alertar si hay muchos errores recientes
  if (stats.recentErrors > 10) {
    console.warn('Alto número de errores recientes:', stats.recentErrors);
    // Posible problema de conectividad o contenido
  }
  
  // Verificar errores bloqueantes
  if (errorHandler.hasActiveBlockingError()) {
    console.error('Error bloqueante activo, tracking detenido');
    // Intentar recuperación o notificar al usuario
  }
};
```

### ✅ **Gestión de Memoria**

```typescript
// CORRECTO: Limpiar historial periódicamente
const manageErrorMemory = () => {
  const history = errorHandler.getErrorHistory();
  
  // Mantener solo errores de las últimas 24 horas
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  const recentErrors = history.filter(error => error.timestamp > oneDayAgo);
  
  if (recentErrors.length < history.length) {
    errorHandler.clearErrorHistory();
    // Re-agregar solo errores recientes si es necesario
    console.log(`Limpieza de memoria: ${history.length - recentErrors.length} errores antiguos removidos`);
  }
};
```

## Consideraciones de Performance

### 🚀 **Optimizaciones**
- **Historial limitado** - Máximo 50 errores en memoria
- **Lazy evaluation** - Solo procesa cuando es necesario
- **Batch metadata updates** - Agrupa actualizaciones de metadatos
- **Memory cleanup** - Limpieza automática de historial

### ⚠️ **Limitaciones**
- **Historial en memoria** - Se pierde al reiniciar la app
- **Un error activo** - Solo maneja un error activo a la vez
- **Dependiente de StateManager** - Requiere sincronización con estados

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Errores no se registran | Handler no inicializado | Verificar constructor |
| Estado de error persiste | No se llama `notifyErrorResolved()` | Llamar método de resolución |
| Memoria alta | Historial muy grande | Usar `clearErrorHistory()` |
| Metadatos incorrectos | Error en integración | Verificar `logErrorToMetadata()` |

### Debugging

```typescript
// Información completa del estado de errores
const debugErrorState = () => {
  console.log('Error Handler Debug Info:', {
    isInError: errorHandler.isInErrorState(),
    currentError: errorHandler.getCurrentError(),
    hasBlockingError: errorHandler.hasActiveBlockingError(),
    statistics: errorHandler.getErrorStatistics(),
    recentHistory: errorHandler.getErrorHistory().slice(-3)
  });
};
```

## 🔗 Referencias

- 📚 **Tipos**: [AnalyticsPlugin Types](../types/AnalyticsPlugin.ts)
- 🎯 **Estados**: [ComscoreState](../types/README.md)
- 🔧 **Base**: [Sistema base de handlers](./base/README.md)
- 📊 **State Manager**: [ComscoreStateManager](./README.stateManager.md)
- 📝 **Logging**: [Sistema de logging](../logger/README.md)
