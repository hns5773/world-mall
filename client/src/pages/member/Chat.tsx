import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MemberChat() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
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
    <div className="h-[calc(100vh-12rem)]">
      <div className="flex flex-col h-full card p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">{t('chat.title')}</h1>
          {partners?.[0] && <p className="text-sm text-gray-500">{partners[0].username}</p>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(!messages || messages.length === 0) && (
            <p className="text-center text-gray-400 mt-8">{t('chat.noMessages')}</p>
          )}
          {(messages || []).map((msg: any) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('chat.typeMessage')}
            className="input-field flex-1"
          />
          <button type="submit" disabled={!message.trim() || sendMutation.isLoading} className="btn-primary px-4">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
