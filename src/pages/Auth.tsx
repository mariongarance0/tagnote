import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setError(error.message);
    } else if (!isLogin) {
      setMessage('Check your email to confirm your account.');
      setEmail('');
      setPassword('');
    }
    setSubmitting(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-5 bg-background">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <img
              src="/monkey_no_background.png"
              alt="TagNote"
              className="mx-auto h-28 w-auto object-contain mb-4"
            />
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">TagNote</h1>
            <p className="text-muted-foreground text-[15px] mt-1">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full text-[15px] px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full text-[15px] px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground/50 outline-none"
            />

            {error && <p className="text-destructive text-[13px]">{error}</p>}
            {message && <p className="text-primary text-[13px]">{message}</p>}

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-[15px] disabled:opacity-50"
            >
              {submitting ? '...' : isLogin ? 'Sign In' : 'Sign Up'}
            </motion.button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
              className="text-foreground font-medium"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
