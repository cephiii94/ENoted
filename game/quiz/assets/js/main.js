import { useState } from 'react';
import { User, ShoppingBag, Trophy, Home } from 'lucide-react';

// Component Utama
const MainPage = ({ userData, onPlayClick }) => {
  const [coins, setCoins] = useState(userData?.coins || 500);
  const [level, setLevel] = useState(userData?.level || 5);
  const [activeTab, setActiveTab] = useState('home');
  
  const handlePlayClick = () => {
    // Di sini akan mengarahkan ke halaman kategori
    onPlayClick();
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-purple-600 to-blue-700">
      {/* Header dengan profile dan coins */}
      <header className="flex justify-between items-center p-4 bg-purple-800 bg-opacity-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 rounded-full p-2 shadow-md">
            <User size={24} className="text-purple-800" />
          </div>
          <div className="text-white">
            <p className="font-bold">Pemain</p>
            <p className="text-xs">Level {level}</p>
          </div>
        </div>
        
        <div className="flex items-center bg-yellow-400 rounded-full px-3 py-1 shadow-md">
          <span className="font-bold text-yellow-800">{coins}</span>
          <img 
            src="/api/placeholder/24/24" 
            alt="Coin" 
            className="w-6 h-6 ml-1"
          />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8">
          <img 
            src="/api/placeholder/200/200" 
            alt="Character" 
            className="w-48 h-48 mx-auto"
          />
        </div>
        
        <button 
          onClick={handlePlayClick}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-lg transform transition-transform hover:scale-105 active:scale-95 btn-pulse"
        >
          PLAY
        </button>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="bg-purple-900 p-2">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setActiveTab('home')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'home' ? 'bg-purple-700' : ''}`}
          >
            <Home size={24} className="text-white" />
            <span className="text-xs text-white">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'inventory' ? 'bg-purple-700' : ''}`}
          >
            <ShoppingBag size={24} className="text-white" />
            <span className="text-xs text-white">Inventory</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('shop')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'shop' ? 'bg-purple-700' : ''}`}
          >
            <ShoppingBag size={24} className="text-white" />
            <span className="text-xs text-white">Shop</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('achievements')}
            className={`p-2 rounded-lg flex flex-col items-center ${activeTab === 'achievements' ? 'bg-purple-700' : ''}`}
          >
            <Trophy size={24} className="text-white" />
            <span className="text-xs text-white">Achievements</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MainPage;