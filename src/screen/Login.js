import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Auth } from '../services';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        Auth.signIn(email, password);
    };

    const handleGoogleLogin = () => {
        // Google ile giriş yapma işlemleri burada gerçekleştirilebilir
    };

    const handleFacebookLogin = () => {
        // Facebook ile giriş yapma işlemleri burada gerçekleştirilebilir
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome</Text>
            <TextInput
                placeholder='Enter email'
                onChangeText={text => setEmail(text)}
                style={styles.textInput}
            />
            <TextInput
                placeholder='Enter password'
                onChangeText={text => setPassword(text)}
                style={styles.textInput}
                secureTextEntry={true}
            />
            <TouchableOpacity onPress={handleLogin}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupText}>Create account</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoogleLogin}>
            <View style={styles.googleButton}>
                <Text style={styles.buttonText}>Login with Google</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFacebookLogin}>
            <View style={styles.facebookButton}>
                <Text style={styles.buttonText}>Login with Facebook</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F8FF',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333333',
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        color: '#333333',
        fontSize: 18,
        width: '100%',
        height: 40,
        marginVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#CCCCCC',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        backgroundColor: '#32CD32',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signupText: {
        marginTop: 20,
        fontSize: 16,
        color: 'grey',
        textDecorationLine: 'underline',
    },
    googleButton: {
        backgroundColor: '#EA4335',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
        paddingVertical: 12,
        paddingHorizontal: 50,
        borderRadius: 20,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default Login;
