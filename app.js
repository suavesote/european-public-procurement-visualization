// cargo los datos principales
Promise.all([
  d3.csv("data/summary_kpis.csv", d3.autoType),
  d3.csv("data/awards_by_year.csv", d3.autoType),
  d3.csv("data/awards_by_country.csv", d3.autoType),
  d3.csv("data/awards_by_cpv_division.csv", d3.autoType),
  d3.csv("data/awards_by_year_and_contract_type.csv", d3.autoType),
  d3.csv("data/awards_by_year_and_supplier_status.csv", d3.autoType)
]).then(function(datos) {
  const resumen = datos[0];
  const porAnio = datos[1];
  const porPais = datos[2];
  const porCpv = datos[3];
  const porTipo = datos[4];
  const porProveedor = datos[5];

  const selectorMetrica = document.getElementById("metric-select");

  pintarKpis(resumen);

  function actualizarGraficos() {
    const metrica = selectorMetrica.value;

    pintarEvolucionAnual(porAnio, metrica);
    pintarPaises(porPais, metrica);
    pintarCpv(porCpv, metrica);
    pintarTipoContrato(porTipo, metrica);
    pintarEstadoProveedor(porProveedor, metrica);
  }

  selectorMetrica.addEventListener("change", actualizarGraficos);

  actualizarGraficos();
});


// formateo importes grandes
function formatoEuros(valor) {
  if (valor >= 1e12) {
    return "€" + (valor / 1e12).toFixed(2) + "T";
  }

  if (valor >= 1e9) {
    return "€" + (valor / 1e9).toFixed(2) + "B";
  }

  if (valor >= 1e6) {
    return "€" + (valor / 1e6).toFixed(2) + "M";
  }

  return "€" + Math.round(valor).toLocaleString("en-US");
}


// formateo cantidades
function formatoNumero(valor) {
  return Math.round(valor).toLocaleString("en-US");
}


// etiqueta de metrica
function etiquetaMetrica(metrica) {
  if (metrica === "awards") {
    return "Number of awards";
  }

  return "Total awarded value (€)";
}


// valores formateados para etiquetas y tooltips
function formatoValor(valor, metrica) {
  if (metrica === "awards") {
    return formatoNumero(valor);
  }

  return formatoEuros(valor);
}


// formato del eje y
function formatoEje(valor, metrica) {
  if (metrica === "awards") {
    if (valor >= 1e6) {
      return (valor / 1e6).toFixed(1) + "M";
    }

    if (valor >= 1e3) {
      return (valor / 1e3).toFixed(0) + "k";
    }

    return valor;
  }

  if (valor >= 1e12) {
    return "€" + (valor / 1e12).toFixed(1) + "T";
  }

  if (valor >= 1e9) {
    return "€" + (valor / 1e9).toFixed(1) + "B";
  }

  return "€" + valor;
}


// pinto las tarjetas de resumen
function pintarKpis(resumen) {
  const contenedor = document.getElementById("kpi-container");

  const obtenerValor = function(nombre) {
    const fila = resumen.find(d => d.metric === nombre);
    return fila ? Number(fila.value) : 0;
  };

  const totalAdjudicaciones = obtenerValor("total_awards");
  const valorTotal = obtenerValor("total_value_euro");
  const paisesCompradores = obtenerValor("buyer_countries");
  const proveedoresConocidos = obtenerValor("known_supplier_country_share");
  const transfronterizo = obtenerValor("cross_border_share_known_suppliers");

  const kpis = [
    {
      label: "Awards analysed",
      value: formatoNumero(totalAdjudicaciones)
    },
    {
      label: "Total awarded value",
      value: formatoEuros(valorTotal)
    },
    {
      label: "Buyer countries",
      value: formatoNumero(paisesCompradores)
    },
    {
      label: "Known supplier country",
      value: (proveedoresConocidos * 100).toFixed(1) + "%"
    },
    {
      label: "Cross-border awards among known suppliers",
      value: (transfronterizo * 100).toFixed(1) + "%"
    }
  ];

  contenedor.innerHTML = "";

  kpis.forEach(function(kpi) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "kpi-card";

    tarjeta.innerHTML = `
      <p class="kpi-label">${kpi.label}</p>
      <p class="kpi-value">${kpi.value}</p>
    `;

    contenedor.appendChild(tarjeta);
  });
}


// grafico 1: evolucion anual
function pintarEvolucionAnual(datos, metrica) {
  const valores = datos.map(d => d[metrica]);
  const textos = valores.map(v => formatoValor(v, metrica));

  const traza = {
    x: datos.map(d => d.year),
    y: valores,
    type: "bar",
    text: textos,
    textposition: "auto",
    hovertemplate: "Year: %{x}<br>" + etiquetaMetrica(metrica) + ": %{text}<extra></extra>"
  };

  const layout = {
    margin: { t: 30, r: 20, b: 60, l: 90 },
    xaxis: {
      title: "Year",
      tickmode: "array",
      tickvals: [2021, 2022, 2023]
    },
    yaxis: {
      title: etiquetaMetrica(metrica),
      tickformat: metrica === "awards" ? ",.0f" : "~s"
    }
  };

  Plotly.newPlot("chart-year", [traza], layout, { responsive: true, displaylogo: false });
}


