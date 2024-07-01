import anime from 'animejs/lib/anime.es.js';
import {renderLoader, setPageInert, hiddenPageScroll, revertPageScroll, renderBodyStubTransit} from './dom';

const LoaderParameters = {
  ENTER_ANIMATION_DURATION: 1200,
  CLOSE_ANIMATION_DURATION: 4000,
};

const StubAnimParameters = {
  ELEMENT_CLASS: '.body-stub',
  DURATION_MILLIS: 1200, // * (3sec / 2)
  DELAY: 200,
  EASING_OPEN_TYPE: 'easeInExpo',
  EASING_CLOSE_TYPE: 'easeOutExpo',
};

// * position: [x, y]
const LeftStubElement = {
  ELEMENT_CLASS: `${StubAnimParameters.ELEMENT_CLASS}__transit_left`,
  ROTATE_DEGREE: -195,
  CLOSE_POSITION_PERCENTAGE: [25, 75],
  OPEN_POSITION_PERCENTAGE: [150, 400],
};

const RightStubElement = {
  ELEMENT_CLASS: `${StubAnimParameters.ELEMENT_CLASS}__transit_right`,
  ROTATE_DEGREE: 165,
  CLOSE_POSITION_PERCENTAGE: [25, 0],
  OPEN_POSITION_PERCENTAGE: [-100, -450],
};

const BarbaAnimParameters = {
  CLASS: '.barba-wrapper',
  OPACITY: [0, 1], // * min, max
  DURATION_MILLIS: 0, // * ms
};

export const showBodyTransition = async (container, callbackFn) => {
  const {OPACITY, DURATION_MILLIS} = BarbaAnimParameters;

  const showAnimation = anime({
    targets: `${container.className}`,
    opacity: OPACITY[1],
    duration: DURATION_MILLIS,
  });

  if (callbackFn) {
    return await showAnimation.finished.then(callbackFn());
  }

  return showAnimation;
}

const getTransitionAnimationTemplate = (target, side = '', type = '') => {
  const parameters = side === 'left' ? LeftStubElement : RightStubElement;
  const {OPEN_POSITION_PERCENTAGE: open, CLOSE_POSITION_PERCENTAGE: close} = parameters;

  return {
    targets: target,
    translateX: type === 'close' ? [`${open[0]}%`, `${close[0]}%`] : [`${close[0]}%`, `${open[0]}%`],
    translateY: type === 'close' ? [`${open[1]}%`, `${close[1]}%`] : [`${close[1]}%`, `${open[1]}%`],
    easing: type === 'close' ? StubAnimParameters.EASING_CLOSE_TYPE : StubAnimParameters.EASING_OPEN_TYPE,
  };
};

export const transitionAnimationHandler = async (parentClass = '', type, callbackFn) => {
  const {ELEMENT_CLASS: leftClass} = LeftStubElement;
  const {ELEMENT_CLASS: rightClass} = RightStubElement;
  let targetStringLeft = `${parentClass} ${leftClass}`;
  let targetStringRight = `${parentClass} ${rightClass}`;

  const timeline = anime.timeline({
    duration: StubAnimParameters.DURATION_MILLIS,
  });

  if (parentClass === null || parentClass === undefined || parentClass === '') {
    targetStringLeft = leftClass;
    targetStringRight = rightClass
  }

  const leftAnimation = getTransitionAnimationTemplate(targetStringLeft, 'left', type);
  const rightAnimation = getTransitionAnimationTemplate(targetStringRight, 'right', type);

  timeline
    .add(leftAnimation, 0)
    .add(rightAnimation, 0);

  if (callbackFn) {
    return await timeline.finished.then(() => callbackFn());
  }

  return timeline;
};

export const loaderAnimationOut = () => {
  const stubLoader = document.querySelector('.body-stub_loader');
  const loader = stubLoader.querySelector('.loader');

  setPageInert(false);
  revertPageScroll();

  stubLoader.classList.add('body-stub_transparent');
  loader.classList.add('loader_leave');

  void transitionAnimationHandler(
    '.body-stub_loader',
    'open',
    () => stubLoader.remove(),
  );
};

export const loaderAnimationIn = async () => {
  const stub = renderBodyStubTransit(document.body);
  stub.zIndex = 11000;
  stub.classList.remove(
    'visually-hidden',
    'body-stub_transparent',
    'body-stub_transition'
  );
  stub.classList.add('body-stub_loader');

  setPageInert(true);
  hiddenPageScroll();

  const loader = renderLoader(stub);
  loader.classList.add('loader_enter');
  return await new Promise(resolve => {
    setTimeout(() => {
      loader.classList.remove('loader_enter')
      resolve(true);
    }, LoaderParameters.ENTER_ANIMATION_DURATION);
  });
};
