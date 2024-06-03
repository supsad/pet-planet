import localStorageHandler from './js/storage';
import {fetchProductsByCategory} from './js/api';
import {
  hiddenPageScroll,
  pageMain,
  removeLoader,
  renderCartErrorMessage,
  renderLoader,
  renderProducts,
  renderWindowLoaderFinisher,
  revertPageScroll,
  setPageInert,
  renderBodyStab
} from './js/dom';
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

  try {
    const products = await fetchProductsByCategory(
      `${currentCategory.firstElementChild.dataset.category}`,
    );
    renderProducts(products, productList);
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

  categoryButtons.forEach(category => {
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
      renderProducts(products, productList);
    });
  });
};

const getCurrentCategory = () => [...categoryButtons].find(el => {
  return el.classList.contains('store__categories-item_current');
});

const init = () => {
  setPageInert(true);
  hiddenPageScroll();
  const stab = renderBodyStab(document.body);
  renderLoader(stab);
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
