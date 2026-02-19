(() => {
  // Año footer
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ====== FIX ANCLAS + OFFCANVAS ======
  const menuEl = document.getElementById("menu");
  const navEl = document.getElementById("mainNav");

  if (menuEl) {
    const getOffset = () => (navEl?.offsetHeight || 76) + 8;

    const scrollToHash = (hash) => {
      const target = document.querySelector(hash);
      if (!target) return;
      const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    document.addEventListener("click", (e) => {
      const a = e.target.closest('a.nav-link[href^="#"]');
      if (!a) return;

      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;

      e.preventDefault();

      // Si el offcanvas está abierto, cerralo y luego scrollea
      const isOpen = menuEl.classList.contains("show");

      if (isOpen && window.bootstrap) {
        const instance = bootstrap.Offcanvas.getInstance(menuEl) || new bootstrap.Offcanvas(menuEl);
        menuEl.addEventListener(
          "hidden.bs.offcanvas",
          () => {
            history.replaceState(null, "", hash);
            scrollToHash(hash);
          },
          { once: true }
        );
        instance.hide();
      } else {
        history.replaceState(null, "", hash);
        scrollToHash(hash);
      }
    });

    // Si cargás con #hash en la URL, ajusta el offset del nav fijo
    window.addEventListener("load", () => {
      if (location.hash) scrollToHash(location.hash);
    });
  }

  // ====== TU MODAL ENTRENAMIENTOS (lo dejo igual) ======
  const modalEl = document.getElementById("modalEntreno");
  if (!modalEl) return;

  const title = document.getElementById("modalEntrenoTitle");
  const desc  = document.getElementById("modalEntrenoDesc");
  const list  = document.getElementById("modalEntrenoList");
  const cta   = document.getElementById("modalEntrenoCTA");

  const DATA = {
    recreativo: {
      title: "Boxeo recreativo",
      desc: "Entrenamiento para todos los niveles. Aprendés técnica real mientras mejorás tu estado físico.",
      items: [
        "Guardia, desplazamientos y combinaciones",
        "Trabajo en bolsa y manoplas",
        "Coordinación y resistencia",
        "Progresión segura para principiantes"
      ],
      wa: "Hola Jorge Aguilera. Quiero info sobre Boxeo recreativo. ¿Horarios y modalidad?"
    },
    competitivo: {
      title: "Boxeo competitivo",
      desc: "Preparación orientada al rendimiento y competencia.",
      items: [
        "Plan personalizado por objetivos",
        "Trabajo técnico–táctico",
        "Sparring guiado",
        "Fuerza, potencia y velocidad aplicada"
      ],
      wa: "Hola Jorge Aguilera. Quiero info sobre Boxeo competitivo. ¿Cómo es la preparación?"
    },
    infantil: {
      title: "Boxeo infantil",
      desc: "Para los más peques. Juego, coordinación y disciplina en un entorno seguro.",
      items: [
        "Motricidad y coordinación",
        "Confianza y respeto",
        "Actividades adaptadas por edad",
        "Seguimiento profesional"
      ],
      wa: "Hola Jorge Aguilera. Quiero info sobre Boxeo infantil. ¿Edades y horarios?"
    },
    fisica: {
      title: "Preparación física",
      desc: "Trabajo integral para mejorar rendimiento y condición general.",
      items: [
        "Entrenamientos funcionales",
        "Trabajo de fuerza y potencia",
        "Velocidad y reacción",
        "Coordinación y flexibilidad"
      ],
      wa: "Hola Jorge Aguilera. Quiero info sobre Preparación física. ¿Qué días y modalidad?"
    }
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-entreno]");
    if (!btn) return;

    const key = btn.getAttribute("data-entreno");
    const data = DATA[key];
    if (!data) return;

    title.textContent = data.title;
    desc.textContent  = data.desc;

    list.innerHTML = data.items.map(item => `
      <div class="col-12 col-sm-6">
        <div class="p-3 rounded-4 border border-secondary-subtle bg-dark h-100">
          <i class="bi bi-check-circle-fill text-danger me-2"></i>
          <span class="text-light">${item}</span>
        </div>
      </div>
    `).join("");

    cta.href = `https://wa.me/5491166427099?text=${encodeURIComponent(data.wa)}`;
  });

})();
