import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../services/apiClient.js';

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await api.get({ path: '/settings', token });
      if (data) {
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(newCats) {
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put({
        path: '/settings',
        token,
        body: { categories: newCats }
      });
      setMsg({ type: 'success', text: 'Categories updated successfully!' });    
      setCategories(newCats);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  }

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.some(c => c.toLowerCase() === newCategory.trim().toLowerCase())) {
      setMsg({ type: 'error', text: 'Category already exists!' });
      return;
    }
    const updated = [...categories, newCategory.trim()];
    saveSettings(updated);
    setNewCategory('');
  };

  const handleRemoveCategory = (cat) => {
    if (!window.confirm(`Are you sure you want to remove the category "${cat}"?`)) return;
    const updated = categories.filter((c) => c !== cat);
    saveSettings(updated);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ flex: 1 }}>
          <h2 style={styles.pageTitle}>Manage Categories</h2>
          <p style={styles.pageSubtitle}>Add, review or remove the talent categories for your events.</p>
        </div>
      </header>

      {/* Alert Messages */}
      {msg.text && (
        <div style={msg.type === 'error' ? styles.alertError : styles.alertSuccess}>
           {msg.type === 'success' ? '✅ ' : '⚠️ '} {msg.text}
        </div>
      )}

      {/* Add New Category Section */}
      <div style={styles.addCard}>
        <h3 style={styles.cardTitle}>Create New Category</h3>
        <form onSubmit={handleAddCategory} style={styles.addCategoryForm}>      
          <div style={styles.inputWrapper}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{position: 'absolute', left: '16px', top: '14px'}}>
               <path d="M12 5v14M5 12h14"/>
             </svg>
             <input
               type="text"
               placeholder="e.g., Beatboxing, Stand-up Comedy..."
               value={newCategory}
               onChange={(e) => setNewCategory(e.target.value)}
               style={styles.inputField}
               maxLength={40}
             />
          </div>
          <button type="submit" disabled={saving || !newCategory.trim()} style={{...styles.actionBtn, opacity: (saving || !newCategory.trim()) ? 0.6 : 1}}> 
            {saving ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Category List Section */}
      <div style={styles.listCard}>
        <h3 style={{...styles.cardTitle, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px', marginBottom: '20px'}}>Active Categories <span style={{marginLeft: '10px', fontSize: '0.9rem', color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '20px'}}>{categories.length}</span></h3>
        
        <div style={styles.categoryList}>
          {loading ? (
            <div style={styles.loadingState}>
                <div className="spinner"></div> Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div style={styles.emptyState}>
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{color: '#475569', marginBottom: '16px'}}>
                 <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 12h6"/><path d="M12 9v6"/>
               </svg>
               <p style={{margin: 0, fontSize: '1.1rem', color: '#94a3b8', fontWeight: 500}}>No Categories Added Yet</p>
               <p style={{margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b'}}>Use the form above to start adding categories.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map((cat, i) => (
                <div key={i} style={styles.categoryItemRow}>
                  <div style={styles.categoryInfo}>
                    <div style={styles.iconBox}>
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                         <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                       </svg>
                    </div>
                    <span style={styles.categoryNameText}>{cat}</span>
                  </div>
                  
                  <button type="button" style={styles.deleteBtn} onClick={() => handleRemoveCategory(cat)} title="Remove Category">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Required tiny animation style injected cleanly */}
      <style>{`
        .spinner {
           border: 3px solid rgba(255,255,255,0.1);
           width: 24px;
           height: 24px;
           border-radius: 50%;
           border-left-color: var(--primary);
           animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
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
  header: {
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
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '400',
  },
  
  cardTitle: { margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '600', color: '#f1f5f9' },
  
  addCard: { 
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  listCard: { 
      background: 'rgba(30, 41, 59, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '24px',
      padding: '2rem',
      minHeight: '300px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  
  addCategoryForm: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  inputWrapper: { position: 'relative', flex: 1, minWidth: '250px' },
  inputField: { 
      width: '100%', 
      padding: '14px 16px 14px 44px', 
      backgroundColor: 'rgba(15, 23, 42, 0.6)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '12px', 
      color: '#fff', 
      fontSize: '1rem', 
      outline: 'none', 
      boxSizing: 'border-box',
      transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  
  actionBtn: { 
      padding: '14px 28px', 
      background: 'linear-gradient(135deg, #FD5D73 0%, #E11D48 100%)', 
      color: '#fff', 
      border: 'none', 
      borderRadius: '12px', 
      fontSize: '1rem', 
      fontWeight: '600', 
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
  },
  
  categoryList: { width: '100%' },
  
  categoryItemRow: { 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      backgroundColor: 'rgba(15, 23, 42, 0.4)', 
      border: '1px solid rgba(255, 255, 255, 0.05)', 
      padding: '16px 20px', 
      borderRadius: '16px',
      transition: 'background-color 0.2s, transform 0.2s',
      backdropFilter: 'blur(10px)',
  },
  categoryInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconBox: {
      width: '44px', height: '44px', borderRadius: '12px', 
      background: 'rgba(253, 93, 115, 0.15)', color: '#FD5D73', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(253, 93, 115, 0.2)'
  },
  categoryNameText: { fontSize: '1.1rem', fontWeight: '500', color: '#f8fafc' },
  
  deleteBtn: { 
      background: 'rgba(244, 63, 94, 0.1)', 
      border: '1px solid rgba(244, 63, 94, 0.2)', 
      color: '#f43f5e', 
      cursor: 'pointer', 
      padding: '10px', 
      borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background-color 0.2s'
  },
  
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' },
  loadingState: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px', color: '#94a3b8' },
  
  alertSuccess: { margin: '0 0 1.5rem 0', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981', color: '#34d399', borderRadius: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' },
  alertError: { margin: '0 0 1.5rem 0', padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '1rem', display: 'flex', alignItems: 'center' }
};
