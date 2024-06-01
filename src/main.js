import localStorageHandler from './js/storage.js';
import {fetchProductsByCategory} from './js/api';
import {hiddenPageScroll, pageMain, renderCartErrorMessage, renderProducts} from './js/dom';
import {addToCart, isCartOpen, openCart, updateCartCount} from './js/cart';

const categoryButtons = pageMain.querySelectorAll('.store__categories-item');
const productList = pageMain.querySelector('.store__catalog');

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

const changeCategories = async () => {
  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  let products = await fetchProductsByCategory(
    `${currentCategory.firstElementChild.dataset.category}`,
  );
  renderProducts(products, productList);

  let activeTarget = currentCategory;

  categoryButtons.forEach(category => {
    category.addEventListener('click', async (ev) => {
      ev.preventDefault();

      if (activeTarget !== ev.currentTarget) {
        activeTarget.classList.remove('store__categories-item_current');
      }

      activeTarget = ev.currentTarget;
      activeTarget.classList.add('store__categories-item_current');
      products = await fetchProductsByCategory(
        `${ev.target.dataset.category}`,
      );
      renderProducts(products, productList);
    });
  });
};

const getCurrentCategory = () => [...categoryButtons].find(el => {
  return el.classList.contains('store__categories-item_current');
});

const init = () => {
  void changeCategories();

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
