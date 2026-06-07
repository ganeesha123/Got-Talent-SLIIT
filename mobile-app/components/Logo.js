import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Logo() {
    return (
        <View style={styles.container}>
            {/* Outer Glow Circle */}
            <View style={styles.glowContainer}>
                <LinearGradient
                    colors={['rgba(233, 69, 96, 0.6)', 'rgba(0,0,0,0)']}
                    style={styles.glow}
                />
            </View>

            {/* Mic Structure */}
            <View style={styles.micStructure}>
                {/* Head */}
                <View style={styles.micHead}>
                    <LinearGradient
                        colors={['#ff7675', '#d63031']}
                        style={styles.gradientFill}
                    />
                    {/* Grid Lines */}
                    <View style={[styles.gridLineH, { top: 20 }]} />
                    <View style={[styles.gridLineH, { top: 40 }]} />
                    <View style={styles.gridLineV} />
                </View>

                {/* Body */}
                <View style={styles.micBody}>
                    <LinearGradient
                        colors={['#636e72', '#2d3436']}
                        style={styles.gradientFill}
                    />
                </View>
            </View>

            {/* Star Icon overlay */}
            <View style={styles.starOverlay}>
                <Text style={styles.starText}>★</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowContainer: {
        position: 'absolute',
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    micStructure: {
        alignItems: 'center',
    },
    micHead: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        elevation: 5,
        zIndex: 2,
    },
    micBody: {
        width: 24,
        height: 40,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        backgroundColor: '#2d3436',
        marginTop: -5,
        zIndex: 1,
        overflow: 'hidden',
    },
    gradientFill: {
        flex: 1,
    },
    gridLineH: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    gridLineV: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 29, // center
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    starOverlay: {
        position: 'absolute',
        top: 50,
        zIndex: 3,
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    starText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    }
});
