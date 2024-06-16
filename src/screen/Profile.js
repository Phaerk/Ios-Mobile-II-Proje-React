import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import IconImage from './icons5.png';
import { Auth } from '../services';

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [userProfile, setUserProfile] = useState(null);
    const [favoriteMovies, setFavoriteMovies] = useState([]);
    const [watchedMovies, setWatchedMovies] = useState([]);
    const [name, setName] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [loading, setLoading] = useState(true);

    const user = auth().currentUser;

    useEffect(() => {
        if (user) {
            fetchUserProfile();
            fetchFavoriteMovies();
            fetchWatchedMovies();
        }
    }, [user]);

    const fetchUserProfile = async () => {
        try {
            const userDoc = await firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                setUserProfile(userData);
                setName(userData.name);
                setProfileImageUrl(userData.profileImageUrl || '');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoriteMovies = async () => {
        try {
            const userFavoritesSnapshot = await firestore().collection('users').doc(user.uid).collection('favorites').get();
            const favoriteMoviesIds = userFavoritesSnapshot.docs.map(doc => doc.id); // Get only movie IDs
            const favoriteMovies = await fetchMoviesData(favoriteMoviesIds); // Fetch movie details from API
            setFavoriteMovies(favoriteMovies.filter(movie => movie)); // Filter out null values
        } catch (error) {
            console.error('Error fetching favorite movies:', error);
        }
    };

    const fetchWatchedMovies = async () => {
        try {
            const userWatchedSnapshot = await firestore().collection('users').doc(user.uid).collection('watched').get();
            const watchedMoviesIds = userWatchedSnapshot.docs.map(doc => doc.id); // Get only movie IDs
            const watchedMovies = await fetchMoviesData(watchedMoviesIds); // Fetch movie details from API
            setWatchedMovies(watchedMovies.filter(movie => movie)); // Filter out null values
        } catch (error) {
            console.error('Error fetching watched movies:', error);
        }
    };

    const fetchMoviesData = async (movieIds) => {
        try {
            const moviesDataPromises = movieIds.map(async (movieId) => {
                const response = await axios.get(`${API_URL}/movie/${movieId}`, {
                    params: {
                        api_key: API_KEY,
                    },
                });
                return response.data;
            });
            const moviesData = await Promise.all(moviesDataPromises);
            return moviesData;
        } catch (error) {
            console.error('Error fetching movies data:', error);
            return [];
        }
    };

    const handleImagePicker = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets.length > 0) {
                const source = response.assets[0];
                const uploadUri = Platform.OS === 'ios' ? source.uri.replace('file://', '') : source.uri;
                await uploadImage(uploadUri);
            }
        });
    };

    const uploadImage = async (uri) => {
        setLoading(true);
        const storageRef = storage().ref(`profile_pictures/${user.uid}`);
        try {
            await storageRef.putFile(uri);
            const url = await storageRef.getDownloadURL();
            await firestore().collection('users').doc(user.uid).update({ profileImageUrl: url });
            setProfileImageUrl(url);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderMovieItem = ({ item }) => {
        const title = item.title.length > 18 ? item.title.substring(0, 18) + "..." : item.title;
        return (
            <TouchableOpacity onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}>
                <View style={styles.movieContainer}>
                    <Image source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }} style={styles.moviePoster} />
                    <Text style={styles.movieTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f3ce13" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={IconImage} style={styles.backButtonIcon} />
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
                <TouchableOpacity onPress={handleImagePicker}>
                    <Image source={profileImageUrl ? { uri: profileImageUrl } : require('./profile_icon.png')} style={styles.profileImage} />
                   
                </TouchableOpacity>
                <Text style={styles.profileName}>{name}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Favorite Movies</Text>
                <FlatList
                    data={favoriteMovies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMovieItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Watched Movies</Text>
                <FlatList
                    data={watchedMovies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderMovieItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
            </View>
            <TouchableOpacity onPress={() => Auth.signOut()} style={styles.logoutButton}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161618',
        padding: 15,
    },
    backButton: {
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        top: 20,
        left: 0,
        zIndex: 1,
    },
    backButtonIcon: {
        width: 30,
        height: 30,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
        position: 'relative',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 2,
        borderColor: '#f3ce13',
    },
    addPhotoText: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
        backgroundColor: '#161618',
        borderRadius: 12,
        padding: 5,
        textAlign: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginTop: 10,
    },
    section: {
        marginBottom: 20,
        marginLeft: 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    movieContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 5,
        backgroundColor: '#161618',
        borderRadius: 10,
        padding: 2,
        marginRight: 0,
    },
    moviePoster: {
        width: 150,
        height: 225,
        marginBottom: 5,
    },
    movieTitle: {
        marginTop: 5,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#161618',
    },
    loadingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        marginTop: 5, // Yeni eklenen stil, logout butonunun üst boşluğu
        alignSelf: 'center', // Butonun ortalanması için
        marginBottom:20,
    },
    
    logoutButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
