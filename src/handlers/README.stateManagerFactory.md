# Documentación del StateManagerFactory

Este documento describe la factory class responsable de crear instancias del `ComscoreStateManager` con diferentes configuraciones según el contexto de uso (desarrollo, producción, testing).

## Descripción General

El `StateManagerFactory` es una clase estática que proporciona métodos de factory para crear instancias del `ComscoreStateManager` con configuraciones predefinidas optimizadas para diferentes escenarios de uso. Implementa el patrón Factory Method para simplificar la creación y configuración del gestor de estados.

## Arquitectura de la Factory

| Componente | Descripción | Responsabilidad |
|------------|-------------|----------------|
| **Factory Methods** | Métodos estáticos de creación | Instanciación con configuraciones específicas |
| **Configuration Presets** | Configuraciones predefinidas | Optimización para diferentes entornos |
| **Context Integration** | Integración con HandlerContext | Paso de contexto a las instancias |
| **Environment Awareness** | Conciencia del entorno | Configuraciones específicas por entorno |

## Métodos de Factory

### create()

Crea un StateManager con configuración por defecto.

```typescript
static create(context: HandlerContext): ComscoreStateManager
```

#### Parámetros

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |

#### Retorno

| Tipo | Descripción |
|------|-------------|
| `ComscoreStateManager` | Instancia con configuración por defecto |

#### Configuración Aplicada

| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| `validateTransitions` | `true` | Validación habilitada por defecto |
| `enableVerboseLogging` | `context.configuration.debug` | Basado en configuración de debug |
| `stateChangeListeners` | `[]` | Sin listeners iniciales |

**Uso recomendado:** Configuración general para la mayoría de casos de uso.

### createForTesting()

Crea un StateManager optimizado para testing con validación deshabilitada.

```typescript
static createForTesting(context: HandlerContext): ComscoreStateManager
```

#### Parámetros

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |

#### Retorno

| Tipo | Descripción |
|------|-------------|
| `ComscoreStateManager` | Instancia optimizada para testing |

#### Configuración Aplicada

| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| `validateTransitions` | `false` | Permite transiciones libres para tests |
| `enableVerboseLogging` | `true` | Logging detallado para debugging |
| `stateChangeListeners` | `[]` | Sin listeners iniciales |

**Uso recomendado:** Tests unitarios e integración donde se necesita control total sobre las transiciones.

### createWithConfig()

Crea un StateManager con configuración personalizada específica.

```typescript
static createWithConfig(
  context: HandlerContext,
  config: StateManagerConfig
): ComscoreStateManager
```

#### Parámetros

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |
| `config` | `StateManagerConfig` | Configuración personalizada | ✅ Sí |

#### Retorno

| Tipo | Descripción |
|------|-------------|
| `ComscoreStateManager` | Instancia con configuración personalizada |

#### Configuración Aplicada

Utiliza la configuración proporcionada directamente, permitiendo control total sobre:

| Configuración | Tipo | Descripción |
|---------------|------|-------------|
| `validateTransitions` | `boolean` | Control de validación de transiciones |
| `enableVerboseLogging` | `boolean` | Control de logging detallado |
| `stateChangeListeners` | `StateChangeListener[]` | Listeners iniciales personalizados |

**Uso recomendado:** Casos específicos que requieren configuración personalizada.

### createForDevelopment()

Crea un StateManager optimizado para desarrollo con logging detallado.

```typescript
static createForDevelopment(context: HandlerContext): ComscoreStateManager
```

#### Parámetros

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |

#### Retorno

| Tipo | Descripción |
|------|-------------|
| `ComscoreStateManager` | Instancia optimizada para desarrollo |

#### Configuración Aplicada

| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| `validateTransitions` | `true` | Validación estricta para detectar errores |
| `enableVerboseLogging` | `true` | Logging detallado para debugging |
| `stateChangeListeners` | `[]` | Sin listeners iniciales |

**Uso recomendado:** Entorno de desarrollo donde se necesita máxima visibilidad y validación.

### createForProduction()

Crea un StateManager optimizado para producción con máximo rendimiento.

```typescript
static createForProduction(context: HandlerContext): ComscoreStateManager
```

#### Parámetros

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `HandlerContext` | Contexto compartido del handler | ✅ Sí |

#### Retorno

| Tipo | Descripción |
|------|-------------|
| `ComscoreStateManager` | Instancia optimizada para producción |

#### Configuración Aplicada

| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| `validateTransitions` | `false` | Sin validación para mejor performance |
| `enableVerboseLogging` | `false` | Sin logging detallado para eficiencia |
| `stateChangeListeners` | `[]` | Sin listeners iniciales |

**Uso recomendado:** Entorno de producción donde la performance es prioritaria.

## Comparación de Configuraciones

### Tabla Comparativa

| Método | Validación | Logging Verbose | Uso Principal | Performance |
|--------|------------|----------------|---------------|-------------|
| **create()** | ✅ Sí | 🔧 Configurable | General | ⚖️ Balanceada |
| **createForTesting()** | ❌ No | ✅ Sí | Testing | 🐌 Baja |
| **createWithConfig()** | 🔧 Configurable | 🔧 Configurable | Personalizado | 🔧 Variable |
| **createForDevelopment()** | ✅ Sí | ✅ Sí | Desarrollo | 🐌 Baja |
| **createForProduction()** | ❌ No | ❌ No | Producción | 🚀 Alta |

### Matriz de Decisión

| Escenario | Método Recomendado | Razón |
|-----------|-------------------|-------|
| **Aplicación en producción** | `createForProduction()` | Máximo rendimiento |
| **Desarrollo y debugging** | `createForDevelopment()` | Máxima visibilidad |
| **Tests unitarios** | `createForTesting()` | Control total de transiciones |
| **Tests de integración** | `create()` | Comportamiento real |
| **Configuración específica** | `createWithConfig()` | Necesidades particulares |

## Ejemplos de Uso

### Ejemplo 1: Uso Básico en Aplicación

```typescript
import { StateManagerFactory } from './StateManagerFactory';
import { HandlerContext } from './types';

// Configuración básica para aplicación general
const context: HandlerContext = {
  connector: comscoreConnector,
  metadata: initialMetadata,
  configuration: appConfiguration,
  logger: appLogger,
  instanceId: 'app-instance-001'
};

// Crear StateManager con configuración por defecto
const stateManager = StateManagerFactory.create(context);

console.log('StateManager creado:', stateManager.getCurrentState()); // INITIALIZED
```

### Ejemplo 2: Configuración por Entorno

```typescript
// Función para crear StateManager según el entorno
const createStateManagerForEnvironment = (
  context: HandlerContext,
  environment: 'development' | 'production' | 'testing'
): ComscoreStateManager => {
  switch (environment) {
    case 'development':
      return StateManagerFactory.createForDevelopment(context);
      
    case 'production':
      return StateManagerFactory.createForProduction(context);
      
    case 'testing':
      return StateManagerFactory.createForTesting(context);
      
    default:
      return StateManagerFactory.create(context);
  }
};

// Uso según NODE_ENV
const environment = process.env.NODE_ENV as 'development' | 'production' | 'testing';
const stateManager = createStateManagerForEnvironment(context, environment);

console.log(`StateManager creado para ${environment}:`, {
  currentState: stateManager.getCurrentState(),
  canValidate: stateManager.canTransitionTo(ComscoreState.VIDEO)
});
```

### Ejemplo 3: Configuración Personalizada

```typescript
// Configuración personalizada con listeners específicos
class CustomStateListener implements StateChangeListener {
  onStateChanged(from: ComscoreState, to: ComscoreState, reason?: string) {
    console.log(`Custom listener: ${from} → ${to}`, { reason });
    
    // Enviar métricas personalizadas
    this.sendMetrics(from, to, reason);
  }
  
  private sendMetrics(from: ComscoreState, to: ComscoreState, reason?: string) {
    // Implementar envío de métricas
    analytics.track('state_transition', {
      from_state: from,
      to_state: to,
      reason: reason,
      timestamp: Date.now()
    });
  }
}

// Crear configuración personalizada
const customConfig: StateManagerConfig = {
  validateTransitions: true,
  enableVerboseLogging: false, // Solo errores importantes
  stateChangeListeners: [new CustomStateListener()]
};

// Crear StateManager con configuración personalizada
const customStateManager = StateManagerFactory.createWithConfig(context, customConfig);

// Verificar configuración
console.log('StateManager personalizado creado con listeners:', 
  customStateManager.getStateSnapshot());
```

### Ejemplo 4: Factory para Testing

