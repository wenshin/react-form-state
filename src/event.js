import isEventSupported from 'react-dom/lib/isEventSupported';
/**
 * trigger a DOM event via script
 * Reference From http://darktalker.com/2010/07/manually-trigger-dom-event/
 * @param {Object,String} element a DOM node/node id
 * @param {String} event a given event to be fired - click,dblclick,mousedown,etc.
 */
export function fireEvent(element, event, bubbling = true, cancelable = true) {
  let evt;
  const isString = function (it) {
    return typeof it === 'string' || it instanceof String;
  };

  element = isString(element) ? document.getElementById(element) : element;
  if (!element) return null;

  if (document.createEventObject) {
    // dispatch for IE
    evt = document.createEventObject();
    return element.fireEvent('on' + event, evt);
  }
  // dispatch for firefox + others
  evt = document.createEvent('HTMLEvents');
  evt.initEvent(event, bubbling, cancelable);
  return !element.dispatchEvent(evt);
}

export function isInputEventSupported() {
  // **Copy From 'react/lib/ChangeEventPlugin.js'**
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events
  return isEventSupported('input') && (!('documentMode' in document) || document.documentMode > 9);
}
