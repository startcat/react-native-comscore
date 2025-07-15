# Ejemplo de Gestor de Plugins de Analíticas

Este documento muestra un ejemplo completo de implementación de un hook que gestiona múltiples plugins de analíticas (ComScore, Adobe, etc.) y los vincula con los eventos del [Player OTT](https://github.com/startcat/react-native-video) (Over-The-Top).

_Este hook de ejemplo vendrá incorporado en la librería del Player OTT próximamente._

## Propósito del Hook

El hook `usePlayerAnalyticsEvents` actúa como un **gestor centralizado** que:

1. **Crea instancias** de plugins de analíticas según el contenido a reproducir
2. **Gestiona el ciclo de vida** de los plugins (creación, destrucción, limpieza)
3. **Vincula los plugins** con el sistema de eventos del reproductor
4. **Sincroniza automáticamente** cuando cambia el contenido

**Ventajas:**

- ✅ Gestión automática del ciclo de vida de plugins
- ✅ Limpieza de memoria y prevención de memory leaks
- ✅ Sincronización automática con cambios de contenido
- ✅ Arquitectura escalable para múltiples proveedores de analíticas

## Implementación del Hook

```typescript
import { useEffect, useRef } from 'react';
import { ComscorePlugin } from 'react-native-comscore';

// Importa tus tipos específicos del proyecto
// import { type MediaDto } from "...";
// import { type StreamDto } from "...";

// Importa tus plugins personalizados
// import { createComscorePlugin } from "./comscorePlugin";
// import { createAdobePlugin } from "./adobePlugin";

// Importa tu sistema de eventos del reproductor
// import { PlayerAnalyticsEvents } from "./playerEvents";

export const usePlayerAnalyticsEvents = (mediaData: YourMediaType | null) => {
  // Referencias para mantener las instancias entre renders
  const playerAnalyticsEventsRef = useRef<PlayerAnalyticsEvents | null>(null);
  const comscorePluginRef = useRef<ComscorePlugin | null>(null);
  const adobePluginRef = useRef<AdobePlugin | null>(null);
  // Añadir más referencias según los plugins que uses

  useEffect(() => {
    if (mediaData) {
      // 1. Limpiar referencias anteriores para evitar memory leaks
      playerAnalyticsEventsRef.current?.destroy();
      comscorePluginRef.current?.destroy();
      adobePluginRef.current?.destroy();

      // 2. Crear nuevas instancias de plugins con los datos del contenido actual
      playerAnalyticsEventsRef.current = new PlayerAnalyticsEvents();
      comscorePluginRef.current = createComscorePlugin(mediaData);
      adobePluginRef.current = createAdobePlugin(mediaData);

      // 3. Registrar plugins en el gestor de eventos
      if (comscorePluginRef.current && playerAnalyticsEventsRef.current) {
        playerAnalyticsEventsRef.current.addPlugin(comscorePluginRef.current);
      }

      if (adobePluginRef.current && playerAnalyticsEventsRef.current) {
        playerAnalyticsEventsRef.current.addPlugin(adobePluginRef.current);
      }
    }

    // 4. Función de limpieza (cleanup) cuando el componente se desmonta
    // o cuando cambia mediaData
    return () => {
      playerAnalyticsEventsRef.current?.destroy();
      comscorePluginRef.current?.destroy();
      adobePluginRef.current?.destroy();

      // Limpiar referencias
      playerAnalyticsEventsRef.current = null;
      comscorePluginRef.current = null;
      adobePluginRef.current = null;
    };
  }, [mediaData]); // Se ejecuta cuando cambia mediaData

  // Retorna la instancia del gestor de eventos para uso externo
  return playerAnalyticsEventsRef.current;
};
```

## Explicación Detallada

### 1. **Referencias con useRef**

```typescript
const playerAnalyticsEventsRef = useRef<PlayerAnalyticsEvents | null>(null);
const comscorePluginRef = useRef<ComscorePlugin | null>(null);
```

- **`useRef`** mantiene las instancias de plugins entre re-renders
- Evita recrear innecesariamente los plugins
- Permite acceso directo para destrucción y limpieza

### 2. **Gestión del Ciclo de Vida**

#### **Limpieza Previa:**

```typescript
playerAnalyticsEventsRef.current?.destroy();
comscorePluginRef.current?.destroy();
```

- Destruye instancias anteriores antes de crear nuevas
- Previene memory leaks y conflictos entre sesiones

#### **Creación de Instancias:**

```typescript
playerAnalyticsEventsRef.current = new PlayerAnalyticsEvents();
comscorePluginRef.current = createComscorePlugin(mediaData);
```

- Crea nuevas instancias con los datos del contenido actual
- Cada plugin se configura específicamente para el contenido

#### **Registro de Plugins:**

```typescript
if (comscorePluginRef.current && playerAnalyticsEventsRef.current) {
  playerAnalyticsEventsRef.current.addPlugin(comscorePluginRef.current);
}
```

- Registra cada plugin en el gestor de eventos
- Validación para evitar errores si falla la creación

### 3. **Dependencia de mediaData**

```typescript
useEffect(() => {
  // ...lógica
}, [mediaData]);
```

- Se ejecuta **automáticamente** cuando cambia el contenido
- Garantiza que los plugins siempre tengan datos actualizados
- Sincronización perfecta con el estado del reproductor

### 4. **Función de Limpieza**

```typescript
return () => {
  playerAnalyticsEventsRef.current?.destroy();
  // ...más limpieza
};
```

- Se ejecuta cuando el componente se desmonta
- También se ejecuta antes de crear nuevas instancias
- Garantiza liberación completa de recursos

## Consideraciones Importantes

### **Rendimiento**

- ✅ Use `useRef` para evitar recreaciones innecesarias
- ✅ Destruye instancias anteriores antes de crear nuevas
- ✅ El hook solo se ejecuta cuando cambia `mediaData`

### **Memory Management**

- ⚠️ **Crítico**: Siempre llama a `destroy()` en plugins que lo soporten
- ⚠️ Limpia todas las referencias en la función de cleanup
- ⚠️ Valida que las instancias existan antes de usarlas

### **Escalabilidad**

- ➕ Fácil añadir nuevos plugins siguiendo el mismo patrón
- ➕ Centraliza toda la lógica de analíticas en un solo lugar
- ➕ Permite activar/desactivar plugins según configuración

### **Error Handling**

```typescript
// Ejemplo de manejo robusto de errores
try {
  comscorePluginRef.current = createComscorePlugin(mediaData);
} catch (error) {
  console.error('[Analytics] Error creating ComScore plugin:', error);
  comscorePluginRef.current = null;
}
```

### **Testing**

- Mockea fácilmente cada plugin por separado
- El hook es testeable de forma aislada
- Permite testing de integración completo
