(() => {
  "use strict";

  // =========================================================
  // UTILIDADES
  // =========================================================
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const setCurrentYear = () => {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  };

  // =========================================================
  // NAV + OFFCANVAS (anclas con offset)
  // =========================================================
  const menuEl = $("#menu");     // offcanvas
  const navEl = $("#mainNav");   // navbar fija

  const getOffset = () => (navEl?.offsetHeight || 76) + 8;

  const scrollToHash = (hash) => {
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.pageYOffset - getOffset();
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const handleNavAnchorClick = (a) => {
    const hash = a.getAttribute("href");
    if (!hash || hash === "#") return;

    const isOffcanvasOpen = menuEl?.classList.contains("show");

    // Si el offcanvas está abierto, cerralo y luego scrollea
    if (isOffcanvasOpen && window.bootstrap && menuEl) {
      const instance =
        bootstrap.Offcanvas.getInstance(menuEl) || new bootstrap.Offcanvas(menuEl);

      menuEl.addEventListener(
        "hidden.bs.offcanvas",
        () => {
          history.replaceState(null, "", hash);
          scrollToHash(hash);
        },
        { once: true }
      );

      instance.hide();
      return;
    }

    history.replaceState(null, "", hash);
    scrollToHash(hash);
  };

  // =========================================================
  // MODAL ENTRENAMIENTOS
  // =========================================================
  const modalEntrenoEl = $("#modalEntreno");
  const entrenoTitleEl = $("#modalEntrenoTitle");
  const entrenoDescEl = $("#modalEntrenoDesc");
  const entrenoListEl = $("#modalEntrenoList");
  const entrenoCtaEl = $("#modalEntrenoCTA");

  const ENTRENOS = {
    recreativo: {
      title: "Boxeo recreativo",
      desc: "Entrenamiento para todos los niveles. Aprendés técnica real mientras mejorás tu estado físico.",
      items: [
        "Guardia, desplazamientos y combinaciones",
        "Trabajo en bolsa y manoplas",
        "Coordinación y resistencia",
        "Progresión segura para principiantes",
      ],
      wa: "Hola Team Aguilera. Quiero info sobre Boxeo recreativo. ¿Horarios y modalidad?",
    },
    competitivo: {
      title: "Boxeo competitivo",
      desc: "Preparación orientada al rendimiento y competencia.",
      items: [
        "Plan personalizado por objetivos",
        "Trabajo técnico–táctico",
        "Sparring guiado",
        "Fuerza, potencia y velocidad aplicada",
      ],
      wa: "Hola Team Aguilera. Quiero info sobre Boxeo competitivo. ¿Cómo es la preparación?",
    },
    infantil: {
      title: "Boxeo infantil",
      desc: "Para los más peques. Juego, coordinación y disciplina en un entorno seguro.",
      items: [
        "Motricidad y coordinación",
        "Confianza y respeto",
        "Actividades adaptadas por edad",
        "Seguimiento profesional",
      ],
      wa: "Hola Team Aguilera. Quiero info sobre Boxeo infantil. ¿Edades y horarios?",
    },
    fisica: {
      title: "Preparación física",
      desc: "Trabajo integral para mejorar rendimiento y condición general.",
      items: [
        "Entrenamientos funcionales",
        "Trabajo de fuerza y potencia",
        "Velocidad y reacción",
        "Coordinación y flexibilidad",
      ],
      wa: "Hola Team Aguilera. Quiero info sobre Preparación física. ¿Qué días y modalidad?",
    },
  };

  const openEntrenoModal = (key) => {
    if (!modalEntrenoEl || !entrenoTitleEl || !entrenoDescEl || !entrenoListEl || !entrenoCtaEl) return;

    const data = ENTRENOS[key];
    if (!data) return;

    entrenoTitleEl.textContent = data.title;
    entrenoDescEl.textContent = data.desc;

    entrenoListEl.innerHTML = data.items
      .map(
        (item) => `
        <div class="col-12 col-sm-6">
          <div class="p-3 rounded-4 border border-secondary-subtle bg-dark h-100">
            <i class="bi bi-check-circle-fill text-danger me-2"></i>
            <span class="text-light">${item}</span>
          </div>
        </div>
      `
      )
      .join("");

    entrenoCtaEl.href = `https://wa.me/5491166427090?text=${encodeURIComponent(data.wa)}`;
  };

  // =========================================================
  // GALERÍA: Carrusel MOBILE + Modal con Prev/Next + Teclado
  // Fuente de verdad: las cards del GRID (md+)
  // =========================================================
  const galeriaGridEl = $("#galeriaGrid");
  const galeriaCarouselInnerEl = $("#galeriaCarouselInner");

  const galeriaModalEl = $("#galeriaModal");
  const galeriaModalImgEl = $("#galeriaModalImg");
  const galeriaModalCaptionEl = $("#galeriaModalCaption");
  const galPrevBtn = $("#galPrev");
  const galNextBtn = $("#galNext");

  let galeriaCards = [];
  let galIndex = 0;

  const syncGaleriaCards = () => {
    // IMPORTANTÍSIMO: solo tomamos las cards del GRID (evita duplicados con el carrusel)
    galeriaCards = galeriaGridEl ? $$(".galeria-card[data-img]", galeriaGridEl) : [];

    // asignamos índice solo a las del GRID
    galeriaCards.forEach((card, i) => {
      card.dataset.index = String(i);
    });
  };

  const buildMobileCarouselFromGrid = () => {
    if (!galeriaCarouselInnerEl) return;
    if (!galeriaCards.length) {
      galeriaCarouselInnerEl.innerHTML = "";
      return;
    }

    galeriaCarouselInnerEl.innerHTML = galeriaCards
      .map((card, i) => {
        const src = card.getAttribute("data-img") || "";
        const cap = card.getAttribute("data-cap") || "Imagen";
        const active = i === 0 ? "active" : "";

        return `
          <div class="carousel-item ${active}">
            <button type="button" class="galeria-card w-100"
              data-index="${i}"
              data-bs-toggle="modal" data-bs-target="#galeriaModal"
              data-img="${src}" data-cap="${cap}">
              <img src="${src}" alt="${cap}">
              <span class="galeria-cap">${cap}</span>
            </button>
          </div>
        `;
      })
      .join("");
  };

  const renderGaleria = (index) => {
    if (!galeriaModalImgEl) return;
    if (!galeriaCards.length) return;

    // loop
    if (index < 0) index = galeriaCards.length - 1;
    if (index >= galeriaCards.length) index = 0;

    galIndex = index;

    const card = galeriaCards[galIndex];
    const src = card.getAttribute("data-img") || "";
    const cap = card.getAttribute("data-cap") || "Imagen";

    galeriaModalImgEl.src = src;
    if (galeriaModalCaptionEl) galeriaModalCaptionEl.textContent = cap;
  };

  const openGaleriaFromAnyCard = (card) => {
    // si el card viene del carrusel, trae data-index; si viene del grid, también.
    const idx = Number(card.getAttribute("data-index") || card.dataset.index || "0");
    if (Number.isNaN(idx)) return;
    renderGaleria(idx);
  };

  const goPrev = () => renderGaleria(galIndex - 1);
  const goNext = () => renderGaleria(galIndex + 1);

  // Limpieza al cerrar modal (opcional)
  galeriaModalEl?.addEventListener("hidden.bs.modal", () => {
    if (galeriaModalImgEl) galeriaModalImgEl.src = "";
    if (galeriaModalCaptionEl) galeriaModalCaptionEl.textContent = "Imagen";
  });

  // =========================================================
  // EVENTOS (delegados)
  // =========================================================
  document.addEventListener("click", (e) => {
    // 1) NAV anclas
    const navLink = e.target.closest('a.nav-link[href^="#"]');
    if (navLink) {
      e.preventDefault();
      handleNavAnchorClick(navLink);
      return;
    }

    // 2) Entrenamientos (Ver detalles)
    const entrenoBtn = e.target.closest("[data-entreno]");
    if (entrenoBtn) {
      const key = entrenoBtn.getAttribute("data-entreno");
      openEntrenoModal(key);
      return;
    }

    // 3) Galería (abrir en modal y cargar la correcta)
    const galBtn = e.target.closest(".galeria-card[data-img]");
    if (galBtn && galeriaModalEl) {
      // IMPORTANTE: antes de abrir, garantizamos que el array del GRID esté sincronizado
      // (por si agregaste/quitaste fotos)
      syncGaleriaCards();
      openGaleriaFromAnyCard(galBtn);
      return;
    }
  });

  // Prev/Next botones
  galPrevBtn?.addEventListener("click", goPrev);
  galNextBtn?.addEventListener("click", goNext);

  // Teclado (cuando modal está abierta)
  document.addEventListener("keydown", (e) => {
    if (!galeriaModalEl?.classList.contains("show")) return;
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  });

  // =========================================================
  // INIT
  // =========================================================
  setCurrentYear();

  // Sync + build carrusel (una vez al inicio)
  syncGaleriaCards();
  buildMobileCarouselFromGrid();

  window.addEventListener("load", () => {
    if (location.hash) scrollToHash(location.hash);
  });

  // Si cambiás el contenido del grid (agregás fotos), podés llamar:
  // syncGaleriaCards(); buildMobileCarouselFromGrid();
})();