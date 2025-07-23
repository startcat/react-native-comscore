# react-native-comscore

Módulo de ComScore Analytics para React Native

## Instalación

Hasta migrarlo a un repositorio privado de Overon, puedes instalarlo de la siguiente manera:

```sh
yarn add react-native-comscore@github:startcat/react-native-comscore
```

## Configuración

### Variables de entorno

Añade las credenciales de ComScore en tu archivo `.env`:

```env
# COMSCORE
COMSCORE_PUBLISHER_ID=11548294
COMSCORE_APPLICATION=3Cat_DEMO
```

> **Nota**: Las variables del `.env` se acceden mediante [react-native-config](https://github.com/lugg/react-native-config), que las expone automáticamente en `BuildConfig` para Android y `RNCConfig` para iOS.

### Configuración Android

#### **MainActivity.kt**

Modifica el archivo `android/app/src/main/java/.../MainActivity.kt` para inicializar ComScore en la función `onCreate`:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Inicialización de ComScore
    cat.start.comscore.init(this, BuildConfig.COMSCORE_PUBLISHER_ID, BuildConfig.COMSCORE_APPLICATION)
}
```

### Configuración iOS

#### **AppDelegate.mm**

Modifica el archivo `ios/YourApp/AppDelegate.mm`:

1. **Añade los imports necesarios** al inicio del archivo:

```objc
#import <ComScore/ComScore.h>
#import "RNCConfig.h"
```

2. **Inicializa ComScore** en el método `didFinishLaunchingWithOptions`:

```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Configuración de ComScore
    SCORPublisherConfiguration *publisherConfiguration = [SCORPublisherConfiguration publisherConfigurationWithBuilderBlock:^(SCORPublisherConfigurationBuilder *builder) {
        builder.publisherId = [RNCConfig envFor:@"COMSCORE_PUBLISHER_ID"];
        builder.persistentLabels = @{ @"cs_ucfr": @"1" };
    }];

    [[SCORAnalytics configuration] addClientWithConfiguration:publisherConfiguration];
    //[[SCORAnalytics configuration] enableChildDirectedApplicationMode];
    [[SCORAnalytics configuration] enableImplementationValidationMode];
    [SCORAnalytics configuration].applicationName = [RNCConfig envFor:@"COMSCORE_APPLICATION"];
    [SCORAnalytics start];

    // ... resto de tu código existente
}
```

#### **Opciones de Configuración**

**Modos de configuración disponibles:**

- **`enableChildDirectedApplicationMode`**: Activa el modo para aplicaciones dirigidas a niños menores de 13 años. Esto cumple con las regulaciones COPPA (Children's Online Privacy Protection Act). Debe activarse solo si tu aplicación está específicamente dirigida a menores.

- **`enableImplementationValidationMode`**: Activa el modo de validación durante el desarrollo. Proporciona logs detallados y validaciones para ayudar a identificar problemas de implementación. Se recomienda usarlo solo en desarrollo y desactivarlo en producción.

**Etiquetas persistentes:**

```objc
builder.persistentLabels = @{ @"cs_ucfr": @"1" };
```

- **`cs_ucfr`**: (User Consent For Remarketing) Indica si el usuario ha aceptado las políticas de privacidad y el uso de cookies/tracking de la aplicación.
  - `"1"`: Usuario ha dado consentimiento
  - `"0"`: Usuario no ha dado consentimiento o se desconoce

> **Importante**: El valor de `cs_ucfr` debe establecerse dinámicamente basándose en la respuesta real del usuario a las políticas de privacidad de tu aplicación, no como un valor fijo.

## Tipos de Funcionamiento

Esta librería soporta dos tipos principales de analíticas:

### 1. Analíticas de ComScore

Funcionalidad básica de tracking y medición de audiencia de ComScore para aplicaciones móviles. Permite:

- Medición de páginas vistas y eventos de aplicación
- Tracking de usuarios únicos y sesiones
- Reportes de uso y engagement
- Configuración personalizada de metadatos

#### **Uso Básico**

Para ver un ejemplo completo de uso mediante un hook personalizado, consulta:

📋 **[Ejemplo de Hook de ComScore](docs/hook.sample.md)**

### 2. ComScore Streaming Tag - Player OTT

Funcionalidad especializada para el tracking de contenido de video streaming y reproductores OTT (Over-The-Top). Esta implementación utiliza una **arquitectura de plugin modular** con handlers especializados que proporcionan:

- 📺 **Medición detallada de reproducción** - Tracking completo de eventos de video
- 🎯 **Gestión de anuncios** - Soporte para pre-roll, mid-roll y post-roll
- 📊 **Métricas de calidad** - Monitoreo de bitrate, resolución y audio
- 🔄 **Gestión de estados** - Control centralizado de transiciones
- ❌ **Manejo de errores** - Recovery automático y reporting
- 📱 **Estados de aplicación** - Tracking de foreground/background

#### **Arquitectura del Plugin**

El sistema utiliza el **ComscorePlugin** como punto de entrada principal, que coordina múltiples handlers especializados:

```typescript
import { ComscorePlugin } from 'react-native-comscore';

