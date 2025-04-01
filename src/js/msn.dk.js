'use strict';

(async () => {
  const containerSelectors = ['article'];

  const shadowDomSelectors = [
    'above-river-block',
    'entry-point',
    'desktop-feed-views',
    'gallery-slideshow',
    'cs-super-container',
    'cs-responsive-feed-layout',
    'cs-infopane-card',
    'cs-card',
    'cs-responsive-infopane',
    'cs-feed-layout',
    'cs-personalized-feed',
    'cs-responsive-card',
    'cs-native-ad-card',
    'cs-content-card',
    'cp-article',
    'slide-metadata',
    'views-native-ad',
    'views-header-wc',
    'waterfall-view-feed',
  ];
  const hideTargetsModuleImport = import(
    chrome.runtime.getURL('utils/hideTargets.js')
  );

  const selectorsModuleImport = import(
    chrome.runtime.getURL('utils/getDefaultSelectors.js')
  );

  const getShadowDomTargetContentModuleImport = import(
    chrome.runtime.getURL('utils/getShadowDomTargetContent.js')
  );

  const hideShadowDomTargetsModuleImport = import(
    chrome.runtime.getURL('utils/hideShadowDomTargets.js')
  );
  const [hideTargetsModule, defaultSelectors] = await Promise.all([
    hideTargetsModuleImport,
    selectorsModuleImport,
    getShadowDomTargetContentModuleImport,
    hideShadowDomTargetsModuleImport,
  ]);

  const selectors = defaultSelectors.getDefaultSelectors();
  let observer = null;

  async function startScript() {
    let isBlocking = await chrome.runtime.sendMessage({
      type: 'GET_IS_BLOCKING',
    });

    if (isBlocking) {
      startBlocking();
    } else {
      stopBlocking();
    }
  }

  const shadowDomtargetsTagNames = [];

  const resizeObserver = new ResizeObserver(_ => {
    startScript();
    console.log('Розмір змінено у:');
  });

  async function startBlocking() {
    const targets = await getTargets();
    const hideStyle = await chrome.runtime.sendMessage({ type: 'GET_STYLE' });

    hideTargetsModule.hideTargets({
      targets,
      hideStyle,
      selectors,
      containerSelectors,
    });

    const shadowDomtargetRefs = getShadowDomTargets({
      targets,
      shadowDomSelectors,
    });
    hideShadowDomTargets({
      shadowDomtargetRefs,
      hideStyle,
    });

    console.log('shadowDomtargets', shadowDomtargetRefs);
    console.log('shadowDomtargetsTagNames', shadowDomtargetsTagNames);
    startObserber({ targets, hideStyle });
    resizeObserver.observe(document.body);
  }

  function getShadowDomTargets({
    root = document,
    targets,
    shadowDomSelectors,
  }) {
    const shadowDomtargets = [];
    function getTargetsInRecursive({ root, targets, shadowDomSelectors }) {
      const shadowDomElements = root.querySelectorAll(shadowDomSelectors);
      if (!shadowDomElements.length) {
        return;
      }

      shadowDomElements.forEach(shadowDomElement => {
        const shadowDomElementText = shadowDomElement.shadowRoot?.textContent;
        const isMatch = targets.some(target => {
          const { target: targetValue, ignoreCase } = target;
          return ignoreCase
            ? shadowDomElementText
                .toLowerCase()
                .includes(targetValue.toLowerCase())
            : shadowDomElementText.includes(targetValue);
        });
        if (isMatch) {
          shadowDomtargets.push(shadowDomElement);
        }
      });

      shadowDomElements.forEach(el => {
        el.shadowRoot &&
          getTargetsInRecursive({
            root: el.shadowRoot,
            targets,
            shadowDomSelectors,
          });
      });
    }

    getTargetsInRecursive({ root, targets, shadowDomSelectors });

    return shadowDomtargets;
  }

  function hideShadowDomTargets({ shadowDomtargetRefs, hideStyle }) {
    if (!shadowDomtargetRefs.length) return;
    const style = document.createElement('style');
    style.setAttribute('data-silent-blocking-extension', 'true');
    const styleBlurTextContentt = ` :host {
        background-color: rgb(227, 243, 250) !important;
        box-shadow: inset 0 0 0 4px lightblue !important;        
        filter: blur(5px) !important;
        }`;

    const styleOffTextContentt = ` :host {
      display: none !important;
      }`;

    const styleTextContentt =
      hideStyle === 'off' ? styleOffTextContentt : styleBlurTextContentt;

    shadowDomtargetRefs.forEach(shadowDomtargetRef => {
      const isAlreadyStyled = shadowDomtargetRef.shadowRoot.querySelector(
        '[data-silent-blocking-extension="true"]'
      );
      isAlreadyStyled && isAlreadyStyled.remove();
      const style = document.createElement('style');
      style.setAttribute('data-silent-blocking-extension', 'true');
      style.textContent = styleTextContentt;
      shadowDomtargetRef.shadowRoot.appendChild(style);
    });
  }

  async function stopBlocking() {
    observer && observer.disconnect();

    const observedTargets = document.querySelectorAll(
      '.silent-blocking-extension'
    );
    observedTargets.forEach(el => {
      el.classList.remove('silent-blocking-extension');
      el.classList.remove('hidden');
      el.removeAttribute('data-silent-blocking-extension');
    });

    stopShadowDomBlocking();
  }

  function stopShadowDomBlocking(root = document) {
    const shadowDomElements = root.querySelectorAll(shadowDomSelectors);
    if (!shadowDomElements.length) {
      return;
    }

    shadowDomElements.forEach(el => {
      if (el.shadowRoot) {
        const style = el.shadowRoot.querySelector(
          '[data-silent-blocking-extension="true"]'
        );
        style && style.remove();
      }
      stopShadowDomBlocking(el.shadowRoot);
    });
  }

  async function getTargets() {
    return await chrome.runtime.sendMessage({
      type: 'GET_TARGETS',
    });
  }

  function startObserber({ targets, hideStyle }) {
    observer && observer.disconnect();
    observer = new MutationObserver(mutations => {
      hideTargetsModule.hideTargets({
        targets,
        hideStyle,
        selectors,
        containerSelectors,
      });

      const shadowDomtargetRefs = getShadowDomTargets({
        targets,
        shadowDomSelectors,
      });
      hideShadowDomTargets({
        shadowDomtargetRefs,
        hideStyle,
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  startScript();

  chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    if (request.type === 'REINIT_BLOCKING') {
      startScript();

      return response(true);
    }
  });
})();
