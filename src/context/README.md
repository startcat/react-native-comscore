# Documentación del Contexto ComScore

Este documento describe el sistema de contexto React para la integración de ComScore en aplicaciones React Native.

## Descripción General

El módulo `/src/context` proporciona una implementación basada en React Context API que simplifica la integración de ComScore en aplicaciones React Native. Está diseñado para ofrecer una experiencia de desarrollo intuitiva y seguir las mejores prácticas de React.

## Arquitectura del Módulo

| Componente | Descripción | Archivo | Responsabilidad |
|------------|-------------|---------|----------------|
| **ComscoreProvider** | Proveedor de contexto React | `ComscoreContext.tsx` | Proporciona acceso a la funcionalidad ComScore |
| **useComscore** | Hook personalizado | `ComscoreContext.tsx` | Interfaz para consumir el contexto |
| **ComscoreContextType** | Tipo TypeScript | `ComscoreContext.tsx` | Define la forma del contexto |
| **Exports** | Exportaciones públicas | `index.ts` | Configuración del módulo |

## ComscoreContext

El `ComscoreContext` utiliza React Context API para proporcionar acceso centralizado a la funcionalidad de ComScore a través de toda la jerarquía de componentes.

### Características Principales

- ✅ **Gestión centralizada** - Una sola fuente de verdad para ComScore
- ✅ **Factory pattern** - Creación consistente de instancias `ComscoreConnector`
- ✅ **Type safety** - Completamente tipado con TypeScript
- ✅ **Error handling** - Detección automática de uso incorrecto
- ✅ **React integration** - Integración nativa con hooks y lifecycle
- ✅ **Automatic cleanup** - Facilita la limpieza de recursos

## API del Contexto

### ComscoreProvider

Componente proveedor que debe envolver la parte de tu aplicación que necesite acceso a ComScore.

```typescript
export const ComscoreProvider: React.FC<ComscoreProviderProps>
```

#### Props

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|----------|
| `children` | `ReactNode` | Componentes hijos que tendrán acceso al contexto ComScore | ✅ Sí |

#### Implementación Interna

El provider implementa un factory method que crea instancias de `ComscoreConnector`:

```typescript
const createConnector = (
  config: ComscoreConfiguration,
  metadata: ComscoreMetadata
): ComscoreConnector => {
  return new ComscoreConnector(config, metadata);
};
```

### useComscore Hook

Hook personalizado que proporciona acceso al contexto ComScore con validación automática.

```typescript
export const useComscore = (): ComscoreContextType
```

#### Valor de Retorno

Retorna un objeto `ComscoreContextType` con la siguiente interfaz:

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `createConnector()` | `config: ComscoreConfiguration`<br>`metadata: ComscoreMetadata` | `ComscoreConnector` | Crea una nueva instancia del conector ComScore |

#### Validación de Contexto

El hook incluye validación automática:

```typescript
if (!context) {
  throw new Error('useComscore must be used within a ComscoreProvider');
}
```

## Configuración y Uso

### 1. Configurar el Provider

Primero, envuelve tu aplicación con el `ComscoreProvider` en el nivel más alto posible:

```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ComscoreProvider } from '@comscore/react-native-comscore/context';
import { MainNavigator } from './navigation/MainNavigator';

export default function App() {
  return (
    <ComscoreProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </ComscoreProvider>
  );
}
```

### 2. Usar el Hook en Componentes

Utiliza el hook `useComscore` en cualquier componente hijo para acceder a la funcionalidad:

```typescript
// VideoPlayerScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Button, Alert } from 'react-native';
import { useComscore } from '@comscore/react-native-comscore/context';
import type { 
  ComscoreConnector,
  ComscoreConfiguration,
  ComscoreMetadata,
  ComscoreUserConsent,
  ComscoreMediaType 
} from '@comscore/react-native-comscore';

interface VideoPlayerScreenProps {
  videoId: string;
  videoTitle: string;
  videoDuration: number;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  videoId,
  videoTitle,
  videoDuration
}) => {
  const { createConnector } = useComscore();
  const [connector, setConnector] = useState<ComscoreConnector | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Configuración memoizada para evitar recreaciones innecesarias
  const comscoreConfig = React.useMemo((): ComscoreConfiguration => ({
    publisherId: 'YOUR_PUBLISHER_ID',
    applicationName: 'MiAplicación',
    userConsent: ComscoreUserConsent.granted,
    usagePropertiesAutoUpdateMode: 'foregroundAndBackground',
    debug: __DEV__,
  }), []);

  const comscoreMetadata = React.useMemo((): ComscoreMetadata => ({
    mediaType: ComscoreMediaType.longFormOnDemand,
    uniqueId: videoId,
    length: videoDuration * 1000, // Convertir segundos a milisegundos
    stationTitle: 'Mi Canal',
    programTitle: videoTitle,
    episodeTitle: videoTitle,
    genreName: 'Entretenimiento',
    classifyAsAudioStream: false,
  }), [videoId, videoTitle, videoDuration]);

  // Inicializar conector ComScore
  useEffect(() => {
    try {
      const comscoreConnector = createConnector(comscoreConfig, comscoreMetadata);
      setConnector(comscoreConnector);
      
      console.log(`ComScore inicializado para video: ${videoId}`);
    } catch (error) {
      console.error('Error al inicializar ComScore:', error);
      Alert.alert('Error', 'No se pudo inicializar el tracking de ComScore');
    }

    return () => {
      if (connector) {
        connector.destroy();
        console.log(`ComScore destruido para video: ${videoId}`);
      }
    };
  }, [createConnector, comscoreConfig, comscoreMetadata, videoId]);

  // Handlers de eventos del reproductor
  const handlePlay = useCallback(() => {
    if (!connector) return;
    
    try {
      if (!isPlaying) {
        connector.createPlaybackSession();
      }
      connector.notifyPlay();
      setIsPlaying(true);
      console.log('ComScore: Play event sent');
    } catch (error) {
      console.error('Error al enviar evento play:', error);
    }
  }, [connector, isPlaying]);

  const handlePause = useCallback(() => {
    if (!connector) return;
    
    try {
      connector.notifyPause();
      setIsPlaying(false);
      console.log('ComScore: Pause event sent');
    } catch (error) {
      console.error('Error al enviar evento pause:', error);
    }
  }, [connector]);

  const handleEnd = useCallback(() => {
    if (!connector) return;
    
    try {
      connector.notifyEnd();
      setIsPlaying(false);
      console.log('ComScore: End event sent');
    } catch (error) {
      console.error('Error al enviar evento end:', error);
    }
  }, [connector]);

  const handleSeek = useCallback((position: number) => {
    if (!connector) return;
    
    try {
      connector.notifySeekStart();
      connector.startFromPosition(position * 1000); // Convertir a ms
      console.log(`ComScore: Seek to ${position}s`);
    } catch (error) {
      console.error('Error al enviar evento seek:', error);
    }
  }, [connector]);

  // Mostrar loading si el conector no está listo
  if (!connector) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Inicializando ComScore...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>{videoTitle}</Text>
      
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Button
          title={isPlaying ? "Pausar" : "Reproducir"}
          onPress={isPlaying ? handlePause : handlePlay}
        />
        <Button
          title="Finalizar"
          onPress={handleEnd}
          disabled={!isPlaying}
        />
      </View>
      
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button
          title="Seek 30s"
          onPress={() => handleSeek(30)}
        />
        <Button
          title="Seek 60s"
          onPress={() => handleSeek(60)}
        />
      </View>
    </View>
  );
};
```

## Ejemplo Completo

```typescript
// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ComscoreProvider } from 'react-native-comscore';
import { MainNavigator } from './navigation/MainNavigator';

export default function App() {
  return (
    <ComscoreProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </ComscoreProvider>
  );
}

// VideoScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Button } from 'react-native';
import { useComscore } from 'react-native-comscore';
import { ComscoreUserConsent, ComscoreMediaType } from 'react-native-comscore';

export const VideoScreen: React.FC = () => {
  const { createConnector } = useComscore();
  const [connector, setConnector] = useState(null);

  useEffect(() => {
    const config = {
      publisherId: 'YOUR_PUBLISHER_ID',
      applicationName: 'YOUR_APP_NAME',
      userConsent: ComscoreUserConsent.granted,
      usagePropertiesAutoUpdateMode: 'foregroundOnly',
      debug: __DEV__,
    };

    const metadata = {
      mediaType: ComscoreMediaType.longFormOnDemand,
      uniqueId: 'video-123',
      length: 1800000, // 30 minutos
      stationTitle: 'Canal Principal',
      classifyAsAudioStream: false,
    };

    const comscoreConnector = createConnector(config, metadata);
    setConnector(comscoreConnector);

    return () => {
      comscoreConnector.destroy();
    };
  }, [createConnector]);

  return (
    <View>
      <Button
        title="Iniciar Reproducción"
        onPress={() => connector?.notifyPlay()}
      />
      <Button
        title="Pausar"
        onPress={() => connector?.notifyPause()}
      />
      <Button
        title="Finalizar"
        onPress={() => connector?.notifyEnd()}
      />
    </View>
  );
};
```

## 🎯 Ventajas del Contexto

### 1. **🏗️ Gestión Centralizada**

- **Una sola fuente de verdad** para la configuración de ComScore
- **Acceso global** desde cualquier componente de la aplicación
- **Configuración consistente** a través de toda la app
- **Fácil mantenimiento** de configuraciones globales

### 2. **🤖 Gestión Automática de Instancias**