```typescript
// Configuración para tests unitarios
describe('VideoPlayer State Management', () => {
  let stateManager: ComscoreStateManager;
  let mockContext: HandlerContext;
  
  beforeEach(() => {
    // Crear contexto mock para testing
    mockContext = {
      connector: createMockConnector(),
      metadata: createMockMetadata(),
      configuration: { debug: true },
      logger: createMockLogger(),
      instanceId: 'test-instance'
    };
    
    // Crear StateManager para testing (sin validación)
    stateManager = StateManagerFactory.createForTesting(mockContext);
  });
  
  it('should allow direct state transitions in testing mode', () => {
    // En modo testing, podemos hacer transiciones que normalmente no serían válidas
    stateManager.setCurrentState(ComscoreState.ADVERTISEMENT, 'test_setup');
    expect(stateManager.getCurrentState()).toBe(ComscoreState.ADVERTISEMENT);
    
    // Transición directa que normalmente requeriría validación
    stateManager.setCurrentState(ComscoreState.PAUSED_VIDEO, 'test_transition');
    expect(stateManager.getCurrentState()).toBe(ComscoreState.PAUSED_VIDEO);
  });
  
  it('should provide verbose logging for debugging', () => {
    const spy = jest.spyOn(mockContext.logger, 'debug');
    
    stateManager.transitionToVideo('test_play');
    
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('State transition'),
      expect.any(Object)
    );
  });
});
```

### Ejemplo 5: Factory con Configuración Dinámica

```typescript
// Factory avanzada con configuración dinámica
class AdvancedStateManagerFactory {
  static createForApp(
    context: HandlerContext,
    options: {
      isDebugMode?: boolean;
      enableStrictValidation?: boolean;
      customListeners?: StateChangeListener[];
    } = {}
  ): ComscoreStateManager {
    
    const {
      isDebugMode = false,
      enableStrictValidation = true,
      customListeners = []
    } = options;
    
    // Configuración dinámica basada en opciones
    const config: StateManagerConfig = {
      validateTransitions: enableStrictValidation,
      enableVerboseLogging: isDebugMode,
      stateChangeListeners: customListeners
    };
    
    return StateManagerFactory.createWithConfig(context, config);
  }
  
  static createForLiveStreaming(context: HandlerContext): ComscoreStateManager {
    // Configuración específica para streaming en vivo
    const liveStreamingConfig: StateManagerConfig = {
      validateTransitions: true, // Importante para live
      enableVerboseLogging: true, // Para monitoreo en tiempo real
      stateChangeListeners: [
        new LiveStreamingStateListener(),
        new MetricsCollector()
      ]
    };
    
    return StateManagerFactory.createWithConfig(context, liveStreamingConfig);
  }
  
  static createForVOD(context: HandlerContext): ComscoreStateManager {
    // Configuración específica para Video on Demand
    const vodConfig: StateManagerConfig = {
      validateTransitions: true,
      enableVerboseLogging: false, // Menos crítico que live
      stateChangeListeners: [
        new VODStateListener()
      ]
    };
    
    return StateManagerFactory.createWithConfig(context, vodConfig);
  }
}

// Uso de la factory avanzada
const liveStateManager = AdvancedStateManagerFactory.createForLiveStreaming(context);
const vodStateManager = AdvancedStateManagerFactory.createForVOD(context);

// Configuración personalizada para app
const appStateManager = AdvancedStateManagerFactory.createForApp(context, {
  isDebugMode: __DEV__,
  enableStrictValidation: !__DEV__, // Estricto en producción
  customListeners: [
    new AnalyticsListener(),
    new ErrorReportingListener()
  ]
});
```

### Ejemplo 6: Integración con Dependency Injection

```typescript
// Integración con sistema de inyección de dependencias
interface StateManagerProvider {
  getStateManager(context: HandlerContext): ComscoreStateManager;
}

class ProductionStateManagerProvider implements StateManagerProvider {
  getStateManager(context: HandlerContext): ComscoreStateManager {
    return StateManagerFactory.createForProduction(context);
  }
}

class DevelopmentStateManagerProvider implements StateManagerProvider {
  getStateManager(context: HandlerContext): ComscoreStateManager {
    return StateManagerFactory.createForDevelopment(context);
  }
}

class TestingStateManagerProvider implements StateManagerProvider {
  getStateManager(context: HandlerContext): ComscoreStateManager {
    return StateManagerFactory.createForTesting(context);
  }
}

// Container de DI
class DIContainer {
  private providers = new Map<string, StateManagerProvider>();
  
  registerProvider(environment: string, provider: StateManagerProvider) {
    this.providers.set(environment, provider);
  }
  
  getStateManager(context: HandlerContext, environment: string): ComscoreStateManager {
    const provider = this.providers.get(environment);
    if (!provider) {
      throw new Error(`No provider registered for environment: ${environment}`);
    }
    
    return provider.getStateManager(context);
  }
}

// Configuración del container
const container = new DIContainer();
container.registerProvider('production', new ProductionStateManagerProvider());
container.registerProvider('development', new DevelopmentStateManagerProvider());
container.registerProvider('testing', new TestingStateManagerProvider());

// Uso
const currentEnv = process.env.NODE_ENV || 'development';
const stateManager = container.getStateManager(context, currentEnv);
```

