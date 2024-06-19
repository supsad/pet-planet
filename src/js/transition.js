import anime from 'animejs/lib/anime.es.js';

const StubAnimParameters = {
  ELEMENT_CLASS: '.body-stub',
  DURATION_MILLIS: 1500, // * (3sec / 2)
  DELAY: 200,
  EASING_TYPE: 'easeInOutQuad',
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
  DURATION_MILLIS: 0, // * sec
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

const transitionAnimationTemplate = (element, side = '', type = '') => {
  const parameters = side === 'left' ? LeftStubElement : RightStubElement;
  const {OPEN_POSITION_PERCENTAGE: open, CLOSE_POSITION_PERCENTAGE: close} = parameters;

  return {
    targets: `${StubAnimParameters.ELEMENT_CLASS} ${element}`,
    translateX: type === 'close' ? [`${open[0]}%`, `${close[0]}%`] : [`${close[0]}%`, `${open[0]}%`],
    translateY: type === 'close' ? [`${open[1]}%`, `${close[1]}%`] : [`${close[1]}%`, `${open[1]}%`],
  };
};

export const transitionAnimationHandler = async (type, callbackFn) => {
  const {ELEMENT_CLASS: leftClass} = LeftStubElement;
  const {ELEMENT_CLASS: rightClass} = RightStubElement;

  const timeline = anime.timeline({
    duration: StubAnimParameters.DURATION_MILLIS,
    easing: StubAnimParameters.EASING_TYPE,
  });

  const leftAnimation = transitionAnimationTemplate(leftClass, 'left', type);
  const rightAnimation = transitionAnimationTemplate(rightClass, 'right', type);

  timeline
    .add(leftAnimation, 0)
    .add(rightAnimation, 0);

  if (callbackFn) {
    return await timeline.finished.then(() => callbackFn());
  }

  return timeline;
};
