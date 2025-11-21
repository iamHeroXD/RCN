import React, { useState, useEffect } from 'react';
import { User, Post, PostType } from '../types';
import { postService } from '../services/storage';
import { optimizePostContent } from '../services/geminiService';
import PostCard from '../components/PostCard';
import AIChat from '../components/AIChat';
import { PlusCircle, Search, Sparkles, X, Briefcase, User as UserIcon, Zap } from 'lucide-react';

interface HomeProps {
  user: User;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<'ALL' | PostType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Post State
  const [newPostType, setNewPostType] = useState<PostType>(PostType.HIRING);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await postService.getPosts();
    setPosts(data);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTitle || !newContent) return;

    await postService.createPost({
        authorId: user.id,
        authorName: user.username,
        authorAvatar: user.avatarUrl,
        authorRole: user.role,
        type: newPostType,
        title: newTitle,
        content: newContent,
        budget: newBudget || 'Negotiable',
        tags: newTags.split(',').map(t => t.trim()).filter(t => t),
    });
    
    setIsModalOpen(false);
    resetForm();
    loadPosts();
  };

  const handleAIOptimize = async () => {
      if (!newContent) return;
      setIsOptimizing(true);
      const result = await optimizePostContent(newTitle, newContent);
      setNewTitle(result.title);
      setNewContent(result.content);
      setIsOptimizing(false);
  };

  const resetForm = () => {
      setNewTitle('');
      setNewContent('');
      setNewBudget('');
      setNewTags('');
  };

  const handleLike = async (id: string) => {
      await postService.likePost(id);
      loadPosts(); // Refresh to show new count
  };

  const filteredPosts = posts.filter(post => {
      if (filter !== 'ALL' && post.type !== filter) return false;
      if (searchTerm && !post.title.toLowerCase().includes(searchTerm.toLowerCase()) && !post.content.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 relative">
      
      {/* Sidebar / Filters (Left) */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 border border-red-500/30"
          >
              <PlusCircle size={20} />
              <span>New Listing</span>
          </button>

          <div className="bg-[#151515] rounded-xl p-3 border border-white/10">
              <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search RCN..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/50 text-gray-200 pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:border-red-500 border border-white/5 transition-colors"
                  />
              </div>

              <div className="space-y-1">
                  <button 
                    onClick={() => setFilter('ALL')}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${filter === 'ALL' ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>All Listings</span>
                  </button>
                  <button 
                    onClick={() => setFilter(PostType.HIRING)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${filter === PostType.HIRING ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                      <Briefcase size={16} className="text-green-400" />
                      <span>Hiring</span>
                  </button>
                  <button 
                    onClick={() => setFilter(PostType.FOR_HIRE)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${filter === PostType.FOR_HIRE ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                      <UserIcon size={16} className="text-blue-400" />
                      <span>For Hire</span>
                  </button>
              </div>
          </div>
          
          <div className="bg-[#151515] p-4 rounded-xl border border-white/10 hidden md:block bg-gradient-to-b from-[#151515] to-black/50">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center">
                  <Zap size={12} className="mr-1 text-yellow-500" />
                  Network Status
              </h3>
              <div className="text-sm text-gray-300 space-y-2">
                  <div className="flex justify-between">
                      <span>Active Creators</span>
                      <span className="text-white font-mono">14.5k</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Daily Volume</span>
                      <span className="text-discord-gold font-mono">2.3M RC</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Main Feed */}
      <div className="flex-1">
          {filteredPosts.length === 0 ? (
              <div className="text-center py-20 bg-[#151515] rounded-xl border border-white/5 border-dashed">
                  <p className="text-lg text-gray-400">No listings found matching criteria.</p>
                  <button onClick={() => setIsModalOpen(true)} className="text-red-500 hover:underline mt-2">Create the first one!</button>
              </div>
          ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                    <PostCard key={post.id} post={post} onLike={handleLike} />
                ))}
              </div>
          )}
      </div>

      {/* AI Assistant */}
      <AIChat posts={posts} />

      {/* Create Post Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="bg-[#111] w-full max-w-xl rounded-2xl shadow-2xl border border-white/10 relative flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                      <h2 className="text-xl font-bold text-white flex items-center">
                          <PlusCircle className="mr-2 text-red-500" />
                          Create Listing
                      </h2>
                      <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-5">
                      {/* Post Type Selector */}
                      <div className="grid grid-cols-2 gap-4">
                          <button 
                             onClick={() => setNewPostType(PostType.HIRING)}
                             className={`p-4 rounded-xl border text-center font-bold transition-all ${newPostType === PostType.HIRING ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-black/30 text-gray-500 border-white/10 hover:bg-white/5'}`}
                          >
                              HIRING
                          </button>
                          <button 
                             onClick={() => setNewPostType(PostType.FOR_HIRE)}
                             className={`p-4 rounded-xl border text-center font-bold transition-all ${newPostType === PostType.FOR_HIRE ? 'bg-blue-500/20 text-blue-400 border-blue-500' : 'bg-black/30 text-gray-500 border-white/10 hover:bg-white/5'}`}
                          >
                              FOR HIRE
                          </button>
                      </div>

                      <div className="space-y-4">
                          <div>
                             <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Title</label>
                             <input 
                                type="text"
                                placeholder="e.g. Lead Scripter Needed for Horror Game"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="w-full bg-black/50 text-white p-4 rounded-xl border border-white/10 focus:border-red-500 focus:outline-none transition-colors"
                              />
                          </div>
                          
                          <div className="relative">
                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Description</label>
                            <textarea 
                                placeholder="Describe the job, payment details, and requirements..."
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                rows={6}
                                className="w-full bg-black/50 text-white p-4 rounded-xl border border-white/10 focus:border-red-500 focus:outline-none resize-none"
                            />
                            <button 
                                onClick={handleAIOptimize}
                                disabled={isOptimizing || !newContent}
                                className="absolute bottom-3 right-3 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center hover:bg-indigo-500 disabled:opacity-50 shadow-lg"
                                title="Reword with Gemini"
                            >
                                <Sparkles size={12} className="mr-1" />
                                {isOptimizing ? 'Thinking...' : 'AI Enhance'}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Budget / Rate</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. 50k R$ or $500"
                                    value={newBudget}
                                    onChange={e => setNewBudget(e.target.value)}
                                    className="w-full bg-black/50 text-white p-4 rounded-xl border border-white/10 focus:border-red-500 focus:outline-none"
                                  />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Tags</label>
                                  <input 
                                    type="text"
                                    placeholder="lua, building, gfx"
                                    value={newTags}
                                    onChange={e => setNewTags(e.target.value)}
                                    className="w-full bg-black/50 text-white p-4 rounded-xl border border-white/10 focus:border-red-500 focus:outline-none"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="p-5 bg-white/5 rounded-b-2xl flex justify-end border-t border-white/10">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-400 hover:text-white mr-2 font-medium">Cancel</button>
                      <button onClick={handleCreatePost} className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-bold transition-transform active:scale-95">Post Listing</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Home;