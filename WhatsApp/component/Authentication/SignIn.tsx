import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useLoginMutation} from '../redux/api/authApi';
import {useAppDispatch} from '../redux/hooks';
import {setUser} from '../redux/feature/authSlice';
import verifyToken from '../redux/feature/verifyToken';

type FormData = {
  email: string;
  password: string;
};

const SignIn = ({navigation}: {navigation: any}) => {
  const [login, {isLoading}] = useLoginMutation();
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null); // 🔹 Store API error message
  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setServerError(null); // Reset error before making a new request
      const response = await login(data).unwrap();
      const user = verifyToken(response.data.accessToken);

      dispatch(setUser({user: user, token: response.data.accessToken}));

      navigation.navigate('Chat');
    } catch (error: any) {
      console.error('Login Failed:', error);

      // 🔹 Check if there's an API error message
      if (error?.data?.message) {
        setServerError(error.data.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }

      // 🔹 Handle validation errors from API
      if (error?.status === 400 && error?.data?.errorSources) {
        error.data.errorSources.forEach(
          (err: {path: string; message: string}) => {
            setError(err.path as keyof FormData, {message: err.message});
          },
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign In</Text>

      {/* 🔹 Display the API error message here */}
      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <Controller
        control={control}
        name="email"
        rules={{required: 'Email is required'}}
        render={({field: {onChange, onBlur, value}}) => (
          <>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{required: 'Password is required'}}
        render={({field: {onChange, onBlur, value}}) => (
          <>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </>
        )}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.signupLink}
        onPress={() => navigation.navigate('Chat')}>
        <Text style={styles.signupText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  serverError: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 15,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#3498db',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    backgroundColor: '#a1c4fd',
  },
});

export default SignIn;
