import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import IconImage from './icons5.png';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const MovieDetailsScreen = ({ route }) => {
    const { movieId } = route.params;
    const navigation = useNavigation();
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatched, setIsWatched] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        fetchMovieDetails();
        fetchCast();
        if (user) {
            checkFavoriteStatus();
            checkWatchedStatus();
        }
    }, []);

    const fetchMovieDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/${movieId}`, {
                params: {
                    api_key: API_KEY,
                    append_to_response: 'videos',
                },
            });
            setMovieDetails(response.data);
        } catch (error) {
            console.error('Film detaylarını çekerken hata oluştu:', error);
        }
    };

    const fetchCast = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/${movieId}/credits`, {
                params: {
                    api_key: API_KEY,
                },
            });
            setCast(response.data.cast);
        } catch (error) {
            console.error('Oyuncu bilgilerini çekerken hata oluştu:', error);
        }
    };

    const checkFavoriteStatus = async () => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('favorites').doc(movieId.toString()).get();
            setIsFavorite(doc.exists);
        } catch (error) {
            console.error('Favori durumu kontrol edilirken hata oluştu:', error);
        }
    };

    const checkWatchedStatus = async () => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('watched').doc(movieId.toString()).get();
            setIsWatched(doc.exists);
        } catch (error) {
            console.error('İzledim durumu kontrol edilirken hata oluştu:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('favorites').doc(movieId.toString());

            if (isFavorite) {
                await movieDoc.delete();
            } else {
                await movieDoc.set({ movieId });
            }

            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Favori durumu değiştirilirken hata oluştu:', error);
        }
    };

    const toggleWatched = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('watched').doc(movieId.toString());

            if (isWatched) {
                await movieDoc.delete();
            } else {
                await movieDoc.set({ movieId });
            }

            setIsWatched(!isWatched);
        } catch (error) {
            console.error('İzledim durumu değiştirilirken hata oluştu:', error);
        }
    };

    if (!movieDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    const releaseYear = movieDetails.release_date.substring(0, 4);

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image source={IconImage} style={styles.backButtonIcon} />
            </TouchableOpacity>
            <View style={styles.contentContainer}>
                <View style={styles.imageContainer}>
                    <View style={styles.posterFrame}>
                        <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w500/${movieDetails.poster_path}` }}
                            style={styles.poster}
                        />
                    </View>
                </View>
                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>{movieDetails.title} ({releaseYear})</Text>
                    <View style={styles.ratingContainer}>
                        <View style={styles.playContainer}>
                            <TouchableOpacity style={styles.playButton}>
                                <Text style={styles.playText}>IMDB {movieDetails.vote_average.toFixed(1)}</Text>
                            </TouchableOpacity>
                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity onPress={toggleFavorite} style={styles.actionButton}>
                                    <Image source={isFavorite ? require('./liked.png') : require('./like.png')} style={styles.icon} />
                                    <Text style={styles.favText}>{isFavorite ? 'Liked' : 'Like'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={toggleWatched} style={styles.actionButton}>
                                    <Image source={isWatched ? require('./watched_icon.png') : require('./unwatched_icon.png')} style={styles.icon} />
                                    <Text style={styles.favText}>{isWatched ? 'Watched' : 'Unwatched'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <Text style={styles.overview}>{movieDetails.overview}</Text>
                </View>
            </View>
            <View style={styles.castContainer}>
                <Text style={styles.castTitle}>Cast</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {cast.map(actor => (
                        <View style={styles.actorContainer} key={actor.id}>
                            <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w200/${actor.profile_path}` }}
                                style={styles.actorImage}
                            />
                            <Text style={styles.actorName}>{actor.name}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161618',
    },
    backButton: {
        padding: 5,
        borderRadius: 5,
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    backButtonIcon: {
        width: 30,
        height: 30,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    posterFrame: {
        position: 'relative',
        borderWidth: 3,
        borderRadius: 20,
        borderColor: '#f3ce13',
    },
    poster: {
        width: 250,
        height: 375,
        borderRadius: 10,
    },
    playContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 10,
    },
    playButton: {
        backgroundColor: '#f3ce13',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    playText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
    detailsContainer: {
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
    },
    overview: {
        fontSize: 16,
        color: 'white',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'right',
        backgroundColor: '#161618',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginRight: 10,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align buttons to the right side
        marginTop: 10,
        paddingHorizontal: 10,
    },
    castContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    castTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
    actorContainer: {
        marginRight: 10,
        alignItems: 'center',
    },
    actorImage: {
        width: 120,
        height: 180,
        borderRadius: 10,
    },
    actorName: {
        marginTop: 5,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
    },
    favText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginBottom: 10,
    },
});

export default MovieDetailsScreen;

