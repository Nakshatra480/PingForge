import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/index.ts';
import { authApi } from '../api';
import './Auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.register({ name, email, password });
      setAuth(res.data.user, res.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <Zap size={24} className="text-accent" />
            <span className="font-bold text-xl">PingForge</span>
          </Link>
          <h1>Create your account</h1>
          <p className="text-secondary text-sm">Start closing deals with AI-powered outreach</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="label" htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
            />
          </div>

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spinning" /> : 'Create account'}
          </button>
        </form>

        <p className="auth-footer text-sm text-secondary">
          Already have an account? <Link to="/login" className="text-accent">Log in</Link>
        </p>
      </div>
    </div>
  );
}
