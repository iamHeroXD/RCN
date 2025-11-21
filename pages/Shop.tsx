import React from 'react';
import { User, Decoration } from '../types';
import { SHOP_ITEMS } from '../constants';
import { authService } from '../services/storage';
import { ShoppingBag, Lock, Check } from 'lucide-react';

interface ShopProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Shop: React.FC<ShopProps> = ({ user, onUpdateUser }) => {
  
  const handleBuy = async (item: Decoration) => {
    if (user.coins < item.price) {
      alert("Not enough coins! Hustle more.");
      return;
    }
    
    const updatedUser = {
      ...user,
      coins: user.coins - item.price,
      inventory: [...user.inventory, item.id]
    };
    
    await authService.updateUser(updatedUser);
    onUpdateUser(updatedUser);
  };

  const handleTopUp = async () => {
      // Simulate top up
      const updatedUser = { ...user, coins: user.coins + 1000 };
      await authService.updateUser(updatedUser);
      onUpdateUser(updatedUser);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-discord-primary to-indigo-600 rounded-xl p-8 shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Item Shop</h1>
            <p className="text-indigo-100 mb-6">Customize your profile with exclusive frames, banners, and effects.</p>
            <div className="flex items-center space-x-4 bg-black/20 p-4 rounded-lg w-fit backdrop-blur-md">
                <span className="text-2xl font-bold text-discord-gold">{user.coins.toLocaleString()} Coins</span>
                <button onClick={handleTopUp} className="bg-white text-discord-primary px-3 py-1 rounded text-sm font-bold hover:bg-gray-100 transition-colors">
                    + Top Up (Free)
                </button>
            </div>
        </div>
        <ShoppingBag className="absolute -bottom-4 -right-4 text-white/10 w-48 h-48 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.map((item) => {
          const isOwned = user.inventory.includes(item.id);
          
          return (
            <div key={item.id} className="bg-discord-dark rounded-lg overflow-hidden border border-discord-darker flex flex-col hover:transform hover:-translate-y-1 transition-all duration-200 shadow-lg">
              <div className="h-32 bg-discord-light flex items-center justify-center relative">
                 {/* Preview Area */}
                 {item.type === 'AVATAR_FRAME' ? (
                     <div className="relative">
                         <div className="w-16 h-16 rounded-full bg-gray-600"></div>
                         <div className={`absolute inset-0 rounded-full w-16 h-16 ${item.cssClass}`}></div>
                     </div>
                 ) : item.type === 'PROFILE_BANNER' ? (
                     <div className={`w-full h-full ${item.cssClass}`}></div>
                 ) : (
                     <span className={`text-xl font-bold ${item.cssClass}`}>Preview Text</span>
                 )}
                 
                 {isOwned && (
                     <div className="absolute top-2 right-2 bg-discord-green text-white text-xs px-2 py-1 rounded-full flex items-center">
                         <Check size={12} className="mr-1"/> Owned
                     </div>
                 )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">{item.name}</h3>
                    <span className="text-xs bg-discord-darker px-2 py-1 rounded text-gray-400 capitalize">{item.type.replace('_', ' ')}</span>
                </div>
                
                <div className="mt-auto pt-4">
                    <button
                        onClick={() => handleBuy(item)}
                        disabled={isOwned || user.coins < item.price}
                        className={`w-full py-2 rounded font-medium transition-colors flex items-center justify-center space-x-2 ${
                            isOwned 
                                ? 'bg-discord-darker text-gray-500 cursor-default' 
                                : user.coins < item.price 
                                    ? 'bg-discord-red/20 text-discord-red cursor-not-allowed'
                                    : 'bg-discord-primary hover:bg-indigo-500 text-white'
                        }`}
                    >
                        {isOwned ? (
                            <span>Purchased</span>
                        ) : (
                            <>
                                <span>{item.price}</span>
                                <span className="text-discord-gold">Coins</span>
                            </>
                        )}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;