// Inicialización del plugin
const plugin = new ComscorePlugin({
  publisherId: 'your-publisher-id',
  applicationName: 'your-app-name',
  metadata: initialMetadata,
  debug: __DEV__
});

// Uso básico
plugin.play();
plugin.pause();
plugin.stop();
```

📋 **[Documentación Completa del Plugin](src/plugin/README.md)** - Guía completa de configuración y uso del ComscorePlugin

#### **Sistema de Handlers Especializados**

Cada aspecto del tracking es manejado por handlers especializados que trabajan de forma coordinada:

| Handler | Responsabilidad | Documentación |
|---------|----------------|--------------|
| 📺 **Advertisement** | Gestión de anuncios y breaks publicitarios | [Ver documentación](src/handlers/README.advertisementHandler.md) |
| 📱 **Application** | Estados de aplicación (foreground/background) | [Ver documentación](src/handlers/README.applicationHandler.md) |
| ❌ **Error** | Manejo de errores y recovery | [Ver documentación](src/handlers/README.errorHandler.md) |
| 📋 **Metadata** | Gestión y sincronización de metadatos | [Ver documentación](src/handlers/README.metadataHandler.md) |
| ▶️ **Playback** | Control de reproducción (play, pause, seek) | [Ver documentación](src/handlers/README.playbackHandler.md) |
| 🎛️ **Quality** | Calidad, bitrate, audio y subtítulos | [Ver documentación](src/handlers/README.qualityHandler.md) |

🏗️ **[Documentación del Sistema de Handlers](src/handlers/README.md)** - Visión general de la arquitectura y coordinación entre handlers

#### **Gestión Centralizada de Estados**

El sistema incluye un gestor centralizado de estados que coordina todas las transiciones:

```typescript
// Los estados se gestionan automáticamente
plugin.play();        // INITIALIZED → VIDEO
plugin.handleAdBegin(); // VIDEO → ADVERTISEMENT
plugin.pause();       // ADVERTISEMENT → PAUSED_AD
plugin.handleAdEnd(); // PAUSED_AD → VIDEO
```

🔄 **[Documentación del State Manager](src/handlers/README.stateManager.md)** - Gestión centralizada de estados y transiciones

🏭 **[Documentación del State Manager Factory](src/handlers/README.stateManagerFactory.md)** - Factory para crear gestores optimizados por entorno

#### **Integración**

El player dispone de un gestor de plugins de analíticas totalmente integrado con este plugin. Revisar la documentación del propio player.

📚 **[Documentación del Player](https://github.com/startcat/react-native-video)** - Player con gestor de plugins de analíticas

```typescript
// Plugins de analíticas
const analyticsPlugins = useRef<PlayerAnalyticsPlugin[]>();

// Creamos los plugins de analyticas a partir de los datos del contenido
analyticsPlugins.current = AnalyticsPluginFactory.createPlugins(responseJson, {
    plugins: {
        comscore: {
            enabled: true,
        },
    },
    debug: true,
    environment: 'dev', // | 'staging' | 'prod';
});

// Componente Player
<Player
    // Player Features
    features={{
        analyticsConfig: analyticsPlugins.current,
    }}
/>
```



#### **Configuración Avanzada**

##### Tipos y Configuración

El sistema incluye definiciones TypeScript completas para todos los componentes:

📚 **[Documentación de Tipos](src/types/README.md)** - Interfaces, tipos y configuraciones disponibles

##### Sistema de Logging

Logging integrado para debugging y monitoreo:

📝 **[Documentación del Logger](src/logger/README.md)** - Sistema de logging y debugging

---

Creado con [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
