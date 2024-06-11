import barba from '@barba/core';
import anime from 'animejs/lib/anime.es.js';
import {renderStoreButton} from './js/dom';
import {storeInit} from './js/store'

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
  document.documentElement.classList.remove('no-js');

  barba.init({
    views: [{
      namespace: 'home',
      afterEnter() {
        renderStoreButton();
      },
    }, {
      namespace: 'store',
      afterEnter() {
        console.log('work store');
        storeInit();
      },
    }],
    transitions: [{
      name: 'opacity-transition',
      sync: true,
      async leave(data) {
        return anime({
          targets: '.barba-wrapper',
          opacity: 0,
        });
      },
      async enter(data) {
        return anime({
          targets: '.barba-wrapper',
          opacity: 1,
        });
      }
    }]
  });
};

document.addEventListener('DOMContentLoaded', init);
