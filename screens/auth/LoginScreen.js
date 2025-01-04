import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
// import { Feather } from '@expo/vector-icons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import ClientPortalLg from '../../assets/logo.svg';
import Routes from '../../navigation/Routes';
import { post_login } from "../../service/api";
import { setAuth, setTwoFA, setCurrentUser, clearAuth } from '../../redux/authSlice';



const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for spinner


  const dispatch = useDispatch();
  // Validate email and password
  const validateInputs = () => {
    let valid = true;
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSignIn = async () => {
    console.log('password :>> ', password);
    // event?.preventDefault();

    if (!validateInputs()) return

    setLoading(true)
      const response = await post_login({
        email: email,
        password: password,
      });


      setLoading(false);

      console.log('response :>> ', response);


      if (response) {
        const data = response.data.data;
        console.log("data", data)
        // Check if two-factor authentication is required
        if (data.twoFaRequired) {
          console.log('data two :>> ', data.twoFaRequired);
          dispatch(
            setTwoFA({
              methods: data.methods,
              recipient: data.recipient,
            })
          );
          navigation.navigate(Routes.TWOFACTORAUTHSCREEN); // Navigate to the 2FA screen
          return;
        }

        // Check for accessToken in the response
        if (!data.accessToken) {
          dispatch(clearAuth()); // Clear auth if there's no access token
          return;
        }

        // Set auth state if accessToken is present
        dispatch(
          setAuth({
            accessToken: data.accessToken,
            expiryTime: data.expiresAt,
            refreshToken: data.refreshToken,
            method: data.method,
          })
        );
      }
      else {
        dispatch(clearAuth());
      }

  };

  // const handleLogin = async (event?: React.FormEvent<HTMLFormElement>) => {
  //   event?.preventDefault();

  //   const isValid = validateInput({
  //     input: {
  //       email: input["email"],
  //       password: input["password"],
  //     },
  //     setError,
  //   });
  //   if (!isValid) return handleLoginError();
  //   setLoading(true);
  //   const response = await backend().post_login({
  //     email: input["email"],
  //     password: input["password"],
  //   });
  //   setLoading(false);
  //   if (response) {
  //     const data = response.data.data;
  //     if (data.twoFaRequired) {
  //       dispatch(
  //         setTwoFA({
  //           methods: data.methods,
  //           recipient: data.recipient,
  //         })
  //       );
  //       router.push(routes.send2fa);
  //       return;
  //     }
  //     // check for the presence of accessToken
  //     if (!data.accessToken) return;
  //     dispatch(
  //       setAuth({
  //         accessToken: data.accessToken,
  //         expiryTime: data.expiresAt,
  //         refreshToken: data.refreshToken,
  //         method: data.method,
  //       })
  //     );
  //     const authResponse = await backend().auth();
  //     if (authResponse) {
  //       const authData: User = authResponse.data.data;
  //       if (!authData.twoFactorMethod?.length) {
  //         router.push(routes["2fa"]);
  //       } else {
  //         dispatch(setCurrentUser(authData));
  //         router.push(routes.dashboard);
  //       }
  //       // handleLoginSuccessful(authResponse);
  //     } else {
  //       dispatch(setCurrentUser(null));
  //     }
  //   } else {
  //     dispatch(resetAuth());
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* Logo Placeholder */}
      <ClientPortalLg width={200} height={200} style={styles.logo} />
      {/* <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.logo} /> */}

      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Enter your login details to access your account</Text>

      <View style={styles.inputContainer}>
        <FeatherIcon name="mail" size={18} color="#666" style={styles.icon} />
        <TextInput
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, emailError && styles.inputError]}
          keyboardType="email-address"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <View style={styles.inputContainer}>
        <FeatherIcon name="lock" size={18} color="#666" style={styles.icon} />
        <TextInput
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          style={[styles.input, passwordError && styles.inputError]}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <FeatherIcon
            name={isPasswordVisible ? 'eye' : 'eye-off'}
            size={18}
            color="#666"
            style={styles.showPasswordButton}
          />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkbox}>
          <View style={[styles.checkboxInner, rememberMe && styles.checkboxChecked]} />
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>Remember me</Text>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password</Text>
        </TouchableOpacity>
      </View>



      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" /> // Show spinner when loading
        ) : (
          <Text style={styles.signInButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  showPasswordButton: {
    padding: 5,
  },
  checkboxContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3da4ab',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  forgotPassword: {
    marginLeft: 'auto',
    color: '#3da4ab',
    textDecorationLine: 'underline',
  },
  // signInButton: {
  //   width: '100%',
  //   backgroundColor: '#3da4ab',
  //   paddingVertical: 10,
  //   borderRadius: 8,
  //   alignItems: 'center',

  // },

  signInButton: {
    backgroundColor: '#3da4ab',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignInScreen;
