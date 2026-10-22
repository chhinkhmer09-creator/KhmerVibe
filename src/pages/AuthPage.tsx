import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { signInWithGoogle, switchAccount } = useAuth();
  const { lang } = useLanguage();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    // Sign in as user or admin if email matches
    if (identifier.toLowerCase().includes('admin') || identifier === 'chhnchhin94@gmail.com') {
      switchAccount('admin', identifier);
    } else {
      switchAccount('user', identifier);
    }
    setIsLoading(false);
    onSuccess();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
    onSuccess();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden bg-[#0D121F] border border-indigo-950/80 shadow-2xl shadow-indigo-950/40">
        {/* Left Hero Graphic Card matching design reference */}
        <div className="relative p-8 sm:p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-950 via-[#0B0F19] to-fuchsia-950/40 border-b md:border-b-0 md:border-r border-indigo-900/40">
          {/* Angkor Wat scenic overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1000&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />

          {/* Logo & Welcome Text */}
          <div className="relative z-10 space-y-6">
            <Logo size="lg" />
            <div className="space-y-2 pt-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                សូមស្វាគមន៍មកកាន់<br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  KhmerVibe
                </span>
              </h2>
              <p className="text-sm text-indigo-200/80 leading-relaxed font-medium">
                ចែករំលែកវីដេអូ ជាមួយសហគមន៍
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12 space-y-2 text-xs text-indigo-300/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>សុវត្ថិភាព និងភាពឯកជនខ្ពស់បំផុត</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              គាំទ្រភាសាខ្មែរ ១០០% លើកស្ទួយមាតិកាជាតិ
            </p>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-[#0F172A]/70 backdrop-blur-md">
          {/* Tabs */}
          <div className="flex border-b border-indigo-950 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 pb-3 text-center text-sm font-bold transition-all relative ${
                tab === 'login' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              ចូលគណនី
              {tab === 'login' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 shadow-md shadow-indigo-500/50" />
              )}
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 pb-3 text-center text-sm font-bold transition-all relative ${
                tab === 'register' ? 'text-indigo-400 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              ចុះឈ្មោះ
              {tab === 'register' && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500 shadow-md shadow-indigo-500/50" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ឈ្មោះពេញ (Full Name)"
                  className="w-full bg-[#0B0F19] border border-indigo-900/60 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="អ៊ីមែល ឬលេខទូរស័ព្ទ"
                className="w-full bg-[#0B0F19] border border-indigo-900/60 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ពាក្យសម្ងាត់"
                className="w-full bg-[#0B0F19] border border-indigo-900/60 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {tab === 'login' ? 'ចូល' : 'ចុះឈ្មោះបង្កើតគណនី'}
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-indigo-950" />
              <span className="px-3 text-xs text-neutral-500 font-medium">ឬ</span>
              <div className="flex-1 h-px bg-indigo-950" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0B0F19] hover:bg-neutral-900 border border-indigo-900/60 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>ចូលជាមួយ Google</span>
            </button>

            <div className="text-center pt-2">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions will be sent to your registered email.');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                ភ្លេចពាក្យសម្ងាត់?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
