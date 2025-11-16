import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code2, User, Shield, Bell, Palette, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    autoSave: true,
    fontSize: 14,
    fontFamily: 'Fira Code'
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'editor', name: 'Editor', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-3 text-2xl font-bold text-white hover:text-python-blue transition-colors">
              <Code2 className="h-8 w-8" />
              <span>Python IDE</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Settings</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-800 border-b md:border-b-0 md:border-r border-gray-700">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-python-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{user?.username}</h3>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-python-blue text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors mt-6"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                      />
                      <p className="text-gray-500 text-sm mt-1">Username cannot be changed</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Member since:</span>
                          <p className="text-white">November 2024</p>
                        </div>
                        <div>
                          <span className="text-gray-400">User ID:</span>
                          <p className="text-white font-mono">{user?.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'editor' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Editor Preferences</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-python-blue"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="high-contrast">High Contrast</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Font Size
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={settings.fontSize}
                        onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-gray-400 text-sm mt-1">
                        {settings.fontSize}px
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Font Family
                      </label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-python-blue"
                      >
                        <option value="Fira Code">Fira Code</option>
                        <option value="Monaco">Monaco</option>
                        <option value="Cascadia Code">Cascadia Code</option>
                        <option value="Roboto Mono">Roboto Mono</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <span className="text-white font-medium">Auto Save</span>
                        <p className="text-gray-400 text-sm">Automatically save your work</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoSave}
                          onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-python-blue"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-700">
                      <div>
                        <span className="text-white font-medium">Email Notifications</span>
                        <p className="text-gray-400 text-sm">Receive updates about your projects</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications}
                          onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-python-blue"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Session Management</h3>
                      <p className="text-gray-400 mb-4">
                        Manage your active sessions and account security.
                      </p>
                      <button className="bg-python-blue hover:bg-python-dark text-white px-4 py-2 rounded-lg transition-colors">
                        Change Password
                      </button>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h3>
                      <p className="text-gray-400 mb-4">
                        Add an extra layer of security to your account.
                      </p>
                      <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
