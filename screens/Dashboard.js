import React, { useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useSelector } from 'react-redux';
import Routes from '../navigation/Routes';


const Dashboard = ({ navigation }) => {
  const { accessToken, expiryTime, currentUser, refreshToken, method } = useSelector((state) => state.auth);

// Encode user data for safe transmission in the URL
const encodedUser = encodeURIComponent(JSON.stringify(currentUser));

// Construct the dashboard URL with query parameters
const dashboardUrl = `http://192.168.115.128:3000/dashboard?accessToken=${encodeURIComponent(accessToken)}&expiryTime=${encodeURIComponent(expiryTime)}&currentUser=${encodedUser}&refreshToken=${encodeURIComponent(refreshToken)}&method=${encodeURIComponent(method)}`;

console.log('Dashboard URL:', dashboardUrl);

  const webViewRef = useRef(null);

  const navigateToLogin = () => {
    navigation.navigate(Routes.AUTH_SIGN_IN);
  };

  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    if (url.includes('/login') && !accessToken) {
      console.warn('No token found. Redirecting to login screen.');
      navigateToLogin();
    } else if (url.includes('/dashboard')) {
      console.log('Successfully navigated to the dashboard.');
    }
  };
  
  

  const injectedJavaScript = `
    (function() {
      console.log('Token Injected:', '${accessToken}');
      localStorage.setItem('token', '${accessToken}');
      document.cookie = "Authorization=Bearer ${accessToken}; path=/";
      console.log('Injected token:', localStorage.getItem('token'));
    })();
    true;
  `;

  return (
    <View style={styles.container}>
     <WebView
      ref={webViewRef}
      source={{
        uri: dashboardUrl,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      }}
      injectedJavaScript={injectedJavaScript} // Runs once after the page loads
      onLoadEnd={() => {
        console.log("Injecting token during onLoadEnd...");
        if (accessToken) {
          webViewRef.current.injectJavaScript(`
            (function() {
              localStorage.setItem('token', '${accessToken}');
              document.cookie = "Authorization=Bearer ${accessToken}; path=/";
              console.log('Injected token during onLoadEnd.');
            })();
          `);
        }
      }}
  javaScriptEnabled={true}
  domStorageEnabled={true}
  originWhitelist={["*"]}
  onNavigationStateChange={handleNavigationStateChange}
  startInLoadingState={true}
  renderLoading={() => (
    <ActivityIndicator size="large" color="#3da4ab" style={styles.loading} />
  )}
  thirdPartyCookiesEnabled={true}
  onError={({ nativeEvent }) => {
    console.log("WebView error:", nativeEvent);
    navigateToLogin();
  }}
  onHttpError={({ nativeEvent }) => {
    console.log("HTTP error:", nativeEvent);
    if (nativeEvent.statusCode === 401) {
      navigateToLogin();
    }
  }}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
});

export default Dashboard;
