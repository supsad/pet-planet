'use strict';

// * API /api/products/category
const API_URL = 'https://cyber-dark-scar.glitch.me';

const categoryButtons = document.querySelectorAll('.store__categories-item');
const productList = document.querySelector('.store__catalog');
const cartButton = document.querySelector('.store__cart-button');
const cartCount = cartButton.querySelector('.store__cart-count');
const modalOverlay = document.querySelector('.modal-overlay');
const cartItemsList = document.querySelector('.modal-cart__shopping-list');
const cartTotalPriceElement = document.querySelector('.modal-cart__total-price');
const cartForm = document.querySelector('.modal-cart__pickup-form');

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

const createProductCard = ({name, price, photoUrl, id}) => {
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
    <button class="button button_purple product-card__buy-button" data-id="${id}" type="button">Заказать</button>
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
    renderProducts(products);
  } catch (e) {
    console.error(e);
  }
};

const fetchCartItems = async (ids) => {
  try {
    const response = await fetch(`${API_URL}/api/products/list/${ids.join(', ')}`);
    checkData(response);

    return await response.json();
  } catch (e) {
    console.error(`Ошибка запроса товаров для корзины: ${e}`);
    return [];
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

const hiddenPageScroll = () => {
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.width = `100%`;
  document.body.style.position = 'fixed';
};

const revertPageScroll = () => {
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  document.body.style.width = '';
};

const openCart = (ev) => {
  ev.preventDefault();

  if (ev.target === ev.currentTarget || ev.target.closest('.modal-overlay__close-button')) {
    revertPageScroll();

    modalOverlay.classList.remove('modal-overlay_show');
    modalOverlay.removeEventListener('click', openCart);
  }
};

const calculateTotalPrice = (cartItems, products) => {
  return cartItems.reduce((acc, item) => {
    const product = products.find(product => product.id === item.id);
    return acc + product.price * item.count;
  }, 0);
};

const renderCartItems = () => {
  cartItemsList.textContent = '';

  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  const products = JSON.parse(localStorage.getItem('cartProductDetails') || '[]');

  products.forEach(({id, name, price, photoUrl}) => {
    const cartItem = cartItems.find(item => item.id === id);

    if (!cartItem) {
      return;
    }

    const listItem = document.createElement('li');
    listItem.classList.add('cart-item', 'modal-cart__shopping-item');
    listItem.innerHTML = `
     <h3 class="cart-item__title"><a href="#">${name}</a></h3>
      <div class="cart-item__image-container">
        <img class="cart-item__image" src="${API_URL}${photoUrl}"
             width="264" height="229" alt="${name}">
      </div>
      <div class="cart-item__quantity-container">
        <button class="counter-button counter-button_green cart-item__quantity-button"
                type="button" value="decrease" data-id="${id}">-</button>
        <span class="cart-item__quantity-amount">${cartItem.count}</span>
        <button class="counter-button counter-button_green cart-item__quantity-button"
                type="button" value="increase" data-id="${id}">+</button>
      </div>
      <p class="cart-item__price">${price * cartItem.count}&nbsp;<span>&#8381;</span></p>
    `;

    cartItemsList.append(listItem);
  });

  const totalPrice = calculateTotalPrice(cartItems, products);
  cartTotalPriceElement.innerHTML = `${totalPrice}&nbsp;<span>&#8381;</span>`;
};

cartButton.addEventListener('click', async (ev) => {
  ev.preventDefault();

  modalOverlay.classList.add('modal-overlay_show');
  hiddenPageScroll();

  modalOverlay.addEventListener('click', openCart);

  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  const ids = cartItems.map(item => item.id);

  if (!ids.length) {
    cartItemsList.textContent = '';
    
    const listItem = document.createElement('li');
    listItem.textContent = 'Пусто';
    cartItemsList.append(listItem);
    return;
  }

  const products = await fetchCartItems(ids);
  localStorage.setItem('cartProductDetails', JSON.stringify(products));
  renderCartItems();
});

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

// * For the cart, the total number of products in it is made, and not by product name
const updateCartCount = () => {
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
  cartCount.textContent = cartItems.reduce((count, item) => count + item.count, 0);
};

const addToCart = (productId) => {
  const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

  const existingItem = cartItems.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.count += 1;
  } else {
    cartItems.push({
      id: productId,
      count: 1,
    });
  }

  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  updateCartCount();
};

const getProductName = () => {
  productList.addEventListener('click', ({target}) => {
    if (!target.closest('.product-card__buy-button')) {
      return;
    }

    const productId = target.dataset.id;
    addToCart(productId);
  })
};

const localStorageHandler = (callbackFn) => {
  if (!isStorageAvailable('sessionStorage')) {
    throw new Error('Ваш браузер не поддерживает локальное хранилище!');
  }

  callbackFn();
};

const init = () => {
  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  void fetchProductByCategory(`${currentCategory.firstElementChild.dataset.category}`);
  changeCategories(currentCategory);

  try {
    localStorageHandler(() => {
      updateCartCount();
      getProductName();
    });
  } catch (e) {
    // ! cart link and error
  }
};

document.addEventListener('DOMContentLoaded', init);
