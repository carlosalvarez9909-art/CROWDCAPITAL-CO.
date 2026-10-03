/* ===== Botón "Ver más soluciones" ===== */
var menuToggle = document.getElementById("mobileMenuToggle");
var mobileMenu = document.getElementById("mobileMenu");

function cerrarMenu() {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  menuToggle.classList.remove("open");
  mobileMenu.classList.remove("open");
  mobileMenu.inert = true;
}

function alternarMenu() {
  var abierto = menuToggle.getAttribute("aria-expanded") === "true";
  if (abierto) {
    cerrarMenu();
    return;
  }
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Cerrar menú");
  menuToggle.classList.add("open");
  mobileMenu.classList.add("open");
  mobileMenu.inert = false;
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", alternarMenu);
  mobileMenu.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", cerrarMenu);
  });
  document.addEventListener("click", function (evento) {
    if (menuToggle.getAttribute("aria-expanded") === "true" &&
        !mobileMenu.contains(evento.target) && !menuToggle.contains(evento.target)) {
      cerrarMenu();
    }
  });
  document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      cerrarMenu();
      menuToggle.focus();
    }
  });
  var menuDesktop = window.matchMedia("(min-width: 981px)");
  if (menuDesktop.addEventListener) {
    menuDesktop.addEventListener("change", function (evento) { if (evento.matches) cerrarMenu(); });
  } else {
    menuDesktop.addListener(function (evento) { if (evento.matches) cerrarMenu(); });
  }
}

var boton = document.getElementById("toggleMore");
var contenido = document.getElementById("moreContent");

function abrir(estado) {
  contenido.classList.toggle("open", estado);
  boton.setAttribute("aria-expanded", estado);
  boton.firstChild.textContent = estado ? "Ver menos " : "Ver todas las soluciones ";
}

boton.addEventListener("click", function () {
  abrir(!contenido.classList.contains("open"));
});

document.querySelectorAll('a[href="#masinfo"]').forEach(function (enlace) {
  enlace.addEventListener("click", function () { abrir(true); });
});

