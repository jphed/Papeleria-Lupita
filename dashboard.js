// Dashboard para Papelería Lupita
// Análisis de ventas e inventario Julio-Septiembre 2024

class DashboardPapeleria {
    constructor() {
        this.ventasData = [];
        this.inventarioData = [];
        this.charts = {};
        this.datosFiltrados = null;
        this.init();
    }

    // Inicialización del dashboard
    async init() {
        try {
            // Cargar datos CSV
            await this.cargarDatos();
            
            // Procesar datos
            this.procesarDatos();
            
            // Crear gráficos
            this.crearGraficos();
            
            // Actualizar KPIs
            this.actualizarKPIs();
            
            // Configurar navegación y filtros
            this.configurarNavegacion();
            this.configurarFiltros();
            
            console.log('Dashboard inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            this.mostrarError('Error al cargar los datos del dashboard');
        }
    }

    // Función para cargar datos CSV
    async cargarDatos() {
        try {
            // Cargar datos de ventas
            const ventasResponse = await fetch('ventas_papeleria.csv');
            const ventasText = await ventasResponse.text();
            this.ventasData = this.parseCSV(ventasText);
            
            // Cargar datos de inventario
            const inventarioResponse = await fetch('inventario_papeleria.csv');
            const inventarioText = await inventarioResponse.text();
            this.inventarioData = this.parseCSV(inventarioText);
            
            console.log('Datos cargados:', {
                ventas: this.ventasData.length,
                inventario: this.inventarioData.length
            });
        } catch (error) {
            console.error('Error al cargar archivos CSV:', error);
            throw error;
        }
    }

    // Parsear CSV a array de objetos
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            
            data.push(row);
        }
        
