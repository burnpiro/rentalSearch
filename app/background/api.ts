declare const chrome: any;

type APIResponse = {
  code: 200 | 400 | 500;
  payload: any;
}
const sendMessage = (messageObj: object, callback: (response: APIResponse) => void) => {
  chrome.runtime.sendMessage(messageObj, callback)
}

const sendGetMessage = (propertyName: string, callback: (response: APIResponse) => void) => {
  sendMessage({ get: propertyName }, callback)
}

const sendSetMessage = (property: any, payload: any, callback: (response: APIResponse) => void) => {
  sendMessage({ set: property, payload }, callback)
}

export {
  sendMessage,
  sendGetMessage,
  sendSetMessage
}