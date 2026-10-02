/* ===== Botón "Ver más soluciones" ===== */
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
    ["Venta registrada", "+$120.000 · hace 1 min"],
    ["Abono recibido", "+$85.000 · cartera al día"],
    ["Reposición sugerida", "Calzado: quedan 8 uds"],
    ["Pago a proveedor programado", "Vence el viernes"],
    ["Pedido por WhatsApp", "Perfumería · 3 unidades"],
    ["Meta diaria alcanzada", "Ventas del día al 100%"]
  ];

  var charlas = [
    [["c", "Hola, ¿tienen perfumes disponibles?"], ["b", "¡Hola! Sí, hay 12 en stock. ¿Te envío el catálogo?"], ["c", "Sí, por favor"], ["b", "Enviado ✓ Pedido listo para registrar"]],
    [["c", "¿Cuánto debo de mi crédito?"], ["b", "Tu saldo es $350.000. Próximo abono: 15 oct"], ["c", "Quiero abonar hoy"], ["b", "Abono registrado ✓ Cartera actualizada"]],
    [["c", "Necesito el reporte de ventas"], ["b", "Generando tu reporte semanal…"], ["b", "Listo ✓ Enviado a tu correo"]]
  ];

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
      esc.querySelectorAll(".inv-row").forEach(function (fila, i) {
        var ancho = Math.min(98, Math.max(18, anchos[i] + entero(-5, 5)));
        var uds = Math.round(ancho * aleatorio(1.1, 2.3));
        fila.querySelector(".lbar i").style.width = ancho + "%";
        contar(fila.querySelector(".inv-n"), uds, "", "");
      });

      // Utilidad: valor distinto en cada vuelta y línea con punto de luz
      var utilidad = Math.round(aleatorio(3400000, 9900000) / 1000) * 1000;
      contar(document.getElementById("utilNum"), utilidad, "$ ", "");
      var path = document.getElementById("utilPath");
      path.setAttribute("d", trazos[cicloN % trazos.length]);
      dibujar(path, document.getElementById("utilDot"), 2600);

      // Notificaciones
      var inicio = (cicloN % 2) * 3;
      document.getElementById("ntList").innerHTML = [0, 1, 2].map(function (k) {
        var n = avisos[(inicio + k) % avisos.length];
        return '<div class="nt" style="--i:' + k + '"><i class="hx-led"></i><div><b>' + n[0] + '</b><small>' + n[1] + '</small></div></div>';
      }).join("");
    },

    // ESCENA 2
    function (esc) {
      var rangos = [[90, 180, " mensajes"], [30, 70, " cobros"], [8, 20, " reportes"]];
      esc.querySelectorAll(".arow").forEach(function (fila, i) {
        var pct = entero(62, 98);
        fila.querySelector(".rg-fg").style.strokeDashoffset = 100 - pct;
        contar(fila.querySelector(".rg-txt"), pct, "", "%");
        contar(fila.querySelector(".arow-n"), entero(rangos[i][0], rangos[i][1]), "", rangos[i][2]);
      });

      contar(esc.querySelector(".hrs-n"), entero(8, 14), "+", " h");
      esc.querySelectorAll(".cols span").forEach(function (c, i) {
        c.style.transitionDelay = (i * 0.07) + "s";
        c.style.height = entero(32, 100) + "%";
      });

      var charla = charlas[cicloN % charlas.length];
      document.getElementById("chat").innerHTML = charla.map(function (m, k) {
        return '<div class="bub ' + (m[0] === "c" ? "me" : "bot") + '" style="animation-delay:' + (0.2 + k * 0.9) + 's">' + m[1] + '</div>';
      }).join("");
    },

    // ESCENA 3
    function (esc) {
      esc.querySelectorAll(".fs-n").forEach(function (el) {
        contar(el, Number(el.dataset.to), "", el.dataset.suffix);
      });

      esc.querySelector(".rg-fg").style.strokeDashoffset = 18;
      contar(esc.querySelector(".rg-txt"), 82, "", "%");
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