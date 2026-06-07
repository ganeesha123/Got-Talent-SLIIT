import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
    Dimensions,
    ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { contestantsAPI, votesAPI, settingsAPI, getAssetUrl } from '../api';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

// Dummy data for fallback if API is empty/down
const DUMMY_CONTESTANTS = [
    { _id: '1', name: 'Araliya Band', talent: 'Band', category: 'Music', description: 'A fusion of traditional and modern beats.', imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800' },
    { _id: '2', name: 'Nethmi Rosara', talent: 'Solo Singer', category: 'Singing', description: 'Soulful melodies that touch the heart.', imageUrl: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800' },
    { _id: '3', name: 'Rhythm Crew', talent: 'Hip Hop Dance', category: 'Dancing', description: 'Energy, precision, and style.', imageUrl: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800' },
    { _id: '4', name: 'Kasun Kalhara', talent: 'Magician', category: 'Magic', description: 'Mind-bending illusions.', imageUrl: 'https://images.unsplash.com/photo-1556648710-857504ba428d?w=800' },
];

export default function VotingScreen({ navigation }) {
    const { votedCategories, votedContestants, updateUserVoteStatus } = useAuth();
    const [contestants, setContestants] = useState([]);
    const [isDummyData, setIsDummyData] = useState(false);
    const [eventStatus, setEventStatus] = useState('upcoming');
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [loading, setLoading] = useState(true);
    const [votingLoading, setVotingLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [categories, setCategories] = useState(['All']);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [conRes, setRes] = await Promise.all([
                contestantsAPI.getAll(),
                settingsAPI.getSettings()
            ]);
            if (conRes.data && conRes.data.length > 0) {
                setContestants(conRes.data);
                setIsDummyData(false);
            } else {
                setContestants(DUMMY_CONTESTANTS);
                setIsDummyData(true);
            }
            if (setRes.data && setRes.data.categories) {
                setCategories(['All', ...setRes.data.categories]);
            } else {
                setCategories(['All', 'Music', 'Singing', 'Dancing', 'Magic']);
            }
            if (setRes.data && setRes.data.countdownEnd) {
                const endT = new Date(setRes.data.countdownEnd).getTime();
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((endT - now) / 1000));
                setTimeLeft(diff);
                setEventStatus(diff > 0 ? 'active' : 'ended');
            } else {
                setTimeLeft(0);
                setEventStatus('upcoming');
            }
        } catch (e) {
            console.log(e);
            setContestants(DUMMY_CONTESTANTS);
            setCategories(['All', 'Music', 'Singing', 'Dancing', 'Magic']);
            setIsDummyData(true);
            setTimeLeft(0);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleVote = async (contestantId, contestantName, contestantCategory) => {
        if (votedCategories.includes(contestantCategory)) {
            Alert.alert('Already Voted', `You have already voted in the ${contestantCategory} category.`);
            return;
        }

        Alert.alert(
            'Confirm Vote',
            `Vote for ${contestantName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Vote',
                    onPress: async () => {
                        try {
                            setVotingLoading(true);
                            if (isDummyData) {
                                await new Promise(r => setTimeout(r, 800));
                                await updateUserVoteStatus({ 
                                    votedCategories: [...votedCategories, contestantCategory],
                                    votedContestants: [...(votedContestants || []), contestantId] 
                                });
                            } else {
                                const res = await votesAPI.castVote(contestantId);
                                if (res.data && res.data.data && res.data.data.user) {
                                    await updateUserVoteStatus(res.data.data.user);
                                } else {
                                    await updateUserVoteStatus({ 
                                        votedCategories: [...votedCategories, contestantCategory],
                                        votedContestants: [...(votedContestants || []), contestantId] 
                                    });
                                }
                            }
                            Alert.alert('Success', 'Your vote has been cast!');
                        } catch (error) {
                            console.log('Vote error:', error?.response?.data || error.message);
                            const message = error?.response?.data?.message || 'Failed to cast vote';
                            Alert.alert('Error', message);
                        } finally {
                            setVotingLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const formatTime = (seconds) => {
        if (seconds <= 0) return "00:00:00";
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);

        if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Helper to extract the proper category property
    const getCategory = (item) => isDummyData ? item.category : item.talentType;

    const filteredContestants = selectedCategory === 'All'
        ? contestants
        : contestants.filter(c => {
            const cat = getCategory(c);
            return String(cat || '').toLowerCase() === String(selectedCategory).toLowerCase();
        });

    const renderContestant = ({ item }) => {
        const cat = getCategory(item);
        const hasVotedInCategory = votedCategories.includes(cat);
        const hasVotedForThis = votedContestants.includes(item._id);

        return (
            <View style={[styles.card, hasVotedForThis && styles.cardVoted]}>
                <Image
                    source={{ uri: getAssetUrl(item.imageUrl) || item.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800' }}
                    style={[styles.cardImage, hasVotedInCategory && !hasVotedForThis && { opacity: 0.3 }]}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(5,5,10,0.8)', '#05050A']}
                    style={styles.cardOverlay}
                />

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View style={styles.tagContainer}>
                            <Text style={styles.categoryTag}>{cat || 'Talent'}</Text>
                        </View>
                        {hasVotedForThis && (
                            <View style={styles.votedBadge}>
                                <Text style={styles.votedBadgeText}>★ VOTED</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.talent} numberOfLines={2}>
                        {item.description || 'Contestant showcasing their amazing abilities and talent!'}
                    </Text>

                    <TouchableOpacity
                        onPress={() => handleVote(item._id, item.name, cat)}
                        disabled={hasVotedInCategory || votingLoading}
                        activeOpacity={0.8}
                        style={styles.voteBtnContainer}
                    >
                        {hasVotedForThis ? (
                            <View style={styles.voteButtonVoted}>
                                <Text style={styles.voteButtonTextVoted}>✓ Voted</Text>
                            </View>
                        ) : hasVotedInCategory ? (
                            <View style={styles.voteButtonDisabled}>
                                <Text style={styles.voteButtonTextDisabled}>Category Voted</Text>
                            </View>
                        ) : (
                            <LinearGradient
                                colors={['#FF007A', '#FF7F00']}
                                start={[0, 0]} end={[1, 0]}
                                style={styles.voteButtonActive}
                            >
                                <Text style={styles.voteButtonTextActive}>Vote Now</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
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
                    <Text style={styles.headerTitle}>Live Voting</Text>
                    <View style={styles.liveBadge}>
                         <View style={styles.liveDot} />
                         <Text style={styles.liveText}>LIVE</Text>
                    </View>
                </View>

                <View style={styles.counterContainer}>
                    <Text style={styles.counterLabel}>VOTING ENDS IN</Text>
                    <Text style={styles.counterValue}>{formatTime(timeLeft)}</Text>
                </View>
            </LinearGradient>

            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            {selectedCategory === cat ? (
                                <LinearGradient
                                    colors={['#FF007A', '#FF7F00']}
                                    start={[0, 0]} end={[1, 0]}
                                    style={styles.categoryChip}
                                >
                                    <Text style={styles.categoryTextActive}>{cat}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={[styles.categoryChip, styles.categoryChipInactive]}>
                                    <Text style={styles.categoryText}>{cat}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF007A" />
                </View>
            ) : (
                <FlatList
                    data={filteredContestants}
                    renderItem={renderContestant}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No contestants in this category.</Text>
                    }
                />
            )}

            <BottomNavBar navigation={navigation} currentScreen="Voting" />
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
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 0.5,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 50, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 50, 0.5)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF2A55',
        marginRight: 6,
    },
    liveText: {
        color: '#FF2A55',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    counterContainer: {
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    counterLabel: {
        color: '#FF007A',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 4,
    },
    counterValue: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
        letterSpacing: 1,
    },
    categoryContainer: {
        marginVertical: 15,
    },
    categoryScroll: {
        paddingHorizontal: 20,
        paddingBottom: 5,
    },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryChipInactive: {
        backgroundColor: '#12101A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryText: {
        color: '#8E8E9F',
        fontWeight: '700',
        fontSize: 12,
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 90, // For BottomNavBar
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        height: 240,
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        backgroundColor: '#12101A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    cardVoted: {
        borderColor: 'rgba(46, 204, 113, 0.3)',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80%',
        justifyContent: 'flex-end',
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tagContainer: {
        backgroundColor: 'rgba(255, 0, 122, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 122, 0.3)',
    },
    categoryTag: {
        color: '#FF007A',
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    votedBadge: {
        backgroundColor: 'rgba(46, 204, 113, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(46, 204, 113, 0.5)',
    },
    votedBadgeText: {
        color: '#2ecc71',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    talent: {
        fontSize: 12,
        color: '#A0A0B0',
        marginBottom: 12,
        fontWeight: '500',
    },
    voteBtnContainer: {
        width: '100%',
    },
    voteButtonActive: {
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    voteButtonTextActive: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
    voteButtonVoted: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    voteButtonTextVoted: {
        color: '#8E8E9F',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 1,
    },
    voteButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    voteButtonTextDisabled: {
        color: '#555',
        fontWeight: '800',
        fontSize: 14,
        letterSpacing: 1,
    },
    emptyText: {
        color: '#8E8E9F',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 14,
    }
});








