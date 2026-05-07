const GlareHover = ({
  element,
  width = '500px',
  height = '500px',
  background = '#000',
  borderRadius = '10px',
  borderColor = '#333',
  glareColor = '#ffffff',
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false
} = {}) => {
  if (!element) return;

  const hex = glareColor.replace('#', '');
  let rgba = glareColor;
  
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  element.classList.add('glare-hover');
  if (playOnce) {
    element.classList.add('glare-hover--play-once');
  }

  element.style.setProperty('--gh-width', width);
  element.style.setProperty('--gh-height', height);
  element.style.setProperty('--gh-bg', background);
  element.style.setProperty('--gh-br', borderRadius);
  element.style.setProperty('--gh-angle', `${glareAngle}deg`);
  element.style.setProperty('--gh-duration', `${transitionDuration}ms`);
  element.style.setProperty('--gh-size', `${glareSize}%`);
  element.style.setProperty('--gh-rgba', rgba);
  element.style.setProperty('--gh-border', borderColor);
};

export default GlareHover;
