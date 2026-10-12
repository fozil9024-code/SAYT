const productCards = [...document.querySelectorAll(".product-card")];
const cartCount = document.querySelector(".bag-count");
const cartLink = document.querySelector(".bag-link");
const searchLink = document.querySelector(".search-link");
const headerActions = document.querySelector(".header-actions");

const cart = new Map();

function updateCartCount() {
  const count = [...cart.values()].reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = String(count);
  cartLink.setAttribute("aria-label", `Xaridlarni ko‘rish: ${count} ta mahsulot`);
}

function createCartDialog() {
  const dialog = document.createElement("dialog");
  dialog.className = "cart-dialog";
  dialog.setAttribute("aria-labelledby", "cart-title");
  dialog.innerHTML = `
    <h2 id="cart-title">Savat</h2>
    <div class="cart-items"></div>
    <div class="cart-total"></div>
    <button class="cart-close" type="button">Davom etish</button>
  `;
  dialog.querySelector(".cart-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.body.append(dialog);
  return dialog;
}

const cartDialog = createCartDialog();

function renderCart() {
  const itemsElement = cartDialog.querySelector(".cart-items");
  const totalElement = cartDialog.querySelector(".cart-total");
  itemsElement.replaceChildren();

  if (cart.size === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = "Savatingiz hozircha bo‘sh.";
    itemsElement.append(emptyMessage);
    totalElement.hidden = true;
    return;
  }

  totalElement.hidden = false;
  let total = 0;
  for (const [name, item] of cart) {
    total += item.price * item.quantity;
    const row = document.createElement("div");
    row.className = "cart-item";

    const productName = document.createElement("span");
    productName.textContent = `${name} × ${item.quantity}`;
    const productPrice = document.createElement("span");
    productPrice.textContent = `${(item.price * item.quantity).toLocaleString("uz-UZ")} so‘m`;

    row.append(productName, productPrice);
    itemsElement.append(row);
  }

  totalElement.replaceChildren();
  const label = document.createElement("span");
  label.textContent = "Jami";
  const amount = document.createElement("span");
  amount.textContent = `${total.toLocaleString("uz-UZ")} so‘m`;
  totalElement.append(label, amount);
}

for (const card of productCards) {
  const productName = card.querySelector("h3").textContent.trim();
  const priceText = card.querySelector(".product-buy-row strong").textContent;
  const price = Number(priceText.replace(/[^\d]/g, ""));
  const addButton = card.querySelector(".add-button");
  const favoriteButton = card.querySelector(".favorite");

  addButton.addEventListener("click", () => {
    const current = cart.get(productName);
    cart.set(productName, { price, quantity: (current?.quantity ?? 0) + 1 });
    updateCartCount();
    addButton.setAttribute("aria-label", `${productName} savatga qo‘shildi`);
    addButton.textContent = "✓";
    window.setTimeout(() => {
      addButton.textContent = "↗";
      addButton.setAttribute("aria-label", `${productName} ni savatga qo‘shish`);
    }, 900);
  });

  favoriteButton.addEventListener("click", () => {
    const isFavorite = favoriteButton.getAttribute("aria-pressed") !== "true";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.classList.toggle("is-favorite", isFavorite);
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
    favoriteButton.setAttribute(
      "aria-label",
      isFavorite
        ? `${productName} sevimlilardan olib tashlash`
        : `${productName} ni sevimlilarga qo‘shish`,
    );
  });
}

cartLink.addEventListener("click", (event) => {
  event.preventDefault();
  renderCart();
  cartDialog.showModal();
});

const searchInput = document.createElement("input");
searchInput.className = "search-input";
searchInput.type = "search";
searchInput.placeholder = "Telefon qidirish...";
searchInput.setAttribute("aria-label", "Telefonlarni qidirish");
searchInput.hidden = true;
headerActions.insertBefore(searchInput, searchLink);

const emptyMessage = document.createElement("p");
emptyMessage.className = "search-empty";
emptyMessage.textContent = "Mos telefon topilmadi.";
emptyMessage.hidden = true;
document.querySelector(".product-grid").append(emptyMessage);

function filterProducts(query) {
  let visibleCount = 0;
  for (const card of productCards) {
    const matches = card.textContent.toLocaleLowerCase("uz").includes(query.toLocaleLowerCase("uz"));
    card.hidden = !matches;
    if (matches) visibleCount += 1;
  }
  emptyMessage.hidden = visibleCount > 0;
}

searchLink.addEventListener("click", (event) => {
  event.preventDefault();
  searchInput.hidden = !searchInput.hidden;
  if (searchInput.hidden) {
    searchInput.value = "";
    filterProducts("");
  } else {
    searchInput.focus();
  }
});

searchInput.addEventListener("input", () => filterProducts(searchInput.value.trim()));
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchInput.value = "";
    filterProducts("");
    searchInput.hidden = true;
    searchLink.focus();
  }
});

updateCartCount();
