# Guía de Contribución - ACRILCARD

¡Gracias por tu interés en contribuir a ACRILCARD! Esta guía te ayudará a entender cómo puedes contribuir al proyecto de manera efectiva.

## 📋 Tabla de Contenidos

- [Cómo Contribuir](#-cómo-contribuir)
- [Proceso de Desarrollo](#-proceso-de-desarrollo)
- [Estándares de Código](#-estándares-de-código)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Pull Requests](#-pull-requests)
- [Issues](#-issues)

## 🎯 Cómo Contribuir

### 1. Fork el Repositorio
```bash
# Fork en GitHub (usando la interfaz web)
# Luego clona tu fork
git clone https://github.com/TU-USUARIO/Acril-Card-control.git
cd Acril-Card-control
```

### 2. Configura tu Entorno
```bash
# Instala dependencias
npm install

# Configura git hooks
npm run prepare

# Ejecuta tests para verificar todo funciona
npm test
```

### 3. Crea una Rama
```bash
# Crea una rama descriptiva para tu feature
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
# o
git checkout -b docs/actualizacion-documentacion
```

### 4. Haz tus Cambios

Sigue los estándares de código y asegúrate de:
- ✅ Escribir tests para nueva funcionalidad
- ✅ Actualizar documentación si es necesario
- ✅ Seguir las convenciones de commit
- ✅ Mantener la accesibilidad (WCAG 2.1 AA)

### 5. Commit y Push
```bash
# Haz commits siguiendo las convenciones
git add .
git commit -m "feat: añadir nueva funcionalidad"

# Push a tu rama
git push origin feature/nueva-funcionalidad
```

### 6. Crea un Pull Request
1. Ve a GitHub y crea un Pull Request
2. Describe claramente tus cambios
3. Referencia issues relacionados
4. Espera review y feedback

## 🔄 Proceso de Desarrollo

### Metodología
Usamos **Feature-Driven Development** con elementos de **Agile**:

1. **Planificación** - Identificar el problema/solución
2. **Implementación** - Desarrollar la funcionalidad
3. **Testing** - Escribir y ejecutar tests
4. **Review** - Code review y feedback
5. **Merge** - Integración a la rama principal

### Ramas de Git
- `main` - Rama principal (production)
- `develop` - Rama de desarrollo (staging)
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Correcciones de bugs
- `docs/*` - Cambios en documentación
- `refactor/*` - Refactorizaciones

### Ciclo de Vida de Issues
1. **Open** - Issue creada y esperando asignación
2. **In Progress** - Alguien está trabajando en ella
3. **Review** - Lista para code review
4. **Testing** - En proceso de testing
5. **Closed** - Completada y cerrada

## 📝 Estándares de Código

### JavaScript/React
```javascript
// ✅ Buenas prácticas
const MyComponent = React.memo(({ prop1, prop2 }) => {
  // Usa hooks en el orden correcto
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  // useCallback para funciones estables
  const handleClick = useCallback(() => {
    setState(prev => prev + 1);
  }, []);

  // useMemo para cálculos costosos
  const computedValue = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  // useEffect con dependencias correctas
  useEffect(() => {
    // Lógica del efecto
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  return (
    <div className="container">
      {/* JSX limpio y legible */}
      <button onClick={handleClick}>
        Click me
      </button>
    </div>
  );
});

// ❌ Malas prácticas - EVITA
const BadComponent = () => {
  const [count, setCount] = useState(0);

  // No uses hooks condicionales
  if (condition) {
    useEffect(() => {}, []);
  }

  // No uses hooks en loops
  for (let i = 0; i < 10; i++) {
    useState(i); // ❌ Mal
  }

  return <div>{/* JSX */}</div>;
};
```

### Convenciones de Nombres
```javascript
// ✅ Componentes
const CustomerList = () => {};        // PascalCase
const customerForm = () => {};        // ❌ camelCase

// ✅ Hooks
const useCustomerData = () => {};     // use + PascalCase
const getCustomerData = () => {};     // ❌ No uses use si no es hook

// ✅ Variables y funciones
const customerData = {};              // camelCase
const MAX_CUSTOMERS = 100;            // SCREAMING_SNAKE_CASE para constantes
const isLoading = true;               // camelCase para booleanos
```

### Props y Componentes
```jsx
// ✅ Props con destructuring
const CustomerCard = ({ customer, onSelect, className }) => {
  return (
    <div className={className} onClick={() => onSelect(customer)}>
      {/* Contenido */}
    </div>
  );
};

// ✅ PropTypes (recomendado)
CustomerCard.propTypes = {
  customer: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  className: PropTypes.string
};

// ✅ Default Props
CustomerCard.defaultProps = {
  className: ''
};
```

### Manejo de Errores
```javascript
// ✅ Try-catch en operaciones asíncronas
const fetchCustomer = async (id) => {
  try {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw new Error('No se pudo cargar el cliente');
  }
};

// ✅ Error boundaries para componentes
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## 🧪 Testing

### Estructura de Tests
```
src/components/test/
├── CustomerContext.test.jsx      # Tests para Context
├── CustomerForm.test.jsx         # Tests para formularios
├── JsonImportExport.test.jsx     # Tests para utilidades
├── Accessibility.test.jsx        # Tests de accesibilidad
└── PWA.test.jsx                  # Tests de PWA
```

### Convenciones de Testing
```jsx
// ✅ Tests descriptivos
describe('CustomerForm', () => {
  test('debe mostrar errores para campos vacíos', async () => {
    // Arrange
    render(<CustomerForm />);

    // Act
    fireEvent.click(screen.getByText('Guardar'));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });
  });

  test('debe guardar cliente válido', async () => {
    // Arrange
    render(<CustomerForm />);
    const nameInput = screen.getByLabelText('Nombre *');

    // Act
    fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
    fireEvent.click(screen.getByText('Guardar'));

    // Assert
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Juan Pérez'
      }));
    });
  });
});
```

### Testing de Accesibilidad
```jsx
// ✅ Tests de accesibilidad
test('debe ser accesible para screen readers', () => {
  render(<CustomerForm />);

  // Verificar ARIA labels
  expect(screen.getByLabelText('Nombre *')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();

  // Verificar navegación por teclado
  const form = screen.getByRole('form');
  expect(form).toHaveAttribute('aria-label');
});
```

### Testing de PWA
```jsx
// ✅ Tests de PWA
test('debe registrar service worker correctamente', () => {
  // Mock service worker
  const mockRegistration = { scope: '/' };
  navigator.serviceWorker.register = jest.fn().mockResolvedValue(mockRegistration);

  // Verificar registro
  expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
});
```

## 📚 Documentación

### Comentarios en Código
```javascript
/**
 * Hook personalizado para gestión de accesibilidad
 * @returns {Object} Objeto con preferencias y funciones de actualización
 */
const useAccessibility = () => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium'
  });

  // Detectar preferencias del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e) => {
      setPreferences(prev => ({
        ...prev,
        reducedMotion: e.matches
      }));
    };

    // Agregar listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { preferences, updatePreference };
};
```

### Documentación de Componentes
```jsx
/**
 * Componente para mostrar la lista de clientes
 * @param {Object} props - Props del componente
 * @param {number} [props.stampsPerReward=10] - Sellos necesarios por premio
 * @param {Function} [props.onCustomerSelect] - Callback cuando se selecciona un cliente
 * @param {string} [props.className] - Clases CSS adicionales
 * @returns {JSX.Element} Elemento React
 */
