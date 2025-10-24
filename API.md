# ACRILCARD - API Documentation

## 📖 Introducción

Esta documentación describe la API interna de ACRILCARD, incluyendo Context API, Custom Hooks, y utilidades disponibles para desarrolladores.

## 🏗️ Arquitectura General

```
┌─────────────────┐
│     React App   │
├─────────────────┤
│   Context API   │ ← Estado global
├─────────────────┤
│ Custom Hooks    │ ← Lógica reutilizable
├─────────────────┤
│   Components    │ ← UI Components
├─────────────────┤
│    Services     │ ← Lógica de negocio
├─────────────────┤
│     Utils       │ ← Utilidades
└─────────────────┘
```

## 🔗 Context API

### CustomerContext

El contexto principal para gestión de clientes.

#### Provider
```jsx
import { CustomerProvider } from './contexts/CustomerContext';

function App() {
  return (
    <CustomerProvider>
      {/* Tu aplicación */}
    </CustomerProvider>
  );
}
```

#### Hook Usage
```jsx
import { useCustomers } from './contexts/CustomerContext';

function MyComponent() {
  const {
    // Estado
    customers,
    selectedCustomer,
    loading,
    searchTerm,
    filterByStamps,
    filterByDate,

    // Acciones
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer,
    clearSelection,

    // Utilidades
    normalizeCustomerIds,
    confirmPrefixFixes
  } = useCustomers();

  // Tu lógica aquí
}
```

#### API Reference

##### Estado
| Prop | Type | Descripción |
|------|------|-------------|
| `customers` | `Array` | Lista completa de clientes |
| `selectedCustomer` | `Object\|null` | Cliente actualmente seleccionado |
| `loading` | `Boolean` | Estado de carga de operaciones |
| `searchTerm` | `String` | Término de búsqueda actual |
| `filterByStamps` | `String` | Filtro por número de sellos |
| `filterByDate` | `String` | Filtro por fecha de última compra |

##### Acciones
| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `addCustomer` | `customerData: Object` | `Promise<Customer>` | Agrega un nuevo cliente |
| `updateCustomer` | `customerId: String, updates: Object` | `Promise<void>` | Actualiza un cliente existente |
| `deleteCustomer` | `customerId: String` | `Promise<void>` | Elimina un cliente |
| `selectCustomer` | `customer: Object` | `void` | Selecciona un cliente |
| `clearSelection` | - | `void` | Limpia la selección actual |

##### Utilidades
| Función | Parámetros | Retorno | Descripción |
|---------|------------|---------|-------------|
| `normalizeCustomerIds` | - | `Promise<void>` | Normaliza IDs de clientes ambiguos |
| `confirmPrefixFixes` | - | `Promise<void>` | Confirma correcciones de prefijos |

### NotificationContext

Contexto para manejo de notificaciones globales.

#### Hook Usage
```jsx
import { useNotification } from './contexts/NotificationContext';

function MyComponent() {
  const {
    showSuccess,
    showError,
    showWarning,
    showInfo
  } = useNotification();

  const handleAction = () => {
    try {
      // Tu lógica
      showSuccess('Operación exitosa!');
    } catch (error) {
      showError('Error en la operación');
    }
  };
}
```

#### API Reference
| Función | Parámetros | Descripción |
|---------|------------|-------------|
| `showSuccess` | `message: String, options?: Object` | Muestra notificación de éxito |
| `showError` | `message: String, options?: Object` | Muestra notificación de error |
| `showWarning` | `message: String, options?: Object` | Muestra notificación de advertencia |
| `showInfo` | `message: String, options?: Object` | Muestra notificación informativa |

## 🪝 Custom Hooks

### useAccessibility

Hook para gestión de preferencias de accesibilidad.

```jsx
import { useAccessibility } from './hooks/useAccessibility';

function MyComponent() {
  const {
    preferences,
    updatePreference,
    isReducedMotion,
    isHighContrast,
    fontSize
  } = useAccessibility();

  return (
    <div className={preferences.reducedMotion ? 'no-animations' : 'with-animations'}>
      {/* Tu componente */}
    </div>
  );
}
```

#### API Reference
| Prop | Type | Descripción |
|------|------|-------------|
| `preferences` | `Object` | Todas las preferencias actuales |
| `updatePreference` | `Function` | Función para actualizar una preferencia |
| `isReducedMotion` | `Boolean` | Si el usuario prefiere reducir movimiento |
| `isHighContrast` | `Boolean` | Si el usuario prefiere alto contraste |
| `fontSize` | `String` | Tamaño de fuente preferido |

### usePWA

Hook para funcionalidades Progressive Web App.

```jsx
import { usePWA } from './hooks/usePWA';

function InstallButton() {
  const {
    isInstallable,
    isInstalled,
    installPWA,
    dismissInstallPrompt
  } = usePWA();

  if (!isInstallable) return null;

  return (
    <button onClick={installPWA}>
      Instalar App
    </button>
  );
}
```

