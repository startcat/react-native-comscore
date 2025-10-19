# Implementación del Método reset()

## Resumen

Se ha implementado el método `reset()` en el `ComscorePlugin` para permitir la reutilización del plugin con nuevo contenido sin necesidad de crear una nueva instancia.

## Cambios Realizados

### 1. Interfaz ComscorePluginInterface
**Archivo**: `/src/types/ComscorePlugin.ts`

Se agregó el método `reset()` a la interfaz:

```typescript
export interface ComscorePluginInterface extends PlayerPlugin {
  // ... otros métodos
  reset(): void;
}
```

### 2. Implementación en ComscorePlugin
**Archivo**: `/src/plugin/ComscorePlugin.ts`

Se implementó el método `reset()` que realiza las siguientes acciones:

```typescript
reset(): void {
  // 1. Notificar fin de sesión actual a ComScore
  if (this.context.connector) {
    this.context.connector.notifyEnd();
  }

  // 2. Resetear StateManager (descongelar estado)
  if (this.stateManager) {
    this.stateManager.reset();
  }

  // 3. Resetear todos los handlers que tienen métodos de reset
  if (this.metadataHandler) {
    this.metadataHandler.resetMetadataState();
  }

  if (this.qualityHandler) {
    this.qualityHandler.resetStatistics();
  }

  if (this.errorHandler) {
    this.errorHandler.resetErrorCounts();
  }

  // 4. Los handlers de playback, application y advertisement no necesitan reset
  // ya que su estado se gestiona a través del StateManager
}
```

### 3. Documentación

Se actualizó la documentación en los siguientes archivos:

- **README.md principal**: Ejemplo básico de uso del método `reset()`
- **src/plugin/README.md**: Documentación completa con:
  - Descripción del método en la tabla de métodos principales
  - Sección dedicada "Reutilización del Plugin con reset()"
  - Casos de uso y cuándo utilizar el método
  - Ejemplos de uso con playlists
  - Ejemplos de uso con navegación entre episodios
  - Hook personalizado para gestionar series
  - Tabla comparativa entre `reset()` y `destroy()`
  - Consideraciones importantes y buenas prácticas

## Funcionalidad del Método reset()

### Acciones Realizadas

1. **Notifica fin de sesión**: Llama a `notifyEnd()` en ComScore para cerrar la sesión actual de tracking
2. **Resetea StateManager**: Vuelve el estado a `INITIALIZED` y limpia todos los flags internos
3. **Resetea handlers específicos**:
   - `MetadataHandler`: Limpia metadatos cargados y estadísticas
   - `QualityHandler`: Resetea contadores de cambios de calidad
   - `ErrorHandler`: Limpia contadores de errores
4. **Mantiene configuración**: La configuración del plugin y las etiquetas persistentes se mantienen intactas

### Lo que NO hace reset()

- No destruye la instancia del plugin
- No elimina la configuración del plugin
- No elimina las etiquetas persistentes establecidas
- No destruye el conector de ComScore

## Casos de Uso

### 1. Playlist de Videos
```typescript
function playNextVideo(newMetadata: ComscoreMetadata) {
  comscorePlugin.reset();
  comscorePlugin.update(newMetadata);
  comscorePlugin.onCreatePlaybackSession?.();
  comscorePlugin.onPlay?.();
}
```

### 2. Navegación entre Episodios
```typescript
function useComscoreForSeries(seriesConfig: ComscoreConfiguration) {
  const pluginRef = useRef<ComscorePlugin | null>(null);
  
  const playEpisode = useCallback((episodeMetadata: ComscoreMetadata) => {
    if (!pluginRef.current) {
      pluginRef.current = new ComscorePlugin(episodeMetadata, seriesConfig);
    } else {
      pluginRef.current.reset();
      pluginRef.current.update(episodeMetadata);
    }
    pluginRef.current.onCreatePlaybackSession?.();
  }, [seriesConfig]);
  
  return { plugin: pluginRef.current, playEpisode };
}
```

## Diferencias: reset() vs destroy()

| Aspecto | reset() | destroy() |
|---------|---------|-----------|
| **Propósito** | Reutilizar el plugin con nuevo contenido | Liberar recursos completamente |
| **Estado del plugin** | Vuelve a INITIALIZED, listo para usar | Plugin inutilizable después |
| **Configuración** | Se mantiene | Se pierde |
| **Etiquetas persistentes** | Se mantienen | Se pierden |
| **Instancia de ComScore** | Se mantiene | Se destruye |
| **Uso típico** | Cambio de contenido en playlist | Desmontaje del componente |

## Buenas Prácticas

✅ **CORRECTO**:
```typescript
plugin.reset();
plugin.update(newMetadata);
plugin.onCreatePlaybackSession?.();
plugin.onPlay?.();
```

❌ **INCORRECTO**:
```typescript
// No resetear antes de cambiar contenido
plugin.update(newMetadata); // Estado inconsistente
plugin.onPlay?.();

// Reset durante reproducción activa
plugin.onPlay?.();
plugin.reset(); // Puede causar problemas de tracking
```

## Consideraciones Importantes

⚠️ **Importante**:
- Siempre llama a `reset()` **antes** de cargar nuevo contenido
- Después de `reset()`, actualiza los metadatos con `update()` antes de iniciar reproducción
- No uses `reset()` durante la reproducción activa, primero pausa o detén el contenido
- Si necesitas cambiar la configuración del plugin, usa `destroy()` y crea una nueva instancia

## Verificación

✅ TypeScript compilation: Passed
✅ Interface updated: Yes
✅ Implementation complete: Yes
✅ Documentation updated: Yes
✅ Examples provided: Yes

## Archivos Modificados

1. `/src/types/ComscorePlugin.ts` - Interfaz actualizada
2. `/src/plugin/ComscorePlugin.ts` - Implementación del método
3. `/README.md` - Ejemplo básico agregado
4. `/src/plugin/README.md` - Documentación completa agregada
5. `/docs/reset-method-implementation.md` - Este documento (nuevo)