- El `ComscoreConnector` **gestiona automáticamente** los IDs de instancia
- **No necesitas gestión manual** de identificadores únicos
- **Previene conflictos** entre múltiples instancias
- **Simplifica la implementación** para desarrolladores

### 3. **⚛️ Integración Nativa con React**

- Utiliza **patrones estándar** de React (Context API + Hooks)
- **Excelente integración** con el ciclo de vida de componentes
- **Type safety completo** con TypeScript
- **Performance optimizada** con memoización

### 4. **🛡️ Detección y Manejo de Errores**

- **Validación automática** del contexto en tiempo de ejecución
- **Mensajes de error descriptivos** para facilitar debugging
- **Prevención de errores** por uso incorrecto
- **Logging integrado** para monitoreo

### 5. **🧹 Limpieza Automática de Recursos**

- **Cleanup automático** usando `useEffect` cleanup functions
- **Previene memory leaks** al destruir instancias correctamente
- **Gestión del lifecycle** integrada con React
- **Liberación de recursos** garantizada

## 📊 Comparación: Context vs Adapter

| Característica | ComscoreContext + useComscore | ComscoreConnectorAdapter | Recomendación |
|----------------|-------------------------------|--------------------------|---------------|
| **Gestión de IDs** | ✅ Automática | ⚙️ Manual | Context para apps React |
| **Integración React** | ✅ Nativa (Context + Hooks) | ⚠️ Clase independiente | Context para mejor UX |
| **Type Safety** | ✅ Completo con TypeScript | ✅ Completo con TypeScript | Ambos son seguros |
| **Complejidad de uso** | 🟢 Baja | 🟡 Media | Context para simplicidad |
| **Flexibilidad** | 🟢 Alta para apps React | 🟢 Alta para control directo | Depende del caso de uso |
| **Performance** | 🟢 Optimizada con memoización | 🟢 Directa sin overhead | Ambos son eficientes |
| **Debugging** | 🟢 Integrado con React DevTools | 🟡 Logging manual | Context para mejor DX |
| **Uso recomendado** | 🎯 Aplicaciones React Native | 🔧 Casos de bajo nivel | Context como primera opción |

## 📋 Mejores Prácticas

### 🏗️ **Configuración del Provider**

```typescript
// ✅ CORRECTO: Provider en el nivel más alto
export default function App() {
  return (
    <ComscoreProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </ComscoreProvider>
  );
}

// ❌ INCORRECTO: Provider anidado innecesariamente
export default function VideoScreen() {
  return (
    <ComscoreProvider> {/* No necesario aquí */}
      <VideoPlayer />
    </ComscoreProvider>
  );
}
```

### 🧹 **Limpieza de Recursos**

```typescript
// ✅ CORRECTO: Limpieza adecuada
useEffect(() => {
  const connector = createConnector(config, metadata);
  setConnector(connector);
  
  return () => {
    connector.destroy(); // Siempre limpiar
  };
}, []);

// ❌ INCORRECTO: Sin limpieza
useEffect(() => {
  const connector = createConnector(config, metadata);
  setConnector(connector);
  // Falta cleanup - memory leak!
}, []);
```

### ⚡ **Optimización de Performance**

```typescript
// ✅ CORRECTO: Configuración memoizada
const config = useMemo(() => ({
  publisherId: 'YOUR_ID',
  applicationName: 'App',
  // ... otras configuraciones
}), []); // Dependencias vacías si no cambia

// ❌ INCORRECTO: Recreación en cada render
const config = {
  publisherId: 'YOUR_ID', // Se recrea en cada render
  applicationName: 'App',
};
```

### 🛡️ **Manejo de Estados**

```typescript
// ✅ CORRECTO: Validación del conector
const handlePlay = useCallback(() => {
  if (!connector) {
    console.warn('Connector not ready');
    return;
  }
  
  try {
    connector.notifyPlay();
  } catch (error) {
    console.error('Error:', error);
  }
}, [connector]);

// ❌ INCORRECTO: Sin validación
const handlePlay = () => {
  connector.notifyPlay(); // Puede fallar si connector es null
};
```

### 📱 **Integración con Navigation**

```typescript
// ✅ CORRECTO: Un conector por pantalla de video
const VideoScreen = ({ route }) => {
  const { videoId } = route.params;
  const { createConnector } = useComscore();
  
  useEffect(() => {
    const connector = createConnector(config, {
      ...metadata,
      uniqueId: videoId, // ID único por video
    });
    
    return () => connector.destroy();
  }, [videoId]);
};
```

## 🔗 Referencias

- 📚 **Tipos**: [Documentación de tipos](../types/README.md)
- 🔌 **API**: [Documentación del módulo API](../api/README.md)
- 🔧 **Adaptador**: [ComscoreConnectorAdapter](../api/adapters/README.md)
- 🎛️ **Plugin**: [ComscorePlugin](../plugin/README.md)
