'use strict';

(async () => {
  if (!window.hasRun) {
    window.hasRun = true;
    const selectors = [
      'div',
      'span',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'li',
      'a',
      'img',
      'b',
      'strong',
    ];

    let observer = null;
    const isDefaultCanBeBlocking = await chrome.runtime.sendMessage({
      type: 'GET_IS_DEFAULT_CAN_BE_BLOCKING',
    });

    if (!isDefaultCanBeBlocking) return;

    const throttledToggleBlocking = throttle(isBlocking => {
      if (isBlocking) {
        startBlocking();
        console.log('[all domains] startBlocking');
      } else {
        stopBlocking();
        console.log('[all domains] stopBlocking');
      }
    }, 500);

    async function startScript() {
      console.log('[all domains] startScript');
      const isBlocking = await chrome.runtime.sendMessage({
        type: 'GET_IS_BLOCKING',
      });
      throttledToggleBlocking(isBlocking);
    }

    async function startBlocking() {
      const targets = await getTargets();
      const hideStyle = await chrome.runtime.sendMessage({ type: 'GET_STYLE' });
      // console.log('[all domains] hideStyle', hideStyle);

      hideTargets({ targets, hideStyle });
      startObserber({ targets, hideStyle });
    }

    async function stopBlocking() {
      observer && observer.disconnect();
      setTimeout(() => {
        const observedTargets = document.querySelectorAll(
          '.silent-blocking-extension'
        );
        observedTargets.forEach(el => {
          el.classList.remove('silent-blocking-extension');
          el.classList.remove('hidden');
          el.removeAttribute('data-silent-blocking-extension');
        });
      }, 500);
    }

    async function getTargets() {
      return await chrome.runtime.sendMessage({
        type: 'GET_TARGETS',
      });
    }

    function hideTargets({ targets, hideStyle }) {
      const targetElement = document.body;
      // const targetElement = element ? element : document.body;
      targets.forEach(target => {
        const elements = targetElement.querySelectorAll(selectors.join(','));
        elements.forEach(el => {
          const targetElement = getTargetContent({ el, target });

          if (targetElement) {
            targetElement.classList.add('silent-blocking-extension');
            hideStyle === 'off'
              ? targetElement.classList.add('hidden')
              : targetElement.classList.remove('hidden');
            targetElement.setAttribute(
              'data-silent-blocking-extension',
              'true'
            );
          }
        });
      });
    }

    function startObserber({ targets, hideStyle }) {
      observer && observer.disconnect();
      const throttledHideTargets = throttle(
        () => hideTargets({ targets, hideStyle }),
        500
      );
      observer = new MutationObserver(mutations => {
        throttledHideTargets();
        console.log('[all domains] hideStyle', hideStyle);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    function throttle(func, limit) {
      let lastFunc;
      let lastRan;
      return function () {
        const context = this,
          args = arguments;
        if (!lastRan) {
          func.apply(context, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function () {
            if (Date.now() - lastRan >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    }

    function getTargetContent({ el, target }) {
      if (el.children.length && !hasTextContent(el)) return null;
      const { target: targetValue, ignoreCase, removeBlock } = target;
      const tagName = el.tagName.toLowerCase();

      const targetEl = ['b'].includes(tagName) ? el.parentNode : el;
      const elementText = targetEl.textContent;
      const isMatch = ignoreCase
        ? elementText.toLowerCase().includes(targetValue.toLowerCase())
        : elementText.includes(targetValue);
      if (!isMatch) return null;

      const targetContent = removeBlock
        ? targetEl.closest(['article', 'div'].join(','))
        : targetEl;
      if (targetContent) {
        return targetContent;
      }

      return targetEl;
    }

    function hasTextContent(element) {
      return Array.from(element.childNodes).some(
        node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== ''
      );
    }

    startScript();

    chrome.runtime.onMessage.addListener(async (request, sender, response) => {
      if (request.type === 'REINIT_BLOCKING' && isDefaultCanBeBlocking) {
        startScript();

        return response(true);
      }
    });
  }
})();
