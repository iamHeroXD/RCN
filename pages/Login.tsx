import React, { useState } from 'react';
import { authService } from '../services/storage';
import { User } from '../types';
import { Zap, Gamepad2 } from 'lucide-react';
import { APP_NAME, FULL_APP_NAME } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      const user = await authService.login(username);
      onLogin(user);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-red-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-[#111] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-gradient-to-br from-red-600 to-red-900 p-4 rounded-2xl mb-6 shadow-[0_0_20px_rgba(220,38,38,0.5)] transform rotate-3 hover:rotate-0 transition-transform duration-500">
             <Zap size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{APP_NAME}</h1>
          <p className="text-gray-400 text-center font-medium tracking-wide uppercase text-sm">{FULL_APP_NAME}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 pl-1">Username / Handle</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-600"
              placeholder="Enter your handle..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Gamepad2 size={20} />
                <span>Enter Network</span>
              </>
            )}
          </button>
          
          <div className="bg-white/5 p-4 rounded-lg mt-6 border border-white/5">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              <span className="text-red-400 font-bold">TIP:</span> Login as <span className="text-white font-mono bg-white/10 px-1 rounded">HeroXD</span> to access the Admin Panel & Infinite Balance.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;