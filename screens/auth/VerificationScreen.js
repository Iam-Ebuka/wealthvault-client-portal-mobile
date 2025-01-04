import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { post_verify_login_2fa, auth } from "../../service/api";
import Routes from '../../navigation/Routes';
import { setAuth, setCurrentUser, } from '../../redux/authSlice';

import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator
}
  from 'react-native';

const VerificationScreen = ({ navigation }) => {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(145); // 2:25 in seconds
  const { twoFaMethods, twoFaRecipient } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false); // Loading state for spinner

  const dispatch = useDispatch();

  // Timer countdown for resend option
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerificationCodeChange = (value, index) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    console.log('newCode :>> ', newCode);

    // Automatically move to the next input if not the last one and value is filled
    if (value && index < 5) {
      const nextInput = `input${index + 1}`;
      this[nextInput]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      // If the input is empty and backspace is pressed, move to the previous input
      const prevInput = `input${index - 1}`;
      this[prevInput]?.focus();

      // Clear the previous input when backspace is pressed
      const newCode = [...verificationCode];
      newCode[index - 1] = '';
      setVerificationCode(newCode);
    }
  };

  const handleSubmit = () => {
    const code = verificationCode.join('');
    if (code !== '123456') {
      setError(true);
    } else {
      setError(false);
      Alert.alert('Verification Successful');
      // Navigate to the next screen
    }
  };

  const handleLogin = async () => {
   
    const code = verificationCode.join(''); // Convert the verificationCode array to a single string
    setLoading(true);

    const response = await post_verify_login_2fa(code, twoFaMethods);
    if (response) {
      let data = response.data.data;
      // console.log("data is", data)
      // console.log('data method :>> ', data.method);
      dispatch(
        setAuth({
          accessToken: data.accessToken,
          expiryTime: data.expiresAt,
          refreshToken: data.refreshToken,
          method: data.method,
        })
      );

      navigation.navigate(Routes.DASHBOARD);

      const authResponse = await auth();
      if (authResponse) {
        // console.log('authResponse :>> ', authResponse);
        const authData = authResponse.data.data;
        // console.log("authdata", authData)
        dispatch(setCurrentUser(authData));
        // handleLoginSuccessful(authResponse);
        return response;
      } else {
        dispatch(setCurrentUser(null));
      }
    }
    setLoading(false);
  };

  const handleResendCode = () => {
    setTimer(145); // Reset timer
    setVerificationCode(Array(6).fill(''));
    setError(false);
    Alert.alert('Verification code resent');
  };

  const formattedTime = `${Math.floor(timer / 60)}:${timer % 60 < 10 ? `0${timer % 60}` : timer % 60}`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verification sent</Text>
        <Text style={styles.description}>
          We have sent a verification code to johnDoe@gmail.com. Please enter it below.
          If this isn't your email you can change it <Text style={styles.link}>here</Text>.
        </Text>

        {/* Code Input Fields without box */}
        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              style={[styles.inputUnderline, error && styles.inputError]}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(value) => handleVerificationCodeChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
              ref={(ref) => (this[`input${index}`] = ref)}
            />
          ))}
        </View>
        {error && <Text style={styles.errorText}>The verification code you entered is invalid, check the code and try again.</Text>}

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>Enter 6-digit code</Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>{formattedTime}</Text>
          ) : (
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendText}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Proceed Button */}

        <TouchableOpacity style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" /> // Show spinner when loading
          ) : (
            <Text style={styles.buttonText}>Proceed</Text>
          )}
        </TouchableOpacity>


        {/* Choose Different Method */}
        <TouchableOpacity style={styles.chooseMethodButton}>
          <Text style={styles.chooseMethodText}>Choose a different method</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    color: '#3da4ab',
    textDecorationLine: 'underline',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  inputUnderline: {
    width: 40,
    height: 50,
    fontSize: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#333',
  },
  inputError: {
    borderBottomColor: 'red',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  timerText: {
    color: '#666',
  },
  resendText: {
    color: '#3da4ab',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3da4ab',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chooseMethodButton: {
    marginTop: 8,
  },
  chooseMethodText: {
    color: '#3da4ab',
    textDecorationLine: 'underline',
  },
});
345734
export default VerificationScreen;
