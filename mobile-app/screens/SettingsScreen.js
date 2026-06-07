import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import BottomNavBar from '../components/BottomNavBar';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Section */}
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        style={styles.header}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.8}>
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </LinearGradient>

      {/* Content Section */}
      <ScrollView 
        style={styles.contentContainer} 
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
                colors={['#FF007A', '#FF7F00']}
                start={[0, 0]} end={[1, 0]}
                style={styles.cardIconDummy}
            />
            <Text style={styles.sectionTitle}>Profile Details</Text>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <Text style={styles.value}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
                <Text style={styles.label}>ACCOUNT ROLE</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role || 'student'}</Text>
                </View>
            </View>
          </View>
        </View>

        {/* Voting Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                start={[0, 0]} end={[1, 0]}
                style={styles.cardIconDummy}
            />
            <Text style={styles.sectionTitle}>Voting Status</Text>
          </View>

          <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                  <Text style={styles.label}>CURRENT STATUS</Text>
                  {user?.isVoted ? (
                      <View style={styles.statusBadgeVoted}>
                          <Text style={styles.statusBadgeTextVoted}>★ You have voted</Text>
                      </View>
                  ) : (
                      <View style={styles.statusBadgePending}>
                          <Text style={styles.statusBadgeTextPending}>! Not voted yet</Text>
                      </View>
                  )}
              </View>
          </View>
        </View>

      </ScrollView>

      <BottomNavBar navigation={navigation} currentScreen="Settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#A0A0B0',
    marginTop: 5,
    fontSize: 11,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 0, 50, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 50, 0.4)',
  },
  logoutText: {
    color: '#FF2A55',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    padding: 14,
    paddingTop: 18,
    paddingBottom: 70,
  },
  card: {
    backgroundColor: '#12101A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconDummy: {
    width: 3,
    height: 18,
    borderRadius: 1.5,
    marginRight: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  infoCol: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  label: {
    color: '#8E8E9F',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  value: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roleText: {
    color: '#A0A0B0',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  statusBadgeVoted: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.4)',
    marginTop: 3,
  },
  statusBadgeTextVoted: {
    color: '#2ecc71',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadgePending: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 170, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 170, 0, 0.4)',
    marginTop: 3,
  },
  statusBadgeTextPending: {
    color: '#ffaa00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
