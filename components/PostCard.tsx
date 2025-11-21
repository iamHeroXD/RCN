import React from 'react';
import { Post, PostType } from '../types';
import { MessageCircle, Heart, Share2, DollarSign } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  currentUserLiked?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  return (
    <div className="bg-discord-dark rounded-lg p-4 mb-4 shadow-sm border border-discord-darker hover:border-discord-light transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={post.authorAvatar} 
            alt={post.authorName} 
            className="w-10 h-10 rounded-full bg-discord-light object-cover" 
          />
          <div>
            <h3 className="text-white font-medium text-sm hover:underline cursor-pointer">{post.authorName}</h3>
            <span className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${post.type === PostType.HIRING ? 'bg-discord-green/20 text-discord-green' : 'bg-discord-primary/20 text-discord-primary'}`}>
          {post.type === PostType.HIRING ? 'Hiring' : 'For Hire'}
        </span>
      </div>

      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-100 mb-1">{post.title}</h2>
        <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-discord-darker text-gray-400 px-2 py-1 rounded-md">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-discord-light/30">
        <div className="flex items-center space-x-1 text-discord-gold font-mono text-sm">
          <DollarSign size={14} />
          <span>{post.budget}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onLike(post.id)}
            className="flex items-center space-x-1 text-gray-400 hover:text-discord-red transition-colors group"
          >
            <Heart size={18} className="group-hover:fill-discord-red" />
            <span className="text-xs">{post.likes}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
            <MessageCircle size={18} />
            <span className="text-xs">Chat</span>
          </button>

           <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;