const CustomerList = ({ stampsPerReward = 10, onCustomerSelect, className }) => {
  // Componente implementation
};
```

## 🔄 Pull Requests

### Título del PR
```
feat: añadir sistema de notificaciones push
fix: corregir error en validación de formularios
docs: actualizar documentación de API
```

### Descripción del PR
```markdown
## Descripción
Breve descripción de los cambios realizados y por qué son necesarios.

## Cambios Realizados
- ✅ Añadida funcionalidad X
- ✅ Corregido bug Y
- ✅ Mejorada performance Z

## Tests Añadidos
- Test para nueva funcionalidad X
- Test de regresión para Y

## Screenshots
[Si aplica, añadir capturas de pantalla]

## Issues Relacionadas
Closes #123
Relacionado con #456
```

### Checklist para PR
- [ ] ✅ Tests escritos y pasan
- [ ] ✅ Linting sin errores
- [ ] ✅ Accesibilidad verificada
- [ ] ✅ Documentación actualizada
- [ ] ✅ Código revisado por al menos 1 desarrollador
- [ ] ✅ No breaking changes sin justificación

## 🎯 Issues

### Crear un Issue
1. **Título descriptivo**: "Error al cargar clientes" en lugar de "Ayuda"
2. **Descripción clara**: Incluye pasos para reproducir, comportamiento esperado vs actual
3. **Labels apropiadas**: `bug`, `feature`, `documentation`, `help wanted`
4. **Screenshots**: Si aplica, añade imágenes del problema

### Templates de Issues

#### Bug Report
```markdown
## Descripción del Bug
Describe claramente qué está mal.