#### API Reference
| Prop | Type | Descripción |
|------|------|-------------|
| `isInstallable` | `Boolean` | Si la app puede ser instalada |
| `isInstalled` | `Boolean` | Si la app ya está instalada |
| `installPWA` | `Function` | Inicia el proceso de instalación |
| `dismissInstallPrompt` | `Function` | Cierra el prompt de instalación |

### useResponsive

Hook para detección de tamaños de pantalla.

```jsx
import { useResponsive } from './hooks/useAccessibility';

function ResponsiveComponent() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    width,
    height
  } = useResponsive();

  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {isDesktop && <DesktopLayout />}
    </div>
  );
}
```

#### API Reference
| Prop | Type | Descripción |
|------|------|-------------|
| `isMobile` | `Boolean` | Si la pantalla es móvil (< 640px) |
| `isTablet` | `Boolean` | Si la pantalla es tablet (640px - 1023px) |
| `isDesktop` | `Boolean` | Si la pantalla es desktop (1024px+) |
| `width` | `Number` | Ancho actual de la pantalla |
| `height` | `Number` | Alto actual de la pantalla |

### useJsonImportExport

Hook para manejo de importación y exportación de datos.

```jsx
import { useJsonImport, useJsonExport } from './hooks/useJsonImportExport';

function DataManagement() {
  const { handleJsonImported } = useJsonImport();
  const { exportCustomersToJSON } = useJsonExport();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        handleJsonImported(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      <button onClick={exportCustomersToJSON}>
        Exportar Datos
      </button>
    </div>
  );
}
```

## 🧩 Componentes Principales

### CustomerList

Lista de clientes con filtros y búsqueda.

#### Props
```jsx
interface CustomerListProps {
  stampsPerReward?: number;      // Sellos necesarios por premio
  onCustomerSelect?: (customer: Customer) => void; // Callback selección
}
```

#### Ejemplo de Uso
```jsx
import CustomerList from './components/CustomerList';

function ClientManagement() {
  const [selectedClient, setSelectedClient] = useState(null);

  return (
    <CustomerList
      stampsPerReward={10}
      onCustomerSelect={setSelectedClient}
    />
  );
}
```

### CustomerDetails

Vista detallada del cliente seleccionado.

#### Props
```jsx
interface CustomerDetailsProps {
  customer: Customer;                    // Cliente a mostrar
  stampsPerReward?: number;             // Sellos por premio
  onEdit?: () => void;                  // Callback para editar
  onDelete?: (customerId: string) => void; // Callback para eliminar
  onClose?: () => void;                 // Callback para cerrar
}
```

### CustomerForm

Formulario para agregar nuevos clientes.

#### Ejemplo de Uso
```jsx
import CustomerForm from './components/CustomerForm';

function AddClientPage() {
  return (
    <div className="max-w-md mx-auto">
      <CustomerForm />
    </div>
  );
}
```

### LoyaltyCardSystem

Componente principal del sistema de fidelización.

#### Props
```jsx
interface LoyaltyCardSystemProps {
  stampsPerReward?: number;      // Configuración de sellos
  setStampsPerReward?: (value: number) => void; // Callback para cambiar
}
```

## 🔧 Utilidades

### Lógica de Negocio

#### generateCustomerCode
Genera códigos únicos para clientes.

```javascript
import { generateCustomerCode } from './utils/logic';

const code = generateCustomerCode(idType, idNumber, name, existingCustomers);
// Retorna: "ABC12345"
```

#### digitsOnly
Extrae solo dígitos de una cadena.

```javascript
import { digitsOnly } from './utils/logic';

const cleanPhone = digitsOnly("0414-123-4567");
// Retorna: "04141234567"
```

#### normalizeStr
Normaliza cadenas para búsqueda.

```javascript
import { normalizeStr } from './utils/logic';

const normalized = normalizeStr("José María");
// Retorna: "jose maria"
```

#### getProgressPercentage
Calcula el porcentaje de progreso de sellos.

```javascript
import { getProgressPercentage } from './utils/logic';

const progress = getProgressPercentage(currentStamps, stampsPerReward);
// Retorna: 75 (para 7.5/10 sellos)
```

### WhatsApp Integration

#### enviarTarjetaPorWhatsApp
Envía tarjeta de cliente por WhatsApp.

```javascript
import { enviarTarjetaPorWhatsApp } from './utils/whatsapp';

enviarTarjetaPorWhatsApp(phone, name, customerId, cardData);
```

## 📊 Servicios

### customerStore

Módulo para gestión de datos de clientes.

#### Funciones Disponibles
```javascript
import {
  createCustomer,
  deleteCustomerRecord,
  updateCustomerRecord
} from './services/customerStore';

// Crear cliente
const customer = await createCustomer(customerData);

// Eliminar cliente
await deleteCustomerRecord(customerId);

// Actualizar cliente
await updateCustomerRecord(customerId, updates);
```

## 🎨 Estilos y Theming

### Tailwind CSS

El proyecto utiliza Tailwind CSS con configuración personalizada.

