'use strict';

// * API /api/products/category
const API_URL = 'https://cyber-dark-scar.glitch.me';

const productList = document.querySelector('.store__catalog');

const createProductCard = (product) => {
  const productCard = document.createElement('li');
  productCard.classList.add('product-card', 'catalog__item');

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

void fetchProductByCategory('Домики');
