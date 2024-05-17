'use strict';

// * API /api/products/category
const API_URL = 'https://cyber-dark-scar.glitch.me';

const categoryButtons = document.querySelectorAll('.store__categories-item');
const productList = document.querySelector('.store__catalog');
const cartButton = document.querySelector('.store__cart-button');
const modalOverlay = document.querySelector('.modal-overlay');
const modalCloseButton = document.querySelector('.modal-overlay__close-button');

const changeCategories = (currentCategory) => {
  let activeTarget = currentCategory;

  categoryButtons.forEach(category => {
    category.addEventListener('click', (e) => {
      e.preventDefault();

      if (activeTarget !== e.currentTarget) {
        activeTarget.classList.remove('store__categories-item_current');
      }

      activeTarget = e.currentTarget;
      activeTarget.classList.add('store__categories-item_current');
      void fetchProductByCategory(`${e.target.dataset.category}`);
    });
  });
};

const createProductCard = (product) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__catalog-item');

  productCard.innerHTML = `
  <article class="product-card">
    <div class="product-card__picture-container">
      <img class="product-card__picture" src="${API_URL}${product.photoUrl}" 
      alt="${product.name}" width="388" height="261">
    </div>
    <h3 class="product-card__title">
      ${product.name}
    </h3>
    <p class="product-card__price">
      ${product.price}&nbsp;
      <span>&#8381;</span>
    </p>
    <button class="button button_purple product-card__buy-button" type="button">Заказать</button>
  </article>
  `;

  return productCard;
};

const renderProducts = (products) => {
  productList.textContent = '';
  products.forEach(product => {
    const productCard = createProductCard(product);

    productList.append(productCard);
  });
};

const fetchProductByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/api/products/category/${category}`);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const products = await response.json();
    console.log('products:', products);

    renderProducts(products);
  } catch (e) {
    console.error(`Ошибка запроса товара: ${e}`);
  }
};

const getCurrentCategory = () => [...categoryButtons].find(el => {
  return el.classList.contains('store__categories-item_current');
});

const setDefaultCategory = (category) => {
  category = categoryButtons[0];

  if (!category.classList.contains('store__categories-item_current')) {
    category.classList.add('store__categories-item_current');
  }

  return category;
};

const openCart = (e) => {
  e.preventDefault();

  modalOverlay.classList.add('modal-overlay_show');

  if (e.target === e.currentTarget || e.target.closest('.modal-overlay__close-button')) {
    modalOverlay.classList.remove('modal-overlay_show');
    modalOverlay.removeEventListener('click', openCart);
  }
};

const cartHandler = () => {
  cartButton.addEventListener('click', (e) => {
    e.preventDefault();

    modalOverlay.classList.add('modal-overlay_show');
    modalOverlay.addEventListener('click', openCart);
  });
};

const init = () => {
  cartHandler();

  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  void fetchProductByCategory(`${currentCategory.firstElementChild.dataset.category}`);
  changeCategories(currentCategory);
};

document.addEventListener('DOMContentLoaded', init);
