import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { db } from './firebaseConfig'; // Firestore bağlantısı

const API_KEY = 'f6de70a4a82aec4b70272b422861c7f1';
const API_URL = 'https://api.themoviedb.org/3';

import IconImage from './icons5.png';

const Home = () => {
    const [popularMovies, setPopularMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [genres, setGenres] = useState([]);
    const [showBackButton, setShowBackButton] = useState(false);
    const [showCategories, setShowCategories] = useState(true);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [selectedGenreName, setSelectedGenreName] = useState(''); // Track selected genre name
    const [pressedButton, setPressedButton] = useState(null); // State to track the pressed button
    const navigation = useNavigation();

    useEffect(() => {
        fetchPopularMovies();
        fetchTopRatedMovies();
        fetchUpcomingMovies();
        fetchGenres();
    }, []);

    const fetchPopularMovies = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/popular`, {
                params: {
                    api_key: API_KEY,
                },
            });
            setPopularMovies(response.data.results);
        } catch (error) {
            console.error('Error fetching popular movies:', error);
        }
    };

    const fetchTopRatedMovies = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/top_rated`, {
                params: {
                    api_key: API_KEY,
                },
            });
            setTopRatedMovies(response.data.results);
        } catch (error) {
            console.error('Error fetching top rated movies:', error);
        }
    };

    const fetchUpcomingMovies = async () => {
        try {
            const response = await axios.get(`${API_URL}/movie/upcoming`, {
                params: {
                    api_key: API_KEY,
                },
            });
            setUpcomingMovies(response.data.results);
        } catch (error) {
            console.error('Error fetching upcoming movies:', error);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await axios.get(`${API_URL}/genre/movie/list`, {
                params: {
                    api_key: API_KEY,
                },
            });
            setGenres(response.data.genres);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const searchMovies = async () => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setShowBackButton(false);
            setShowCategories(true);
            return;
        }

        try {
            const response = await axios.get(`${API_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    query: searchQuery,
                },
            });
            setSearchResults(response.data.results);
            setShowBackButton(true);
            setShowCategories(false);
        } catch (error) {
            console.error('Error searching movies:', error);
        }
    };

    const fetchMoviesByGenre = async (genreId, genreName) => {
        try {
            const response = await axios.get(`${API_URL}/discover/movie`, {
                params: {
                    api_key: API_KEY,
                    with_genres: genreId,
                },
            });
            setSearchResults(response.data.results);
            setSelectedGenreName(genreName); // Set selected genre name
            setShowBackButton(true);
            setShowCategories(false);
        } catch (error) {
            console.error('Error fetching movies by genre:', error);
        }
    };

    const handleBack = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedGenre(null);
        setSelectedGenreName(''); // Clear selected genre name
        setShowBackButton(false);
        setShowCategories(true);
    };

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const handleButtonPress = (buttonId, genreName = '') => {
        setPressedButton(buttonId);
        if (buttonId === 'profile') {
            navigation.navigate('Profile', { userId: 'defaultUserId' });
        } else {
            fetchMoviesByGenre(buttonId, genreName);
        }
    };

    const renderMovieItem = ({ item, index }) => {
        const posterStyle = selectedGenreName ? styles.poster2 : styles.poster; // Poster boyutunu seçilen türe göre ayarla
    
        if (index % 2 === 0) {
            return (
                <View style={styles.movieRow}>
                    <MovieItem item={item} posterStyle={posterStyle} />
                    {searchResults[index + 1] && <MovieItem item={searchResults[index + 1]} posterStyle={posterStyle} />}
                </View>
            );
        }
        return null;
    };
    

    const MovieItem = ({ item }) => {
        const title = item.title.length > 18 ? item.title.substring(0, 18) + "..." : item.title;
        const posterStyle = selectedGenreName ? styles.poster2 : styles.poster; // Poster boyutunu seçilen türe göre ayarla
    
        return (
            <TouchableOpacity onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}>
                <View style={styles.movieContainer}>
                    <Image source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }} style={posterStyle} />
                    <Text style={styles.movieTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={styles.searchContainer}>
                    {showBackButton && (
                        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                            <Image source={IconImage} style={styles.backButtonIcon} />
                        </TouchableOpacity>
                    )}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search movies..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={searchMovies}
                    />
                    <TouchableOpacity onPress={toggleOptions} style={styles.optionButton}>
                        <View style={styles.optionLine} />
                        <View style={styles.optionLine} />
                        <View style={styles.optionLine} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                {showCategories && (
                    <ScrollView>
                        <View>
                            <Text style={styles.categoryTitle}>Popular Movies</Text>
                            <FlatList
                                data={popularMovies}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMovieItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                            <Text style={styles.categoryTitle}>Top Rated Movies</Text>
                            <FlatList
                                data={topRatedMovies}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMovieItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                            <Text style={styles.categoryTitle}>Upcoming Movies</Text>
                            <FlatList
                                data={upcomingMovies}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderMovieItem}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            />
                        </View>
                    </ScrollView>
                )}
                {selectedGenreName && (
                    <Text style={styles.genreHeader}>{selectedGenreName}</Text>
                )}
                {searchResults.length > 0 && (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMovieItem}
                        style={styles.flatList}
                        contentContainerStyle={styles.searchResultsContainer}
                    />
                )}
            </View>
            {showOptions && (
                <View style={styles.optionsContainer}>
                    <ScrollView>
                        <TouchableOpacity
                            onPress={() => handleButtonPress('profile')}
                            style={[
                                styles.profileButton,
                                pressedButton === 'profile' && styles.pressedButton,
                            ]}
                        >
                            <Text style={styles.genreButtonText}>Profile</Text>
                        </TouchableOpacity>
                        {genres.map((genre) => (
                            <TouchableOpacity
                                key={genre.id}
                                onPress={() => handleButtonPress(genre.id, genre.name)}
                                style={[
                                    styles.genreButton,
                                    pressedButton === genre.id && styles.pressedButton,
                                ]}
                            >
                                <Text style={styles.genreButtonText}>{genre.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('RecommendationPage')}>
                <View style={styles.navigationBar}>
                    <Text style={styles.navigationText}>Recommend Me A Film</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#161618',
        padding: 10,
    },
    navigationBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3ce13',
        height: 50,
        paddingHorizontal: 10,
    },
    topContainer: {
        paddingHorizontal: 10,
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginRight: 10,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'white',
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
    poster: {
        width: 150,
        height: 225,
        marginBottom: 5,
    },
    poster2: {
        width: 175,
        height: 262.5,
        marginBottom: 5,
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    backButton: {
        padding: 5,
        borderRadius: 5,
    },
    backButtonIcon: {
        width: 30,
        height: 30,
    },
    flatList: {
        flexGrow: 0,
    },
    navigationText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    optionButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLine: {
        width: 25,
        height: 3,
        backgroundColor: '#f3ce13',
        marginVertical: 2,
        borderRadius: 3,
    },
    optionsContainer: {
        position: 'absolute',
        top: 60,
        right: 10,
        backgroundColor: '#161618',
        borderRadius: 5,
        padding: 10,
        maxHeight: 530, // Increased height for the options container
    },
    genreButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#2a2a2a',
        borderRadius: 5,
    },
    profileButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#2a2a2a',
        borderRadius: 5,
    },
    genreButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    pressedButton: {
        backgroundColor: '#555',
    },
    searchResultsContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    movieRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    movieTitle: {
        color: 'white',
        marginTop: 5,
        textAlign: 'center',
    },
    genreHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'white',
    },
});

export default Home;