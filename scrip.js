document.addEventListener('DOMContentLoaded', () => {
    const apiUrlBase = 'https://workcore.net/apiv2/ia/';
    const yearSelect = document.getElementById('year-select');
    const productTable = document.getElementById('product-table');
    const topProductsList = document.getElementById('top-products-list');
    const salesChart = document.getElementById('salesChart');

    // Inicializar el selector de años
    function initYearSelector() {
        const currentYear = new Date().getFullYear();
        for (let year = 2020; year <= currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = currentYear; // Seleccionar el año actual por defecto
    }

    // Función para obtener datos desde la API
    async function fetchData(year) {
        try {
            const apiUrl = `${apiUrlBase}?year=${year}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                console.error('Error al obtener datos:', response.statusText);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    // Mostrar los productos más vendidos
    function mostSaleProduct(productos) {
        topProductsList.innerHTML = ''; // Limpiar lista
        if (productos && productos["cantidad_productos_vendidos_pormes"]) {
            const productosOrdenados = productos["cantidad_productos_vendidos_pormes"]
                .map(producto => ({
                    nombre: producto["NOMBRE"],
                    totalVentas: parseFloat(producto["TOTAL"]),
                }))
                .sort((a, b) => b.totalVentas - a.totalVentas);

            const top10Productos = productosOrdenados.slice(0, 10);

            top10Productos.forEach(producto => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${producto.nombre} - ${producto.totalVentas} ventas`;
                topProductsList.appendChild(listItem);
            });
        }
    }

    // Generar recomendaciones
    function generateSuggestions(product) {
        const monthlySales = [
            product["ENERO"], product["FEBRERO"], product["MARZO"], product["ABRIL"],
            product["MAYO"], product["JUNIO"], product["JULIO"], product["AGOSTO"],
            product["SEPTIEMBRE"], product["OCTUBRE"], product["NOVIEMBRE"], product["DICIEMBRE"]
        ].map(sale => parseFloat(sale) || 0);

        const maxMonth = monthlySales.indexOf(Math.max(...monthlySales)) + 1;
        const minMonth = monthlySales.indexOf(Math.min(...monthlySales.filter(s => s > 0))) + 1;

        return `
            Considera promocionar este producto en los meses con bajas ventas.
            La demanda máxima fue en el mes ${maxMonth}, y la demanda baja en el mes ${minMonth}.
        `;
    }

    // Mostrar datos en la tabla
    function mostrarDatos(productos) {
        productTable.innerHTML = ''; // Limpiar tabla
        if (productos && productos["cantidad_productos_vendidos_pormes"]) {
            const headers = `
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Marca</th>
                    <th>Cantidad Mantenimientos</th>
                    <th>Cantidad Ventas</th>
                    <th>Total</th>
                    <th>Recomendaciones</th>
                </tr>
            `;
            productTable.innerHTML = headers;

            productos["cantidad_productos_vendidos_pormes"].forEach(product => {
                const recommendations = generateSuggestions(product);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product["CODIGO"]}</td>
                    <td>${product["NOMBRE"]}</td>
                    <td>${product["CATEGORIA"]}</td>
                    <td>${product["MARCA"]}</td>
                    <td>${product["CANTIDAD_MANTENIMIENTOS"]}</td>
                    <td>${product["CANTIDAD_VENTAS"]}</td>
                    <td>${product["TOTAL"]}</td>
                    <td>${recommendations}</td>
                `;
                productTable.appendChild(row);
            });
        }
    }

    // Renderizar gráfico
    function renderChart(products) {
        const ctx = salesChart.getContext('2d');
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const monthsInOrder = [
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
        ];
        const datasets = products.map(product => ({
            label: product["NOMBRE"],
            data: monthsInOrder.map(month => parseFloat(product[month]) || 0),
            borderColor: getRandomColor(),
            fill: false,
        }));

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets,
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                },
            },
        });
    }

    // Obtener un color aleatorio para el gráfico
    function getRandomColor() {
        return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }

    // Actualizar datos cuando se seleccione un nuevo año
    yearSelect.addEventListener('change', async () => {
        const selectedYear = yearSelect.value;
        const data = await fetchData(selectedYear);
        mostrarDatos(data);
        mostSaleProduct(data);
        if (data && data["cantidad_productos_vendidos_pormes"]) {
            renderChart(data["cantidad_productos_vendidos_pormes"]);
        }
    });

    // Inicialización
    async function init() {
        initYearSelector();
        const currentYear = yearSelect.value;
        const data = await fetchData(currentYear);
        mostrarDatos(data);
        mostSaleProduct(data);
        if (data && data["cantidad_productos_vendidos_pormes"]) {
            renderChart(data["cantidad_productos_vendidos_pormes"]);
        }
    }

    init();
});
