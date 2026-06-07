import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { FiLogOut, FiUser, FiShield, FiMail, FiMoon, FiBell, FiLock } from 'react-icons/fi';

export default function SettingsPage() {
  const { user, clearSession } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account Info', icon: <FiUser /> },
    { id: 'preferences', label: 'Preferences', icon: <FiMoon /> },
    { id: 'security', label: 'Security', icon: <FiLock /> },
  ];

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.headerGlass}>
        <div style={styles.headerInfo}>
          <h2 style={styles.titleGradient}>System Settings</h2>
          <p style={styles.subtitle}>Manage your account preferences and settings</p>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                ...(activeTab === tab.id ? styles.activeTabButton : {})
              }}
            >
              <span style={{
                ...styles.tabIcon,
                ...(activeTab === tab.id ? styles.activeTabIcon : {})
              }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          
          <div style={styles.sidebarDivider}></div>
          
          <button
            style={styles.signOutBtn}
            onClick={() => {
              clearSession();
              window.location.href = '/login';
            }}
          >
            <span style={styles.signOutIcon}><FiLogOut /></span>
            Sign Out
          </button>
        </div>

        {/* Main Content Area */}
        <div style={styles.mainContent}>
          {activeTab === 'account' && (
            <div style={styles.cardGlass}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Profile Information</h3>
                <p style={styles.cardSubtitle}>Your personal account details</p>
              </div>
              
              <div style={styles.profileHero}>
                <div style={styles.avatarLarge}>
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={styles.userName}>{user?.name || 'Authorized User'}</h3>
                  <div style={styles.roleBadgeContainer}>
                    <FiShield style={styles.roleIcon} />
                    <span style={styles.roleBadgeText}>
                      {user?.role === 'admin' ? 'System Administrator' : 'Voter Account'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Email Address</label>
                  <div style={styles.infoValueBox}>
                    <FiMail style={styles.infoIcon} />
                    <span>{user?.email || 'Not provided'}</span>
                  </div>
                </div>
                
                <div style={styles.infoItem}>
                  <label style={styles.infoLabel}>Account Status</label>
                  <div style={styles.infoValueBox}>
                    <div style={styles.statusDot}></div>
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={styles.cardGlass}>
               <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>App Preferences</h3>
                <p style={styles.cardSubtitle}>Customize your experience</p>
              </div>
              
              <div style={styles.settingRow}>
                <div>
                  <h4 style={styles.settingItemTitle}>Dark Mode</h4>
                  <p style={styles.settingItemDesc}>Use dark theme across the application</p>
                </div>
                <div style={styles.toggleActive}></div>
              </div>
              
              <div style={styles.settingRow}>
                <div>
                  <h4 style={styles.settingItemTitle}>Email Notifications</h4>
                  <p style={styles.settingItemDesc}>Receive voting updates and results</p>
                </div>
                <div style={styles.toggleInactive}></div>
              </div>
            </div>
          )}

           {activeTab === 'security' && (
            <div style={styles.cardGlass}>
               <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>Security Settings</h3>
                <p style={styles.cardSubtitle}>Manage your account security</p>
              </div>
              
              <div style={styles.securityAlert}>
                <FiLock style={styles.alertIcon} />
                <div>
                  <h4 style={styles.alertTitle}>Password is managed externally</h4>
                  <p style={styles.alertDesc}>Your authentication is handled securely. You cannot change your password here.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#f8fafc',
  },
  headerGlass: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  headerInfo: {
    flex: 1,
  },
  titleGradient: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '400',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem',
    alignItems: 'start',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px',
    color: '#94a3b8',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  activeTabButton: {
    background: 'rgba(253, 93, 115, 0.1)',
    color: '#FD5D73',
  },
  tabIcon: {
    fontSize: '1.25rem',
    color: '#64748b',
    display: 'flex',
  },
  activeTabIcon: {
    color: '#FD5D73',
  },
  sidebarDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.05)',
    margin: '1rem 0',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    color: '#fca5a5',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  signOutIcon: {
    display: 'flex',
    fontSize: '1.25rem',
  },
  mainContent: {
    minHeight: '400px',
  },
  cardGlass: {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    padding: '2.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 0.5rem 0',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    margin: 0,
  },
  profileHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '3rem',
  },
  avatarLarge: {
    width: '96px',
    height: '96px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: 'bold',
    boxShadow: '0 8px 16px -4px rgba(225, 29, 72, 0.4)',
  },
  userName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 0.5rem 0',
  },
  roleBadgeContainer: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(56, 189, 248, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    border: '1px solid rgba(56, 189, 248, 0.2)',
  },
  roleIcon: {
    color: '#38bdf8',
  },
  roleBadgeText: {
    color: '#bae6fd',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  infoItem: {
    background: 'rgba(15, 23, 42, 0.4)',
    padding: '1.25rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '0.75rem',
    fontWeight: '500',
  },
  infoValueBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#f1f5f9',
    fontSize: '1.05rem',
    fontWeight: '500',
  },
  infoIcon: {
    color: '#64748b',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '1rem',
  },
  settingItemTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#f8fafc',
    margin: '0 0 0.25rem 0',
  },
  settingItemDesc: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: 0,
  },
  toggleActive: {
    width: '48px',
    height: '24px',
    borderRadius: '9999px',
    background: '#FD5D73',
    position: 'relative',
    cursor: 'pointer',
    '::after': {
      content: '""',
      position: 'absolute',
      right: '2px',
      top: '2px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
    }
  },
  toggleInactive: {
    width: '48px',
    height: '24px',
    borderRadius: '9999px',
    background: '#475569',
    position: 'relative',
    cursor: 'pointer',
    '::after': {
      content: '""',
      position: 'absolute',
      left: '2px',
      top: '2px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: 'white',
    }
  },
  securityAlert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    padding: '1.5rem',
    background: 'rgba(56, 189, 248, 0.1)',
    borderRadius: '16px',
    border: '1px solid rgba(56, 189, 248, 0.2)',
  },
  alertIcon: {
    fontSize: '1.5rem',
    color: '#38bdf8',
    marginTop: '0.25rem',
  },
  alertTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#bae6fd',
    margin: '0 0 0.5rem 0',
  },
  alertDesc: {
    color: '#94a3b8',
    margin: 0,
    lineHeight: '1.5',
  }
};