        return data;
    }

    // Procesar datos para análisis
    procesarDatos() {
        // Procesar datos de ventas
        this.ventasData = this.ventasData.map(venta => ({
            ...venta,
            fecha: new Date(venta.fecha),
            cantidad: parseInt(venta.cantidad),
            precio_unitario: parseFloat(venta.precio_unitario),
            total: parseFloat(venta.total)
        }));

        // Procesar datos de inventario
        this.inventarioData = this.inventarioData.map(item => ({
            ...item,
            precio_compra: parseFloat(item.precio_compra),
            precio_venta: parseFloat(item.precio_venta),
            stock_actual: parseInt(item.stock_actual),
            stock_minimo: parseInt(item.stock_minimo),
            margen: ((parseFloat(item.precio_venta) - parseFloat(item.precio_compra)) / parseFloat(item.precio_compra)) * 100
        }));

        // Ordenar ventas por fecha
        this.ventasData.sort((a, b) => a.fecha - b.fecha);
    }

    // Crear todos los gráficos
    crearGraficos() {
        this.crearGraficoVentasTrend();
        this.crearGraficoCategorias();
        this.crearGraficoCategoriasPie();
        this.crearGraficoMargenes();
        this.crearGraficoEmpleados();
        this.crearGraficoMetodosPago();
        this.crearAlertasInventario();
    }

    // Gráfico de tendencia de ventas diarias
    crearGraficoVentasTrend() {
        const canvas = document.getElementById('ventasTrendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Agrupar ventas por día
        const ventasPorDia = {};
        this.ventasData.forEach(venta => {
            const fechaKey = venta.fecha.toISOString().split('T')[0];
            if (!ventasPorDia[fechaKey]) {
                ventasPorDia[fechaKey] = 0;
            }
            ventasPorDia[fechaKey] += venta.total;
        });

        const fechas = Object.keys(ventasPorDia).sort();
        const montos = fechas.map(fecha => ventasPorDia[fecha]);

        // Encontrar día con mayor venta
        const maxVenta = Math.max(...montos);
        const diaMaxVenta = fechas[montos.indexOf(maxVenta)];
        const diaMayorVentaElement = document.getElementById('diaMayorVenta');
        if (diaMayorVentaElement) {
            diaMayorVentaElement.textContent = 
                `${new Date(diaMaxVenta).toLocaleDateString('es-MX')}: $${maxVenta.toFixed(2)}`;
        }

        this.charts.ventasTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fechas.map(fecha => new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })),
                datasets: [{
                    label: 'Ventas Diarias',
                    data: montos,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolución de Ventas Diarias'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de desempeño por categoría
    crearGraficoCategorias() {
        const canvas = document.getElementById('categoriasChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Agrupar ventas por categoría
        const ventasPorCategoria = {};
        this.ventasData.forEach(venta => {
            if (!ventasPorCategoria[venta.categoria]) {
                ventasPorCategoria[venta.categoria] = 0;
            }
            ventasPorCategoria[venta.categoria] += venta.total;
        });

        const categorias = Object.keys(ventasPorCategoria);
        const montos = Object.values(ventasPorCategoria);

        this.charts.categorias = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categorias,
                datasets: [{
                    label: 'Ventas por Categoría',
                    data: montos,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ventas por Categoría'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de pastel de categorías
    crearGraficoCategoriasPie() {
        const canvas = document.getElementById('categoriasPieChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Agrupar ventas por categoría
        const ventasPorCategoria = {};
        this.ventasData.forEach(venta => {
            if (!ventasPorCategoria[venta.categoria]) {
                ventasPorCategoria[venta.categoria] = 0;
            }
            ventasPorCategoria[venta.categoria] += venta.total;
        });

        const categorias = Object.keys(ventasPorCategoria);
        const montos = Object.values(ventasPorCategoria);

        this.charts.categoriasPie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categorias,
                datasets: [{
                    data: montos,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(168, 85, 247, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución por Categoría'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Gráfico de márgenes de ganancia
    crearGraficoMargenes() {
        const canvas = document.getElementById('margenesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Ordenar productos por margen
        const productosConMargen = this.inventarioData
            .sort((a, b) => b.margen - a.margen)
            .slice(0, 15); // Top 15 productos

        this.charts.margenes = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: productosConMargen.map(p => p.producto.length > 15 ? p.producto.substring(0, 15) + '...' : p.producto),
                datasets: [{
                    label: 'Margen de Ganancia (%)',
                    data: productosConMargen.map(p => p.margen),
                    backgroundColor: productosConMargen.map(p => 
                        p.margen > 50 ? 'rgba(16, 185, 129, 0.8)' : 
                        p.margen > 30 ? 'rgba(245, 158, 11, 0.8)' : 
                        'rgba(239, 68, 68, 0.8)'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 15 Productos por Margen de Ganancia'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });

        // Llenar tabla de márgenes
        this.llenarTablaMargenes();
    }

    // Llenar tabla de márgenes
    llenarTablaMargenes() {
        const tbody = document.getElementById('margenesTableBody');
        if (!tbody) return;
        
        const productosOrdenados = this.inventarioData
            .sort((a, b) => b.margen - a.margen)
            .slice(0, 10);

        tbody.innerHTML = productosOrdenados.map(producto => `
            <tr>
                <td>${producto.producto}</td>
                <td>${producto.categoria}</td>
                <td>$${producto.precio_compra.toFixed(2)}</td>
                <td>$${producto.precio_venta.toFixed(2)}</td>
                <td>$${(producto.precio_venta - producto.precio_compra).toFixed(2)}</td>
                <td class="${producto.margen > 50 ? 'high-margin' : producto.margen > 30 ? 'medium-margin' : 'low-margin'}">
                    ${producto.margen.toFixed(1)}%
                </td>
            </tr>
        `).join('');
    }

    // Gráfico de comparación de empleados
    crearGraficoEmpleados() {
        const canvas = document.getElementById('empleadosChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Agrupar ventas por empleado
        const ventasPorEmpleado = {};
        const transaccionesPorEmpleado = {};
        
        this.ventasData.forEach(venta => {
            if (!ventasPorEmpleado[venta.vendedor]) {
                ventasPorEmpleado[venta.vendedor] = 0;
                transaccionesPorEmpleado[venta.vendedor] = 0;
            }
            ventasPorEmpleado[venta.vendedor] += venta.total;
            transaccionesPorEmpleado[venta.vendedor]++;
        });

        const empleados = Object.keys(ventasPorEmpleado);
        const montos = Object.values(ventasPorEmpleado);

        this.charts.empleados = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: empleados,
                datasets: [{
                    label: 'Ventas Totales',
                    data: montos,
                    backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ventas por Empleado'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });

        // Actualizar insights de empleados
        this.actualizarInsightsEmpleados(ventasPorEmpleado, transaccionesPorEmpleado);
    }

    // Actualizar insights de empleados
    actualizarInsightsEmpleados(ventasPorEmpleado, transaccionesPorEmpleado) {
        const empleadoTop = Object.keys(ventasPorEmpleado).reduce((a, b) => 
            ventasPorEmpleado[a] > ventasPorEmpleado[b] ? a : b
        );
        
        const empleadoMasTransacciones = Object.keys(transaccionesPorEmpleado).reduce((a, b) => 
            transaccionesPorEmpleado[a] > transaccionesPorEmpleado[b] ? a : b
        );

        // Actualizar estadísticas de empleados usando los IDs correctos del HTML
        const ventasMariaElement = document.getElementById('ventasMaria');
        const transaccionesMariaElement = document.getElementById('transaccionesMaria');
        const promedioMariaElement = document.getElementById('promedioMaria');
        const ventasCarlosElement = document.getElementById('ventasCarlos');
        const transaccionesCarlosElement = document.getElementById('transaccionesCarlos');
        const promedioCarlosElement = document.getElementById('promedioCarlos');

        if (ventasMariaElement) ventasMariaElement.textContent = '$' + (ventasPorEmpleado['Maria'] || 0).toFixed(2);
        if (transaccionesMariaElement) transaccionesMariaElement.textContent = transaccionesPorEmpleado['Maria'] || 0;
        if (promedioMariaElement) {
            const promedioMaria = (ventasPorEmpleado['Maria'] || 0) / (transaccionesPorEmpleado['Maria'] || 1);
            promedioMariaElement.textContent = '$' + promedioMaria.toFixed(2);
        }
        if (ventasCarlosElement) ventasCarlosElement.textContent = '$' + (ventasPorEmpleado['Carlos'] || 0).toFixed(2);
        if (transaccionesCarlosElement) transaccionesCarlosElement.textContent = transaccionesPorEmpleado['Carlos'] || 0;
        if (promedioCarlosElement) {
            const promedioCarlos = (ventasPorEmpleado['Carlos'] || 0) / (transaccionesPorEmpleado['Carlos'] || 1);
            promedioCarlosElement.textContent = '$' + promedioCarlos.toFixed(2);
        }
    }

    // Gráfico de métodos de pago
    crearGraficoMetodosPago() {
        const canvas = document.getElementById('metodosPagoChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Agrupar ventas por método de pago
        const ventasPorMetodo = {};
        this.ventasData.forEach(venta => {
            if (!ventasPorMetodo[venta.metodo_pago]) {
                ventasPorMetodo[venta.metodo_pago] = 0;
            }
            ventasPorMetodo[venta.metodo_pago] += venta.total;
        });

        const metodos = Object.keys(ventasPorMetodo);
        const montos = Object.values(ventasPorMetodo);

        this.charts.metodosPago = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: metodos,
                datasets: [{
                    data: montos,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ventas por Método de Pago'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Crear alertas de inventario
    crearAlertasInventario() {
        const alertasGrid = document.getElementById('alertasGrid');
        if (!alertasGrid) return;
        
        // Filtrar productos con stock bajo
        const productosStockBajo = this.inventarioData.filter(item => 
            item.stock_actual <= item.stock_minimo
        );

        if (productosStockBajo.length === 0) {
            alertasGrid.innerHTML = `
                <div class="alerta-card success">
                    <i class="fas fa-check-circle"></i>
                    <div class="alerta-content">
                        <h4>Todos los productos tienen stock adecuado</h4>
                        <p>No hay productos con stock bajo</p>
                    </div>
                </div>
            `;
            return;
        }

        alertasGrid.innerHTML = productosStockBajo.map(producto => {
            const urgencia = producto.stock_actual === 0 ? 'critical' : 'warning';
            const icono = producto.stock_actual === 0 ? 'fas fa-times-circle' : 'fas fa-exclamation-triangle';
            
            return `
                <div class="alerta-card ${urgencia}">
                    <i class="${icono}"></i>
                    <div class="alerta-content">
                        <h4>${producto.producto}</h4>
                        <p>Stock actual: ${producto.stock_actual} (Mínimo: ${producto.stock_minimo})</p>
                        <p>Categoría: ${producto.categoria}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Actualizar KPIs
    actualizarKPIs() {
        // Calcular KPIs de ventas
        const totalVentas = this.ventasData.reduce((sum, venta) => sum + venta.total, 0);
        const totalTransacciones = this.ventasData.length;
        const ticketPromedio = totalVentas / totalTransacciones;
        
        // Encontrar día con mayor venta
        const ventasPorDia = {};
        this.ventasData.forEach(venta => {
            const fechaKey = venta.fecha.toISOString().split('T')[0];
            if (!ventasPorDia[fechaKey]) {
                ventasPorDia[fechaKey] = 0;
            }
            ventasPorDia[fechaKey] += venta.total;
        });
        
        const maxVenta = Math.max(...Object.values(ventasPorDia));
        
        // Producto más vendido
        const ventasPorProducto = {};
        this.ventasData.forEach(venta => {
            if (!ventasPorProducto[venta.producto]) {
                ventasPorProducto[venta.producto] = 0;
            }
            ventasPorProducto[venta.producto] += venta.cantidad;
        });
        
        const productoTop = Object.keys(ventasPorProducto).reduce((a, b) => 
            ventasPorProducto[a] > ventasPorProducto[b] ? a : b
        );

        // Actualizar DOM - usando los IDs correctos del HTML
        const totalVentasElement = document.getElementById('ventasTotales');
        const totalTransaccionesElement = document.getElementById('productosVendidos');
        const margenPromedioElement = document.getElementById('margenPromedio');
        const alertasInventarioElement = document.getElementById('alertasInventario');

        if (totalVentasElement) totalVentasElement.textContent = '$' + totalVentas.toFixed(2);
        if (totalTransaccionesElement) totalTransaccionesElement.textContent = totalTransacciones;
        if (margenPromedioElement) {
            const margenPromedio = this.inventarioData.reduce((sum, item) => sum + item.margen, 0) / this.inventarioData.length;
            margenPromedioElement.textContent = margenPromedio.toFixed(1) + '%';
        }
        if (alertasInventarioElement) {
            const productosStockBajo = this.inventarioData.filter(item => item.stock_actual <= item.stock_minimo);
            alertasInventarioElement.textContent = productosStockBajo.length;
        }
    }

    // Configurar navegación
    configurarNavegacion() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover clase active de todos los links
                navLinks.forEach(l => l.classList.remove('active'));
                
                // Agregar clase active al link actual
                link.classList.add('active');
                
                // Mostrar sección correspondiente
                const targetId = link.getAttribute('href').substring(1);
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            });
        });

        // Mostrar solo la primera sección por defecto
        sections.forEach((section, index) => {
            section.style.display = index === 0 ? 'block' : 'none';
        });
    }

    // Configurar filtros
    configurarFiltros() {
        // Filtro de período
        const periodoFilter = document.getElementById('periodoFilter');
        if (periodoFilter) {
            periodoFilter.addEventListener('change', (e) => {
                this.aplicarFiltros();
            });
        }

        // Filtro de categoría
        const categoriaFilter = document.getElementById('categoriaFilter');
        if (categoriaFilter) {
            categoriaFilter.addEventListener('change', (e) => {
                this.aplicarFiltros();
            });
        }

        // Filtro de empleado
        const empleadoFilter = document.getElementById('empleadoFilter');
        if (empleadoFilter) {
            empleadoFilter.addEventListener('change', (e) => {
                this.aplicarFiltros();
            });
        }

        // Botón de limpiar filtros
        const limpiarFiltrosBtn = document.getElementById('limpiarFiltros');
        if (limpiarFiltrosBtn) {
            limpiarFiltrosBtn.addEventListener('click', () => {
                this.limpiarFiltros();
            });
        }
    }

    // Aplicar filtros
    aplicarFiltros() {
        const periodo = document.getElementById('periodoFilter')?.value || 'todos';
        const categoria = document.getElementById('categoriaFilter')?.value || 'todas';
        const empleado = document.getElementById('empleadoFilter')?.value || 'todos';

        let datosFiltrados = [...this.ventasData];

        // Filtrar por período
        if (periodo !== 'todos') {
            const dias = parseInt(periodo);
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() - dias);
            datosFiltrados = datosFiltrados.filter(venta => venta.fecha >= fechaLimite);
        }

        // Filtrar por categoría
        if (categoria !== 'todas') {
            datosFiltrados = datosFiltrados.filter(venta => venta.categoria === categoria);
        }

        // Filtrar por empleado
        if (empleado !== 'todos') {
            datosFiltrados = datosFiltrados.filter(venta => venta.vendedor === empleado);
        }

        this.datosFiltrados = datosFiltrados;
        this.actualizarGraficosConFiltros();
        this.mostrarIndicadorFiltros();
    }

    // Limpiar filtros
    limpiarFiltros() {
        const periodoFilter = document.getElementById('periodoFilter');
        const categoriaFilter = document.getElementById('categoriaFilter');
        const empleadoFilter = document.getElementById('empleadoFilter');

        if (periodoFilter) periodoFilter.value = 'todos';
        if (categoriaFilter) categoriaFilter.value = 'todas';
        if (empleadoFilter) empleadoFilter.value = 'todos';

        this.datosFiltrados = null;
        this.actualizarGraficosConFiltros();
        this.mostrarIndicadorFiltros();
    }

    // Actualizar gráficos con filtros
    actualizarGraficosConFiltros() {
        const datos = this.datosFiltrados || this.ventasData;
        
        // Actualizar gráfico de tendencia
        this.actualizarGraficoVentasTrend(datos);
        
        // Actualizar gráfico de categorías
        this.actualizarGraficoCategorias(datos);
        
        // Actualizar gráfico de empleados
        this.actualizarGraficoEmpleados(datos);
        
        // Actualizar gráfico de métodos de pago
        this.actualizarGraficoMetodosPago(datos);
    }

    // Actualizar gráfico de tendencia con datos filtrados
    actualizarGraficoVentasTrend(datos) {
        if (!this.charts.ventasTrend) return;
        
        const ventasPorDia = {};
        datos.forEach(venta => {
            const fechaKey = venta.fecha.toISOString().split('T')[0];
            if (!ventasPorDia[fechaKey]) {
                ventasPorDia[fechaKey] = 0;
            }
            ventasPorDia[fechaKey] += venta.total;
        });

        const fechas = Object.keys(ventasPorDia).sort();
        const montos = fechas.map(fecha => ventasPorDia[fecha]);

        this.charts.ventasTrend.data.labels = fechas.map(fecha => new Date(fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }));
        this.charts.ventasTrend.data.datasets[0].data = montos;
        this.charts.ventasTrend.update();
    }

    // Actualizar gráfico de categorías con datos filtrados
    actualizarGraficoCategorias(datos) {
        if (!this.charts.categorias) return;
        
        const ventasPorCategoria = {};
        datos.forEach(venta => {
            if (!ventasPorCategoria[venta.categoria]) {
                ventasPorCategoria[venta.categoria] = 0;
            }
            ventasPorCategoria[venta.categoria] += venta.total;
        });

        const categorias = Object.keys(ventasPorCategoria);
        const montos = Object.values(ventasPorCategoria);

        this.charts.categorias.data.labels = categorias;
        this.charts.categorias.data.datasets[0].data = montos;
        this.charts.categorias.update();
    }

    // Actualizar gráfico de empleados con datos filtrados
    actualizarGraficoEmpleados(datos) {
        if (!this.charts.empleados) return;
        
        const ventasPorEmpleado = {};
        datos.forEach(venta => {
            if (!ventasPorEmpleado[venta.vendedor]) {
                ventasPorEmpleado[venta.vendedor] = 0;
            }
            ventasPorEmpleado[venta.vendedor] += venta.total;
        });

        const empleados = Object.keys(ventasPorEmpleado);
        const montos = Object.values(ventasPorEmpleado);

        this.charts.empleados.data.labels = empleados;
        this.charts.empleados.data.datasets[0].data = montos;
        this.charts.empleados.update();
    }

    // Actualizar gráfico de métodos de pago con datos filtrados
    actualizarGraficoMetodosPago(datos) {
        if (!this.charts.metodosPago) return;
        
        const ventasPorMetodo = {};
        datos.forEach(venta => {
            if (!ventasPorMetodo[venta.metodo_pago]) {
                ventasPorMetodo[venta.metodo_pago] = 0;
            }
            ventasPorMetodo[venta.metodo_pago] += venta.total;
        });

        const metodos = Object.keys(ventasPorMetodo);
        const montos = Object.values(ventasPorMetodo);

        this.charts.metodosPago.data.labels = metodos;
        this.charts.metodosPago.data.datasets[0].data = montos;
        this.charts.metodosPago.update();
    }

    // Mostrar indicador de filtros aplicados
    mostrarIndicadorFiltros() {
        const indicador = document.getElementById('filtrosIndicador');
        if (!indicador) return;
        
        const tieneFiltros = this.datosFiltrados && this.datosFiltrados.length !== this.ventasData.length;
        
        if (tieneFiltros) {
            indicador.style.display = 'block';
            indicador.textContent = `Mostrando ${this.datosFiltrados.length} de ${this.ventasData.length} registros`;
        } else {
            indicador.style.display = 'none';
        }
    }

    // Mostrar error
    mostrarError(mensaje) {
        const main = document.querySelector('.main');
        if (!main) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error</h3>
            <p>${mensaje}</p>
        `;
        main.insertBefore(errorDiv, main.firstChild);
    }
}

// Inicializar dashboard cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    new DashboardPapeleria();
});
