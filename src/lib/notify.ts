import {Alert, Platform} from 'react-native';

// Alert.alert is a no-op in react-native-web.
export function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
