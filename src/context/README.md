# Contexto de ComScore para React Native

Este documento describe cómo funciona el contexto de ComScore para React Native.

## Descripción del Contexto

El `ComscoreContext` es un contexto de React que proporciona una forma centralizada y eficiente de gestionar las instancias de ComScore en tu aplicación React Native. Utiliza el patrón de Context API de React para proporcionar acceso a la funcionalidad de ComScore a través de toda la jerarquía de componentes.

### Características del Contexto

El contexto de ComScore permite:

- Proporcionar acceso centralizado a la funcionalidad de ComScore
- Crear instancias de `ComscoreConnector` de forma consistente
- Gestionar automáticamente los IDs de instancia a través de `ComscoreConnector`
- Integración nativa con hooks de React
- Detección automática de errores cuando se usa fuera del proveedor

## Componentes del Contexto

### ComscoreProvider

El `ComscoreProvider` es un componente Provider que debe envolver los componentes que necesiten acceso a la funcionalidad de ComScore.

#### Props del ComscoreProvider

| Parámetro | Tipo      | Descripción                           | Requerido |
| --------- | --------- | ------------------------------------- | --------- |
| children  | ReactNode | Componentes hijos que tendrán acceso al contexto | Sí        |

### useComscore Hook

El hook `useComscore` proporciona acceso al contexto de ComScore y debe usarse dentro de componentes que estén envueltos por `ComscoreProvider`.

#### Valor de Retorno

El hook retorna un objeto `ComscoreContextType` con los siguientes métodos:

| Método          | Parámetros                                              | Descripción                           |
| --------------- | ------------------------------------------------------- | ------------------------------------- |
| createConnector | config: ComscoreConfiguration, metadata: ComscoreMetadata | Crea una nueva instancia de ComscoreConnector |

## Configuración y Uso

### 1. Configurar el Provider

Primero, envuelve tu aplicación o la parte que necesite ComScore con el `ComscoreProvider`:

```typescript
import React from 'react';
import { ComscoreProvider } from 'react-native-comscore';
import App from './App';

export default function AppWrapper() {
  return (
    <ComscoreProvider>
      <App />
    </ComscoreProvider>
  );
}
```

### 2. Usar el Hook en Componentes

Luego, utiliza el hook `useComscore` en cualquier componente hijo para acceder a la funcionalidad:

```typescript
import React, { useEffect, useState } from 'react';
import { useComscore } from 'react-native-comscore';
import { ComscoreUserConsent, ComscoreMediaType } from 'react-native-comscore';

export const VideoPlayer: React.FC = () => {
  const { createConnector } = useComscore();
  const [comscoreConnector, setComscoreConnector] = useState(null);

  useEffect(() => {
    // Configuración de ComScore
    const comscoreConfig = {
      publisherId: 'YOUR_PUBLISHER_ID',
      applicationName: 'YOUR_APP_NAME',
      userConsent: ComscoreUserConsent.granted,
      usagePropertiesAutoUpdateMode: 'foregroundOnly',
      debug: __DEV__,
    };

    // Metadatos del contenido
    const comscoreMetadata = {
      mediaType: ComscoreMediaType.longFormOnDemand,
      uniqueId: 'unique-content-id-123',
      length: 3600000, // 1 hora en milisegundos
      stationTitle: 'Mi Canal',
      classifyAsAudioStream: false,
    };

    // Crear conector usando el contexto
    const connector = createConnector(comscoreConfig, comscoreMetadata);
    setComscoreConnector(connector);

    return () => {
      // Limpiar al desmontar el componente
      connector?.destroy();
    };
  }, [createConnector]);

  const handlePlay = () => {
    comscoreConnector?.notifyPlay();
  };

  const handlePause = () => {
    comscoreConnector?.notifyPause();
  };

  const handleEnd = () => {
    comscoreConnector?.notifyEnd();
  };

  return (
    <View>
      {/* Tu componente de video aquí */}
      <Button title="Play" onPress={handlePlay} />
      <Button title="Pause" onPress={handlePause} />
      <Button title="Stop" onPress={handleEnd} />
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

## Ventajas del Contexto

### 1. **Gestión Centralizada**
- Una sola fuente de verdad para la configuración de ComScore
- Fácil acceso desde cualquier componente de la aplicación

### 2. **Gestión Automática de Instancias**
- El `ComscoreConnector` gestiona automáticamente los IDs de instancia
- No necesitas preocuparte por la gestión manual de identificadores

### 3. **Integración con React**
- Utiliza patrones nativos de React (Context API + Hooks)
- Excelente integración con el ciclo de vida de los componentes

### 4. **Detección de Errores**
- El hook `useComscore` detecta automáticamente si se usa fuera del provider
- Mensajes de error claros para facilitar el debugging

### 5. **Limpieza Automática**
- Fácil limpieza de recursos usando `useEffect` cleanup
- Previene memory leaks al destruir instancias correctamente

## Diferencias con ComscoreConnectorAdapter

| Característica | ComscoreContext + useComscore | ComscoreConnectorAdapter |
| -------------- | ----------------------------- | ------------------------ |
| Gestión de IDs | Automática | Manual |
| Integración React | Nativa (Context + Hooks) | Clase independiente |
| Uso recomendado | Aplicaciones React Native | Casos de bajo nivel |
| Complejidad | Baja | Media |
| Flexibilidad | Alta para apps React | Alta para control directo |

## Mejores Prácticas

1. **Coloca el Provider en el nivel más alto posible** de tu aplicación para maximizar el acceso
2. **Siempre limpia las instancias** usando el cleanup de `useEffect`
3. **Usa el hook solo dentro de componentes** envueltos por el Provider
4. **Maneja los estados de loading** mientras se inicializa el conector
5. **Considera usar useMemo** para configuraciones complejas que no cambian frecuentemente

Para una documentación detallada de los tipos `ComscoreConfiguration` y `ComscoreMetadata`, consulta la [documentación de tipos de ComScore](../api/types/README.md).
