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

#### MainActivity.kt

Modifica el archivo `android/app/src/main/java/.../MainActivity.kt` para inicializar ComScore en la función `onCreate`:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Inicialización de ComScore
    cat.start.comscore.init(this, BuildConfig.COMSCORE_PUBLISHER_ID, BuildConfig.COMSCORE_APPLICATION)
}
```

### Configuración iOS

#### AppDelegate.mm

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

#### Opciones de Configuración

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

#### Uso Básico

Para ver un ejemplo completo de uso mediante un hook personalizado, consulta:

📋 **[Ejemplo de Hook de ComScore](docs/hook.sample.md)**

### 2. ComScore Streaming Tag - Player OTT

Funcionalidad especializada para el tracking de contenido de video streaming y reproductores OTT (Over-The-Top). Esta implementación permite:

- Medición detallada de reproducción de video
- Tracking de eventos de streaming (play, pause, buffer, etc.)
- Métricas de calidad de reproducción
- Análisis de audiencia para contenido OTT

#### Gestión de Eventos

El Player OTT debe gestionar diversos eventos durante la reproducción de contenido. Para obtener información detallada sobre todos los eventos disponibles y su implementación, consulta:

**[Documentación de Eventos del Player OTT](docs/events.md)**

#### Configuración para Streaming

La implementación de ComScore Streaming Tag requiere la creación de plugins personalizados que mapeen los datos de tu contenido a los metadatos requeridos por ComScore.

Para ver ejemplos completos de implementación, consulta:

📋 **[Ejemplo de Plugin ComScore Streaming Tag](docs/plugin.sample.md)** - Muestra cómo crear un plugin personalizado que adapta los datos de tu proyecto a ComScore

📋 **[Ejemplo de Gestor de Plugins](docs/plugin.manager.sample.md)** - Hook para gestionar múltiples plugins de analíticas y vincularlos con eventos del Player OTT

---

Creado con [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
