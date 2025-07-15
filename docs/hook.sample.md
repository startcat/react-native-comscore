# Ejemplo de Hook useComScore

Este documento muestra un ejemplo completo de implementación de un hook personalizado para gestionar ComScore Analytics en una aplicación React Native.

## Implementación del Hook

```typescript
import { useEffect } from 'react';
import { updatePersistentLabels } from 'react-native-comscore';
import Config from 'react-native-config';
import { useSelector } from 'react-redux'; // o tu gestor de estado preferido

export const useComScore = () => {
  // Obtener datos del usuario desde tu sistema de gestión de estado
  // Esto dependerá de cómo manejes la autenticación en tu proyecto
  const user = useSelector(userSelector); // Adaptar según tu implementación

  useEffect(() => {
    console.log(`[ComScore] User ${JSON.stringify(user)}`);

    if (Config.COMSCORE_PUBLISHER_ID && user) {
      // Usuario autenticado - enviar datos de usuario logueado
      const cs_fpdm = calculateFpdm(user.birthdate); // o "*null" si no tienes fecha de nacimiento

      updatePersistentLabels(
        Config.COMSCORE_PUBLISHER_ID,
        user.id, // ID único del usuario
        'li', // Login status: "li" = logged in
        cs_fpdm, // First Party Data Mapping
        '01' // Versión del esquema de datos
      );
    } else if (Config.COMSCORE_PUBLISHER_ID) {
      // Usuario no autenticado - usar ID de sesión anónima
      updatePersistentLabels(
        Config.COMSCORE_PUBLISHER_ID,
        getSessionId(), // Función para obtener ID de sesión único
        'lo', // Login status: "lo" = logged out
        '*null', // No hay datos demográficos
        '01' // Versión del esquema de datos
      );
    }
  }, [user]);

  // Función para calcular el First Party Data Mapping (FPDM)
  const calculateFpdm = (birthdate: string | undefined) => {
    let result = '*null';

    if (birthdate) {
      const birthdateObj = new Date(birthdate);
      const today = new Date();
      const fix = 19991999999; // Constante de ofuscación de ComScore
      const ageGroup = '00'; // Grupo de edad (personalizable)
      const gender = '0'; // Género: 0=desconocido, 1=masculino, 2=femenino

      // Validar la fecha y calcular la edad
      const isValidDate = !isNaN(birthdateObj.getTime());
      let age = today.getFullYear() - birthdateObj.getFullYear();
      const monthDiff = today.getMonth() - birthdateObj.getMonth();

      // Ajustar la edad si aún no ha pasado el cumpleaños este año
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthdateObj.getDate())
      ) {
        age--;
      }

      // Solo procesar si es mayor de edad (18+ años)
      if (isValidDate && age > 17) {
        console.log(`[ComScore] FPDM User age: ${age}`);

        // Formatear fecha como YYYYMMDD + ageGroup + gender
        const year = birthdateObj.getFullYear().toString();
        const month = (birthdateObj.getMonth() + 1).toString().padStart(2, '0');
        const day = birthdateObj.getDate().toString().padStart(2, '0');
        const strBirthMap = `${year}${month}${day}${ageGroup}${gender}`;

        // Aplicar algoritmo de ofuscación de ComScore
        result = (Number(strBirthMap) + fix).toString();
      }
    }

    return result;
  };

  // Función auxiliar para obtener ID de sesión (implementar según tu proyecto)
  const getSessionId = () => {
    // Ejemplo: generar un ID único de sesión
    // En tu proyecto podrías usar AsyncStorage, un generador UUID, etc.
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };
};
```

## Explicación del Hook

### 1. **Gestión de Estado del Usuario**

```typescript
const user = useSelector(userSelector);
```

- Obtiene los datos del usuario desde tu sistema de gestión de estado
- Adapta `userSelector` según tu implementación (Redux, Context, Zustand, etc.)

### 2. **Actualización de Etiquetas Persistentes**

El hook llama a `updatePersistentLabels` con diferentes parámetros según el estado del usuario:

#### Usuario Autenticado (`user` existe):

- **Publisher ID**: Tu ID de publisher de ComScore
- **User ID**: ID único del usuario logueado
- **Login Status**: `"li"` (logged in)
- **FPDM**: Datos demográficos calculados o `"*null"`
- **Schema Version**: `"01"`

#### Usuario No Autenticado:

- **Publisher ID**: Tu ID de publisher de ComScore
- **Session ID**: ID de sesión anónima
- **Login Status**: `"lo"` (logged out)
- **FPDM**: `"*null"` (sin datos demográficos)
- **Schema Version**: `"01"`

### 3. **Cálculo del FPDM (First Party Data Mapping)**

La función `calculateFpdm` genera un hash ofuscado de los datos demográficos:

- **Validación de edad**: Solo procesa usuarios mayores de 18 años
- **Formato de fecha**: YYYYMMDD + grupo de edad + género
- **Ofuscación**: Aplica el algoritmo de ComScore (suma constante fija)

## Adaptación a Tu Proyecto

Para usar este hook en tu proyecto, adapta las siguientes partes:

### 1. **Gestor de Estado**

```typescript
// Cambia esto según tu implementación
const user = useSelector(userSelector);

// Ejemplos alternativos:
// const user = useContext(UserContext);
// const user = useAuthStore(state => state.user);
// const { user } = useAuth();
```

### 2. **Estructura de Datos del Usuario**

```typescript
// Adapta según la estructura de tu objeto usuario
user.id; // ID único del usuario
user.birthdate; // Fecha de nacimiento (opcional)
```

### 3. **Generación de ID de Sesión**

```typescript
// Implementa según tus necesidades
const getSessionId = () => {
  // Opción 1: AsyncStorage
  // return await AsyncStorage.getItem('sessionId');

  // Opción 2: UUID
  // return uuid.v4();

  // Opción 3: Timestamp + random
  return Date.now().toString() + Math.random().toString(36).substring(2);
};
```

## Uso del Hook

```typescript
// En tu componente principal o provider
import { useComScore } from './hooks/useComScore';

export const App = () => {
    // El hook se ejecutará automáticamente cuando cambie el estado del usuario
    useComScore();

    return (
        <YourAppContent />
    );
};
```

## Consideraciones

- **Privacidad**: El FPDM solo se calcula para usuarios mayores de edad
- **Consentimiento**: Asegúrate de tener el consentimiento del usuario antes de procesar datos
- **Validación**: El hook incluye validaciones para fechas y edad
- **Logging**: Incluye logs para debug (eliminar en producción si es necesario)
