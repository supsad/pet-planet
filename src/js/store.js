import localStorageHandler from './storage';
import {fetchProductsByCategory} from './api';
import {getPageElements, hiddenPageScroll, renderNotificationMessageOverlay, renderProducts} from './dom';
import {addToCart, cartButtonHandler, getCartElements, isCartOpen, openCart, updateCartCount} from './cart';
import {loaderAnimationIn, loaderAnimationOut} from './animation';

const storeElements = {};
const getProductName = () => {
  storeElements.productList.addEventListener('click', ({target}) => {
    if (!target.closest('.product-card__buy-button')) {
      return;
    }

    const productId = target.dataset.id;
    addToCart(productId);
  })
};

const setDefaultCategory = (category) => {
  category = storeElements.categoryButtons[0];

  if (!category.classList.contains('store__categories-item_current')) {
    category.classList.add('store__categories-item_current');
  }

  return category;
};

const getCurrentCategory = () => [...storeElements.categoryButtons].find(el => {
  return el.classList.contains('store__categories-item_current');
});

const changeCategories = async () => {
  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  try {
    const products = await fetchProductsByCategory(
      `${currentCategory.firstElementChild.dataset.category}`,
    );
    renderProducts(products, storeElements.productList);
  } catch (e) {
    renderNotificationMessageOverlay(
      'Уппс... Возникла ошибка!',
      `Корзина неработоспособна!\n
    Попытайтесь перезагрузить страницу.\n
    Если ничего не вышло, то обратитесь в поддержку`,
    );
    throw new Error(`Не удалось загрузить каталог товаров: ${e}`);
  } finally {
    loaderAnimationOut();
  }


  let activeTarget = currentCategory;

  storeElements.categoryButtons.forEach(category => {
    category.addEventListener('click', async (ev) => {
      ev.preventDefault();

      if (activeTarget !== ev.currentTarget) {
        activeTarget.classList.remove('store__categories-item_current');
      }

      activeTarget = ev.currentTarget;
      activeTarget.classList.add('store__categories-item_current');
      const products = await fetchProductsByCategory(
        `${ev.target.dataset.category}`,
      );
      renderProducts(products, storeElements.productList);
    });
  });
};

export const storeInit = async () => {
  // * loader
  await loaderAnimationIn();

  // * init page
  try {
    const categoryButtons = document.querySelectorAll('.store__categories-item');
    const productList = document.querySelector('.store__catalog');

    getPageElements(
      storeElements,
      {
        categoryButtons,
        productList,
      },
    );
    getCartElements();
  } catch (e) {
    console.error(`Не удалось получить элементы страницы: ${e}`);
  }

  await changeCategories();
  cartButtonHandler();

  try {
    if (isCartOpen()) {
      hiddenPageScroll();
      await openCart();
    }

    localStorageHandler(() => {
      updateCartCount();
      getProductName();
    });
  } catch (e) {
    console.error(`Ошибка открытия корзины: ${e}`);
    renderNotificationMessageOverlay(
      'Уппс... Возникла ошибка!',
      `Корзина неработоспособна!\n
    Попытайтесь перезагрузить страницу.\n
    Если ничего не вышло, то обратитесь в поддержку`,
    );
  }
};