// grafico 2: paises compradores
function pintarPaises(datos, metrica) {
  const datosTop = datos
    .slice()
    .sort((a, b) => b[metrica] - a[metrica])
    .slice(0, 15)
    .reverse();

  const valores = datosTop.map(d => d[metrica]);
  const textos = valores.map(v => formatoValor(v, metrica));

  const traza = {
    x: valores,
    y: datosTop.map(d => d.buyer_country),
    type: "bar",
    orientation: "h",
    text: textos,
    textposition: "auto",
    hovertemplate: "Buyer country: %{y}<br>" + etiquetaMetrica(metrica) + ": %{text}<extra></extra>"
  };

  const layout = {
    margin: { t: 30, r: 30, b: 60, l: 90 },
    xaxis: {
      title: etiquetaMetrica(metrica),
      tickformat: metrica === "awards" ? ",.0f" : "~s"
    },
    yaxis: {
      title: "Buyer country"
    }
  };

  Plotly.newPlot("chart-country", [traza], layout, { responsive: true, displaylogo: false });
}


// grafico 3: cpv
function pintarCpv(datos, metrica) {
  const datosTop = datos
    .slice()
    .sort((a, b) => b[metrica] - a[metrica])
    .slice(0, 12);

  const valores = datosTop.map(d => d[metrica]);
  const textos = valores.map(v => formatoValor(v, metrica));

  const traza = {
    type: "treemap",
    labels: datosTop.map(d => d.cpv_division + " · " + d.cpv_division_label),
    parents: datosTop.map(() => ""),
    values: valores,
    customdata: textos,
    texttemplate: "%{label}<br>%{customdata}",
    hovertemplate: "%{label}<br>" + etiquetaMetrica(metrica) + ": %{customdata}<extra></extra>"
  };

  const layout = {
    margin: { t: 30, r: 10, b: 10, l: 10 }
  };

  Plotly.newPlot("chart-cpv", [traza], layout, { responsive: true, displaylogo: false });
}


// grafico 4: tipo de contrato
function pintarTipoContrato(datos, metrica) {
  const tipos = ["Services", "Supplies", "Works", "Other / unknown"];

  const trazas = tipos
    .filter(tipo => datos.some(d => d.contract_type_label === tipo))
    .map(function(tipo) {
      const datosTipo = datos.filter(d => d.contract_type_label === tipo);
      const valores = datosTipo.map(d => d[metrica]);
      const textos = valores.map(v => formatoValor(v, metrica));

      return {
        x: datosTipo.map(d => d.year),
        y: valores,
        type: "bar",
        name: tipo,
        text: textos,
        hovertemplate: "Year: %{x}<br>" + tipo + "<br>" + etiquetaMetrica(metrica) + ": %{text}<extra></extra>"
      };
    });

  const layout = {
    barmode: "stack",
    margin: { t: 30, r: 20, b: 80, l: 90 },
    xaxis: {
      title: "Year",
      tickmode: "array",
      tickvals: [2021, 2022, 2023]
    },
    yaxis: {
      title: etiquetaMetrica(metrica),
      tickformat: metrica === "awards" ? ",.0f" : "~s"
    },
    legend: {
      orientation: "h",
      y: -0.25
    }
  };

  Plotly.newPlot("chart-contract-type", trazas, layout, { responsive: true, displaylogo: false });
}


// grafico 5: estado del proveedor
function pintarEstadoProveedor(datos, metrica) {
  const estados = [
    "Domestic award",
    "Cross-border award",
    "Unknown supplier country"
  ];

  const trazas = estados
    .filter(estado => datos.some(d => d.supplier_status === estado))
    .map(function(estado) {
      const datosEstado = datos.filter(d => d.supplier_status === estado);
      const valores = datosEstado.map(d => d[metrica]);
      const textos = valores.map(v => formatoValor(v, metrica));

      return {
        x: datosEstado.map(d => d.year),
        y: valores,
        type: "bar",
        name: estado,
        text: textos,
        hovertemplate: "Year: %{x}<br>" + estado + "<br>" + etiquetaMetrica(metrica) + ": %{text}<extra></extra>"
      };
    });

  const layout = {
    barmode: "stack",
    margin: { t: 30, r: 20, b: 80, l: 90 },
    xaxis: {
      title: "Year",
      tickmode: "array",
      tickvals: [2021, 2022, 2023]
    },
    yaxis: {
      title: etiquetaMetrica(metrica),
      tickformat: metrica === "awards" ? ",.0f" : "~s"
    },
    legend: {
      orientation: "h",
      y: -0.25
    }
  };

  Plotly.newPlot("chart-supplier-status", trazas, layout, { responsive: true, displaylogo: false });
}