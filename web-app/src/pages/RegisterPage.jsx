import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/apiClient.js';
import { useAuth } from '../components/AuthContext.jsx';

const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTER_OPTIONS = ['1st Semester', '2nd Semester'];

function toMb(size) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatFileMeta(file) {
  if (!file) return 'No file selected';
  return `${file.name} (${toMb(file.size)})`;
}
// Validation functiuons for form fields
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
  return /^[0-9]{10}$/.test(mobile); // 10 digits only
}

function validateStudentId(id) {
  return /^[A-Za-z]{2}\d{8}$/.test(id);// 2 letters followed by 8 digits
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const loggedInEmail = user?.email?.trim() || '';
  const isReapplyFlow = Boolean(location.state?.reapply);
  const prefillData = location.state?.prefill || null;
  const pageTopRef = useRef(null);
  const formErrorRef = useRef(null);
  const fileErrorRef = useRef(null);
  const universityIdRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const yearRef = useRef(null);
  const semesterRef = useRef(null);
  const talentTypeRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    universityId: '',
    email: '',
    mobile: '',
    year: '',
    semester: '',
    talentType: '',
    description: ''
  });

  
  const [categories, setCategories] = useState(['Singing', 'Dancing', 'Other']);
  const [years] = useState(YEAR_OPTIONS);
  const [semesters] = useState(SEMESTER_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [fileError, setFileError] = useState('');
  const [checkingApplication, setCheckingApplication] = useState(true);

  useEffect(() => {
    const fetchSettingsCategories = async () => {
      try {
        const data = await api.get({ path: '/settings' });
        if (data && data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchSettingsCategories();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    pageTopRef.current?.scrollIntoView({ block: 'start' });
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreview, videoPreview]);

  useEffect(() => {
    if (!loggedInEmail) return;
    setFormData((prev) => ({ ...prev, email: loggedInEmail }));
  }, [loggedInEmail]);

  useEffect(() => {
    if (!prefillData) return;
    setFormData((prev) => ({
      ...prev,
      name: prefillData.name || '',
      universityId: prefillData.universityId || '',
      email: loggedInEmail || prefillData.email || '',
      mobile: prefillData.mobileNumber || prefillData.mobile || '',
      year: prefillData.year || '',
      semester: prefillData.semester || '',
      talentType: prefillData.talentType || '',
      description: prefillData.description || ''
    }));
  }, [prefillData, loggedInEmail]);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingApplication() {
      if (!token) {
        setCheckingApplication(false);
        return;
      }

      try {
        const res = await api.get({ path: '/contestants/my-application', token });
        const existing = res?.hasApplication ? res?.data : null;

        if (!cancelled && existing) {
          const canReapply = existing.status === 'rejected';
          if (!isReapplyFlow || !canReapply) {
            navigate('/application-status', { replace: true });
            return;
          }

          setFormData((prev) => ({
            ...prev,
            name: existing.name || '',
            universityId: existing.universityId || '',
            email: loggedInEmail || existing.email || '',
            mobile: existing.mobileNumber || '',
            year: existing.year || '',
            semester: existing.semester || '',
            talentType: existing.talentType || '',
            description: existing.description || ''
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to verify your application status.');
        }
      } finally {
        if (!cancelled) setCheckingApplication(false);
      }
    }

    checkExistingApplication();
    return () => {
      cancelled = true;
    };
  }, [token, navigate, isReapplyFlow, loggedInEmail]);

  const scrollToRef = (ref) => {
    window.requestAnimationFrame(() => {
      ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof ref?.current?.focus === 'function') {
        ref.current.focus();
      }
    });
  };

  const setFormValidationError = (message, ref) => {
    setError(message);
    scrollToRef(ref || formErrorRef);
  };

  const setFileValidationError = (message, ref) => {
    setFileError(message);
    scrollToRef(ref || fileErrorRef);
  };

  const handleChange = (e) => {
    if (e.target.name === 'email' && loggedInEmail) return;
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFileError('Image file must be less than 3 MB.');
      e.target.value = '';
      return;
    }

    setFileError('');
    setImageFile(file);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setFileError('Please select a valid video file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setFileError('Video file must be less than 50 MB.');
      e.target.value = '';
      return;
    }

    setFileError('');
    setVideoFile(file);

    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFileError('');

    if (!imageFile) {
      setFileValidationError('Please upload a profile image under 3 MB.', imageInputRef);
      return;
    }

    if (!videoFile) {
      setFileValidationError('Please upload a performance video under 50 MB.', videoInputRef);
      return;
    }

    if (!formData.talentType) {
      setFormValidationError('Please select a talent category.', talentTypeRef);
      return;
    }

    if (!formData.year) {
      setFormValidationError('Please select your year.', yearRef);
      return;
    }

    if (!formData.semester) {
      setFormValidationError('Please select your semester.', semesterRef);
      return;
    }

    const finalEmail = loggedInEmail || formData.email.trim();

    if (!loggedInEmail) {
      setFormValidationError('Please login first to use your verified email address.', emailRef);
      return;
    }

    if (!validateEmail(finalEmail)) {
      setFormValidationError('Please enter a valid email address.', emailRef);
      return;
    }

    if (!validateMobile(formData.mobile)) {
      setFormValidationError('Mobile number must be 10 digits.', mobileRef);
      return;
    }
    
    if (!validateStudentId(formData.universityId)) {
      setFormValidationError('Student ID must follow the format AAxxxxxx.', universityIdRef);
    return;
    }


    setLoading(true);

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('universityId', formData.universityId.trim());
    payload.append('email', finalEmail);
    payload.append('mobileNumber', formData.mobile.trim());
    payload.append('year', formData.year);
    payload.append('semester', formData.semester);
    payload.append('talentType', formData.talentType);
    payload.append('description', formData.description.trim());
    payload.append('image', imageFile);
    payload.append('video', videoFile);

    try {
      await api.post({ path: '/contestants', token, body: payload });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error registering');
      scrollToRef(formErrorRef);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.ambientGlowOne} />
        <div style={styles.ambientGlowTwo} />
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Application Submitted</h2>
          <p style={styles.successText}>Thank you for registering. Your application is now in the review queue.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/')}>
            Return To Home
          </button>
        </div>
      </div>
    );
  }

  if (checkingApplication) {
    return (
      <div style={styles.container}>
        <div style={styles.ambientGlowOne} />
        <div style={styles.ambientGlowTwo} />
        <div style={styles.successCard}>
          <h2 style={styles.successTitle}>Checking Application</h2>
          <p style={styles.successText}>Please wait while we verify your existing submission.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} ref={pageTopRef}>
      <div style={styles.ambientGlowOne} />
      <div style={styles.ambientGlowTwo} />

      <div style={styles.backRow} onClick={() => navigate(-1)}>
        &larr; Back
      </div>

      <div style={styles.card}>
        <div style={styles.leftPanel}>
          <span style={styles.tag}>Contestant Application</span>
          <h2 style={styles.title}>Step Into The Spotlight</h2>
          <p style={styles.subtitle}>
            Submit your details with a clean profile image and a short performance video. Make your first impression count.
          </p>

          {isReapplyFlow ? (
            <div style={{ ...styles.quickRules, borderColor: 'rgba(251, 191, 36, 0.5)', background: 'rgba(120, 53, 15, 0.18)' }}>
              <p style={styles.ruleTitle}>Re-Apply Mode</p>
              <p style={styles.ruleItem}>Your previous details are pre-filled from your last rejected application.</p>
              <p style={styles.ruleItem}>Update anything necessary and upload new files before submitting again.</p>
            </div>
          ) : null}

          <div style={styles.quickRules}>
            <p style={styles.ruleTitle}>Upload Rules</p>
            <p style={styles.ruleItem}>Image must be less than 3 MB</p>
            <p style={styles.ruleItem}>Video must be less than 50 MB</p>
            <p style={styles.ruleItem}>Supported formats: common image and video types</p>
          </div>

          <div style={styles.previewWrap}>
            <div style={styles.previewCard}>
              <p style={styles.previewLabel}>Image Preview</p>
              {imagePreview ? (
                <img src={imagePreview} alt="Selected contestant" style={styles.imagePreview} />
              ) : (
                <div style={styles.previewPlaceholder}>No image selected yet</div>
              )}
              <p style={styles.fileMeta}>{formatFileMeta(imageFile)}</p>
            </div>

            <div style={styles.previewCard}>
              <p style={styles.previewLabel}>Video Preview</p>
              {videoPreview ? (
                <video src={videoPreview} controls style={styles.videoPreview} />
              ) : (
                <div style={styles.previewPlaceholder}>No video selected yet</div>
              )}
              <p style={styles.fileMeta}>{formatFileMeta(videoFile)}</p>
            </div>
          </div>

          {fileError && <div style={styles.errorBanner} ref={fileErrorRef}>{fileError}</div>}
        </div>

        <div style={styles.rightPanel}>
          <h3 style={styles.formTitle}>Talent Registration</h3>
          {error && <div style={styles.errorBanner} ref={formErrorRef}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your full name"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Student ID</label>
              <input
                ref={universityIdRef}
                name="universityId"
                value={formData.universityId}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="AAxxxxxxxx"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                ref={emailRef}
                name="email"
                value={loggedInEmail || formData.email}
                onChange={handleChange}
                readOnly
                required
                style={styles.input}
                placeholder={loggedInEmail ? '' : 'Login required to auto-fill email'}
              />
              <span style={styles.helperText}>This field is auto-filled from your logged-in account and cannot be edited.</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mobile number</label>
              <input
                ref={mobileRef}
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="07xxxxxxxx"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Year</label>
              <select
                ref={yearRef}
                name="year"
                value={formData.year}
                onChange={handleChange}
                style={{ ...styles.input, appearance: 'none' }}
                required
              >
                <option value="" disabled>
                  Select Year
                </option>
                {years.map((year, idx) => (
                  <option
                    key={idx}
                    value={year}
                    style={{ backgroundColor: '#dbe4ee', color: '#0f172a' }}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Semester</label>
              <select
                ref={semesterRef}
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                style={{ ...styles.input, appearance: 'none' }}
                required
              >
                <option value="" disabled>
                  Select Semester
                </option>
                {semesters.map((semester, idx) => (
                  <option
                    key={idx}
                    value={semester}
                    style={{ backgroundColor: '#dbe4ee', color: '#0f172a' }}
                  >
                    {semester}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select
                ref={talentTypeRef}
                name="talentType"
                value={formData.talentType}
                onChange={handleChange}
                style={{ ...styles.input, appearance: 'none' }}
                required
              >
                <option value="" disabled>
                  Select Talent
                </option>
                {categories.map((cat, idx) => (
                  <option
                    key={idx}
                    value={cat}
                    style={{ backgroundColor: '#dbe4ee', color: '#0f172a' }}
                  >
                    {cat}
                  </option>
                ))}
              </select>
              <span style={styles.helperText}>Available categories: {categories.join(', ')}</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Profile Image</label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagePick}
                style={styles.fileInput}
                required
              />
              <span style={styles.helperText}>Maximum size: 3 MB</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Performance Video</label>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoPick}
                style={styles.fileInput}
                required
              />
              <span style={styles.helperText}>Maximum size: 50 MB</span>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Short Bio</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                style={{ ...styles.input, resize: 'vertical' }}
                placeholder="Tell us about your performance style"
              />
            </div>

            <button type="submit" disabled={loading} style={styles.primaryBtn}>
              {loading ? 'Submitting...' : isReapplyFlow ? 'Submit Re-Application' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'radial-gradient(circle at 10% 20%, #13293d 0%, #0b0f1a 35%, #05070c 100%)',
    fontFamily: "'Sora', sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  ambientGlowOne: {
    position: 'absolute',
    width: '480px',
    height: '480px',
    top: '-180px',
    left: '-140px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,211,238,0.22) 0%, rgba(34,211,238,0) 72%)',
    pointerEvents: 'none'
  },
  ambientGlowTwo: {
    position: 'absolute',
    width: '520px',
    height: '520px',
    bottom: '-210px',
    right: '-190px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0) 70%)',
    pointerEvents: 'none'
  },
  backRow: {
    width: '100%',
    maxWidth: '1120px',
    color: '#b9c7d6',
    marginBottom: '16px',
    cursor: 'pointer',
    zIndex: 2,
    fontSize: '0.95rem',
    fontWeight: 600
  },
  card: {
    width: '100%',
    maxWidth: '1120px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    borderRadius: '24px',
    backdropFilter: 'blur(18px)',
    overflow: 'hidden',
    boxShadow: '0 30px 70px rgba(0, 0, 0, 0.45)',
    zIndex: 2
  },
  leftPanel: {
    padding: '34px',
    borderRight: '1px solid rgba(255, 255, 255, 0.11)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'linear-gradient(170deg, rgba(8,26,43,0.8), rgba(3,10,22,0.8))'
  },
  rightPanel: {
    padding: '34px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  tag: {
    width: 'fit-content',
    background: 'rgba(34, 211, 238, 0.16)',
    border: '1px solid rgba(34, 211, 238, 0.35)',
    color: '#9be8f5',
    padding: '6px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontWeight: 700
  },
  title: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '2rem',
    lineHeight: 1.2,
    letterSpacing: '0.01em'
  },
  subtitle: {
    margin: 0,
    color: '#bfd0e1',
    lineHeight: 1.7,
    fontSize: '0.98rem'
  },
  quickRules: {
    border: '1px dashed rgba(255,255,255,0.22)',
    borderRadius: '14px',
    padding: '14px',
    background: 'rgba(2, 10, 22, 0.45)'
  },
  ruleTitle: {
    margin: '0 0 8px 0',
    color: '#f8fafc',
    fontWeight: 700,
    fontSize: '0.95rem'
  },
  ruleItem: {
    margin: '4px 0',
    color: '#b7c8d9',
    fontSize: '0.88rem'
  },
  previewWrap: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px',
    marginTop: '8px'
  },
  previewCard: {
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)'
  },
  previewLabel: {
    margin: '0 0 8px 0',
    color: '#d9e5f1',
    fontWeight: 600,
    fontSize: '0.85rem'
  },
  previewPlaceholder: {
    height: '120px',
    border: '1px dashed rgba(255,255,255,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9aa8b8',
    fontSize: '0.86rem'
  },
  imagePreview: {
    width: '100%',
    maxHeight: '220px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.18)'
  },
  videoPreview: {
    width: '100%',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.18)',
    backgroundColor: '#0d1117'
  },
  fileMeta: {
    margin: '8px 0 0 0',
    color: '#98a9bb',
    fontSize: '0.78rem'
  },
  formTitle: {
    margin: 0,
    color: '#f8fafc',
    fontSize: '1.55rem',
    fontWeight: 700
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: '#afc1d5'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#f8fafc',
    outline: 'none',
    fontSize: '0.98rem'
  },
  fileInput: {
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#f8fafc',
    fontSize: '0.92rem',
    padding: '10px'
  },
  helperText: {
    color: '#8fa2b7',
    fontSize: '0.78rem'
  },
  primaryBtn: {
    marginTop: '6px',
    padding: '13px 14px',
    borderRadius: '10px',
    background: 'linear-gradient(90deg, #06b6d4, #f97316)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.98rem',
    border: 'none',
    cursor: 'pointer'
  },
  errorBanner: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    color: '#fca5a5',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(248, 113, 113, 0.32)',
    fontSize: '0.86rem'
  },
  successCard: {
    width: '100%',
    maxWidth: '560px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    padding: '36px',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    backdropFilter: 'blur(20px)',
    textAlign: 'center',
    zIndex: 2
  },
  successTitle: {
    margin: '0 0 8px 0',
    fontSize: '1.9rem',
    color: '#f8fafc'
  },
  successText: {
    margin: '0 0 20px 0',
    color: '#c3d3e3',
    lineHeight: 1.6
  }
};
