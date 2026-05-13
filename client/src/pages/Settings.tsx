import { useState } from 'react';
import { Loader2, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/index.ts';
import { settingsApi } from '../api';
import api from '../api/client';
import './Pages.css';

export default function Settings() {
  const { user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: user?.title || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [smtp, setSmtp] = useState({
    host: user?.preferences?.smtp?.host || '',
    port: user?.preferences?.smtp?.port || 587,
    user: user?.preferences?.smtp?.user || '',
    pass: user?.preferences?.smtp?.pass || '',
    fromName: user?.preferences?.smtp?.fromName || user?.name || '',
    fromEmail: user?.preferences?.smtp?.fromEmail || user?.email || '',
  });
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [smtpStatus, setSmtpStatus] = useState<{ configured: boolean; host: string | null } | null>(null);
  const [smtpStatusLoading, setSmtpStatusLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [error, setError] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await settingsApi.updateProfile(profile);
      setAuth(res.data as any, useAuthStore.getState().token!);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch { setError('Failed to update profile'); }
    setProfileLoading(false);
  };

  const handleSmtpSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpLoading(true);
    setSmtpStatus(null);
    try {
      const res = await settingsApi.updateProfile({ preferences: { smtp } });
      setAuth(res.data as any, useAuthStore.getState().token!);
      setSmtpSaved(true);
      setTimeout(() => setSmtpSaved(false), 2000);
    } catch { setError('Failed to update email settings'); }
    setSmtpLoading(false);
  };

  const handleCheckSmtpStatus = async () => {
    setSmtpStatusLoading(true);
    try {
      const res = await api.get('/settings/smtp-status') as any;
      // Axios interceptor returns response.data, so res = { success, data: { configured, host, ... } }
      setSmtpStatus(res.data);
    } catch (e: any) { setError('Could not check SMTP status: ' + (e?.response?.data?.error || e?.message || 'unknown')); }
    setSmtpStatusLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPwLoading(true);
    try {
      await settingsApi.updatePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2000);
    } catch (err: any) { setError(err.response?.data?.error || 'Failed to change password'); }
    setPwLoading(false);
  };

  return (
    <div className="page settings-page">
      <div className="settings-section card">
        <h3 className="font-semibold" style={{ marginBottom: 20 }}>Email Configuration (SMTP)</h3>
        <p className="text-sm text-tertiary" style={{ marginBottom: 16 }}>Configure your email server to send direct outreach from PingForge.</p>
        <form className="modal-form" onSubmit={handleSmtpSave}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}><label className="label">SMTP Host</label><input className="input" value={smtp.host} onChange={e => setSmtp({ ...smtp, host: e.target.value })} placeholder="smtp.gmail.com" /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="label">Port</label><input className="input" type="number" value={smtp.port} onChange={e => setSmtp({ ...smtp, port: parseInt(e.target.value) })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="label">Username</label><input className="input" value={smtp.user} onChange={e => setSmtp({ ...smtp, user: e.target.value })} /></div>
            <div className="form-group"><label className="label">Password / App Key</label><input className="input" type="password" value={smtp.pass} onChange={e => setSmtp({ ...smtp, pass: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="label">From Name</label><input className="input" value={smtp.fromName} onChange={e => setSmtp({ ...smtp, fromName: e.target.value })} /></div>
            <div className="form-group"><label className="label">From Email</label><input className="input" type="email" value={smtp.fromEmail} onChange={e => setSmtp({ ...smtp, fromEmail: e.target.value })} /></div>
          </div>
          <div className="modal-actions" style={{ flexDirection: 'column', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={smtpLoading} style={{ width: '100%' }}>
              {smtpLoading ? <Loader2 size={16} className="spinning" /> : smtpSaved ? <><Check size={16} /> Saved Successfully</> : 'Save Email Settings'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCheckSmtpStatus} disabled={smtpStatusLoading} style={{ width: '100%' }}>
              {smtpStatusLoading ? <Loader2 size={16} className="spinning" /> : 'Verify Saved Settings'}
            </button>
          </div>
          {smtpStatus && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: smtpStatus.configured ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${smtpStatus.configured ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              {smtpStatus.configured
                ? <><CheckCircle size={16} style={{ color: '#22c55e' }} /><span className="text-sm" style={{ color: '#22c55e' }}>SMTP configured correctly — host: {smtpStatus.host}</span></>
                : <><AlertCircle size={16} style={{ color: '#ef4444' }} /><span className="text-sm" style={{ color: '#ef4444' }}>SMTP not saved in database. Please fill all fields and save again.</span></>
              }
            </div>
          )}
        </form>
      </div>

      <div className="settings-section card">
        <h3 className="font-semibold" style={{ marginBottom: 20 }}>Profile</h3>
        <form className="modal-form" onSubmit={handleProfileSave}>
          <div className="form-row">
            <div className="form-group"><label className="label">Name</label><input className="input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} /></div>
            <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="label">Your Title <span className="text-tertiary text-xs">(used in emails)</span></label><input className="input" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} placeholder="e.g. Founder & CEO" /></div>
            <div className="form-group"><label className="label">Your Company <span className="text-tertiary text-xs">(used in emails)</span></label><input className="input" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} placeholder="e.g. PingForge" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="label">Phone Number <span className="text-tertiary text-xs">(used in emails)</span></label><input className="input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="e.g. +91 98765 43210" /></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={profileLoading}>
            {profileLoading ? <Loader2 size={16} className="spinning" /> : profileSaved ? <><Check size={16} /> Saved</> : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="settings-section card">
        <h3 className="font-semibold" style={{ marginBottom: 20 }}>Change Password</h3>
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}
        <form className="modal-form" onSubmit={handlePasswordChange}>
          <div className="form-group"><label className="label">Current Password</label><input className="input" type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></div>
          <div className="form-group"><label className="label">New Password</label><input className="input" type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} minLength={8} required /></div>
          <button type="submit" className="btn btn-primary" disabled={pwLoading}>
            {pwLoading ? <Loader2 size={16} className="spinning" /> : pwSaved ? <><Check size={16} /> Updated</> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
