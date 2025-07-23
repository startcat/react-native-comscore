# Documentación del Sistema de Logging ComScore

Este documento describe el sistema de logging centralizado para la integración de ComScore en React Native.

## Descripción

El sistema de logging de ComScore proporciona una solución centralizada y configurable para el registro de eventos, errores y información de depuración. Está diseñado para ser flexible, eficiente y fácil de usar en todos los componentes de la integración.

## Arquitectura del Sistema

| Componente | Responsabilidad | Archivo |
|------------|-----------------|---------|
| **ComscoreLogger** | Logger principal con configuración completa | `ComscoreLogger.ts` |
| **ComscoreLoggerFactory** | Factory para crear instancias de logger | `ComscoreLoggerFactory.ts` |
| **DefaultComponentLogger** | Logger específico para componentes individuales | `DefaultComponentLogger.ts` |
| **LoggerUtils** | Utilidades para formateo y procesamiento | `LoggerUtils.ts` |
| **Types** | Interfaces y enumeraciones del sistema | `types/index.ts` |

## Niveles de Logging

### LogLevel

Enumeración que define los niveles de logging disponibles:

| Nivel | Valor | Descripción | Uso Recomendado |
|-------|-------|-------------|-----------------|
| `DEBUG` | 0 | Información detallada de depuración | Desarrollo y debugging |
| `INFO` | 1 | Información general del flujo | Eventos importantes |
| `WARN` | 2 | Advertencias que no detienen la ejecución | Situaciones inesperadas |
| `ERROR` | 3 | Errores que requieren atención | Fallos y excepciones |
| `NONE` | 4 | Desactiva todos los logs | Producción silenciosa |

## Configuración del Logger

### ComscoreLoggerConfig

Interfaz para configurar el comportamiento del logger:

| Propiedad | Tipo | Por Defecto | Descripción |
|-----------|------|-------------|-------------|
| `enabled` | `boolean` | `__DEV__` | Habilita/deshabilita el logging |
| `level` | `LogLevel` | `LogLevel.INFO` | Nivel mínimo de logging |
| `prefix` | `string` | `'[ComScore]'` | Prefijo para todos los mensajes |
| `includeTimestamp` | `boolean` | `true` | Incluye timestamp en los mensajes |
| `includeInstanceId` | `boolean` | `true` | Incluye ID de instancia en los mensajes |
| `useColors` | `boolean` | `__DEV__` | Aplica colores en consola (solo desarrollo) |
| `filterComponents` | `string[]` | `[]` | Lista de componentes a mostrar (filtro) |

## ComscoreLogger

Clase principal del sistema de logging.

### Constructor

