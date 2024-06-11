import localStorageHandler from './storage';
import {fetchProductsByCategory} from './api';
import {
  hiddenPageScroll,
  removeLoader,
  renderCartErrorMessage,
  renderLoader,
  renderProducts,
  renderWindowLoaderFinisher,
  revertPageScroll,
  setPageInert,
  renderBodyStab,
  getPageElements
} from './dom';
import {addToCart, isCartOpen, openCart, updateCartCount, cartButtonHandler, getCartElements} from './cart';

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

const changeCategories = async () => {
  let currentCategory = getCurrentCategory();
  currentCategory ??= setDefaultCategory(currentCategory);

  try {
    const products = await fetchProductsByCategory(
      `${currentCategory.firstElementChild.dataset.category}`,
    );
    renderProducts(products, storeElements.productList);
  } catch (e) {
    throw new Error(`Не удалось загрузить каталог товаров: ${e}`);
  } finally {
    const loader = document.querySelector('.loader');
    setTimeout(() => {
      setPageInert(false);
      revertPageScroll();
    }, 1500);
    renderWindowLoaderFinisher(loader, 1500);
    removeLoader(loader, 3000, true);
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

const getCurrentCategory = () => [...storeElements.categoryButtons].find(el => {
  return el.classList.contains('store__categories-item_current');
});

export const storeInit = () => {
  // * loading page
  setPageInert(true);
  hiddenPageScroll();
  const stab = renderBodyStab(document.body);
  renderLoader(stab);

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

  void changeCategories();
  cartButtonHandler();

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
