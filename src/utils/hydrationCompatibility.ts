const markerAttributes = ['bis_skin_checked', 'bis_register'];
const markerSelector = markerAttributes.map(name => `[${name}]`).join(',');
let finishCleanup: (() => void) | undefined;

/** Remove only known extension bookkeeping, never application attributes/content. */
export function cleanExtensionMarkers(root: Document | Element) {
  const cleanElement = (element: Element) => {
    for (const name of markerAttributes) {
      if (element.hasAttribute(name)) element.removeAttribute(name);
    }
    if (element.tagName === 'BODY') {
      for (const name of element.getAttributeNames()) {
        if (/^__processed_[\w-]+__$/.test(name)) element.removeAttribute(name);
      }
    }
  };
  if (root.nodeType === 1) cleanElement(root as Element);
  root.querySelectorAll(markerSelector).forEach(cleanElement);
  if (root.nodeType === 9 && (root as Document).body) cleanElement((root as Document).body);
}

export function prepareExtensionSafeHydration() {
  if (typeof document === 'undefined' || finishCleanup) return;
  // Next runs instrumentation-client synchronously before hydrateRoot, including
  // framework metadata nodes outside the application's component subtree.
  cleanExtensionMarkers(document);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') cleanExtensionMarkers(record.target as Element);
      else for (const node of record.addedNodes) {
        if (node.nodeType === 1) cleanExtensionMarkers(node as Element);
      }
    }
  });
  observer.observe(document, {subtree:true, childList:true, attributes:true, attributeFilter:markerAttributes});
  const timer = window.setTimeout(finishExtensionSafeHydration, 15000);
  finishCleanup = () => {
    observer.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener('pagehide', finishExtensionSafeHydration);
  };
  window.addEventListener('pagehide', finishExtensionSafeHydration, {once:true});
}

export function finishExtensionSafeHydration() {
  finishCleanup?.();
  finishCleanup = undefined;
}
