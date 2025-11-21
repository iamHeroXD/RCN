import React, { useState } from 'react';
import { User, DecorationType } from '../types';
import { SHOP_ITEMS } from '../constants';
import { authService } from '../services/storage';
import { generateEnhancedBio } from '../services/geminiService';
import { Edit2, Sparkles, Save, Shield } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(user.bio);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  // Decoration handling
  const ownedFrames = SHOP_ITEMS.filter(i => i.type === DecorationType.AVATAR_FRAME && (user.inventory.includes(i.id) || i.price === 0));
  const ownedBanners = SHOP_ITEMS.filter(i => i.type === DecorationType.PROFILE_BANNER && (user.inventory.includes(i.id) || i.price === 0));

  const handleEquip = async (type: string, id: string) => {
    const updatedUser = {
        ...user,
        equipped: {
            ...user.equipped,
            [type]: id
        }
    };
    await authService.updateUser(updatedUser);
    onUpdateUser(updatedUser);
  };

  const handleSaveBio = async () => {
    const updatedUser = { ...user, bio: editBio };
    await authService.updateUser(updatedUser);
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  const handleAIBio = async () => {
      setIsGeneratingBio(true);
      const newBio = await generateEnhancedBio(editBio, user.username);
      setEditBio(newBio);
      setIsGeneratingBio(false);
  };

  const activeBanner = SHOP_ITEMS.find(i => i.id === user.equipped.banner);
  const activeFrame = SHOP_ITEMS.find(i => i.id === user.equipped.avatarFrame);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="bg-discord-dark rounded-xl overflow-hidden shadow-2xl relative">
        {/* Banner */}
        <div className={`h-48 w-full ${activeBanner ? activeBanner.cssClass : 'bg-discord-light'}`}></div>
        
        <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-discord-dark bg-discord-dark relative z-10">
                        <img src={user.avatarUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                    </div>
                    {/* Frame Overlay */}
                    {activeFrame && (
                        <div className={`absolute -inset-1 rounded-full z-20 pointer-events-none ${activeFrame.cssClass}`}></div>
                    )}
                    <div className="absolute bottom-2 right-2 z-30 bg-discord-green w-6 h-6 rounded-full border-4 border-discord-dark"></div>
                </div>

                <div className="md:ml-6 mt-4 md:mt-0 text-center md:text-left flex-1">
                    <h1 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start">
                        {user.username}
                        <span className="text-gray-400 text-xl font-medium ml-1">#{user.discriminator}</span>
                        {user.coins > 1000 && <Shield className="ml-2 text-discord-gold" size={24} fill="currentColor" />}
                    </h1>
                    <div className="text-gray-400 text-sm mt-1">Member since {new Date(user.joinedAt).toLocaleDateString()}</div>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-3">
                    <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className="bg-discord-primary hover:bg-indigo-500 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center"
                    >
                       <Edit2 size={16} className="mr-2" />
                       Edit Profile
                    </button>
                </div>
            </div>

            {/* Bio Section */}
            <div className="bg-discord-darker p-4 rounded-lg border border-black/10">
                <div className="flex justify-between mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase">About Me</h3>
                    {isEditing && (
                        <button 
                            onClick={handleAIBio}
                            disabled={isGeneratingBio}
                            className="text-xs text-discord-primary hover:text-white flex items-center transition-colors"
                        >
                            <Sparkles size={12} className="mr-1" />
                            {isGeneratingBio ? 'Magic in progress...' : 'Enhance with Gemini'}
                        </button>
                    )}
                </div>
                
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea 
                            value={editBio} 
                            onChange={(e) => setEditBio(e.target.value)}
                            className="w-full bg-black/20 text-white p-3 rounded border border-discord-light focus:border-discord-primary focus:outline-none"
                            rows={3}
                        />
                        <button onClick={handleSaveBio} className="bg-discord-green text-white px-4 py-1 rounded text-sm flex items-center">
                            <Save size={14} className="mr-1" /> Save Bio
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-200 whitespace-pre-wrap">{user.bio}</p>
                )}
            </div>
        </div>
      </div>

      {/* Customization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-discord-dark p-6 rounded-xl border border-discord-darker">
              <h2 className="text-xl font-bold text-white mb-4">Avatar Frames</h2>
              <div className="grid grid-cols-4 gap-4">
                  <button 
                    onClick={() => handleEquip('avatarFrame', '')}
                    className={`h-16 rounded-lg border-2 flex items-center justify-center text-xs text-gray-400 hover:bg-discord-light ${!user.equipped.avatarFrame ? 'border-discord-primary bg-discord-light' : 'border-discord-darker'}`}
                  >
                      None
                  </button>
                  {ownedFrames.map(f => (
                       <button 
                       key={f.id}
                       onClick={() => handleEquip('avatarFrame', f.id)}
                       className={`h-16 rounded-lg border-2 flex items-center justify-center relative overflow-hidden group ${user.equipped.avatarFrame === f.id ? 'border-discord-primary bg-discord-light' : 'border-discord-darker hover:bg-discord-light'}`}
                     >
                         <div className={`w-8 h-8 rounded-full ${f.cssClass}`}></div>
                     </button>
                  ))}
              </div>
          </div>

          <div className="bg-discord-dark p-6 rounded-xl border border-discord-darker">
              <h2 className="text-xl font-bold text-white mb-4">Profile Banners</h2>
              <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleEquip('banner', '')}
                    className={`h-16 rounded-lg border-2 flex items-center justify-center text-xs text-gray-400 hover:bg-discord-light ${!user.equipped.banner ? 'border-discord-primary bg-discord-light' : 'border-discord-darker'}`}
                  >
                      Default
                  </button>
                  {ownedBanners.map(b => (
                       <button 
                       key={b.id}
                       onClick={() => handleEquip('banner', b.id)}
                       className={`h-16 rounded-lg border-2 relative overflow-hidden group ${user.equipped.banner === b.id ? 'border-discord-primary' : 'border-discord-darker hover:border-gray-500'}`}
                     >
                         <div className={`absolute inset-0 ${b.cssClass}`}></div>
                         <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                             <span className="text-white text-xs font-bold">{b.name}</span>
                         </div>
                     </button>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;