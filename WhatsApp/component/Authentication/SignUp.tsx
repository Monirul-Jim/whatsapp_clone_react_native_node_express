import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useRegisterUserMutation} from '../redux/api/authApi';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const SignUp = ({navigation}: {navigation: any}) => {
  const [registerUser, {isLoading}] = useRegisterUserMutation();
  const {
    control,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm<FormData>();

  // const onSubmit = async (data: FormData) => {
  //   try {
  //     const response = await registerUser(data).unwrap();
  //     navigation.navigate('Login');
  //   } catch (error) {
  //     console.error('Registration Failed:', error);
  //   }
  // };
  const onSubmit = async (data: FormData) => {
    try {
      const response = await registerUser(data).unwrap();
      navigation.navigate('Login'); // Navigate to Login after successful registration
    } catch (error: any) {
      console.error('Registration Failed:', error);

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
      <Text style={styles.header}>Sign Up</Text>

      {/* First Name */}
      <Controller
        control={control}
        name="firstName"
        rules={{required: 'First name is required'}}
        render={({field: {onChange, onBlur, value}}) => (
          <>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="First Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
          </>
        )}
      />

      {/* Last Name */}
      <Controller
        control={control}
        name="lastName"
        rules={{required: 'Last name is required'}}
        render={({field: {onChange, onBlur, value}}) => (
          <>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Last Name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
          </>
        )}
      />

      {/* Email */}
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
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </>
        )}
      />

      {/* Password */}
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

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')} // Navigate to SignIn
      >
        <Text style={styles.loginText}>Already have an account? Log In</Text>
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
  loginLink: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#3498db',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  buttonDisabled: {
    backgroundColor: '#a1c4fd', // Light blue for disabled state
  },
});

export default SignUp;
