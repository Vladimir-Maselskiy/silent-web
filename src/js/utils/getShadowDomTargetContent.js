export const getShadowDomTargetContent = ({
  el,
  target,
  shadowDomSelectors,
}) => {
  if (!el || !el.shadowRoot) return null;
  const { target: targetValue, ignoreCase } = target;
  const elementText = el.textContent;
  const isMatch = ignoreCase
    ? elementText.toLowerCase().includes(targetValue.toLowerCase())
    : elementText.includes(targetValue);
  if (isMatch) {
    const tagName = el.tagName.toLowerCase();
    const currentSelector = shadowDomSelectors.find(
      shadowDomSelector => shadowDomSelector.selector === tagName
    );
    if (!currentSelector) return null;
    const targetEl = el.closest(currentSelector.containerSelector);

    return targetEl;
  }
  return null;
};
