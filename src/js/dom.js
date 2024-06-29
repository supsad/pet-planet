import {API_URL} from './api';

const STORE_PATH = './store.html';
const RUBLE_SYMBOL = '&#8381;'

export const removeNoJs = () => document.documentElement.removeAttribute('class');

export const getPageElements = (receiveObj, elementsObj) => Object.assign(receiveObj, elementsObj);

export const renderStoreButton = () => {
  const button = document.querySelector('.hero__button');
  button.href = STORE_PATH;
  button.textContent = 'Перейти в магазин';

  return button;
};

export const setScrollWindowToTop = () => window.scrollTo(0, 0);

export const setPageInert = (mode = true) => {
  const pageElements = [
    document.querySelector('header'),
    document.querySelector('main'),
    document.querySelector('footer'),
  ];

  if (typeof mode === 'boolean') {
    pageElements.forEach(el => el.inert = mode);
  }
};

export const hiddenPageScroll = () => {
  document.body.style.top = `-${window.scrollY}px`;
  document.body.style.width = `100%`;
  document.body.style.position = 'fixed';
};

export const revertPageScroll = () => {
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  document.body.style.width = '';
};

const createStubTransition = () => {
  const stub = document.createElement('div');
  stub.classList.add('body-stub', 'body-stub_white');

  const stubCoverLeft = document.createElement('div');
  const stubCoverRight = document.createElement('div');

  stubCoverLeft.classList.add('body-stub__transit', 'body-stub__transit_left');
  stubCoverRight.classList.add('body-stub__transit', 'body-stub__transit_right');

  stub.append(stubCoverLeft, stubCoverRight);

  return stub;
};

export const renderBodyStubTransit = (container) => {
  const stub = createStubTransition();
  stub.classList.add('body-stub_transparent');

  if (container === document.body) {
    document.querySelector('script').before(stub);
  }

  container.append(stub);
  return stub;
};

export const renderLoader = (container) => {
  const loader = document.createElement('div');
  loader.classList.add('loader');

  if (container === document.body) {
    document.querySelector('script').before(loader);
  }

  container.append(loader);

  return loader;
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
  overlayCloseButton.ariaLabel = 'Закрыть уведомление';

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
    if (ev.target === ev.currentTarget || ev.target.closest('.notification-message__close-button')) {
      setPageInert(false);
      revertPageScroll();
      overlayElement.remove();
    }
  });

  return fragment.appendChild(overlayElement);
};

export const renderNotificationMessageOverlay = (headerText, paragraphMessage) => {
  const messageFragment = createModalMessageFragment();

  messageFragment.querySelector('h3').textContent = `${headerText}`;
  messageFragment.querySelector('p').textContent = `${paragraphMessage}`;

  setPageInert(true);
  hiddenPageScroll();
  document.body.append(messageFragment);
};

const createProductCard = ({name, price, photoUrl, id}) => {
  const productCard = document.createElement('li');
  productCard.classList.add('store__catalog-item');

  productCard.innerHTML = `
  <article class="product-card">
    <div class="product-card__picture-container">
      <img class="product-card__picture" src="${API_URL}${photoUrl}" alt="${name}" width="388" height="261">
    </div>
    <h3 class="product-card__title">${name}</h3>
    <p class="product-card__price">${price}&nbsp;<span>${RUBLE_SYMBOL}</span></p>
    <button class="button button_purple product-card__buy-button" data-id="${id}" type="button">Заказать</button>
  </article>
  `;

  return productCard;
};

export const renderProducts = (products, productList) => {
  productList.textContent = '';

  products.forEach(product => {
    const productCard = createProductCard(product);

    productList.append(productCard);
  });
};

export const renderEmptyCart = (totalPrice, ...containers) => {
  const [container, cartSubmit, cartTotalPriceElement] = containers;
  container.textContent = '';

  const listItem = document.createElement('li');
  listItem.textContent = 'Пусто';
  container.append(listItem);

  cartTotalPriceElement.innerHTML = `${totalPrice}&nbsp;<span>${RUBLE_SYMBOL}</span>`;
  cartSubmit.disabled = true;
};

export const renderCartItems = (products, totalPrice, cartItems, ...containers) => {
  const [container, cartSubmit, cartTotalPriceElement] = containers;
  container.textContent = '';

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
      <p class="cart-item__price">${price * cartItem.count}&nbsp;<span>${RUBLE_SYMBOL}</span></p>
    `;

    container.append(listItem);
  });

  cartTotalPriceElement.innerHTML = `${totalPrice}&nbsp;<span>${RUBLE_SYMBOL}</span>`;
  cartSubmit.disabled = false;
};
