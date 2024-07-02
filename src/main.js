import barba from '@barba/core';
import {removeNoJs, renderBodyStubTransit, renderStoreButton, setScrollWindowToTop} from './js/dom';
import {storeInit} from './js/store'
import {showBodyTransition, transitionAnimationHandler} from './js/animation';

/*
 * Because I wanted to make SPA-like training application out of this,
 * I needed to rewrite the code in the map scripts and store so that global variables
 * did not work when the main page was loaded.
 * I agree that this looks like the biggest crutch,
 * but attempts to load the script of another page when it is opened,
 * or to make some kind of bus, were not successful
 * Therefore, on vanilla JS I only came up with this solution
 */

const init = () => {
  removeNoJs();

  barba.init({
    views: [
      {
        namespace: 'home',
        beforeEnter: () => renderStoreButton(),
      },
      {
        namespace: 'store',
        afterEnter: () => storeInit(),
      }
    ],
    transitions: [{
      name: 'default-transition',
      async leave({next}) {
        renderBodyStubTransit(document.body)
          .classList.add('body-stub_transition');
        await transitionAnimationHandler(
          '.body-stub_transition',
          'close',
          () => next.container.remove(),
        );
      },
      async enter({next}) {
        await showBodyTransition(
          next.container,
          async () => {
            setScrollWindowToTop();
            await transitionAnimationHandler(
              '.body-stub_transition',
              'open',
              () => document
                .querySelector('.body-stub')
                .remove(),
            );
          },
        );
      },
    }],
  });
};

document.addEventListener('DOMContentLoaded', init);
