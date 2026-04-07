import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, Sprout, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    phone: false,
    password: false,
  });

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const phoneError = touched.phone && phoneNumber && !validatePhone(phoneNumber) 
    ? 'Enter a valid 10-digit Indian phone number'
    : '';
    
  const passwordError = touched.password && password.length < 6 
    ? 'Password must be at least 6 characters'
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({ phone: true, password: true });
    
    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const result = await login(phoneNumber, password);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.div
          className="bg-neutral-800 rounded-2xl p-8 border border-neutral-700"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#3B6D11] flex items-center justify-center">
                <Sprout className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AgriTech AI</h1>
                <p className="text-sm text-neutral-400">Smart Farming Platform</p>
              </div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-300">Login successful! Redirecting...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  <Phone size={20} strokeWidth={2} />
                </div>
                <motion.input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhoneNumber(value);
                  }}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  placeholder="9998887776"
                  disabled={loading}
                  className={`w-full h-12 pl-11 pr-4 rounded-lg border transition-all duration-200 bg-neutral-900 text-neutral-100 placeholder-neutral-600 focus:outline-none ${
                    phoneError
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500/50'
                      : 'border-neutral-700 focus:ring-1 focus:ring-[#3B6D11]/50 focus:border-[#3B6D11]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </div>
              {phoneError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 mt-2 flex items-center gap-1"
                >
                  <span>⚠</span>
                  {phoneError}
                </motion.p>
              )}
              {!phoneError && phoneNumber && (
                <p className="text-sm text-neutral-500 mt-2">
                  Default: 9998887776
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  <Lock size={20} strokeWidth={2} />
                </div>
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  placeholder="password123"
                  disabled={loading}
                  className={`w-full h-12 pl-11 pr-4 rounded-lg border transition-all duration-200 bg-neutral-900 text-neutral-100 placeholder-neutral-600 focus:outline-none ${
                    passwordError
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500/50'
                      : 'border-neutral-700 focus:ring-1 focus:ring-[#3B6D11]/50 focus:border-[#3B6D11]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              </div>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-400 mt-2 flex items-center gap-1"
                >
                  <span>⚠</span>
                  {passwordError}
                </motion.p>
              )}
              {!passwordError && password && (
                <p className="text-sm text-neutral-500 mt-2">
                  Default: password123
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading || !!phoneError || !!passwordError}
              className="w-full h-12 bg-[#3B6D11] hover:bg-[#2d5409] text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              whileHover={!loading && !phoneError && !passwordError ? { scale: 1.01 } : {}}
              whileTap={!loading && !phoneError && !passwordError ? { scale: 0.99, y: 1 } : {}}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  />
                  <span>Logging in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-700">
            <div className="text-center">
              <p className="text-sm text-neutral-400">
                Demo Credentials
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-neutral-500">
                  Phone: <span className="text-neutral-300">9998887776</span>
                </p>
                <p className="text-xs text-neutral-500">
                  Password: <span className="text-neutral-300">password123</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="text-center text-sm text-neutral-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Powered by AgriTech AI Platform
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
