'use strict';

// * API /api/products/category
const API_URL = 'https://cyber-dark-scar.glitch.me';

const categoryButtons = document.querySelectorAll('.store__categories-item');

const renderCategories = (currentCategory) => {
  let activeTarget = currentCategory;

  categoryButtons.forEach(category => {
    category.addEventListener('click', (e) => {
      e.preventDefault();

      if (activeTarget !== e.currentTarget) {
        activeTarget.classList.remove('store__categories-item_current');
      }

      activeTarget = e.currentTarget;
      activeTarget.classList.add('store__categories-item_current');
      void fetchProductByCategory(`${e.target.textContent}`);
    });
  });
};


const productList = document.querySelector('.store__catalog');

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

const isHasCurrentCategory = () => [...categoryButtons].some(el => {
  return el.classList.contains('is-selected');
});


const init = () => {
  let currentCategory;

  !isHasCurrentCategory
    ? currentCategory = document.querySelector('.store__categories-item_current')
    : currentCategory = categoryButtons[0];

  void fetchProductByCategory(`${currentCategory.firstElementChild.textContent}`);
  renderCategories(currentCategory);
};

document.addEventListener('DOMContentLoaded', init);
