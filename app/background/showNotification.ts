declare const chrome: any;
const showNotification = (config: { title: string, message: string }): void => {
  chrome.notifications.create('rentalWatchNotification', {
    type: 'basic',
    iconUrl: '/img/mainIcon.png',
    title: config.title,
    message: config.message
  }, function(notificationId) {
    setTimeout(function(){
      chrome.notifications.clear(notificationId)
    },3000);
  })
}

export default showNotification;