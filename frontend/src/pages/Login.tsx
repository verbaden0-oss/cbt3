import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await client.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      setIsNewUser(res.data.isNewUser || false);
      setIsSuccess(true);

      // Delay navigation to show success animation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || 'Ошибка сети';

      // Translate common errors
      if (errorMsg === 'Invalid credentials') {
        setError('Неверный пароль');
      } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
        setError('Ошибка сети. Проверьте подключение или сервер недоступен.');
      } else if (err?.response?.status === 500) {
        setError('Ошибка сервера. Попробуйте позже.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center animate-success">
          <div className="text-7xl mb-6">
            {isNewUser ? '🎉' : '👋'}
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-2">
            {isNewUser ? 'Добро пожаловать!' : 'С возвращением!'}
          </h2>
          <p className="text-text-secondary">
            {isNewUser ? 'Аккаунт успешно создан' : 'Вход выполнен успешно'}
          </p>
          <div className="mt-6">
            <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md space-y-6 relative z-10 glass-card-premium">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white text-3xl shadow-lg animate-float">
            🧠
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Мой КПТ
          </h2>
          <p className="text-text-secondary text-sm">
            Войдите или создайте новый аккаунт
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                📧
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-text-primary placeholder-text-secondary/60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary">
              Пароль
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ваш пароль"
                required
                minLength={6}
                className="w-full pl-10 pr-12 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-text-primary placeholder-text-secondary/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-shake">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-medium">Ошибка</p>
                <p className="text-red-500 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 text-xs">
            <p>💡 Если аккаунт с этим email не существует, он будет создан автоматически.</p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            className="py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-text-secondary pt-4 border-t border-gray-200 dark:border-gray-700">
          <p>Защищённое соединение 🔐</p>
        </div>
      </Card>
    </div>
  );
}