## Mejores Prácticas

### ✅ **Selección de Método Apropiado**

```typescript
// CORRECTO: Seleccionar método según el contexto
const createStateManager = (context: HandlerContext) => {
  if (process.env.NODE_ENV === 'production') {
    return StateManagerFactory.createForProduction(context);
  } else if (process.env.NODE_ENV === 'test') {
    return StateManagerFactory.createForTesting(context);
  } else {
    return StateManagerFactory.createForDevelopment(context);
  }
};
```

### ✅ **Configuración Consistente**

```typescript
// CORRECTO: Mantener configuración consistente en la aplicación
class AppStateManagerConfig {
  static readonly PRODUCTION_CONFIG: StateManagerConfig = {
    validateTransitions: false,
    enableVerboseLogging: false,
    stateChangeListeners: []
  };
  
  static readonly DEVELOPMENT_CONFIG: StateManagerConfig = {
    validateTransitions: true,
    enableVerboseLogging: true,
    stateChangeListeners: []
  };
  
  static create(context: HandlerContext): ComscoreStateManager {
    const config = __DEV__ ? 
      AppStateManagerConfig.DEVELOPMENT_CONFIG : 
      AppStateManagerConfig.PRODUCTION_CONFIG;
      
    return StateManagerFactory.createWithConfig(context, config);
  }
}
```

### ✅ **Testing con Factory**

```typescript
// CORRECTO: Usar factory específica para tests
describe('StateManager Tests', () => {
  let stateManager: ComscoreStateManager;
  
  beforeEach(() => {
    const testContext = createTestContext();
    stateManager = StateManagerFactory.createForTesting(testContext);
  });
  
  it('should allow unrestricted transitions in test mode', () => {
    // Test específico que requiere transiciones libres
    stateManager.setCurrentState(ComscoreState.ADVERTISEMENT);
    stateManager.setCurrentState(ComscoreState.PAUSED_VIDEO);
    
    expect(stateManager.getCurrentState()).toBe(ComscoreState.PAUSED_VIDEO);
  });
});
```

## Consideraciones de Performance

### 🚀 **Optimizaciones por Entorno**

| Entorno | Validación | Logging | Performance | Debugging |
|---------|------------|---------|-------------|-----------|
| **Producción** | ❌ Deshabilitada | ❌ Mínimo | 🚀 Máxima | 🔍 Limitado |
| **Desarrollo** | ✅ Habilitada | ✅ Completo | 🐌 Reducida | 🔍 Completo |
| **Testing** | ❌ Deshabilitada | ✅ Completo | 🐌 Reducida | 🔍 Completo |

### ⚖️ **Trade-offs**

- **Validación vs Performance**: La validación mejora la robustez pero reduce la performance
- **Logging vs Eficiencia**: El logging detallado ayuda al debugging pero consume recursos
- **Flexibilidad vs Seguridad**: El modo testing permite más flexibilidad pero menos validación

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Performance lenta en producción | Usando método de desarrollo | Usar `createForProduction()` |
| Transiciones no validadas en tests | Usando método estándar | Usar `createForTesting()` |
| Falta de logs para debugging | Configuración de producción | Usar `createForDevelopment()` |
| Configuración inconsistente | Métodos mezclados | Estandarizar selección de método |

### Debugging

```typescript
// Verificar configuración del StateManager
const debugStateManagerConfig = (stateManager: ComscoreStateManager) => {
  console.log('StateManager Configuration Debug:', {
    canValidate: stateManager.canTransitionTo(ComscoreState.VIDEO),
    currentState: stateManager.getCurrentState(),
    snapshot: stateManager.getStateSnapshot()
  });
};
```

## 🔗 Referencias

- 📚 **State Manager**: [ComscoreStateManager](./README.stateManager.md)
- 🎯 **Tipos**: [Handler Types](./types/index.ts)
- 🔧 **Base**: [Sistema base de handlers](./base/README.md)
- 📝 **Configuración**: [StateManagerConfig](./types/StateManager.ts)
- 🏗️ **Patrones**: [Factory Pattern Documentation](https://refactoring.guru/design-patterns/factory-method)
