import Toast from 'react-native-toast-message';

const ToastNotification = {
  show: (type, title, message) => {
    Toast.show({
      type,
      position: 'top',
      text1: title,
      text2: message,
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60
    });
  }
};

export default ToastNotification;