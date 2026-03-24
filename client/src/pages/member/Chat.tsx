import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Send, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function MemberChat() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: partners } = trpc.chat.getChatPartner.useQuery();
  const partnerId = partners?.[0]?.id;

  const { data: messages, refetch } = trpc.chat.getMessages.useQuery(
    { otherUserId: partnerId! },
    { enabled: !!partnerId, refetchInterval: 3000 }
  );

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage('');
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !partnerId) return;
    sendMutation.mutate({ receiverId: partnerId, message: message.trim() });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex flex-wrap items-center justify-center gap-8 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Globe key={i} className="w-12 h-12 text-white" />
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold">{t('chat.title')}</h1>
            {partners?.[0] && <p className="text-white/70 text-xs">{partners[0].username}</p>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {(!messages || messages.length === 0) && (
          <p className="text-center text-gray-400 mt-8 text-sm">{t('chat.noMessages')}</p>
        )}
        {(messages || []).map((msg: any) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                isMine
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md'
                  : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chat.typeMessage')}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
        <button type="submit" disabled={!message.trim() || sendMutation.isLoading} className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
