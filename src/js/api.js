// * API /api/products/category
export const API_URL = 'https://cyber-dark-scar.glitch.me';

const checkData = (data) => {
  if (!data.ok) throw new Error(`Ошибка запроса: ${data.status} ${data.statusText}`);
};

const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    checkData(response);
    return await response.json();
  } catch (e) {
    console.error(`Ошибка запроса: ${e}`);
    return [];
  }
};

export const fetchProductsByCategory = (category) =>
  fetchData(`/api/products/category/${category}`);

export const fetchCartItems = async (ids) =>
  await fetchData(`/api/products/list/${ids.join(', ')}`);

export const submitOrder = async (storeId, products) =>
  await fetchData(
    '/api/orders',
    {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({storeId, products}),
    },
  );
