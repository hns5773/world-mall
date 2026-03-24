import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff, RefreshCw, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

// Generate random CAPTCHA text (4 characters)
function generateCaptchaText(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let text = '';
  for (let i = 0; i < 4; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

// Draw CAPTCHA on canvas with colorful characters
function drawCaptcha(canvas: HTMLCanvasElement, text: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // White background with subtle border feel
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw noise dots
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.3)`;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw noise lines
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.2)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // Colors for each character - vibrant like City Mall
  const colors = [
    '#e53e3e', // red
    '#3182ce', // blue
    '#38a169', // green
    '#d69e2e', // orange/gold
    '#805ad5', // purple
    '#dd6b20', // dark orange
    '#e53e3e', // red
    '#2b6cb0', // dark blue
  ];

  // Draw each character with different color, size, and rotation
  const charWidth = width / (text.length + 1);
  for (let i = 0; i < text.length; i++) {
    ctx.save();

    const x = charWidth * (i + 0.5) + (Math.random() * 10 - 5);
    const y = height / 2 + (Math.random() * 10 - 5);
    const rotation = (Math.random() - 0.5) * 0.6; // -0.3 to 0.3 radians
    const fontSize = 28 + Math.floor(Math.random() * 8); // 28-36px

    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.font = `bold ${fontSize}px "Georgia", "Times New Roman", serif`;
    ctx.fillStyle = colors[i % colors.length];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text[i], 0, 0);

    ctx.restore();
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const refreshCaptcha = useCallback(() => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    setCaptchaInput('');
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, newText);
    }
  }, []);

  // Initialize CAPTCHA on mount
  useEffect(() => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    // Small delay to ensure canvas is mounted
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        drawCaptcha(canvasRef.current, newText);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Redraw when captchaText changes
  useEffect(() => {
    if (canvasRef.current && captchaText) {
      drawCaptcha(canvasRef.current, captchaText);
    }
  }, [captchaText]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      setAuth(data.token, data.user as any);
      toast.success('登录成功');
      navigate('/admin/dashboard');
    },
    onError: (err) => {
      toast.error(err.message);
      refreshCaptcha();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate CAPTCHA (case-insensitive)
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      toast.error('验证码错误，请重新输入');
      refreshCaptcha();
      return;
    }

    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Shield Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
          <p className="text-gray-400 text-sm mt-1">World Mall</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all bg-white"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all bg-white pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">验证码</label>
              <div className="flex items-center gap-3 mb-2">
                <div className="border border-red-400 rounded-lg overflow-hidden flex-shrink-0" style={{ lineHeight: 0 }}>
                  <canvas
                    ref={canvasRef}
                    width={140}
                    height={50}
                    className="cursor-pointer"
                    onClick={refreshCaptcha}
                    title="点击刷新验证码"
                  />
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="刷新验证码"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="请输入上方验证码"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all bg-white"
                required
                autoComplete="off"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loginMutation.isLoading}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loginMutation.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          World Mall © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
