import barba from '@barba/core';
import {removeNoJs, renderBodyStubTransit, renderStoreButton} from './js/dom';
import {storeInit} from './js/store'
import {showBodyTransition, transitionAnimationHandler,} from './js/transition';

/*
 * Because I wanted to make SPA-like training application out of this,
 * I needed to rewrite the code in the map scripts and store so that global variables
 * did not work when the main page was loaded.
 * I agree that this looks like the biggest crutch,
 * but attempts to load the script of another page when it is opened,
 * or to make some kind of bus, were not successful
 * Therefore, on vanilla JS I only came up with this solution
 */

// TODO Сделать переход похожий переход на загрузку страницы, чтобы она плавно перетекала
// TODO Отключить загрузку, если статус страницы 304 - закэшированно
// TODO Попытаться исправить NS_BINDING_ABORTED при переходе на index.html ->
// ! В хром не работает переход, так как нужно дополнительно настроить роутинг (из-за открытия /pet-planet)

const init = () => {
  removeNoJs();
  const transit = renderBodyStubTransit(document.body);

  barba.init({
    debug: true,
    views: [
      {
        namespace: 'home',
        beforeEnter: (data) => renderStoreButton(),
      },
      {
        namespace: 'store',
        afterEnter: (data) => storeInit(),
      }
    ],
    transitions: [{
        name: 'default-transition',
        async leave({next}) {
          transit.classList.remove('visually-hidden');
          await transitionAnimationHandler(
            'close',
            () => next.container.remove(),
          );
        },
        async enter({next}) {
          await showBodyTransition(
            next.container,
            async () => {
              await transitionAnimationHandler(
                'open',
                () => transit.classList.add('visually-hidden'),
              );
            },
          );
        },
      }],
  });
};

document.addEventListener('DOMContentLoaded', init);
