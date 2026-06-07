import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { votesAPI } from '../api';
import BottomNavBar from '../components/BottomNavBar';

export default function LeaderboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contestants, setContestants] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const calculateWeightedScore = (contestant) => {
    const publicMax = 1000;
    const judgeMax = 100;

    const publicPercent = ((contestant.votes || 0) / publicMax) * 100;
    
    const scores = contestant.judgeScores || [];
    const totalJudgeScore = scores.reduce((sum, s) => sum + s.score, 0);
    const avgScore = scores.length > 0 ? totalJudgeScore / scores.length : 0;
    
    const judgePercent = (avgScore / judgeMax) * 100;
    
    return Number((publicPercent * 0.4 + judgePercent * 0.6).toFixed(1));
  };

  const fetchStats = async () => {
    try {
      const res = await votesAPI.getStats();
      const list = res.data?.data || [];
      setContestants(list);
      const total = list.reduce((sum, c) => sum + (c.votes || 0), 0);
      setTotalVotes(total);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Leaderboard fetch error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const getSections = () => {
    const map = {};
    contestants.forEach(c => {
      const type = c.talentType || 'Other';
      if (!map[type]) map[type] = [];
      map[type].push(c);
    });
    return Object.keys(map).map(category => ({
      title: category,
      data: map[category].map(c => ({...c, finalScore: calculateWeightedScore(c)})).sort((a, b) => b.finalScore - a.finalScore)
    })).sort((a, b) => a.title.localeCompare(b.title));
  };

  const renderItem = ({ item, index }) => {
    const isGold = index === 0;
    const isSilver = index === 1;
    const isBronze = index === 2;
    const isTop3 = isGold || isSilver || isBronze;

    const rankColors = isGold ? ['#FFD700', '#FDB931'] :
                       isSilver ? ['#E0E0E0', '#BDBDBD'] :
                       isBronze ? ['#CD7F32', '#A0522D'] :
                       ['#2A2633', '#1F1A24'];

    const cardBorder = isGold ? '#FFD700' :
                       isSilver ? '#E0E0E0' :
                       isBronze ? '#CD7F32' :
                       'transparent';

    const finalScore = item.finalScore || 0;
    const percent = finalScore.toFixed(1);

    return (
      <View style={[styles.card, isTop3 && styles.topCard]}>
        {isGold && (
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.1)', 'transparent']}
            style={StyleSheet.absoluteFill}
            start={[0, 0]}
            end={[1, 1]}
            borderRadius={20}
          />
        )}
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={rankColors}
            style={[styles.rankBadge, isTop3 ? styles.topRankBadge : null]}
          >
            <Text style={[styles.rankText, isTop3 && { color: '#000', fontSize: 18 }]}>
              {index + 1}
            </Text>
          </LinearGradient>

          <View style={[styles.avatarContainer, { borderColor: cardBorder }]}>
            <Image
              source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
              style={styles.avatar}
            />
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.talent}>{item.talentType || 'Talent'}</Text>
          </View>

          <View style={styles.votesContainer}>
            <Text style={styles.votesValue}>{finalScore}</Text>
            <Text style={styles.votesLabel}>FINAL SCORE</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#FF007A', '#FF7F00']}
              start={[0, 0]} end={[1, 0]}
              style={[styles.progressBarFill, { width: `${percent}%` }]}
            />
          </View>
          <Text style={styles.percentText}>{percent}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        style={styles.header}
        start={[0, 0]}
        end={[1, 1]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <Text style={styles.headerSubtitle}>Real-time audience voting results</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalVotes}</Text>
            <Text style={styles.statLabel}>Total Votes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{contestants.length}</Text>
            <Text style={styles.statLabel}>Contestants</Text>
          </View>
        </View>
        {lastUpdated && (
          <Text style={styles.headerUpdated}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF007A" />
        </View>
      ) : (
        <SectionList
          sections={getSections()}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeaderContainer}>
              <LinearGradient
                colors={['#FF007A', 'transparent']}
                start={[0, 0.5]} end={[1, 0.5]}
                style={styles.sectionGradient}
              />
              <Text style={styles.sectionHeaderText}>{title}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF007A"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No contestants available yet.</Text>
          }
        />
      )}
      <BottomNavBar navigation={navigation} currentScreen="Leaderboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050A',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
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
    marginBottom: 15,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  backText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 50, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 50, 0.5)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF2A55',
    marginRight: 6,
  },
  liveText: {
    color: '#FF2A55',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#A0A0B0',
    marginTop: 6,
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#8E8E9F',
    fontSize: 9,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerUpdated: {
    color: '#666',
    marginTop: 12,
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#12101A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  topCard: {
    borderColor: 'rgba(255,215,0,0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  topRankBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  rankText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#222',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  talent: {
    color: '#FF007A',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  votesContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  votesValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  votesLabel: {
    color: '#8E8E9F',
    fontSize: 9,
    marginTop: 2,
    letterSpacing: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    width: 44,
    textAlign: 'right',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionGradient: {
    width: 20,
    height: 3,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#8E8E9F',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});