/* ===== Números ascendentes ===== */
function formatear(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function contar(el, hasta, prefijo, sufijo) {
  prefijo = prefijo || "";
  sufijo = sufijo || "";
  if (el._raf) cancelAnimationFrame(el._raf);
  var inicio = null;
  function paso(t) {
    if (!inicio) inicio = t;
    var p = Math.min((t - inicio) / 1600, 1);
    var suave = 1 - Math.pow(1 - p, 3);
    el.textContent = prefijo + formatear(hasta * suave) + sufijo;
    if (p < 1) el._raf = requestAnimationFrame(paso);
  }
  el._raf = requestAnimationFrame(paso);
}

// Números fijos: suben cuando aparecen en pantalla
var obsNumeros = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (e) {
    if (e.isIntersecting) {
      var el = e.target;
      contar(el, Number(el.dataset.to), el.dataset.prefix, el.dataset.suffix);
      obsNumeros.unobserve(el);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll(".count[data-to]").forEach(function (el) {
  obsNumeros.observe(el);
});

/* ===== HERO: escenas con loop infinito ===== */
var hx = document.getElementById("heroCards");

if (hx) {
  var escenas = hx.querySelectorAll(".hx-scene");
  var puntos = hx.querySelectorAll(".hx-dot");
  var CICLO = 5200;
  var temporizador = null;
  var cicloN = 0;

  function aleatorio(min, max) { return min + Math.random() * (max - min); }
  function entero(min, max) { return Math.round(aleatorio(min, max)); }
  function barajar(lista) {
    var b = lista.slice();
    for (var i = b.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = b[i]; b[i] = b[j]; b[j] = t;
    }
    return b;
  }

  // Cambia un valor sin que se vea la transición (para reiniciar a cero)
  function sinTransicion(el, fn) {
    el.style.transition = "none";
    fn();
    void el.offsetWidth;
    el.style.transition = "";
  }

  // Dibuja la línea con un punto de luz en la punta
  function dibujar(path, dot, ms) {
    var largo = path.getTotalLength();
    if (path._raf) cancelAnimationFrame(path._raf);
    path.style.strokeDashoffset = 1;
    dot.style.opacity = 0;
    var ini = null;
    function paso(t) {
      if (!ini) ini = t;
      var p = Math.min((t - ini) / ms, 1);
      var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      path.style.strokeDashoffset = 1 - e;
      var pt = path.getPointAtLength(largo * e);
      dot.style.left = (pt.x / 240 * 100) + "%";
      dot.style.top = (pt.y / 92 * 100) + "%";
      dot.style.opacity = 1;
      if (p < 1) path._raf = requestAnimationFrame(paso);
    }
    path._raf = requestAnimationFrame(paso);
  }

  var trazos = [
    "M0 80 C30 76 45 62 75 64 S115 42 145 38 S200 18 240 8",
    "M0 76 C25 80 50 58 80 56 S120 60 150 34 S205 26 240 12",
    "M0 82 C35 70 55 74 85 52 S130 48 160 30 S210 22 240 6",
    "M0 78 C28 68 48 70 78 58 S122 36 152 40 S206 14 240 10"
  ];

  var avisos = [
    ["Venta registrada", "+$120.000 · Caja principal", "hace 1 min"],
    ["Abono recibido", "+$85.000 · cartera al día", "hace 3 min"],
    ["Reposición sugerida", "Calzado: quedan 8 uds", "hace 5 min"],
    ["Pago a proveedor", "Programado para el viernes", "hace 8 min"],
    ["Pedido por WhatsApp", "Perfumería · 3 unidades", "hace 12 min"],
    ["Meta diaria alcanzada", "Ventas del día al 100%", "hace 16 min"],
    ["Factura generada", "Venta #CC-284 · $245.000", "hace 21 min"],
    ["Inventario actualizado", "Tecnología · 14 productos", "hace 28 min"],
    ["Cuenta por pagar", "Servicio registrado · $380.000", "hace 34 min"],
    ["Cierre de caja listo", "Diferencia: $0 · todo en orden", "hace 42 min"]
  ];

  var charlas = [
    [
      ["c", "Hola, ¿tienen perfumes disponibles?", "10:42"],
      ["b", "Sí, tenemos 12 unidades en inventario.", "10:42"],
      ["c", "¿Me compartes las referencias?", "10:43"],
      ["b", "Claro, te envío el catálogo actualizado.", "10:43"],
      ["c", "Voy a pedir dos de la línea floral.", "10:44"],
      ["b", "Pedido registrado por $245.000.", "10:44"],
      ["c", "¿Puedo recogerlo esta tarde?", "10:45"],
      ["b", "Sí. Queda separado hasta las 5 p. m.", "10:45"],
      ["c", "Perfecto, pago al recoger.", "10:46"],
      ["b", "Listo, la factura quedará pendiente de pago.", "10:46"],
      ["c", "Gracias, ya voy en camino.", "10:47"],
      ["b", "Con gusto. Te esperamos.", "10:47"]
    ],
    [
      ["c", "¿Cuánto debo de mi crédito?", "11:06"],
      ["b", "Tu saldo pendiente es de $350.000.", "11:06"],
      ["c", "¿Cuál es la fecha del próximo abono?", "11:07"],
      ["b", "El próximo pago vence el 15 de octubre.", "11:07"],
      ["c", "Quiero abonar $100.000 hoy.", "11:08"],
      ["b", "Abono aplicado. Tu nuevo saldo es $250.000.", "11:08"],
      ["c", "¿Me envías el comprobante?", "11:09"],
      ["b", "Comprobante enviado a tu correo registrado.", "11:09"],
      ["c", "También actualiza mi calendario, por favor.", "11:10"],
      ["b", "Calendario actualizado con el saldo nuevo.", "11:10"]
    ],
    [
      ["c", "Necesito el reporte de ventas semanal.", "14:18"],
      ["b", "Reviso las ventas del lunes al domingo.", "14:18"],
      ["c", "Incluye gastos y utilidad, por favor.", "14:19"],
      ["b", "Incluí ingresos, gastos y margen neto.", "14:19"],
      ["c", "¿Cuál fue el producto más vendido?", "14:20"],
      ["b", "Perfumería lideró con 38 unidades.", "14:20"],
      ["c", "¿Y la utilidad de la semana?", "14:21"],
      ["b", "La utilidad neta fue de $1.840.000.", "14:21"],
      ["c", "Compártelo con mi equipo.", "14:22"],
      ["b", "Reporte enviado al equipo y a tu correo.", "14:22"],
      ["c", "Gracias, lo revisamos hoy.", "14:23"],
      ["b", "Perfecto. Queda guardado en tu historial.", "14:23"]
    ]
  ];

  var utilidadActual = 7455000;

  function detenerChat(esc) {
    (esc._chatTimers || []).forEach(function (temporizadorChat) { clearTimeout(temporizadorChat); });
    esc._chatTimers = [];
  }

  function mostrarBurbuja(contenedor, mensaje) {
    var burbuja = document.createElement("div");
    burbuja.className = "bub " + (mensaje[0] === "c" ? "me" : "bot");
    var texto = document.createElement("span");
    texto.textContent = mensaje[1];
    var hora = document.createElement("time");
    hora.textContent = mensaje[2];
    burbuja.appendChild(texto);
    burbuja.appendChild(hora);
    contenedor.appendChild(burbuja);
  }

  function mostrarEscribiendo(contenedor) {
    var indicador = document.createElement("div");
    indicador.className = "chat-typing";
    indicador.setAttribute("aria-label", "Asistente escribiendo");
    var texto = document.createElement("span");
    texto.textContent = "escribiendo";
    var puntosTyping = document.createElement("span");
    puntosTyping.className = "typing-dots";
    for (var i = 0; i < 3; i++) puntosTyping.appendChild(document.createElement("i"));
    indicador.appendChild(texto);
    indicador.appendChild(puntosTyping);
    contenedor.appendChild(indicador);
    return indicador;
  }

  function iniciarChat(esc, mensajes) {
    var contenedor = esc.querySelector("#chatMessages");
    contenedor.innerHTML = "";
    detenerChat(esc);
    var indice = 0;

    function esperarChat(ms, callback) {
      esc._chatTimers.push(setTimeout(callback, ms));
    }

    function siguienteMensaje() {
      if (indice >= mensajes.length) return;
      var mensaje = mensajes[indice];
      if (mensaje[0] === "b") {
        var indicador = mostrarEscribiendo(contenedor);
        esperarChat(320, function () {
          if (!indicador.isConnected) return;
          indicador.remove();
          mostrarBurbuja(contenedor, mensaje);
          indice++;
          if (indice < mensajes.length) esperarChat(180, siguienteMensaje);
        });
        return;
      }
      mostrarBurbuja(contenedor, mensaje);
      indice++;
      if (indice < mensajes.length) esperarChat(220, siguienteMensaje);
    }

    siguienteMensaje();
  }

  // Deja todo en cero antes de volver a llenar
  function limpiar(esc) {
    esc.querySelectorAll(".lbar i").forEach(function (b) {
      sinTransicion(b, function () { b.style.width = "0%"; });
    });
    esc.querySelectorAll(".rg-fg").forEach(function (r) {
      sinTransicion(r, function () { r.style.strokeDashoffset = 100; });
    });
    esc.querySelectorAll(".cols span").forEach(function (c) {
      sinTransicion(c, function () { c.style.height = "0%"; });
    });
  }

  // Qué se muestra en cada escena
  var llenar = [

    // ESCENA 1
    function (esc) {
      // Inventario: unidades ascendentes y barras de tamaños distintos
      var anchos = barajar([96, 82, 68, 55, 42, 30]);
      var totalStock = 0;
      esc.querySelectorAll(".inv-row").forEach(function (fila, i) {
        var ancho = Math.min(98, Math.max(18, anchos[i] + entero(-5, 5)));
        var uds = Math.round(ancho * aleatorio(1.1, 2.3));
        totalStock += uds;
        fila.querySelector(".lbar i").style.width = ancho + "%";
        contar(fila.querySelector(".inv-n"), uds, "", "");
      });
      contar(document.getElementById("stockTotal"), totalStock, "", "");

      // Utilidad: valor distinto en cada vuelta y línea con punto de luz
      utilidadActual = Math.round(aleatorio(3400000, 9900000) / 1000) * 1000;
      contar(document.getElementById("utilNum"), utilidadActual, "$ ", "");
      var path = document.getElementById("utilPath");
      path.setAttribute("d", trazos[cicloN % trazos.length]);
      dibujar(path, document.getElementById("utilDot"), 2600);

      // Notificaciones
      var inicio = (cicloN * 5) % avisos.length;
      document.getElementById("ntList").innerHTML = [0, 1, 2, 3, 4].map(function (k) {
        var n = avisos[(inicio + k) % avisos.length];
        return '<div class="nt" style="--i:' + k + '"><i class="hx-led"></i><div><b>' + n[0] + '</b><small>' + n[1] + '</small><small>' + n[2] + '</small></div></div>';
      }).join("");
    },

    // ESCENA 2
    function (esc) {
      var rangos = [[90, 180, " mensajes"], [30, 70, " cobros"], [8, 20, " reportes"], [32, 58, " facturas"]];
      esc.querySelectorAll(".arow").forEach(function (fila, i) {
        var pct = entero(62, 98);
        fila.querySelector(".rg-fg").style.strokeDashoffset = 100 - pct;
        contar(fila.querySelector(".rg-txt"), pct, "", "%");
        contar(fila.querySelector(".arow-n"), entero(rangos[i][0], rangos[i][1]), "", rangos[i][2]);
      });

      contar(esc.querySelector(".hrs-n"), 10, "+", " h");
      esc.querySelectorAll(".cols span").forEach(function (c, i) {
        c.style.transitionDelay = (i * 0.07) + "s";
        c.style.height = entero(32, 100) + "%";
      });

      var tareas = 214;
      document.getElementById("recoveryTasks").textContent = formatear(tareas);
      esc.querySelectorAll(".automated-tasks").forEach(function (el) { el.textContent = formatear(tareas); });
      document.getElementById("avoidedErrors").textContent = entero(12, 27);

      var charla = charlas[cicloN % charlas.length];
      iniciarChat(esc, charla);
    },

    // ESCENA 3
    function (esc) {
      esc.querySelectorAll(".health-metric").forEach(function (metric) {
        var progress = Number(metric.dataset.progress);
        metric.querySelector(".rg-fg").style.strokeDashoffset = 100 - progress;
        contar(metric.querySelector(".rg-txt"), progress, "", "%");
      });

      document.getElementById("netProfit").textContent = "$ 7.455.000";
      esc.querySelector(".goal-ring .rg-fg").style.strokeDashoffset = 18;
      contar(esc.querySelector(".goal-ring .rg-txt"), 82, "", "%");
      contar(esc.querySelector(".rent-n"), 30, "+", "%");

      var alturas = [30, 42, 38, 60, 78, 100];
      esc.querySelectorAll(".cols span").forEach(function (c, i) {
        c.style.transitionDelay = (i * 0.08) + "s";
        c.style.height = alturas[i] + "%";
      });
    }
  ];

  // Primera vez: llena directo. Después: se desvanece, cambia los valores y reaparece
  function renovar(i, primera) {
    var esc = escenas[i];
    var partes = esc.querySelectorAll(".lp");
    detenerChat(esc);
    clearTimeout(esc._t);

    if (primera) {
      partes.forEach(function (p) {
        p.classList.remove("out");
        p.style.transitionDelay = "0ms";
      });
      limpiar(esc);
      llenar[i](esc);
      return;
    }

    cicloN++;
    partes.forEach(function (p, k) {
      p.style.transitionDelay = (k * 50) + "ms";
      p.classList.add("out");
    });

    esc._t = setTimeout(function () {
      limpiar(esc);
      llenar[i](esc);
      partes.forEach(function (p, k) {
        p.style.transitionDelay = (k * 80) + "ms";
        p.classList.remove("out");
      });
    }, 1000);
  }

  function mostrarEscena(i) {
    escenas.forEach(function (e, n) {
      if (n !== i) {
        clearTimeout(e._t);
        detenerChat(e);
      }
      e.classList.toggle("active", n === i);
    });
    puntos.forEach(function (p) { p.classList.remove("on"); });
    void hx.offsetWidth; // reinicia la barrita de progreso
    puntos[i].classList.add("on");

    clearInterval(temporizador);
    renovar(i, true);
    temporizador = setInterval(function () { renovar(i, false); }, CICLO);
  }

  puntos.forEach(function (p, i) {
    p.addEventListener("click", function () { mostrarEscena(i); });
    // Cuando la barrita termina de llenarse, pasa a la siguiente escena
    p.querySelector("i").addEventListener("animationend", function () {
      if (p.classList.contains("on")) {
        mostrarEscena((i + 1) % escenas.length);
      }
    });
  });

  mostrarEscena(0);
}

/* ===== Elementos que aparecen al hacer scroll ===== */
var obsReveal = new IntersectionObserver(function (entradas) {
  entradas.forEach(function (e) {
    if (e.isIntersecting) {
      var el = e.target;
      setTimeout(function () { el.classList.add("visible"); }, Number(el.dataset.d || 0));
      obsReveal.unobserve(el);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(function (el) {
  obsReveal.observe(el);
});

/* ===== Franja de herramientas: se duplica para que gire sin cortes ===== */
var pista = document.querySelector(".marquee-track");

if (pista) {
  Array.from(pista.children).forEach(function (c) {
    pista.appendChild(c.cloneNode(true));
  });
}