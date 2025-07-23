# Documentación del ComscoreMetadataHandler

Este documento describe el handler especializado para la gestión de metadatos de contenido en el sistema de tracking de ComScore.

## Descripción General

El `ComscoreMetadataHandler` es responsable de gestionar todos los aspectos relacionados con los metadatos del contenido, incluyendo carga inicial, actualizaciones durante la reproducción, cambios de duración y detección automática del tipo de contenido (live vs VOD). Utiliza un contexto mutable para actualizar metadatos dinámicamente.

## Arquitectura del Handler

| Componente | Descripción | Responsabilidad |
|------------|-------------|----------------|
| **ComscoreMetadataHandler** | Handler principal | Gestión completa de metadatos |
| **Metadata History** | Historial de cambios | Registro de cambios para debugging |
| **Content Type Detection** | Detección de tipo | Identificación automática de live/VOD |
| **Validation System** | Sistema de validación | Validación de metadatos para ComScore |
| **DVR Window Management** | Gestión de DVR | Configuración automática de ventana DVR |

## Estados de Metadatos

### Estados del Handler

| Estado | Descripción | Impacto |
|--------|-------------|---------|
| **Not Loaded** | Metadatos no cargados | Usa metadatos del contexto inicial |
| **Loaded** | Metadatos cargados | Metadatos específicos del contenido disponibles |
| **Duration Known** | Duración conocida | Puede determinar tipo de contenido |
| **Live Detected** | Contenido live detectado | Configuración específica para live |
| **VOD Detected** | Contenido VOD detectado | Configuración específica para VOD |

### Tipos de Cambios

| Tipo | Descripción | Cuándo Ocurre |
|------|-------------|---------------|
| `load` | Carga inicial | `handleMetadataLoaded()` |
| `update` | Actualización | `handleMetadataUpdate()` |
| `duration_change` | Cambio de duración | `handleDurationChange()` |
| `complete_change` | Cambio completo | `updateMetadata()` manual |

## API del Handler

### Constructor

```typescript
constructor(context: MutableHandlerContext, stateManager: ComscoreStateManager)
```

#### Parámetros del Constructor

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `context` | `MutableHandlerContext` | Contexto mutable del handler | ✅ Sí |
| `stateManager` | `ComscoreStateManager` | Gestor de estados de ComScore | ✅ Sí |

### Eventos de Metadatos

#### handleMetadataLoaded()

Maneja la carga inicial de metadatos del contenido.

