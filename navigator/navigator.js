import React from "react";
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import Home from "../src/screen/Home";
import MovieDetailsScreen from "../src/screen/MovieDetails";
import RecommendationPage from "../src/screen/RecommendationPage";
import MovieDetailsRecommend from "../src/screen/MovieDetailsRecommend";
import ProfileScreen from "../src/screen/Profile";
import MovieDetailsPro from "../src/screen/MovieDetailsPro";


const Stack = createStackNavigator();

const Mainnav = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...TransitionPresets.FadeFromBottomAndroid,  // Bu satır animasyon preset'ini ekler
            }}
        >
            <Stack.Screen name='Home' component={Home} />
            <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
            <Stack.Screen name="MovieDetailsPro" component={MovieDetailsPro} />
            <Stack.Screen name="RecommendationPage" component={RecommendationPage} options={{ title: 'Recommend Me A Film' }} />
            <Stack.Screen name="MovieDetailsRecommend" component={MovieDetailsRecommend} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    );
}

export default Mainnav;
