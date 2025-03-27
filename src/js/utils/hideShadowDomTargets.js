export const hideShadowDomTargets = ({
  targets,
  hideStyle,
  shadowDomSelectors,
  getShadowDomTargetContentModule,
}) => {
  if (!shadowDomSelectors.length) return;
  const targetElement = document.body;
  targets.forEach(target => {
    const elements = targetElement.querySelectorAll(
      shadowDomSelectors.map(({ selector }) => selector).join(',')
    );
    elements.forEach(el => {
      const targetElement =
        getShadowDomTargetContentModule.getShadowDomTargetContent({
          el,
          target,
          shadowDomSelectors,
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
