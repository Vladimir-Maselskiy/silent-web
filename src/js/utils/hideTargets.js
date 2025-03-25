function getTargetContent({ el, target, containerSelectors }) {
  if (el.children.length && !hasTextContent(el)) return null;
  const { target: targetValue, ignoreCase, removeBlock } = target;
  const elementText = el.textContent;
  const isMatch = ignoreCase
    ? elementText.toLowerCase().includes(targetValue.toLowerCase())
    : elementText.includes(targetValue);
  if (!isMatch) return null;

  const targetContent = removeBlock
    ? el.closest(containerSelectors.join(','))
    : el;
  console.log('[reddit] targetValue', targetValue);
  if (targetContent) {
    return targetContent;
  }
  return el;
}

function hasTextContent(element) {
  return Array.from(element.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ''
  );
}

export const hideTargets = ({
  targets,
  hideStyle,
  selectors,
  containerSelectors,
}) => {
  const targetElement = document.body;
  targets.forEach(target => {
    const elements = targetElement.querySelectorAll(selectors.join(','));
    elements.forEach(el => {
      const targetElement = getTargetContent({
        el,
        target,
        containerSelectors,
      });

      if (targetElement) {
        targetElement.classList.add('silent-blocking-extension');
        hideStyle === 'off'
          ? targetElement.classList.add('hidden')
          : targetElement.classList.remove('hidden');
        targetElement.setAttribute('data-silent-blocking-extension', 'true');
      }
    });
  });
};
