import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, GraduationCap, Loader2, AlertCircle, WifiOff } from 'lucide-react';

export default function Login() {
  const { login, signup } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    // Optionally reset fields here, but keeping them can be nice for UX
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLoginMode && !selectedRole) {
      setError('Please select a role to sign up.');
      return;
    }

    setLoading(true);
    
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await signup(name, email, password, selectedRole);
      }
    } catch (err) {
      // err.message is already friendly from AuthContext
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-sm">
            S
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900 font-manrope">
          {isLoginMode ? 'Sign in to SkillMatch' : 'Create an account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isLoginMode ? 'Welcome back! Please enter your details.' : 'Join SkillMatch and find your perfect role.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          
          {/* Offline banner */}
          {!isOnline && (
            <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">You appear to be offline. Check your connection and try again.</p>
            </div>
          )}

          {/* Auth error */}
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Name Field (Signup Only) */}
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="name">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    type="text"
                    required={!isLoginMode}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role Selection (Signup Only) */}
            {!isLoginMode && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  I am a...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    disabled={loading}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                      selectedRole === 'student'
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-700'
                        : 'border-slate-200 hover:border-blue-400 bg-white text-slate-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <GraduationCap className={`w-6 h-6 mb-2 ${selectedRole === 'student' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold">Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('company')}
                    disabled={loading}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                      selectedRole === 'company'
                        ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 text-blue-700'
                        : 'border-slate-200 hover:border-blue-400 bg-white text-slate-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Briefcase className={`w-6 h-6 mb-2 ${selectedRole === 'company' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold">Company</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !isOnline}
                className="flex w-full justify-center items-center rounded-md border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading
                  ? (isLoginMode ? 'Signing in…' : 'Creating account…')
                  : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  {isLoginMode ? 'New to SkillMatch?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={toggleMode}
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoginMode ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