## Pasos para Reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

## Comportamiento Esperado
Lo que debería pasar.

## Comportamiento Actual
Lo que realmente pasa.

## Entorno
- OS: Windows 10
- Browser: Chrome 120
- Versión: 1.2.0

## Screenshots
[Adjuntar imágenes]
```

#### Feature Request
```markdown
## Descripción de la Funcionalidad
Describe la nueva funcionalidad que quieres.

## Casos de Uso
- Caso de uso 1
- Caso de uso 2

## Beneficios
- Beneficio 1
- Beneficio 2

## Alternativas Consideradas
- Alternativa 1
- Alternativa 2

## Información Adicional
Cualquier otra información relevante.
```

## 🚀 Mejores Prácticas

### Desarrollo
- **Escribe tests primero** (TDD cuando sea posible)
- **Mantén componentes pequeños** (< 200 líneas)
- **Usa TypeScript** para nuevos proyectos
- **Implementa accesibilidad** desde el principio
- **Haz code reviews** antes de merge

### Commits
- **Commits atómicos** - Un cambio por commit
- **Mensajes descriptivos** - Explica el "por qué", no solo el "qué"
- **Referencia issues** - "Fixes #123" o "Closes #456"
- **Usa conventional commits** - Para automatización

### Code Review
- **Sé constructivo** - Enfócate en el código, no en la persona
- **Pregunta antes de criticar** - "¿Has considerado X?"
- **Sugiere alternativas** - No solo digas "esto está mal"
- **Aprobación requerida** - Al menos 1 approval antes de merge

## 🤝 Código de Conducta

### Comportamiento Esperado
- ✅ Sé respetuoso y considerado
- ✅ Usa lenguaje inclusivo y welcoming
- ✅ Sé colaborativo y open-minded
- ✅ Enfócate en lo que es mejor para la comunidad
- ✅ Muestra empatía hacia otros miembros

### Comportamiento Inaceptable
- ❌ Lenguaje ofensivo o discriminatorio
- ❌ Ataques personales o trolling
- ❌ Spam o contenido irrelevante
- ❌ Violación de derechos de autor
- ❌ Cualquier forma de acoso

### Reportar Violaciones
Si experimentas o presencias comportamiento inaceptable:
1. Contacta a los mantenedores: dev@acrilcard.com
2. Proporciona evidencia específica
3. Permite tiempo para investigación
4. Respeta la privacidad de todos los involucrados

## 📞 Contacto

### Canales de Comunicación
- **Soporte Técnico**: Para bugs y features
- **Email**: dev@acrilcard.com (para contacto directo)
- **Discusiones**: Para conversaciones generales

### Horarios de Soporte
- **Lunes a Viernes**: 9:00 AM - 6:00 PM (GMT-4)
- **Respuesta**: Dentro de 24-48 horas
- **Issues Críticos**: Respuesta inmediata

## 🎉 Reconocimientos

Gracias a todos los contribuidores que hacen de ACRILCARD un proyecto mejor:

- **Desarrolladores** - Por el código increíble
- **Diseñadores** - Por la experiencia visual
- **Testers** - Por encontrar bugs antes que los usuarios
- **Documentadores** - Por hacer el conocimiento accesible
- **Usuarios** - Por el feedback valioso

---

**¡Feliz Contribución! 🚀**

*Guía de Contribución de ACRILCARD - © 2025*
