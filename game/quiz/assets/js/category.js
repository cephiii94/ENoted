import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const CategoryPage = ({ categories, userData, onCategorySelect, onBack }) => {
  // Data kategori (dalam aplikasi nyata ini bisa berasal dari props)
  const categoriesData = categories || [
    {
      id: 1,
      title: 'Sains',
      description: 'Pertanyaan tentang fisika, kimia, dan biologi',
      color: 'bg-blue-500',
      icon: '🔬'
    },
    {
      id: 2,
      title: 'Sejarah',
      description: 'Pertanyaan tentang peristiwa bersejarah',
      color: 'bg-amber-600',
      icon: '📜'
    },
    {
      id: 3,
      title: 'Geografi',
      description: 'Pertanyaan tentang negara dan tempat',
      color: 'bg-green-600',
      icon: '🌍'
    },
    {
      id: 4,
      title: 'Olahraga',
      description: 'Pertanyaan tentang berbagai cabang olahraga',
      color: 'bg-red-500',
      icon: '⚽'
    },
    {
      id: 5,
      title: 'Teknologi',
      description: 'Pertanyaan tentang komputer dan internet',
      color: 'bg-gray-700',
      icon: '💻'
    },
    {
      id: 6,
      title: 'Musik',
      description: 'Pertanyaan tentang alat musik dan penyanyi',
      color: 'bg-purple-500',
      icon: '🎵'
    }
  ];

  const handleBack = () => {
    // Logika untuk kembali ke halaman utama
    onBack();
  };

  const handleCategoryClick = (categoryId) => {
    // Logika untuk menuju ke halaman level dengan kategori yang dipilih
    onCategorySelect(categoryId);
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
        <h1 className="text-white text-xl font-bold">Pilih Kategori</h1>
      </header>

      {/* Kategori Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoriesData.map((category) => (
            <div 
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`${category.color} rounded-lg p-4 shadow-lg cursor-pointer transform transition-transform hover:scale-105 category-card`}
            >
              <div className="flex items-center">
                <div className="text-4xl mr-4">{category.icon}</div>
                <div className="text-white">
                  <h3 className="font-bold text-lg">{category.title}</h3>
                  <p className="text-sm text-white text-opacity-80">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;

export default CategoryPage;