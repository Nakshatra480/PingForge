import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Users, BarChart3, ArrowRight, Shield, Clock, Target } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: Sparkles, title: 'AI-Powered Outreach', desc: 'Generate hyper-personalized cold emails, LinkedIn DMs, and follow-ups in seconds.' },
  { icon: Users, title: 'Smart Lead Management', desc: 'Track engagement scores, stages, and relationship history across your entire pipeline.' },
  { icon: Target, title: 'Campaign Orchestration', desc: 'Launch targeted campaigns, track performance, and optimize conversion rates.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor reply rates, campaign performance, and pipeline velocity at a glance.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'JWT authentication, rate limiting, and encrypted data storage from day one.' },
  { icon: Clock, title: 'AI Operator', desc: 'Your always-on AI assistant for outreach strategy, message crafting, and lead analysis.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <Zap size={22} className="text-accent" />
            <span className="font-bold text-lg">PingForge</span>
          </div>
          <div className="landing-nav-links">
            <Link to="/login" className="btn btn-ghost">Log in</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>AI-Native Outreach Platform</span>
          </div>
          <h1 className="hero-title">
            Close deals faster with<br />
            <span className="hero-accent">AI-powered outreach</span>
          </h1>
          <p className="hero-subtitle">
            PingForge combines intelligent lead management, AI message generation, and campaign analytics into one platform built for founders and growth teams.
          </p>
          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Log in
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-glow"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </section>

      <section className="landing-features">
        <div className="features-header">
          <h2>Everything you need to scale outreach</h2>
          <p className="text-secondary">Built for speed, designed for results.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="feature-icon">
                <f.icon size={22} />
              </div>
              <h3>{f.title}</h3>
              <p className="text-secondary text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <p className="text-tertiary text-sm">PingForge. Built for founders who ship.</p>
      </footer>
    </div>
  );
}
