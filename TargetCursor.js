const createTargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true
} = {}) => {
  // Detect mobile
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
  const isMobile = (hasTouchScreen && isSmallScreen) || isMobileUserAgent;

  if (isMobile) return null;

  // Create cursor DOM
  const wrapper = document.createElement('div');
  wrapper.className = 'target-cursor-wrapper';

  const dot = document.createElement('div');
  dot.className = 'target-cursor-dot';

  const corners = [
    { className: 'target-cursor-corner corner-tl' },
    { className: 'target-cursor-corner corner-tr' },
    { className: 'target-cursor-corner corner-br' },
    { className: 'target-cursor-corner corner-bl' }
  ];

  corners.forEach(cornerInfo => {
    const corner = document.createElement('div');
    corner.className = cornerInfo.className;
    wrapper.appendChild(corner);
  });

  wrapper.appendChild(dot);
  document.body.appendChild(wrapper);

  // State
  const state = {
    activeTarget: null,
    spinTl: null,
    cursorX: window.innerWidth / 2,
    cursorY: window.innerHeight / 2,
    activeStrength: 0,
    isActive: false,
    targetCornerPositions: null,
    resumeTimeout: null,
    currentLeaveHandler: null
  };

  const cornerElements = Array.from(wrapper.querySelectorAll('.target-cursor-corner'));
  const dotElement = wrapper.querySelector('.target-cursor-dot');

  const constants = {
    borderWidth: 3,
    cornerSize: 12
  };

  // Hide default cursor
  const originalCursor = document.body.style.cursor;
  if (hideDefaultCursor) {
    document.body.style.cursor = 'none !important';
    
    // Disable custom cursors on all elements
    const style = document.createElement('style');
    style.textContent = `
      body, a, button, .cursor-target {
        cursor: none !important;
      }
    `;
    style.id = 'target-cursor-hide-style';
    document.head.appendChild(style);
  }

  // Initialize cursor position
  gsap.set(wrapper, {
    xPercent: -50,
    yPercent: -50,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  // Spin animation
  const createSpinTimeline = () => {
    if (state.spinTl) {
      state.spinTl.kill();
    }
    state.spinTl = gsap
      .timeline({ repeat: -1 })
      .to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
  };

  createSpinTimeline();

  // Ticker function for parallax
  const tickerFn = () => {
    if (!state.targetCornerPositions || !state.isActive) {
      return;
    }

    const strength = state.activeStrength;
    if (strength === 0) return;

    const cursorX = gsap.getProperty(wrapper, 'x');
    const cursorY = gsap.getProperty(wrapper, 'y');

    cornerElements.forEach((corner, i) => {
      const currentX = gsap.getProperty(corner, 'x') || 0;
      const currentY = gsap.getProperty(corner, 'y') || 0;

      const targetX = state.targetCornerPositions[i].x - cursorX;
      const targetY = state.targetCornerPositions[i].y - cursorY;

      const finalX = currentX + (targetX - currentX) * strength;
      const finalY = currentY + (targetY - currentY) * strength;

      const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

      gsap.to(corner, {
        x: finalX,
        y: finalY,
        duration: duration,
        ease: duration === 0 ? 'none' : 'power1.out',
        overwrite: 'auto'
      });
    });
  };

  // Event listeners
  const moveCursor = (e) => {
    state.cursorX = e.clientX;
    state.cursorY = e.clientY;
    gsap.to(wrapper, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: 'power3.out'
    });
  };

  const cleanupTarget = (target) => {
    if (state.currentLeaveHandler) {
      target.removeEventListener('mouseleave', state.currentLeaveHandler);
    }
    state.currentLeaveHandler = null;
  };

  const enterHandler = (e) => {
    const directTarget = e.target;
    const allTargets = [];
    let current = directTarget;
    while (current && current !== document.body) {
      if (current.matches(targetSelector)) {
        allTargets.push(current);
      }
      current = current.parentElement;
    }
    const target = allTargets[0] || null;
    if (!target) return;
    if (state.activeTarget === target) return;
    if (state.activeTarget) {
      cleanupTarget(state.activeTarget);
    }
    if (state.resumeTimeout) {
      clearTimeout(state.resumeTimeout);
      state.resumeTimeout = null;
    }

    state.activeTarget = target;
    cornerElements.forEach(corner => gsap.killTweensOf(corner));

    gsap.killTweensOf(wrapper, 'rotation');
    state.spinTl?.pause();
    gsap.set(wrapper, { rotation: 0 });

    const rect = target.getBoundingClientRect();
    const { borderWidth, cornerSize } = constants;
    const cursorX = gsap.getProperty(wrapper, 'x');
    const cursorY = gsap.getProperty(wrapper, 'y');

    state.targetCornerPositions = [
      { x: rect.left - borderWidth, y: rect.top - borderWidth },
      { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
      { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
      { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
    ];

    state.isActive = true;
    gsap.ticker.add(tickerFn);

    gsap.to(state, {
      activeStrength: 1,
      duration: hoverDuration,
      ease: 'power2.out'
    });

    cornerElements.forEach((corner, i) => {
      gsap.to(corner, {
        x: state.targetCornerPositions[i].x - cursorX,
        y: state.targetCornerPositions[i].y - cursorY,
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    const leaveHandler = () => {
      gsap.ticker.remove(tickerFn);

      state.isActive = false;
      state.targetCornerPositions = null;
      gsap.set(state, { activeStrength: 0, overwrite: true });
      state.activeTarget = null;

      cornerElements.forEach(corner => gsap.killTweensOf(corner));
      const { cornerSize } = constants;
      const positions = [
        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
        { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
      ];
      const tl = gsap.timeline();
      cornerElements.forEach((corner, index) => {
        tl.to(
          corner,
          {
            x: positions[index].x,
            y: positions[index].y,
            duration: 0.3,
            ease: 'power3.out'
          },
          0
        );
      });

      state.resumeTimeout = setTimeout(() => {
        if (!state.activeTarget && state.spinTl) {
          const currentRotation = gsap.getProperty(wrapper, 'rotation');
          const normalizedRotation = currentRotation % 360;
          state.spinTl.kill();
          state.spinTl = gsap
            .timeline({ repeat: -1 })
            .to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
          gsap.to(wrapper, {
            rotation: normalizedRotation + 360,
            duration: spinDuration * (1 - normalizedRotation / 360),
            ease: 'none',
            onComplete: () => {
              state.spinTl?.restart();
            }
          });
        }
        state.resumeTimeout = null;
      }, 50);

      cleanupTarget(target);
    };

    state.currentLeaveHandler = leaveHandler;
    target.addEventListener('mouseleave', leaveHandler);
  };

  const scrollHandler = () => {
    if (!state.activeTarget || !wrapper) return;
    const mouseX = gsap.getProperty(wrapper, 'x');
    const mouseY = gsap.getProperty(wrapper, 'y');
    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
    const isStillOverTarget =
      elementUnderMouse &&
      (elementUnderMouse === state.activeTarget || elementUnderMouse.closest(targetSelector) === state.activeTarget);
    if (!isStillOverTarget) {
      if (state.currentLeaveHandler) {
        state.currentLeaveHandler();
      }
    }
  };

  const mouseDownHandler = () => {
    gsap.to(dotElement, { scale: 0.7, duration: 0.3 });
    gsap.to(wrapper, { scale: 0.9, duration: 0.2 });
  };

  const mouseUpHandler = () => {
    gsap.to(dotElement, { scale: 1, duration: 0.3 });
    gsap.to(wrapper, { scale: 1, duration: 0.2 });
  };

  const resetCursorPressState = () => {
    mouseUpHandler();
  };

  // Add event listeners
  window.addEventListener('mousemove', moveCursor);
  window.addEventListener('mouseover', enterHandler, { passive: true });
  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('mousedown', mouseDownHandler);
  window.addEventListener('mouseup', mouseUpHandler);
  window.addEventListener('pointerup', resetCursorPressState);
  window.addEventListener('pointercancel', resetCursorPressState);
  window.addEventListener('blur', resetCursorPressState);
  document.addEventListener('mouseup', mouseUpHandler, true);
  document.addEventListener('click', resetCursorPressState, true);
  window.addEventListener('cursor:reset', resetActiveTarget);

  // Cleanup function
  const cleanup = () => {
    gsap.ticker.remove(tickerFn);
    window.removeEventListener('mousemove', moveCursor);
    window.removeEventListener('mouseover', enterHandler);
    window.removeEventListener('scroll', scrollHandler);
    window.removeEventListener('mousedown', mouseDownHandler);
    window.removeEventListener('mouseup', mouseUpHandler);
    window.removeEventListener('pointerup', resetCursorPressState);
    window.removeEventListener('pointercancel', resetCursorPressState);
    window.removeEventListener('blur', resetCursorPressState);
    document.removeEventListener('mouseup', mouseUpHandler, true);
    document.removeEventListener('click', resetCursorPressState, true);

    if (state.activeTarget) {
      cleanupTarget(state.activeTarget);
    }

    state.spinTl?.kill();
    document.body.style.cursor = originalCursor;
    
    // Remove the cursor-hiding style
    const hideStyle = document.getElementById('target-cursor-hide-style');
    if (hideStyle) {
      hideStyle.remove();
    }
    
    wrapper.remove();

    state.isActive = false;
    state.targetCornerPositions = null;
    state.activeStrength = 0;
  };

  function resetActiveTarget() {
    if (state.resumeTimeout) {
      clearTimeout(state.resumeTimeout);
      state.resumeTimeout = null;
    }

    gsap.ticker.remove(tickerFn);
    state.isActive = false;
    state.targetCornerPositions = null;
    gsap.set(state, { activeStrength: 0, overwrite: true });

    if (state.activeTarget) {
      cleanupTarget(state.activeTarget);
    }

    state.activeTarget = null;

    cornerElements.forEach(corner => gsap.killTweensOf(corner));
    const { cornerSize } = constants;
    const positions = [
      { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
      { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
      { x: cornerSize * 0.5, y: cornerSize * 0.5 },
      { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
    ];

    const tl = gsap.timeline();
    cornerElements.forEach((corner, index) => {
      tl.to(
        corner,
        {
          x: positions[index].x,
          y: positions[index].y,
          duration: 0.3,
          ease: 'power3.out'
        },
        0
      );
    });

    mouseUpHandler();

    if (state.spinTl) {
      const currentRotation = gsap.getProperty(wrapper, 'rotation');
      const normalizedRotation = currentRotation % 360;
      state.spinTl.kill();
      state.spinTl = gsap
        .timeline({ repeat: -1 })
        .to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
      gsap.to(wrapper, {
        rotation: normalizedRotation + 360,
        duration: spinDuration * (1 - normalizedRotation / 360),
        ease: 'none',
        onComplete: () => {
          state.spinTl?.restart();
        }
      });
    }
  }
  return { cleanup };
};