#### Configuración Personalizada
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#dc2626',    // Rojo ACRILCARD
        secondary: '#fbbf24',  // Amarillo dorado
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

#### Clases Utilitarias Comunes
```jsx
// Colores de marca
className="bg-primary text-white"        // Fondo rojo ACRILCARD
className="text-secondary border-secondary" // Texto amarillo con borde

// Espaciado consistente
className="p-4 sm:p-6 lg:p-8"           // Padding responsive
className="space-y-4"                   // Espacio vertical entre elementos

// Layout responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
className="flex flex-col sm:flex-row"   // Stack en móvil, row en desktop
```

### Breakpoints

- **sm**: 640px+ (tablets)
- **md**: 768px+ (small desktop)
- **lg**: 1024px+ (large desktop)
- **xl**: 1280px+ (extra large)

## 🚀 Performance

### Lazy Loading

Componentes cargados bajo demanda:

```jsx
const LoyaltyCardSystem = lazy(() =>
  import('./components/LoyaltyCardSystem')
);

const TestErrorHandling = lazy(() =>
  import('./pages/TestErrorHandling')
);
```

### Memoización

Componentes optimizados con memoización:

```jsx
const CustomerItem = React.memo(({ customer, onSelect }) => {
  // Componente optimizado
});

const CustomerStats = React.memo(({ customer, stampsPerReward }) => {
  // Cálculos memoizados
  const progressPercentage = useMemo(() =>
    getProgressPercentage(customer.stamps, stampsPerReward),
    [customer.stamps, stampsPerReward]
  );
});
```

## 🧪 Testing

### Testing Setup

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Estructura de Tests
```
src/components/test/
├── CustomerContext.test.jsx      # Tests para CustomerContext
├── CustomerForm.test.jsx         # Tests para formularios
├── JsonImportExport.test.jsx     # Tests para import/export
└── Accessibility.test.jsx        # Tests de accesibilidad
```

### Ejemplo de Test
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomerProvider } from '../contexts/CustomerContext';

test('debe agregar cliente correctamente', async () => {
  render(
    <CustomerProvider>
      <TestComponent />
    </CustomerProvider>
  );

  fireEvent.click(screen.getByTestId('add-customer'));

  await waitFor(() => {
    expect(screen.getByTestId('customer-count')).toHaveTextContent('1');
  });
});
```

## 🔒 Seguridad

### Validación de Datos
```javascript
// Validación estricta en formularios
const validateCustomer = (customer) => {
  const errors = {};

  if (!customer.name || customer.name.length < 2) {
    errors.name = 'Nombre debe tener al menos 2 caracteres';
  }

  if (!/^\d{8,15}$/.test(customer.phone)) {
    errors.phone = 'Teléfono debe tener entre 8 y 15 dígitos';
  }

  return errors;
};
```

### Sanitización de Entradas
```javascript
// Sanitización automática
const sanitizeInput = (input) => {
  return input.replace(/[<>]/g, ''); // Remover caracteres peligrosos
};
```

## 📱 PWA Configuration

### Manifest.json
```json
{
  "name": "ACRILCARD - Sistema de Fidelización",
  "short_name": "ACRILCARD",
  "description": "Sistema de fidelización PWA",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#dc2626",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
- **Cache First**: Assets estáticos
- **Network First**: Datos dinámicos
- **Stale While Revalidate**: Contenido mixto
- **Background Sync**: Sincronización offline

## 🔧 Development Guidelines

### Convenciones de Código
```javascript
// ✅ Buenas prácticas
const MyComponent = React.memo(({ prop1, prop2 }) => {
  const handleClick = useCallback(() => {
    // Lógica
  }, [dependencies]);

  const computedValue = useMemo(() => {
    // Cálculo costoso
  }, [dependencies]);

  return <div>{/* JSX */}</div>;
});
```

### Estructura de Carpetas
```
components/
├── common/          # Componentes compartidos
├── [Feature]/       # Componentes específicos
└── test/           # Tests de componentes

hooks/              # Custom hooks
contexts/           # Context API
utils/              # Utilidades puras
services/           # Lógica de negocio
```

### Commit Conventions
```
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato de código
refactor: refactorización
perf: optimización de performance
test: tests
chore: mantenimiento
```

## 🚀 Deployment

### Build de Producción
```bash
npm run build
```

### Configuración de Entorno
```env
REACT_APP_API_URL=https://api.acrilcard.com
REACT_APP_VERSION=1.2.0
REACT_APP_ENVIRONMENT=production
REACT_APP_PWA_ENABLED=true
```

### Hosting Options
- **Netlify**: Deploy automático con PWA
- **Vercel**: Optimizaciones automáticas
- **AWS S3 + CloudFront**: Control total
- **Firebase Hosting**: Con backend opcional

## 📞 Support

Para soporte técnico o preguntas sobre la API:

- **Email**: dev@acrilcard.com
- **Soporte Técnico**: Para bugs y features
- **Documentación**: [docs.acrilcard.com](https://docs.acrilcard.com)

---

**ACRILCARD API Documentation - © 2025**
