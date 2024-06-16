import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignUp = async () => {
        try {
            // Create user with email and password
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update the user's profile with the provided name
            await user.updateProfile({
                displayName: name,
            });

            // Save the user's name and email to Firestore
            await firestore().collection('users').doc(user.uid).set({
                name: name,
                email: email,
            });

            // Navigate to the Home screen upon successful sign-up
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error during sign-up:', error);
            setErrorMessage(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <TextInput
                placeholder='Enter name'
                onChangeText={text => setName(text)}
                style={styles.textInput}
            />
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
            <TouchableOpacity onPress={handleSignUp}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signupText}>Have an Account?</Text>
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
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
});

export default SignUp;