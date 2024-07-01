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

export const getDeliveryDate = () => {
  const date = new Date();

  // * The month in the Date has an array-like structure, so I don't increment month
  return `${date.getDate() + 1} ${MonthsRU[date.getMonth()]}`;
};
