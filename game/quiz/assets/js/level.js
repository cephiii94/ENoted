import { useState, useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';

const LevelPage = ({ categoryId, levels, userData, onLevelSelect, onBack }) => {
  // State untuk nama kategori
  const [categoryTitle, setCategoryTitle] = useState('');
  
  // Data level (dalam aplikasi nyata, akan menerima dari props)
  const levelsData = levels || [
    { id: 1, number: 1, unlocked: true, stars: 3 },
    { id: 2, number: 2, unlocked: true, stars: 2 },
    { id: 3, number: 3, unlocked: true, stars: 1 },
    { id: 4, number: 4, unlocked: true, stars: 0 },
    { id: 5, number: 5, unlocked: false, stars: 0 },
    { id: 6, number: 6, unlocked: false, stars: 0 },
    { id: 7, number: 7, unlocked: false, stars: 0 },
    { id: 8, number: 8, unlocked: false, stars: 0 },
    { id: 9, number: 9, unlocked: false, stars: 0 },
    { id: 10, number: 10, unlocked: false, stars: 0 },
    { id: 11, number: 11, unlocked: false, stars: 0 },
    { id: 12, number: 12, unlocked: false, stars: 0 },
  ];

  // Set judul kategori berdasarkan ID
  useEffect(() => {
    // Fungsi untuk mendapatkan nama kategori (dalam aplikasi sebenarnya dari store/context)
    const getCategoryName = (id) => {
      const categories = {
        1: 'Sains',
        2: 'Sejarah',
        3: 'Geografi',
        4: 'Olahraga',
        5: 'Teknologi',
        6: 'Musik'
      };
      
      return categories[id] || 'Kategori';
    };
    
    setCategoryTitle(getCategoryName(categoryId));
  }, [categoryId]);

  const handleBack = () => {
    // Logika untuk kembali ke halaman kategori
    onBack();
  };

  const handleLevelClick = (levelId, unlocked) => {
    if (!unlocked) {
      alert('Level ini masih terkunci!');
      return;
    }
    // Logika untuk memulai quiz dengan level yang dipilih
    onLevelSelect(levelId);
  };

  // Fungsi untuk render bintang
  const renderStars = (count) => {
    return (
      <div className="flex mt-1">
        {[...Array(3)].map((_, index) => (
          <div 
            key={index} 
            className={`h-2 w-2 rounded-full ${index < count ? 'bg-yellow-300' : 'bg-gray-400'} mx-0.5`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-700">
      {/* Header */}
      <header className="bg-purple-800 bg-opacity-50 p-4 flex items-center">
        <button 
          onClick={handleBack}
          className="bg-white bg-opacity-20 p-2 rounded-full mr-4"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-white text-xl font-bold">{categoryTitle}</h1>
      </header>

      {/* Level Grid */}
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {levelsData.map((level) => (
            <div 
              key={level.id}
              onClick={() => handleLevelClick(level.id, level.unlocked)}
              className={`
                flex flex-col items-center justify-center 
                ${level.unlocked ? 'bg-white' : 'bg-gray-300 level-locked'} 
                rounded-lg p-3 shadow-lg cursor-pointer 
                transform transition-transform hover:scale-105
                aspect-square
              `}
            >
              {level.unlocked ? (
                <>
                  <span className="text-purple-800 font-bold text-2xl">{level.number}</span>
                  {renderStars(level.stars)}
                </>
              ) : (
                <Lock size={24} className="text-gray-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelPage;

export default LevelPage;