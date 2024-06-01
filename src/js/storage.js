const isStorageAvailable = (type) => {
  let storage;
  try {
    storage = window[type];

    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);

    return true;
  } catch (err) {
    return (
      err instanceof DOMException &&
      // * everything except Firefox
      (err.code === 22 ||
        // Firefox
        err.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        err.name === 'QuotaExceededError' ||
        // Firefox
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
};

export default function localStorageHandler(callbackFn) {
  if (!isStorageAvailable('sessionStorage')) {
    throw new Error('Ваш браузер не поддерживает локальное хранилище!');
  }

  callbackFn();
};
