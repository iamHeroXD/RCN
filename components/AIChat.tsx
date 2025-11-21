import React, { useState } from 'react';
import { Sparkles, Send, X, MessageSquare } from 'lucide-react';
import { getSmartRecommendations } from '../services/geminiService';
import { Post } from '../types';

interface AIChatProps {
  posts: Post[];
}

const AIChat: React.FC<AIChatProps> = ({ posts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
      { role: 'ai', text: "Hi! I'm RCN Bot. Looking for a job? Need a dev? Ask me!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
      if(!query.trim()) return;
      
      const userMsg = query;
      setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
      setQuery('');
      setIsLoading(true);

      const aiResponse = await getSmartRecommendations(userMsg, posts);
      setHistory(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setIsLoading(false);
  };

  return (
    <>
        {/* Toggle Button */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 md:bottom-8 right-4 md:right-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform z-40"
            >
                <MessageSquare size={24} />
            </button>
        )}

        {/* Chat Window */}
        {isOpen && (
            <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-[90vw] md:w-96 h-[500px] bg-[#151515] border border-white/20 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden glass-panel">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 flex justify-between items-center border-b border-white/10">
                    <div className="flex items-center space-x-2">
                        <Sparkles size={18} className="text-cyan-400" />
                        <span className="font-bold text-white">RCN Intelligence</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                    {history.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-black/20 border-t border-white/10">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="E.g. Best job for a builder?"
                            className="w-full bg-black/50 text-white border border-white/10 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading}
                            className="absolute right-2 top-2 p-1.5 bg-cyan-600 rounded-full text-white hover:bg-cyan-500 disabled:opacity-50"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default AIChat;
