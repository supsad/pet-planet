import {
  getPageElements,
  hiddenPageScroll,
  renderCartItems,
  renderNotificationMessageOverlay,
  revertPageScroll,
  setPageInert,
  renderEmptyCart,
} from './dom';
import {fetchCartItems, submitOrder} from './api';
import {getDeliveryDate} from './date';

const cartElements = {};

export const getCartElements = () => {
  const cartButton = document.querySelector('.store__cart-button');
  const cartCount = cartButton.querySelector('.store__cart-count');

  const modalOverlay = document.querySelector('.modal-overlay');
  const cartItemsList = modalOverlay.querySelector('.modal-cart__shopping-list');
  const cartTotalPriceElement = modalOverlay.querySelector('.modal-cart__total-price');
  const cartForm = modalOverlay.querySelector('.modal-cart__pickup-form');
  const cartSubmit = cartForm.querySelector('.modal-cart__submit-button');

  getPageElements(
    cartElements,
    {
      cartButton,
      cartCount,
      modalOverlay,
      cartItemsList,
      cartTotalPriceElement,
      cartForm,
      cartSubmit,
    },
  );
};
const getCartItems = () => JSON.parse(localStorage.getItem('cartItems') || '[]');
const getProductDetails = () => JSON.parse(localStorage.getItem('cartProductDetails') || '[]');


export const isCartOpen = () => cartElements.modalOverlay.classList.contains('modal-overlay_show');

// * For the cart, the total number of products in it is made, and not by product name
export const updateCartCount = () => {
  const cartItems = getCartItems();
  cartElements.cartCount.textContent = cartItems.reduce((count, item) => count + item.count, 0);
};

export const addToCart = (productId) => {
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

const calculateTotalPrice = (cartItems, products) => {
  return cartItems.reduce((acc, item) => {
    const product = products.find(product => product.id === item.id);
    return acc + product.price * item.count;
  }, 0);
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

  const products = getProductDetails();
  const totalPrice = calculateTotalPrice(cartItems, products);

  updateCartCount();

  if (!cartItems.length) {
    renderEmptyCart(
      totalPrice,
      cartElements.cartItemsList, cartElements.cartSubmit, cartElements.cartTotalPriceElement
    );
    return;
  }

  renderCartItems(
    products, totalPrice, cartItems,
    cartElements.cartItemsList, cartElements.cartSubmit, cartElements.cartTotalPriceElement,
  );
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

const closeCartHandler = ({target, currentTarget}) => {
  if (target === currentTarget || target.closest('.modal-overlay__close-button')) {
    closeCart();
  }
};

const closeCart = () => {
  setPageInert(false);
  revertPageScroll();

  cartElements.modalOverlay.classList.remove('modal-overlay_show');
  cartElements.modalOverlay.removeEventListener('click', closeCartHandler);
  cartElements.cartItemsList.removeEventListener('click', quantityButtonHandler);
  cartElements.cartForm.removeEventListener('submit', cartFormHandler);
};

const cartFormHandler = async (ev) => {
  ev.preventDefault();

  const storeId = cartElements.cartForm['delivery-address'].value;
  const cartItems = getCartItems();

  const products = cartItems.map(({id, count}) => ({
    id,
    quantity: count,
  }));

  const {orderId} = await submitOrder(storeId, products);

  if (orderId === undefined || orderId === null) {
    throw new Error(`Ошибка отправки данных. ID заказа: ${orderId}`);
  }

  localStorage.removeItem('cartItems');
  localStorage.removeItem('cartProductDetails');

  updateCartCount();
  closeCart();
  renderNotificationMessageOverlay(
    'Ваш заказ оформлен.',
    `Номер заказа: ${orderId}\n
    Вы можете забрать его ${getDeliveryDate()} после 12:00.\n`,
  );
};

// * I didn't add a loader for opening the cart, as I think it worsens UX
export const openCart = async () => {
  setPageInert(true);
  cartElements.modalOverlay.addEventListener('click', closeCartHandler);

  const cartItems = getCartItems();

  if (!cartItems.length) {
    renderEmptyCart(
      0,
      cartElements.cartItemsList, cartElements.cartSubmit, cartElements.cartTotalPriceElement
    );
    return;
  }

  const ids = cartItems.map(item => item.id);

  const products = await fetchCartItems(ids);
  localStorage.setItem('cartProductDetails', JSON.stringify(products));

  const totalPrice = calculateTotalPrice(cartItems, products);
  renderCartItems(
    products, totalPrice, cartItems,
    cartElements.cartItemsList, cartElements.cartSubmit, cartElements.cartTotalPriceElement,
  );

  cartElements.cartItemsList.addEventListener('click', quantityButtonHandler);
  cartElements.cartForm.addEventListener('submit', cartFormHandler);
};

export const cartButtonHandler = () => {
  cartElements.cartButton.addEventListener('click', (ev) => {
    ev.preventDefault();

    cartElements.modalOverlay.classList.add('modal-overlay_show');
    hiddenPageScroll();

    void openCart();
  });
};
