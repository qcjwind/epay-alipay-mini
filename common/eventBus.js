import { isFunction } from '/utils/types';
const eventQueue = {};

/**
 * @summary Randomly generate uuids
 * @return {string} Uuid string
 * by www.jbxue.com
 */
export function randomUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0;
    let v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @summary Monitoring event
 * @param {string} eventName
 * @param {function} callback
 * @param {string} target 'this' points to
 * @param {string} id unique identifier
 * @return {string} If no id is set, a random uuid will be returned
 */
export const eventOn = (eventName, callback, target, id) => {
  if (!target) {
    throw new Error('target required!');
  }
  if (!id) {
    id = randomUuid();
  }
  if (eventQueue.hasOwnProperty(eventName)) {
    eventQueue[eventName].push({
      target,
      eventName,
      callback,
      id,
    });
  } else {
    eventQueue[eventName] = [{
      target,
      eventName,
      callback,
      id,
    }];
  }
  return id;
};

/**
 * @summary Trigger event
 * @param {string} eventName
 * @param {*} params Parameters passed for event
 * @param {string} id unique identifier
 */
export const eventEmit = (eventName, params, id) => {
  if (eventQueue.hasOwnProperty(eventName) && eventQueue[eventName].length > 0) {
    if (!id) {
      eventQueue[eventName].forEach((item) => {
        if (isFunction(item.callback)) {
          item.callback.call(item.target, params);
        }
      });
      return;
    }
    const foundItem = eventQueue[eventName].find((item) => item.id === id);
    if (foundItem && isFunction(foundItem.callback)) {
      foundItem.callback.call(foundItem.target, params);
    }
  }
};

/**
 * @summary Triggering a one-time monitoring event will remove the monitoring event list or event source. 
 * @summary If there is no ID, the event list will be removed,
 * @summary and if there is an ID, only the event source corresponding to the ID will be removed.
 * @param {string} eventName
 * @param {*} params Parameters passed for event
 * @param {string} id unique identifier
 */
export const eventOnceEmit = (eventName, params, id) => {
  if (eventQueue.hasOwnProperty(eventName) && eventQueue[eventName].length > 0) {
    if (!id) {
      eventQueue[eventName].forEach((item) => {
        if (isFunction(item.callback)) {
          item.callback.call(item.target, params);
        }
      });
      eventQueue[eventName] = [];
      return;
    }
    const foundIndex = eventQueue[eventName].findIndex((item) => item.id === id);
    const eventNameQueue = eventQueue[eventName];
    if (foundIndex > -1 && isFunction(eventNameQueue[foundIndex].callback)) {
      eventNameQueue[foundIndex].callback.call(eventNameQueue[foundIndex].target, params);
      eventNameQueue.splice(foundIndex, 1);
    }
  }
};

/**
 * @summary Remove the corresponding ID event or remove the event list
 * @param {string} eventName
 * @param {string} id unique identifier
 * @param {boolean} removeAll Remove the list of all corresponding event names
 */
export const eventOff = (eventName, id, removeAll) => {
  if (eventQueue.hasOwnProperty(eventName) && eventQueue[eventName].length > 0) {
    if (removeAll) {
      eventQueue[eventName] = [];
      return;
    }
    if (!id) {
      return;
    }
    const foundIndex = eventQueue[eventName].findIndex((item) => item.id === id);
    if (foundIndex > -1) {
      eventQueue[eventName].splice(foundIndex, 1);
    }
  }
};