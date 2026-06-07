import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BottomNavBar({ navigation, currentScreen }) {
  const go = (screen) => {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(screen);
    }
  };

  const Item = ({ label, icon, screen }) => {
    const isActive = currentScreen === screen;
    
    if (isActive) {
      return (
        <TouchableOpacity style={styles.item} onPress={() => go(screen)} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF007A', '#FF7F00']}
            start={[0, 0]} end={[1, 0]}
            style={styles.pillActive}
          >
            <Text style={styles.iconActive}>{icon}</Text>
            <Text style={styles.labelActive}>{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.item} onPress={() => go(screen)} activeOpacity={0.8}>
        <View style={styles.pill}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        <Item label="Home" icon="⌂" screen="Voting" />
        <Item label="Ranking" icon="★" screen="Leaderboard" />
        <Item label="Settings" icon="⚙" screen="Settings" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%',
    backgroundColor: '#12101A',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  pillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    color: '#8E8E9F',
    fontSize: 18,
    marginRight: 4,
    fontWeight: '400',
    marginTop: -2,
  },
  iconActive: {
    color: '#fff',
    fontSize: 18,
    marginRight: 4,
    fontWeight: '800',
    marginTop: -2,
  },
  label: {
    color: '#8E8E9F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
