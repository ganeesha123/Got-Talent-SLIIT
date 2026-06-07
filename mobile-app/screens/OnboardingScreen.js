import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ⚠️ Ensure your image is saved as 'assets/logo.png'
const BACKGROUND_IMAGE = require('../assets/logo.png');

export default function OnboardingScreen({ navigation }) {
    return (
        <View style={styles.container}>
            {/* 
         Using the logo as a full-screen background. 
         resizeMode="cover" will make it fill the screen.
         If the logo has a white background, "cover" might push the white parts off-screen 
         depending on aspect ratio, or we can try to blend it.
      */}
            <ImageBackground
                source={BACKGROUND_IMAGE}
                style={styles.backgroundImage}
                resizeMode="cover" // Change to 'contain' if you want to see the whole image including borders
            >
                {/* Dark Gradient Overlay to make text readable and hide potential white edges */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                    style={styles.overlay}
                >
                    <View style={styles.bottomSection}>
                        <Text style={styles.appName}>SLIIT's Got Talent</Text>
                        <Text style={styles.tagline}>
                            Show the world what you've got.
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Black background to merge with dark logo
    },
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
        justifyContent: 'flex-end',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%', // Gradient covers bottom half
        justifyContent: 'flex-end',
        padding: 30,
        paddingBottom: 50,
    },
    bottomSection: {
        width: '100%',
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    tagline: {
        fontSize: 16,
        color: '#ddd',
        textAlign: 'center',
        marginBottom: 40,
        opacity: 0.9,
    },
    button: {
        backgroundColor: '#e94560',
        width: '100%',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e94560',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
