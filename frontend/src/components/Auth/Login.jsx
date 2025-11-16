import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code2, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-ide-dark-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <Code2 className="h-12 w-12 text-python-blue mr-3" />
            <span className="text-3xl font-bold text-white">Python IDE</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to your account to continue coding
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="relative block w-full px-4 py-3 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-python-blue focus:border-transparent transition-all"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full px-4 py-3 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-python-blue focus:border-transparent transition-all"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-python-blue hover:bg-python-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-python-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-python-blue hover:text-python-yellow transition-colors"
              >
                Sign up now
              </Link>
            </span>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8 text-center">
          <div className="text-gray-400">
            <div className="text-lg font-semibold text-python-yellow">Python 3.14</div>
            <div className="text-xs">Latest Version</div>
          </div>
          <div className="text-gray-400">
            <div className="text-lg font-semibold text-python-yellow">Live Preview</div>
            <div className="text-xs">Real-time Output</div>
          </div>
          <div className="text-gray-400">
            <div className="text-lg font-semibold text-python-yellow">Games</div>
            <div className="text-xs">Pygame Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
