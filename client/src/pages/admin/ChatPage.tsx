import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Send, MessageCircle, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminChatPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const utils = trpc.useContext();
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-reply state
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyMessage, setAutoReplyMessage] = useState('Welcome to our official World Mall Platform, how can I help you?');
  const [autoReplyLoaded, setAutoReplyLoaded] = useState(false);

  // Load settings for auto-reply
  const { data: settings } = trpc.admin.getSettings.useQuery();
  const updateSetting = trpc.admin.updateSetting.useMutation({
    onSuccess: () => {
      toast.success('Auto-reply settings saved');
      utils.admin.getSettings.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (settings && !autoReplyLoaded) {
      const enabledSetting = settings.find((s: any) => s.key === 'auto_reply_enabled');
      const messageSetting = settings.find((s: any) => s.key === 'auto_reply_message');
      if (enabledSetting) setAutoReplyEnabled(enabledSetting.value === 'true');
      if (messageSetting) setAutoReplyMessage(messageSetting.value);
      setAutoReplyLoaded(true);
    }
  }, [settings, autoReplyLoaded]);

  const saveAutoReply = () => {
    updateSetting.mutate({ key: 'auto_reply_enabled', value: autoReplyEnabled ? 'true' : 'false' });
    updateSetting.mutate({ key: 'auto_reply_message', value: autoReplyMessage });
  };

  const { data: members } = trpc.chat.getChatMembers.useQuery(undefined, { refetchInterval: 5000 });

  const { data: chatMessages, refetch } = trpc.chat.getMessages.useQuery(
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
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedMember) return;
    sendMutation.mutate({ receiverId: selectedMember, message: message.trim() });
  };

  // Generate a 6-digit UID from the user ID
  const getUID = (id: number) => {
    const hash = ((id * 2654435761) >>> 0) % 900000 + 100000;
    return hash;
  };

  const formatChatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Chat Auto-Reply Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Chat Auto-Reply</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Automatically send a reply when a member sends their first message to customer service.
        </p>

        <div className="card p-5 space-y-4">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Auto-Reply</p>
              <p className="text-xs text-emerald-600">autoReplyStatus{autoReplyEnabled ? 'On' : 'Off'}</p>
            </div>
            <button
              onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                autoReplyEnabled ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Auto-reply message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Auto-Reply Message</label>
            <textarea
              value={autoReplyMessage}
              onChange={(e) => setAutoReplyMessage(e.target.value)}
              rows={3}
              className="input-field w-full resize-none"
              placeholder="Enter auto-reply message..."
            />
          </div>

          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>✨</span> autoReplyTranslateNote
          </p>

          <button
            onClick={saveAutoReply}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Conversations */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 28rem)' }}>
        {/* Left panel - Conversations list */}
        <div className="w-80 card p-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-gray-500">Conversations</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {(members || []).filter((m: any) => m.lastMessage).map((m: any) => (
              <button
                key={m.id}
                onClick={() => setSelectedMember(m.id)}
                className={`w-full px-4 py-3 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                  selectedMember === m.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-900">{m.username}</span>
                      {m.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {m.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 font-medium">UID: {getUID(m.id)}</p>
                    {m.lastMessage && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{m.lastMessage}</p>
                    )}
                    {m.lastMessageAt && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatChatTime(m.lastMessageAt)}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {(!members || members.filter((m: any) => m.lastMessage).length === 0) && (
              <p className="text-center text-gray-400 text-sm py-8">No conversations yet</p>
            )}
          </div>
        </div>

        {/* Right panel - Chat window */}
        <div className="flex-1 card p-0 overflow-hidden flex flex-col">
          {selectedMember ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="font-semibold text-gray-900">{members?.find((m: any) => m.id === selectedMember)?.username}</p>
                <p className="text-xs text-gray-400">UID: {getUID(selectedMember)}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {(chatMessages || []).map((msg: any) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                        isMine ? 'bg-blue-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-bl-md'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-gray-400'}`}>
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
                  placeholder="Type a message..."
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
                <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
                <p className="text-lg font-medium">Select a user to chat</p>
                <p className="text-sm mt-1">Choose a user from the left panel to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
