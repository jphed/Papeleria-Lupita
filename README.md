# 📊 Dashboard Papelería Lupita

Un dashboard interactivo y analítico para el análisis de ventas e inventario de Papelería Lupita, desarrollado como proyecto académico.

## 📋 Descripción del Proyecto

Este dashboard proporciona una vista completa del rendimiento de ventas de una papelería durante el período de Julio a Septiembre 2024. Incluye análisis de tendencias, categorías, márgenes de ganancia, desempeño de empleados y alertas de inventario.

## ✨ Características Principales

### 📈 Análisis de Ventas
- **Tendencia de Ventas Diarias**: Gráfico de líneas mostrando la evolución de ventas
- **KPIs Principales**: Ventas totales, productos vendidos, margen promedio
- **Día de Mayor Venta**: Identificación del mejor día de ventas

### 🏷️ Análisis por Categorías
- **Ventas por Categoría**: Gráfico de barras comparativo
- **Distribución**: Gráfico de pastel mostrando participación por categoría
- **Productos Más Vendidos**: Ranking de productos por volumen

### 💰 Análisis de Márgenes
- **Top 15 Productos**: Productos con mayor margen de ganancia
- **Tabla Detallada**: Comparación de precios de compra vs venta
- **Código de Colores**: Verde (alto margen), Amarillo (medio), Rojo (bajo)

### 👥 Desempeño de Empleados
- **Comparación de Ventas**: María vs Carlos
- **Métodos de Pago**: Análisis de preferencias de pago
- **Estadísticas Detalladas**: Ventas, transacciones y promedios

### 📦 Gestión de Inventario
- **Alertas de Stock Bajo**: Productos que requieren reorden
- **Niveles Críticos**: Productos con stock cero o por debajo del mínimo
- **Categorización por Urgencia**: Crítico, advertencia, normal

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Gráficos**: Chart.js
- **Datos**: CSV (Comma Separated Values)
- **Estilos**: CSS personalizado + Font Awesome
- **Arquitectura**: Vanilla JavaScript (Sin frameworks)

## 📁 Estructura del Proyecto

```
papeleria/
├── index.html              # Página principal del dashboard
├── dashboard.js            # Lógica principal y manejo de datos
├── styles.css              # Estilos personalizados
├── ventas_papeleria.csv    # Datos de ventas (Julio-Sept 2024)
├── inventario_papeleria.csv # Datos de inventario
├── README.md               # Este archivo
└── .gitignore              # Archivos a ignorar en Git
```

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (Python, Node.js, o similar)

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/jphed/Papeleria-Lupita.git
   cd Papeleria-Lupita
   ```

2. **Inicia un servidor local:**
   
   **Con Python:**
   ```bash
   python -m http.server 8000
   ```
   
   **Con Node.js:**
   ```bash
   npx http-server -p 8000
   ```

3. **Abre tu navegador y visita:**
   ```
   http://localhost:8000
   ```

### ⚠️ Nota Importante
El dashboard debe ejecutarse desde un servidor web local debido a las políticas CORS (Cross-Origin Resource Sharing) del navegador. No se puede abrir directamente el archivo HTML.

## 📊 Datos del Dashboard

### Período de Análisis
- **Fechas**: Julio - Septiembre 2024
- **Ubicación**: Chihuahua, México
- **Empleados**: María y Carlos

### Categorías de Productos
- Cuadernos
- Escritura
- Adhesivos
- Papel
- Corte
- Arte
- Organización
- Medición
- Electrónicos
- Mochilas
- Libros

### Métodos de Pago
- Efectivo
- Tarjeta
- Transferencia

## 🎯 Funcionalidades Interactivas

- **Navegación por Pestañas**: Cambio entre secciones del dashboard
- **Gráficos Responsivos**: Adaptables a diferentes tamaños de pantalla
- **Datos en Tiempo Real**: Cálculos automáticos de KPIs y estadísticas
- **Alertas Visuales**: Notificaciones de inventario con códigos de color

## 📈 Métricas y KPIs

- **Ventas Totales**: Suma de todas las transacciones
- **Productos Vendidos**: Número total de transacciones
- **Margen Promedio**: Promedio de márgenes de ganancia
- **Alertas de Inventario**: Productos con stock bajo
- **Ticket Promedio**: Valor promedio por transacción
- **Producto Más Vendido**: Item con mayor volumen de ventas

## 🔧 Desarrollo

### Estructura del Código
- **Clase Principal**: `DashboardPapeleria`
- **Métodos Principales**:
  - `cargarDatos()`: Carga de archivos CSV
  - `procesarDatos()`: Procesamiento y limpieza de datos
  - `crearGraficos()`: Generación de todos los gráficos
  - `actualizarKPIs()`: Cálculo de métricas principales

### Personalización
Para adaptar el dashboard a otros datos:
1. Modifica los archivos CSV con tu estructura de datos
2. Ajusta los nombres de columnas en `parseCSV()`
3. Personaliza los colores en `styles.css`
4. Modifica los KPIs en `actualizarKPIs()`

## 📝 Créditos

**Desarrollador:** Jorge Parra  
**Institución:** Instituto Tecnológico de Chihuahua  
**Carrera:** Ingeniería en Tecnologías de la Información y Comunicaciones (ITIC)  
**Matrícula:** 13104  
**Período:** 2024  

### Agradecimientos
- Chart.js por la librería de gráficos
- Font Awesome por los iconos
- Datos de ejemplo basados en operaciones reales de papelería

## 📄 Licencia

Este proyecto es desarrollado con fines educativos y académicos. Todos los derechos reservados.

## 🤝 Contribuciones

Este es un proyecto académico, pero las sugerencias y mejoras son bienvenidas.


---

*Desarrollado con ❤️ para el análisis de datos empresariales*
