const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const toast = document.querySelector(".toast");
let toastTimer;
let cartItems = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

document.querySelectorAll(".collection-page .product-card").forEach(card => {
  const actions = document.createElement("div");
  actions.className = "product-actions";

  const button = document.createElement("button");
  button.className = "add-to-cart";
  button.type = "button";
  button.textContent = "Adicionar ao carrinho";

  actions.append(button);
  card.append(actions);
});

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    mainNav.classList.toggle("open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    });
  });
}

document.querySelectorAll(".add-to-cart").forEach(button => {
  button.addEventListener("click", () => {
    cartItems += 1;
    document.querySelector(".cart-count").textContent = String(cartItems);
    const productName = button.closest(".product-card").querySelector(".product-name").textContent;
    showToast(`${productName} adicionado ao carrinho.`);
  });
});

document.querySelectorAll("[data-message]").forEach(button => {
  button.addEventListener("click", () => showToast(button.dataset.message));
});

const heroImage = document.querySelector(".hero-image");
if (heroImage) {
  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2200&q=88",
      alt: "Detalhe de joalharia dourada sobre pele ao sol",
      eyebrow: "Coleção de edição limitada",
      title: "Peças com<br>alma própria.",
      copy: "Pequenos detalhes. Grandes histórias."
    },
    {
      image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=2200&q=88",
      alt: "Joias douradas com formas intemporais",
      eyebrow: "Essenciais de todos os dias",
      title: "O teu brilho,<br>à tua maneira.",
      copy: "Descobre peças feitas para ficar."
    },
    {
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=2200&q=88",
      alt: "Anel dourado em destaque",
      eyebrow: "Pequenas grandes histórias",
      title: "Guarda o que<br>te faz única.",
      copy: "Joias com significado, sempre contigo."
    }
  ];
  let activeSlide = 0;
  const heroEyebrow = document.querySelector(".hero .eyebrow");
  const heroTitle = document.querySelector(".hero h1");
  const heroCopy = document.querySelector(".hero-copy");
  const dots = [...document.querySelectorAll(".hero-dots button")];

  function showSlide(index) {
    activeSlide = (index + heroSlides.length) % heroSlides.length;
    const slide = heroSlides[activeSlide];
    heroImage.src = slide.image;
    heroImage.alt = slide.alt;
    heroEyebrow.textContent = slide.eyebrow;
    heroTitle.innerHTML = slide.title;
    heroCopy.textContent = slide.copy;
    dots.forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === activeSlide)));
  }

  document.querySelector(".hero-arrow.prev").addEventListener("click", () => showSlide(activeSlide - 1));
  document.querySelector(".hero-arrow.next").addEventListener("click", () => showSlide(activeSlide + 1));
  dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));
}

const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", event => {
    event.preventDefault();
    const emailInput = event.currentTarget.elements.email;
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    document.querySelector(".form-message").textContent = "Obrigada! Ficaste na nossa lista de novidades.";
    event.currentTarget.reset();
  });
}

const lightbox = document.querySelector(".photo-lightbox");
if (lightbox) {
  const galleryButtons = [...document.querySelectorAll(".gallery-trigger")];
  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxCaption = lightbox.querySelector(".lightbox-caption");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  let activePhoto = 0;

  function showPhoto(index) {
    activePhoto = (index + galleryButtons.length) % galleryButtons.length;
    const button = galleryButtons[activePhoto];
    const image = button.querySelector("img");
    lightboxImage.src = button.dataset.fullSrc;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = button.dataset.caption;
    previousButton.disabled = galleryButtons.length < 2;
    nextButton.disabled = galleryButtons.length < 2;
  }

  galleryButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      showPhoto(index);
      lightbox.showModal();
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  previousButton.addEventListener("click", () => showPhoto(activePhoto - 1));
  nextButton.addEventListener("click", () => showPhoto(activePhoto + 1));
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
    if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
  });
}