```typescript
handleMetadataLoaded(params: MetadataParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `MetadataParams` | Parámetros con metadatos iniciales | ✅ Sí |

**Funcionalidad:**
- ✅ Marca metadatos como cargados
- ✅ Actualiza metadatos en ComScore
- ✅ Detecta tipo de contenido automáticamente
- ✅ Configura DVR window si es necesario
- ✅ Registra cambio en historial

#### handleMetadataUpdate()

Maneja actualizaciones de metadatos durante la reproducción.

```typescript
handleMetadataUpdate(params: MetadataParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `MetadataParams` | Parámetros con metadatos actualizados | ✅ Sí |

**Funcionalidad:**
- ✅ Compara con metadatos actuales
- ✅ Identifica campos afectados
- ✅ Actualiza solo si hay cambios significativos
- ✅ Sincroniza con ComScore si es necesario

#### handleDurationChange()

Maneja cambios en la duración del contenido.

```typescript
handleDurationChange(params: DurationChangeParams): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `params` | `DurationChangeParams` | Parámetros con nueva duración | ✅ Sí |

**Funcionalidad:**
- ✅ Detecta cambios de tipo de contenido (live ↔ VOD)
- ✅ Actualiza configuración de DVR si es necesario
- ✅ Determina si requiere nueva sesión
- ✅ Actualiza metadatos en ComScore

### Métodos de Consulta

#### getCurrentMetadata()

Obtiene los metadatos actuales del contenido.

```typescript
getCurrentMetadata(): ComscoreMetadata | null
```

| Retorno | Descripción |
|---------|-------------|
| `ComscoreMetadata \| null` | Metadatos actuales o null si no están cargados |

#### isLiveContent()

Verifica si el contenido actual es live.

```typescript
isLiveContent(): boolean
```

| Retorno | Descripción |
|---------|-------------|
| `boolean` | true si es contenido live, false en caso contrario |

#### getContentType()

Obtiene el tipo de contenido detectado.

```typescript
getContentType(): 'live' | 'vod' | 'unknown'
```

| Retorno | Descripción |
|---------|-------------|
| `'live' \| 'vod' \| 'unknown'` | Tipo de contenido detectado |

#### getDuration()

Obtiene la duración actual del contenido.

```typescript
getDuration(): number | null
```

| Retorno | Descripción |
|---------|-------------|
| `number \| null` | Duración en milisegundos o null si no se conoce |

#### isMetadataLoadedFlag()

Verifica si los metadatos han sido cargados.

```typescript
isMetadataLoadedFlag(): boolean
```

| Retorno | Descripción |
|---------|-------------|
| `boolean` | true si los metadatos están cargados |

### Métodos de Análisis

#### getMetadataDiff()

Compara metadatos actuales con otros metadatos.

```typescript
getMetadataDiff(otherMetadata: ComscoreMetadata): {
  added: string[];
  removed: string[];
  changed: string[];
}
```

| Parámetro | Tipo | Descripción | Retorno |
|-----------|------|-------------|---------|
| `otherMetadata` | `ComscoreMetadata` | Metadatos para comparar | Objeto con diferencias |

#### areMetadataComplete()

Verifica si los metadatos están completos para ComScore.

```typescript
areMetadataComplete(): {
  isComplete: boolean;
  missingRequired: string[];
  missingRecommended: string[];
}
```

| Retorno | Descripción |
|---------|-------------|
| Objeto de validación | Estado de completitud de metadatos |

#### getMetadataStatistics()

Obtiene estadísticas completas de metadatos.

```typescript
getMetadataStatistics(): {
  changesCount: number;
  lastChangeTime?: number;
  isLoaded: boolean;
  isDurationKnown: boolean;
  contentType: string;
  significantChanges: number;
  currentMetadataSize: number;
  hasCustomDimensions: boolean;
}
```

### Métodos de Gestión

#### updateMetadata()

Actualiza metadatos manualmente.

```typescript
updateMetadata(metadata: ComscoreMetadata): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `metadata` | `ComscoreMetadata` | Nuevos metadatos | ✅ Sí |

**Funcionalidad:**
- ✅ Actualiza metadatos internos
- ✅ Sincroniza con ComScore
- ✅ Actualiza contexto si hay cambios significativos
- ✅ Registra cambio en historial

#### setDvrWindow()

Configura la ventana DVR manualmente.

```typescript
setDvrWindow(windowLengthInSeconds: number): void
```

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `windowLengthInSeconds` | `number` | Duración de la ventana DVR en segundos | ✅ Sí |

#### resetMetadataState()

Reinicia el estado de metadatos.

```typescript
resetMetadataState(): void
```

**Funcionalidad:**
- ✅ Limpia flags de estado
- ✅ Restaura metadatos originales
- ✅ Limpia historial de cambios

#### forceSync()

Fuerza sincronización con ComScore.

```typescript
forceSync(): void
```

**Funcionalidad:**
- ✅ Valida metadatos actuales
- ✅ Sincroniza con ComScore
- ✅ Registra warnings si los hay

### Métodos de Debugging

#### exportMetadataSnapshot()

Exporta snapshot completo para debugging.

```typescript
exportMetadataSnapshot(): {
  current: ComscoreMetadata | null;
  history: MetadataChangeInfo[];
  statistics: MetadataStatistics;
  validation: ValidationResult;
}
```

## Detección Automática de Tipo de Contenido

### Criterios de Detección

| Tipo | Criterios | Configuración Automática |
|------|-----------|-------------------------|
| **Live** | `duration === 0` o `duration === null` | DVR window configurado |
| **VOD** | `duration > 0` | Sin DVR window |
| **Unknown** | Metadatos insuficientes | Configuración por defecto |

### Configuración Automática de DVR

```typescript
// Para contenido live detectado automáticamente
if (isLive && !this.isDvrWindowConfigured) {
  this.context.connector.setDvrWindowLength(DEFAULT_DVR_WINDOW);
}
```

## Estructura de MetadataChangeInfo

### Interfaz MetadataChangeInfo

```typescript
interface MetadataChangeInfo {
  previousMetadata: ComscoreMetadata | null;
  newMetadata: ComscoreMetadata;
  changeType: 'update' | 'load' | 'duration_change' | 'complete_change';
  timestamp: number;
  affectedFields: string[];
}
```

### Campos de MetadataChangeInfo

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `previousMetadata` | `ComscoreMetadata \| null` | Metadatos anteriores | ✅ Sí |
| `newMetadata` | `ComscoreMetadata` | Nuevos metadatos | ✅ Sí |
| `changeType` | `ChangeType` | Tipo de cambio | ✅ Sí |
| `timestamp` | `number` | Timestamp del cambio | ✅ Sí |
| `affectedFields` | `string[]` | Campos que cambiaron | ✅ Sí |

## Flujo de Gestión de Metadatos

### 1. **Carga Inicial de Metadatos**

```mermaid
graph TD
    A[Contenido Inicia] --> B[handleMetadataLoaded()]
    B --> C[Actualizar Metadatos Internos]
    C --> D[Detectar Tipo de Contenido]
    D --> E[Configurar DVR si es Live]
    E --> F[Sincronizar con ComScore]
    F --> G[Registrar en Historial]
```

### 2. **Actualización Durante Reproducción**

```mermaid
graph TD
    A[Metadatos Cambian] --> B[handleMetadataUpdate()]
    B --> C[Comparar con Actuales]
    C --> D{Cambios Significativos?}
    D -->|Sí| E[Sincronizar con ComScore]
    D -->|No| F[Solo Registrar Internamente]
    E --> G[Actualizar Contexto]
    F --> G
    G --> H[Registrar en Historial]
```

### 3. **Cambio de Duración**

```mermaid
graph TD
    A[Duración Cambia] --> B[handleDurationChange()]
    B --> C[Comparar Duración Anterior]
    C --> D{Cambio de Tipo?}
    D -->|Live → VOD| E[Reconfigurar para VOD]
    D -->|VOD → Live| F[Configurar DVR]
    D -->|Sin Cambio| G[Actualizar Solo Duración]
    E --> H[Sincronizar con ComScore]
    F --> H
    G --> H
```

## Ejemplos de Uso

### Ejemplo 1: Carga Inicial de Metadatos

```typescript
import { ComscoreMetadataHandler } from './ComscoreMetadataHandler';
import { MetadataParams } from '../types/AnalyticsPlugin';

// Configuración del handler
const metadataHandler = new ComscoreMetadataHandler(mutableContext, stateManager);

// Metadatos iniciales del contenido
const initialMetadata: MetadataParams = {
  metadata: {
    uniqueId: 'video_12345',
    programTitle: 'Mi Programa',
    episodeTitle: 'Episodio 1',
    length: 1800000, // 30 minutos
    stationTitle: 'Mi Canal',
    genreName: 'Entretenimiento',
    mediaType: ComscoreMediaType.longFormOnDemand,
    classifyAsAudioStream: false
  }
};

// Procesar carga inicial
metadataHandler.handleMetadataLoaded(initialMetadata);

// Verificar estado después de la carga
console.log('Tipo de contenido:', metadataHandler.getContentType());
console.log('Es live:', metadataHandler.isLiveContent());
console.log('Duración:', metadataHandler.getDuration());
```

### Ejemplo 2: Actualización de Metadatos Durante Reproducción

```typescript
// Actualización durante la reproducción (ej: cambio de episodio)
const updatedMetadata: MetadataParams = {
  metadata: {
    ...metadataHandler.getCurrentMetadata(),
    episodeTitle: 'Episodio 2',
    uniqueId: 'video_12346',
    customLabels: {
      seasonNumber: '1',
      episodeNumber: '2'
    }
  }
};

metadataHandler.handleMetadataUpdate(updatedMetadata);

// Obtener diferencias
const currentMetadata = metadataHandler.getCurrentMetadata();
if (currentMetadata) {
  const diff = metadataHandler.getMetadataDiff(initialMetadata.metadata!);
  console.log('Campos cambiados:', diff.changed);
  console.log('Campos agregados:', diff.added);
}
```

### Ejemplo 3: Manejo de Cambio de Duración

```typescript
import { DurationChangeParams } from '../types/AnalyticsPlugin';

// Cambio de duración (ej: live stream que se convierte en VOD)
const durationChange: DurationChangeParams = {
  duration: 3600000 // 1 hora - ahora es VOD
};

metadataHandler.handleDurationChange(durationChange);

// Verificar cambios
const stats = metadataHandler.getMetadataStatistics();
console.log('Tipo de contenido después del cambio:', stats.contentType);
console.log('Duración conocida:', stats.isDurationKnown);
```

### Ejemplo 4: Contenido Live con DVR

```typescript
// Metadatos para contenido live
const liveMetadata: MetadataParams = {
  metadata: {
    uniqueId: 'live_stream_001',
    programTitle: 'Transmisión en Vivo',
    length: 0, // Duración 0 indica live
    stationTitle: 'Canal Live',
    mediaType: ComscoreMediaType.live,
    classifyAsAudioStream: false
  }
};

metadataHandler.handleMetadataLoaded(liveMetadata);

// Configurar ventana DVR manualmente si es necesario
if (metadataHandler.isLiveContent()) {
  metadataHandler.setDvrWindow(300); // 5 minutos de DVR
  console.log('DVR configurado para contenido live');
}
```

### Ejemplo 5: Validación y Completitud

```typescript
// Verificar completitud de metadatos
const completeness = metadataHandler.areMetadataComplete();

if (!completeness.isComplete) {
  console.warn('Metadatos incompletos:', {
    faltanRequeridos: completeness.missingRequired,
    faltanRecomendados: completeness.missingRecommended
  });
}

// Obtener estadísticas detalladas
const stats = metadataHandler.getMetadataStatistics();
console.log('Estadísticas de metadatos:', {
  cambios: stats.changesCount,
  cambiosSignificativos: stats.significantChanges,
  tamañoActual: stats.currentMetadataSize,
  tieneCustomLabels: stats.hasCustomDimensions,
  ultimoCambio: stats.lastChangeTime ? new Date(stats.lastChangeTime) : 'Nunca'
});
```

### Ejemplo 6: Debugging y Snapshot

```typescript
// Exportar snapshot completo para debugging
const snapshot = metadataHandler.exportMetadataSnapshot();

console.log('Snapshot de metadatos:', {
  metadatosActuales: snapshot.current,
  historialCambios: snapshot.history.length,
  estadisticas: snapshot.statistics,
  validacion: snapshot.validation
});

// Forzar sincronización si es necesario
if (!snapshot.validation.isComplete) {
  console.log('Forzando sincronización...');
  metadataHandler.forceSync();
}
```

### Ejemplo 7: Actualización Manual Completa

```typescript
// Actualización manual completa de metadatos
const newMetadata: ComscoreMetadata = {
  uniqueId: 'updated_content_001',
  programTitle: 'Programa Actualizado',
  episodeTitle: 'Nuevo Episodio',
  length: 2400000, // 40 minutos
  stationTitle: 'Canal Premium',
  genreName: 'Drama',
  mediaType: ComscoreMediaType.longFormOnDemand,
  classifyAsAudioStream: false,
  customLabels: {
    contentRating: 'PG-13',
    language: 'es',
    quality: 'HD'
  }
};

metadataHandler.updateMetadata(newMetadata);

// Verificar que la actualización fue exitosa
const updatedMetadata = metadataHandler.getCurrentMetadata();
console.log('Metadatos actualizados exitosamente:', !!updatedMetadata);
```

## Criterios de Cambios Significativos

### Campos Considerados Significativos

| Campo | Impacto | Requiere Sync |
|-------|---------|---------------|
| `uniqueId` | Alto | ✅ Sí |
| `programTitle` | Alto | ✅ Sí |
| `episodeTitle` | Medio | ✅ Sí |
| `length` | Alto | ✅ Sí |
| `mediaType` | Alto | ✅ Sí |
| `stationTitle` | Medio | ✅ Sí |
| `genreName` | Bajo | ❌ No |
| `customLabels` | Variable | ✅ Sí (si cambian keys importantes) |

### Lógica de Evaluación

```typescript
private hasSignificantChanges(changeInfo: MetadataChangeInfo): boolean {
  const significantFields = [
    'uniqueId', 'programTitle', 'episodeTitle', 
    'length', 'mediaType', 'stationTitle'
  ];
  
  return changeInfo.affectedFields.some(field => 
    significantFields.includes(field)
  );
}
```

## Mejores Prácticas

### ✅ **Carga de Metadatos**

```typescript
// CORRECTO: Cargar metadatos al inicio
const loadInitialMetadata = async () => {
  const metadata = await fetchContentMetadata(contentId);
  
  metadataHandler.handleMetadataLoaded({
    metadata: {
      uniqueId: contentId,
      programTitle: metadata.title,
      length: metadata.duration * 1000, // Convertir a ms
      ...metadata
    }
  });
};
```

### ✅ **Actualización Incremental**

```typescript
// CORRECTO: Solo actualizar campos que cambiaron
const updateSpecificFields = (changes: Partial<ComscoreMetadata>) => {
  const currentMetadata = metadataHandler.getCurrentMetadata();
  
  if (currentMetadata) {
    const updatedMetadata = {
      ...currentMetadata,
      ...changes
    };
    
    metadataHandler.updateMetadata(updatedMetadata);
  }
};
```

### ✅ **Validación Antes de Uso**

```typescript
// CORRECTO: Validar metadatos antes de operaciones críticas
const ensureMetadataComplete = () => {
  const completeness = metadataHandler.areMetadataComplete();
  
  if (!completeness.isComplete) {
    console.warn('Metadatos incompletos detectados');
    
    // Completar campos requeridos
    completeness.missingRequired.forEach(field => {
      console.error(`Campo requerido faltante: ${field}`);
    });
    
    return false;
  }
  
  return true;
};
```

### ✅ **Manejo de Contenido Live**

```typescript
// CORRECTO: Configuración específica para live
const setupLiveContent = () => {
  if (metadataHandler.isLiveContent()) {
    // Configurar DVR window apropiada
    metadataHandler.setDvrWindow(600); // 10 minutos
    
    // Configurar metadatos específicos para live
    const liveMetadata = {
      ...metadataHandler.getCurrentMetadata(),
      length: 0, // Live debe tener length = 0
      mediaType: ComscoreMediaType.live
    };
    
    metadataHandler.updateMetadata(liveMetadata);
  }
};
```

## Consideraciones de Performance

### 🚀 **Optimizaciones**
- **Comparación incremental** - Solo evalúa campos que cambiaron
- **Sync condicional** - Solo sincroniza cambios significativos
- **Historial limitado** - Máximo 20 cambios en memoria
- **Validación lazy** - Solo valida cuando es necesario

### ⚠️ **Limitaciones**
- **Historial en memoria** - Se pierde al reiniciar
- **Un tipo de contenido** - No maneja contenido mixto
- **Sync manual** - Requiere llamadas explícitas para actualizaciones

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| Metadatos no se actualizan | No hay cambios significativos | Usar `forceSync()` |
| Tipo de contenido incorrecto | Duración mal configurada | Verificar `length` en metadatos |
| DVR no funciona | No detectado como live | Verificar `length === 0` |
| Validación falla | Campos requeridos faltantes | Usar `areMetadataComplete()` |

### Debugging

```typescript
// Información completa del estado de metadatos
const debugMetadataState = () => {
  const snapshot = metadataHandler.exportMetadataSnapshot();
  
  console.log('Metadata Handler Debug:', {
    isLoaded: metadataHandler.isMetadataLoadedFlag(),
    contentType: metadataHandler.getContentType(),
    isLive: metadataHandler.isLiveContent(),
    duration: metadataHandler.getDuration(),
    statistics: snapshot.statistics,
    validation: snapshot.validation,
    recentChanges: snapshot.history.slice(-3)
  });
};
```

## 🔗 Referencias

- 📚 **Tipos**: [ComscoreMetadata](../types/README.md)
- 🎯 **Analytics**: [AnalyticsPlugin Types](../types/AnalyticsPlugin.ts)
- 🔧 **Base**: [Sistema base de handlers](./base/README.md)
- 📊 **State Manager**: [ComscoreStateManager](./README.stateManager.md)
- 🎛️ **Context**: [MutableHandlerContext](./base/README.md#mutablehandlercontext)
