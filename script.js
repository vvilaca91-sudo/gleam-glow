const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const toast = document.querySelector(".toast");
let toastTimer;
const cartStorageKey = "gleam-glow-cart";
const currency = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" });
let cart = [];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function loadCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    if (!Array.isArray(stored)) throw new Error("Formato de carrinho inválido.");
    return stored.filter(item =>
      item && typeof item.id === "string" && typeof item.name === "string" &&
      typeof item.detail === "string" && typeof item.image === "string" &&
      Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0
    );
  } catch (error) {
    showToast("Não foi possível carregar o carrinho guardado.");
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  } catch (error) {
    showToast("Não foi possível guardar o carrinho neste dispositivo.");
  }
}

function cartSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function shippingCost(subtotal) {
  return subtotal === 0 || subtotal > 75 ? 0 : 4.9;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function renderCheckout() {
  const items = document.querySelector(".checkout-items");
  if (!items) return;
  items.innerHTML = cart.length ? cart.map(item => `
    <article class="checkout-item">
      <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">
      <div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.detail)}</p><span>Quantidade: ${item.quantity}</span></div>
      <strong>${currency.format(item.price * item.quantity)}</strong>
    </article>`).join("") : '<p class="checkout-empty">Ainda não adicionaste produtos ao carrinho.</p>';
  const subtotal = cartSubtotal();
  const shipping = shippingCost(subtotal);
  document.querySelector(".checkout-subtotal").textContent = currency.format(subtotal);
  document.querySelector(".checkout-shipping").textContent =
    shipping === 0 ? (subtotal > 75 ? "Grátis" : "—") : currency.format(shipping);
  document.querySelector(".checkout-total").textContent = currency.format(subtotal + shipping);
  const submitButton = document.querySelector(".checkout-submit");
  if (submitButton) submitButton.disabled = cart.length === 0;
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(element => {
    element.textContent = String(count);
    element.hidden = count === 0;
  });
  const items = document.querySelector(".cart-popover-items");
  if (items) {
    items.innerHTML = cart.map(item => `
      <article class="cart-popover-item">
        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">
        <div class="cart-popover-info">
          <h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.detail)}</p>
          <div class="cart-popover-controls">
            <button type="button" data-cart-action="decrease" data-cart-id="${escapeHTML(item.id)}" aria-label="Diminuir quantidade de ${escapeHTML(item.name)}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" data-cart-id="${escapeHTML(item.id)}" aria-label="Aumentar quantidade de ${escapeHTML(item.name)}">+</button>
            <button class="cart-remove" type="button" data-cart-action="remove" data-cart-id="${escapeHTML(item.id)}">Apagar</button>
          </div>
          <p class="cart-popover-price">${currency.format(item.price)} · Total ${currency.format(item.price * item.quantity)}</p>
        </div>
      </article>`).join("");
    document.querySelector(".cart-popover-empty").hidden = cart.length > 0;
    items.hidden = cart.length === 0;
    document.querySelector(".cart-popover-total").textContent = currency.format(cartSubtotal());
    document.querySelector(".cart-checkout").hidden = cart.length === 0;
  }
  renderCheckout();
}

function updateCart(id, action) {
  const index = cart.findIndex(item => item.id === id);
  if (index < 0) return;
  if (action === "remove" || (action === "decrease" && cart[index].quantity === 1)) cart.splice(index, 1);
  else if (action === "increase") cart[index].quantity += 1;
  else if (action === "decrease") cart[index].quantity -= 1;
  saveCart();
  renderCart();
}

function setupCart() {
  const button = document.querySelector('.header-actions [aria-label="Carrinho"]');
  const headerActions = document.querySelector(".header-actions");
  if (!button || !headerActions) return;
  button.removeAttribute("data-message");
  button.setAttribute("aria-haspopup", "true");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "cart-popover");
  const popover = document.createElement("section");
  popover.id = "cart-popover";
  popover.className = "cart-popover";
  popover.setAttribute("aria-label", "Resumo do carrinho");
  popover.innerHTML = '<div class="cart-popover-heading"><h2>O teu carrinho</h2><button class="cart-popover-close" type="button" aria-label="Fechar carrinho">×</button></div><p class="cart-popover-empty">O seu carrinho está vazio.</p><div class="cart-popover-items"></div><div class="cart-popover-footer"><div class="cart-popover-total-row"><span>Subtotal</span><strong class="cart-popover-total">€ 0,00</strong></div><a class="button cart-checkout" href="checkout.html">Finalizar encomenda</a></div>';
  headerActions.append(popover);
  button.addEventListener("click", () => {
    const isOpen = popover.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
  popover.querySelector(".cart-popover-close").addEventListener("click", () => {
    popover.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    button.focus();
  });
  popover.addEventListener("click", event => {
    const control = event.target.closest("[data-cart-action]");
    if (control) updateCart(control.dataset.cartId, control.dataset.cartAction);
  });
  document.addEventListener("click", event => {
    if (!event.composedPath().includes(headerActions)) {
      popover.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && popover.classList.contains("open")) {
      popover.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
      button.focus();
    }
  });
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
    const card = button.closest(".product-card");
    const name = card.querySelector(".product-name").textContent.trim();
    const detail = card.querySelector(".product-detail").textContent.trim();
    const image = card.querySelector(".product-photo img").getAttribute("src");
    const price = Number(card.querySelector(".product-price").textContent.replace(/[^\d,.-]/g, "").replace(",", "."));
    if (!Number.isFinite(price) || !image) {
      showToast("Não foi possível adicionar este produto ao carrinho.");
      return;
    }
    const id = `${window.location.pathname}:${name}`;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, name, detail, image, price, quantity: 1 });
    saveCart();
    renderCart();
    showToast(`${name} adicionado ao carrinho.`);
  });
});

cart = loadCart();
setupCart();
renderCart();

document.querySelectorAll("[data-message]").forEach(button => {
  button.addEventListener("click", () => showToast(button.dataset.message));
});

const checkoutForm = document.querySelector(".checkout-form");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!checkoutForm.reportValidity()) return;
    showToast("O pagamento ainda não está ligado. A tua encomenda não foi enviada.");
  });
}

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
