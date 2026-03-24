import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Send, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChatPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: members } = trpc.chat.getChatMembers.useQuery(undefined, { refetchInterval: 5000 });

  const { data: messages, refetch } = trpc.chat.getMessages.useQuery(
    { otherUserId: selectedMember! },
    { enabled: !!selectedMember, refetchInterval: 3000 }
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
    if (!message.trim() || !selectedMember) return;
    sendMutation.mutate({ receiverId: selectedMember, message: message.trim() });
  };

  return (
    <div className="h-[calc(100vh-12rem)]">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('chat.title')}</h1>
      <div className="flex h-[calc(100%-3rem)] gap-4">
        {/* Members list */}
        <div className="w-72 card p-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t('chat.members')}</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {(members || []).map((m: any) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m.id)}
                className={`w-full px-4 py-3 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedMember === m.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{m.username}</span>
                  {m.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {m.unreadCount}
                    </span>
                  )}
                </div>
                {m.lastMessage && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{m.lastMessage}</p>
                )}
              </button>
            ))}
            {(!members || members.length === 0) && (
              <p className="text-center text-gray-400 text-sm py-8">{t('common.noData')}</p>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 card p-0 overflow-hidden flex flex-col">
          {selectedMember ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="font-semibold">{members?.find((m: any) => m.id === selectedMember)?.username}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(messages || []).map((msg: any) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
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
              <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('chat.typeMessage')}
                  className="input-field flex-1"
                />
                <button type="submit" disabled={!message.trim()} className="btn-primary px-4">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t('chat.selectMember')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
