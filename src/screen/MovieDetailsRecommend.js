import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import IconImage from './icons5.png';

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

const MovieDetailsRecommend = ({ route }) => {
    const { movieId, movies } = route.params;
    const navigation = useNavigation();
    const [movieDetails, setMovieDetails] = useState(null);
    const [cast, setCast] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [currentMovieIndex, setCurrentMovieIndex] = useState(0);

    const auth = getAuth();
    const user = auth.currentUser;

    useEffect(() => {
        fetchMovieDetails(movieId);
        fetchCast(movieId);
        if (user) {
            checkFavoriteStatus(movieId);
            checkWatchedStatus(movieId);
        }
    }, []);

    const fetchMovieDetails = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/movie/${id}`, {
                params: {
                    api_key: API_KEY,
                    append_to_response: 'videos',
                },
            });
            setMovieDetails(response.data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    };

    const fetchCast = async (id) => {
        try {
            const response = await axios.get(`${API_URL}/movie/${id}/credits`, {
                params: {
                    api_key: API_KEY,
                },
            });
            setCast(response.data.cast);
        } catch (error) {
            console.error('Error fetching cast:', error);
        }
    };

    const checkFavoriteStatus = async (id) => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('favorites').doc(id.toString()).get();
            setIsFavorite(doc.exists);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const checkWatchedStatus = async (id) => {
        try {
            const doc = await firestore().collection('users').doc(user.uid).collection('watched').doc(id.toString()).get();
            setIsWatched(doc.exists);
        } catch (error) {
            console.error('Error checking watched status:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('favorites').doc(movies[currentMovieIndex].id.toString());
    
            if (isFavorite) {
                await movieDoc.delete();
                setIsFavorite(false); // Toggle edildiğinde durumu false yap
            } else {
                await movieDoc.set({ movieId: movies[currentMovieIndex].id }); // Doğru film kimliğini kullan
                setIsFavorite(true); // Toggle edildiğinde durumu true yap
            }
        } catch (error) {
            console.error('Error toggling favorite status:', error);
        }
    };
    
    const toggleWatched = async () => {
        try {
            const userDoc = firestore().collection('users').doc(user.uid);
            const movieDoc = userDoc.collection('watched').doc(movies[currentMovieIndex].id.toString());
    
            if (isWatched) {
                await movieDoc.delete();
                setIsWatched(false); // Toggle edildiğinde durumu false yap
            } else {
                await movieDoc.set({ movieId: movies[currentMovieIndex].id }); // Doğru film kimliğini kullan
                setIsWatched(true); // Toggle edildiğinde durumu true yap
            }
        } catch (error) {
            console.error('Error toggling watched status:', error);
        }
    };
    
    
    

    const handleNextMovie = () => {
        if (currentMovieIndex < movies.length - 1) {
            setCurrentMovieIndex(currentMovieIndex + 1);
            fetchMovieDetails(movies[currentMovieIndex + 1].id);
            fetchCast(movies[currentMovieIndex + 1].id);
            if (user) {
                checkFavoriteStatus(movies[currentMovieIndex + 1].id);
                checkWatchedStatus(movies[currentMovieIndex + 1].id);
            }
        }
    };

    const handleBackMovie = () => {
        if (currentMovieIndex > 0) {
            setCurrentMovieIndex(currentMovieIndex - 1);
            fetchMovieDetails(movies[currentMovieIndex - 1].id);
            fetchCast(movies[currentMovieIndex - 1].id);
            if (user) {
                checkFavoriteStatus(movies[currentMovieIndex - 1].id);
                checkWatchedStatus(movies[currentMovieIndex - 1].id);
            }
        }
    };
    

    const releaseYear = movieDetails ? movieDetails.release_date.substring(0, 4) : '';

    if (!movieDetails) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

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
            <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={[styles.navButton, currentMovieIndex === 0 && styles.disabledButton]}
                onPress={handleBackMovie}
                disabled={currentMovieIndex === 0}
            >
                <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.navButton, currentMovieIndex === movies.length - 1 && styles.disabledButton]}
                onPress={handleNextMovie}
                disabled={currentMovieIndex === movies.length - 1}
            >
                <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
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
    navButton: {
        backgroundColor: '#f3ce13',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },

    navButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        },
    disabledButton: {
        backgroundColor: 'gray',
        },    
});



export default MovieDetailsRecommend;

