'use strict';

// * API /api/products/category
const API_URL = 'https://cyber-dark-scar.glitch.me';

const categoryButtons = document.querySelectorAll('.store__categories-item');
const productList = document.querySelector('.store__catalog');
const cartButton = document.querySelector('.store__cart-button');
const cartCount = cartButton.querySelector('.store__cart-count');
const modalOverlay = document.querySelector('.modal-overlay');
const cartItemsList = document.querySelector('.modal-cart__shopping-list');

const changeCategories = (currentCategory) => {
  let activeTarget = currentCategory;

  categoryButtons.forEach(category => {
    category.addEventListener('click', (ev) => {
      ev.preventDefault();

      if (activeTarget !== ev.currentTarget) {
        activeTarget.classList.remove('store__categories-item_current');
      }

      activeTarget = ev.currentTarget;
      activeTarget.classList.add('store__categories-item_current');
      void fetchProductByCategory(`${ev.target.dataset.category}`);
    });
  });
};

const createProductCard = ({name, price, photoUrl}) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__catalog-item');

  productCard.innerHTML = `
  <article class="product-card">
    <div class="product-card__picture-container">
      <img class="product-card__picture" src="${API_URL}${photoUrl}" 
      alt="${name}" width="388" height="261">
    </div>
    <h3 class="product-card__title">
      ${name}
    </h3>
    <p class="product-card__price">
      ${price}&nbsp;
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

const checkData = (data) => {
  if (!data.ok) throw new Error(`Ошибка запроса: ${data.status} ${data.statusText}`);
};

const fetchProductByCategory = async (category) => {
  try {
    const response = await fetch(`${API_URL}/api/products/category/${category}`);

    checkData(response);

    const products = await response.json();
    console.log('products:', products);

    renderProducts(products);
  } catch (e) {
    console.error(e);
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

const openCart = (ev) => {
  ev.preventDefault();

  modalOverlay.classList.add('modal-overlay_show');

  if (ev.target === ev.currentTarget || ev.target.closest('.modal-overlay__close-button')) {
    modalOverlay.classList.remove('modal-overlay_show');
    modalOverlay.removeEventListener('click', openCart);
  }
};

const renderCartItems = () => {
  cartItemsList.textContent = '';
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

  cartItems.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    cartItemsList.append(listItem);
  });
};

const openCartHandler = () => {
  cartButton.addEventListener('click', (ev) => {
    ev.preventDefault();

    modalOverlay.classList.add('modal-overlay_show');
    modalOverlay.addEventListener('click', openCart);
    renderCartItems();
  });
};

const isStorageAvailable = (type) => {
  let storage;
  try {
    storage = window[type];

    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);

    return true;
  } catch (err) {
    return (
      err instanceof DOMException &&
      // * everything except Firefox
      (err.code === 22 ||
        // Firefox
        err.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        err.name === 'QuotaExceededError' ||
        // Firefox
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
};

const updateCartCount = () => {
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  cartCount.textContent = cartItems.length;
};

const addToCart = (productName) => {
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  cartItems.push(productName);
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  updateCartCount();
};

const getProductName = () => {
  productList.addEventListener('click', ({target}) => {
    if (!target.closest('.product-card__buy-button')) {}

    const productCard = target.closest('.product-card');
    const productName = productCard.querySelector('.product-card__title').textContent;

    addToCart(productName.trim());
  })
};

const localStorageHandler = () => {
  if (!isStorageAvailable('sessionStorage')) {
    throw new Error('Ваш браузер не поддерживает локальное хранилище!');
  }

  updateCartCount();
  getProductName();
};

const init = () => {
  openCartHandler();

  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  void fetchProductByCategory(`${currentCategory.firstElementChild.dataset.category}`);
  changeCategories(currentCategory);

  try {
    localStorageHandler();
  } catch (e) {
    // * cart link and error
  }
};

document.addEventListener('DOMContentLoaded', init);