```typescript
constructor(config?: ComscoreLoggerConfig, instanceId?: number)
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `config` | `ComscoreLoggerConfig` | Configuración opcional del logger |
| `instanceId` | `number` | ID único de la instancia (opcional) |

### Métodos Principales

#### Métodos de Logging por Nivel

| Método | Parámetros | Descripción |
|--------|------------|-------------|
| `debug()` | `component: string, message: string, ...args: any[]` | Log de nivel DEBUG |
| `info()` | `component: string, message: string, ...args: any[]` | Log de nivel INFO |
| `warn()` | `component: string, message: string, ...args: any[]` | Log de nivel WARN |
| `error()` | `component: string, message: string, ...args: any[]` | Log de nivel ERROR |
| `log()` | `level: LogLevel, component: string, message: string, ...args: any[]` | Log genérico con nivel especificado |

#### Métodos de Configuración

| Método | Parámetros | Descripción |
|--------|------------|-------------|
| `updateConfig()` | `config: Partial<ComscoreLoggerConfig>` | Actualiza la configuración del logger |
| `setEnabled()` | `enabled: boolean` | Habilita/deshabilita el logging |
| `setLevel()` | `level: LogLevel` | Establece el nivel mínimo de logging |
| `setInstanceId()` | `instanceId: number` | Establece el ID de instancia |

#### Métodos de Utilidad

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `forComponent()` | `ComponentLogger` | Crea un logger específico para un componente |

### Formato de Mensajes

El logger genera mensajes con el siguiente formato:

```
[ComScore] HH:MM:SS.mmm #instanceId [LEVEL] [Component] Message
```

**Ejemplo**:
```
[ComScore] 14:30:25.123 #1 [INFO] [ComscorePlugin] Plugin initialized
```

### Colores en Consola

Cuando `useColors` está habilitado (por defecto en desarrollo):

| Nivel | Color | Código |
|-------|-------|--------|
| DEBUG | Cyan | `\x1b[36m` |
| INFO | Green | `\x1b[32m` |
| WARN | Yellow | `\x1b[33m` |
| ERROR | Red | `\x1b[31m` |

## ComscoreLoggerFactory

Factory para crear instancias preconfiguradas de logger.

### Métodos Estáticos

| Método | Parámetros | Descripción |
|--------|------------|-------------|
| `createDevelopmentLogger()` | `instanceId?: number` | Crea logger optimizado para desarrollo |
| `createProductionLogger()` | `instanceId?: number` | Crea logger optimizado para producción |
| `createFromComscoreConfig()` | `debugEnabled: boolean, instanceId?: number` | Crea logger basado en configuración de ComScore |

### Configuraciones Predefinidas

#### Logger de Desarrollo
```typescript
{
  enabled: true,
  level: LogLevel.DEBUG,
  useColors: true,
  includeTimestamp: true,
  includeInstanceId: true
}
```

#### Logger de Producción
```typescript
{
  enabled: false,
  level: LogLevel.ERROR,
  useColors: false,
  includeTimestamp: false,
  includeInstanceId: true
}
```

## ComponentLogger

Interfaz para loggers específicos de componentes que simplifican el uso.

### Métodos

| Método | Parámetros | Descripción |
|--------|------------|-------------|
| `debug()` | `message: string, ...args: any[]` | Log de DEBUG (sin especificar componente) |
| `info()` | `message: string, ...args: any[]` | Log de INFO (sin especificar componente) |
| `warn()` | `message: string, ...args: any[]` | Log de WARN (sin especificar componente) |
| `error()` | `message: string, ...args: any[]` | Log de ERROR (sin especificar componente) |
| `log()` | `level: LogLevel, message: string, ...args: any[]` | Log genérico (sin especificar componente) |

## LoggerUtils

Clase de utilidades para procesamiento de logs.

### Métodos Estáticos

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `formatObject()` | `obj: any` | `string` | Formatea objetos para logging (JSON.stringify con fallback) |
| `truncateMessage()` | `message: string, maxLength?: number` | `string` | Trunca mensajes largos (por defecto 500 caracteres) |
| `createSessionId()` | - | `string` | Genera ID único para sesiones de log |

## Ejemplos de Uso

### Uso Básico con ComscoreLogger

```typescript
import { ComscoreLogger, LogLevel } from './logger';

// Crear logger con configuración por defecto
const logger = new ComscoreLogger();

// Logs básicos
logger.info('MyComponent', 'Aplicación iniciada');
logger.debug('MyComponent', 'Estado actual:', { user: 'john', active: true });
logger.warn('MyComponent', 'Configuración no encontrada, usando valores por defecto');
logger.error('MyComponent', 'Error al conectar con el servidor', error);
```

### Uso con Factory

```typescript
import { ComscoreLoggerFactory } from './logger';

// Logger para desarrollo
const devLogger = ComscoreLoggerFactory.createDevelopmentLogger(123);

// Logger para producción
const prodLogger = ComscoreLoggerFactory.createProductionLogger(123);

// Logger basado en configuración de ComScore
const logger = ComscoreLoggerFactory.createFromComscoreConfig(
  __DEV__, // debugEnabled
  instanceId
);
```

### Uso con ComponentLogger

```typescript
import { ComscoreLogger } from './logger';

const mainLogger = new ComscoreLogger();
const componentLogger = mainLogger.forComponent('ComscorePlugin');

// Uso simplificado (no necesita especificar componente)
componentLogger.info('Plugin inicializado correctamente');
componentLogger.debug('Configuración cargada:', config);
componentLogger.error('Error en la inicialización:', error);
```

### Configuración Avanzada

```typescript
import { ComscoreLogger, LogLevel } from './logger';

const logger = new ComscoreLogger({
  enabled: true,
  level: LogLevel.INFO,
  prefix: '[MiApp-ComScore]',
  includeTimestamp: true,
  includeInstanceId: true,
  useColors: true,
  filterComponents: ['ComscorePlugin', 'ComscoreConnector'] // Solo estos componentes
}, 42);

// Actualizar configuración dinámicamente
logger.updateConfig({
  level: LogLevel.DEBUG,
  filterComponents: [] // Mostrar todos los componentes
});
```

### Uso con LoggerUtils

```typescript
import { LoggerUtils } from './logger';

const complexObject = {
  user: { id: 1, name: 'John' },
  settings: { theme: 'dark', notifications: true }
};

// Formatear objeto para logging
const formattedObj = LoggerUtils.formatObject(complexObject);
logger.info('MyComponent', 'Datos del usuario:', formattedObj);

// Truncar mensajes largos
const longMessage = 'Este es un mensaje muy largo...'.repeat(100);
const truncated = LoggerUtils.truncateMessage(longMessage, 200);
logger.info('MyComponent', truncated);

// Crear ID de sesión
const sessionId = LoggerUtils.createSessionId();
logger.info('MyComponent', `Nueva sesión iniciada: ${sessionId}`);
```

## Integración con ComScore

El sistema de logging se integra automáticamente con la configuración de ComScore:

```typescript
import { ComscorePlugin } from '../plugin';
import { ComscoreLoggerFactory } from '../logger';

// El plugin crea automáticamente un logger basado en la configuración
const plugin = new ComscorePlugin(metadata, {
  debug: true, // Habilita logging detallado
  // ... otras configuraciones
});

// El logger se crea internamente usando:
const logger = ComscoreLoggerFactory.createFromComscoreConfig(
  configuration.debug ?? false,
  instanceId
);
```

## Consideraciones de Rendimiento

### Filtrado Eficiente
- Los logs se filtran **antes** de procesar el mensaje para máximo rendimiento
- El filtrado por nivel es muy eficiente (comparación numérica)
- El filtrado por componente usa `Array.includes()` optimizado

### Formateo Lazy
- Los objetos complejos solo se formatean si el log va a mostrarse
- El timestamp se calcula solo cuando es necesario
- Los colores se aplican solo en desarrollo

### Configuración Recomendada

#### Desarrollo
```typescript
{
  enabled: true,
  level: LogLevel.DEBUG,
  useColors: true,
  includeTimestamp: true
}
```

#### Producción
```typescript
{
  enabled: false, // o LogLevel.ERROR para errores críticos
  level: LogLevel.ERROR,
  useColors: false,
  includeTimestamp: false
}
```

## Debugging y Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| No aparecen logs | `enabled: false` o nivel muy alto | Verificar configuración y nivel |
| Logs duplicados | Múltiples instancias de logger | Usar singleton o factory |
| Rendimiento lento | Nivel DEBUG en producción | Cambiar a nivel ERROR o deshabilitar |
| Colores no funcionan | `useColors: false` o entorno no compatible | Habilitar solo en desarrollo |

### Verificación de Configuración

```typescript
// Verificar estado actual del logger
console.log('Logger enabled:', logger.config.enabled);
console.log('Logger level:', logger.config.level);
console.log('Filter components:', logger.config.filterComponents);

// Test de niveles
logger.debug('Test', 'Debug message');
logger.info('Test', 'Info message');
logger.warn('Test', 'Warning message');
logger.error('Test', 'Error message');
```
