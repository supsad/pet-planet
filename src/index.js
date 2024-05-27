'use strict';

// * API /api/products/category
const API_URL = 'https://cyber-dark-scar.glitch.me';

const pageHeader = document.querySelector('header');
const pageMain = document.querySelector('main');
const pageFooter = document.querySelector('footer');

const categoryButtons = pageMain.querySelectorAll('.store__categories-item');
const productList = pageMain.querySelector('.store__catalog');
const cartButton = pageMain.querySelector('.store__cart-button');
const cartCount = cartButton.querySelector('.store__cart-count');

const modalOverlay = document.querySelector('.modal-overlay');
const cartItemsList = modalOverlay.querySelector('.modal-cart__shopping-list');
const cartTotalPriceElement = modalOverlay.querySelector('.modal-cart__total-price');
const cartForm = modalOverlay.querySelector('.modal-cart__pickup-form');
const cartSubmit = cartForm.querySelector('.modal-cart__submit-button');

const setPageInert = (mode = true) => {
  const pageElements = [pageHeader, pageMain, pageFooter];

  if (typeof mode === 'boolean') {
    pageElements.forEach(el => el.inert = mode);
  }
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

const getCartItems = () => JSON.parse(localStorage.getItem('cartItems') || '[]');

const createProductCard = ({name, price, photoUrl, id}) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__catalog-item');

  productCard.innerHTML = `
  <article class="product-card">
    <div class="product-card__picture-container">
      <img class="product-card__picture" src="${API_URL}${photoUrl}" alt="${name}" width="388" height="261">
    </div>
    <h3 class="product-card__title">${name}</h3>
    <p class="product-card__price">${price}&nbsp;<span>&#8381;</span></p>
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

const renderCartItems = () => {
  cartItemsList.textContent = '';

  const cartItems = getCartItems();

  if (!cartItems.length) {
    const listItem = document.createElement('li');
    listItem.textContent = 'Пусто';
    cartItemsList.append(listItem);

    cartSubmit.disabled = true;
    return;
  }

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

  cartSubmit.disabled = false;
};

// * For the cart, the total number of products in it is made, and not by product name
const updateCartCount = () => {
  const cartItems = getCartItems();
  cartCount.textContent = cartItems.reduce((count, item) => count + item.count, 0);
};

const updateCartItem = (productId, change) => {
  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === productId);

  if (itemIndex === -1) {
    return;
  }

  cartItems[itemIndex].count += change;

  if (cartItems[itemIndex].count <= 0) {
    cartItems.splice(itemIndex, 1);
  }

  localStorage.setItem('cartItems', JSON.stringify(cartItems));

  updateCartCount();
  renderCartItems();
};

const quantityButtonHandler = ({target}) => {
  if (
    target.classList.contains('cart-item__quantity-button')
    && target.closest('.cart-item__quantity-button').value === 'decrease'
  ) {
    const productId = target.dataset.id;
    updateCartItem(productId, -1);
  } else if (
    target.classList.contains('cart-item__quantity-button')
    && target.closest('.cart-item__quantity-button').value === 'increase'
  ) {
    const productId = target.dataset.id;
    updateCartItem(productId, 1);
  }
};

const createModalMessageFragment = () => {
  const fragment = document.createDocumentFragment();

  const overlayElement = document.createElement('section');
  overlayElement.classList.add('modal-overlay');
  overlayElement.style.display = 'block';

  const overlayCloseButton = document.createElement('button');
  overlayCloseButton.type = 'button';
  overlayCloseButton.innerHTML = '&times;';
  overlayCloseButton.classList.add('modal-overlay__close-button');

  const orderMessageElement = document.createElement('div');
  orderMessageElement.classList.add('notification-message');

  const orderMessageTitle = document.createElement('h3');
  orderMessageTitle.classList.add('notification-message__title');

  const orderMessageText = document.createElement('p');
  orderMessageText.classList.add('notification-message__text');

  const orderMessageCloseButton = document.createElement('p');
  orderMessageCloseButton.classList.add('button', 'button_carrot', 'notification-message__close-button');
  orderMessageCloseButton.textContent = 'Закрыть';
  orderMessageCloseButton.tabIndex = -1;

  orderMessageElement.append(orderMessageTitle, orderMessageText, orderMessageCloseButton);
  overlayElement.append(orderMessageElement, overlayCloseButton);

  overlayElement.addEventListener('click', (ev) => {
    ev.preventDefault();
    if (ev.target === ev.currentTarget || ev.target.closest('.order-message__close-button')) {
      setPageInert(false);
      revertPageScroll();
      overlayElement.remove();
    }
  });

  return fragment.appendChild(overlayElement);
};

const getDeliveryDate = () => {
  const MonthsRU = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ];
  const date = new Date();

  // * The month in the Date has an array-like structure, so I don't increment month
  return `${date.getDate() + 1} ${MonthsRU[date.getMonth()]}`;
};

const renderOrderMessage = (orderId) => {
  const messageFragment = createModalMessageFragment();
  const paragraph = messageFragment.querySelector('p');

  messageFragment.querySelector('h3').textContent = 'Ваш заказ оформлен.';
  paragraph.textContent = `Номер заказа: ${orderId}\n
    Вы можете забрать его ${getDeliveryDate()} после 12:00.\n`;

  setPageInert(true);
  hiddenPageScroll();
  document.body.append(messageFragment);
};

const submitOrder = async (ev) => {
  ev.preventDefault();

  const storeId = cartForm['delivery-address'].value;
  const cartItems = getCartItems();

  const products = cartItems.map(({id, count}) => ({
    id,
    quantity: count,
  }));

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({storeId, products}),
    });

    checkData(response);

    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartProductDetails');

    const {orderId} = await response.json();

    updateCartCount();
    closeCart();
    renderOrderMessage(orderId);
  } catch (e) {
    console.error(`Ошибка оформления заказа: ${e}`);
  }
};

const closeCart = () => {
  setPageInert(false);
  revertPageScroll();

  modalOverlay.classList.remove('modal-overlay_show');
  modalOverlay.removeEventListener('click', closeCartHandler);
  cartItemsList.removeEventListener('click', quantityButtonHandler);
  cartForm.removeEventListener('submit', submitOrder);
};

const closeCartHandler = ({target, currentTarget}) => {
  if (target === currentTarget || target.closest('.modal-overlay__close-button')) {
    closeCart();
  }
};

const openCart = async () => {
  setPageInert(true);
  modalOverlay.addEventListener('click', closeCartHandler);

  const cartItems = getCartItems();
  const ids = cartItems.map(item => item.id);

  const products = await fetchCartItems(ids);
  localStorage.setItem('cartProductDetails', JSON.stringify(products));
  renderCartItems();
  cartItemsList.addEventListener('click', quantityButtonHandler);
  cartForm.addEventListener('submit', submitOrder);
};

cartButton.addEventListener('click', (ev) => {
  ev.preventDefault();

  modalOverlay.classList.add('modal-overlay_show');
  hiddenPageScroll();

  void openCart();
});

const isCartOpen = () => modalOverlay.classList.contains('modal-overlay_show');

const addToCart = (productId) => {
  const cartItems = getCartItems();

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

const setDefaultCategory = (category) => {
  category = categoryButtons[0];

  if (!category.classList.contains('store__categories-item_current')) {
    category.classList.add('store__categories-item_current');
  }

  return category;
};

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

const getCurrentCategory = () => [...categoryButtons].find(el => {
  return el.classList.contains('store__categories-item_current');
});

const calculateTotalPrice = (cartItems, products) => {
  return cartItems.reduce((acc, item) => {
    const product = products.find(product => product.id === item.id);
    return acc + product.price * item.count;
  }, 0);
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

const localStorageHandler = (callbackFn) => {
  if (!isStorageAvailable('sessionStorage')) {
    throw new Error('Ваш браузер не поддерживает локальное хранилище!');
  }

  callbackFn();
};

const renderCartErrorMessage = () => {
  const messageFragment = createModalMessageFragment();
  const paragraph = messageFragment.querySelector('p');

  messageFragment.querySelector('h3').textContent = 'Уппс... Возникла ошибка!';
  paragraph.textContent = `Корзина неработоспособна!\n
    Попытайтесь перезагрузить страницу.\n
    Если ничего не вышло, то обратитесь к разработчику сайта`;

  setPageInert(true);
  hiddenPageScroll();
  document.body.append(messageFragment);
};

const init = () => {
  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  void fetchProductByCategory(`${currentCategory.firstElementChild.dataset.category}`);
  changeCategories(currentCategory);

  try {
    if (isCartOpen()) {
      hiddenPageScroll();
      void openCart();
    }

    localStorageHandler(() => {
      updateCartCount();
      getProductName();
    });
  } catch (e) {
    console.error(`Ошибка открытия корзины: ${e}`);
    renderCartErrorMessage();
  }
};

document.addEventListener('DOMContentLoaded', init);
