// categories.js - Data untuk kategori quiz
export const categories = [
    {
      id: 1,
      title: 'Sains',
      description: 'Pertanyaan tentang fisika, kimia, dan biologi',
      color: 'bg-blue-500',
      icon: '🔬',
      image: 'science.png'
    },
    {
      id: 2,
      title: 'Sejarah',
      description: 'Pertanyaan tentang peristiwa bersejarah',
      color: 'bg-amber-600',
      icon: '📜',
      image: 'history.png'
    },
    {
      id: 3,
      title: 'Geografi',
      description: 'Pertanyaan tentang negara dan tempat',
      color: 'bg-green-600',
      icon: '🌍',
      image: 'geography.png'
    },
    {
      id: 4,
      title: 'Olahraga',
      description: 'Pertanyaan tentang berbagai cabang olahraga',
      color: 'bg-red-500',
      icon: '⚽',
      image: 'sports.png'
    },
    {
      id: 5,
      title: 'Teknologi',
      description: 'Pertanyaan tentang komputer dan internet',
      color: 'bg-gray-700',
      icon: '💻',
      image: 'technology.png'
    },
    {
      id: 6,
      title: 'Musik',
      description: 'Pertanyaan tentang alat musik dan penyanyi',
      color: 'bg-purple-500',
      icon: '🎵',
      image: 'music.png'
    }
  ];
  
  // levels.js - Data untuk level quiz di setiap kategori
  export const levels = {
    1: [ // Levels for "Sains" category
      { id: 1, number: 1, unlocked: true, stars: 0, requiredScore: 200 },
      { id: 2, number: 2, unlocked: false, stars: 0, requiredScore: 300 },
      { id: 3, number: 3, unlocked: false, stars: 0, requiredScore: 400 },
      // Additional levels...
    ],
    2: [ // Levels for "Sejarah" category
      { id: 1, number: 1, unlocked: true, stars: 0, requiredScore: 200 },
      { id: 2, number: 2, unlocked: false, stars: 0, requiredScore: 300 },
      // Additional levels...
    ],
    // Additional categories...
  };
  
  // questions.js - Data pertanyaan untuk setiap level di setiap kategori
  export const questions = {
    // Kategori Sains (id: 1)
    "1": {
      // Level 1
      "1": [
        {
          id: 1,
          question: "Apa nama planet terbesar di tata surya kita?",
          options: ["Mars", "Venus", "Jupiter", "Saturn"],
          correctAnswer: "Jupiter",
          timeLimit: 20, // dalam detik
          points: 100
        },
        {
          id: 2,
          question: "Apa rumus kimia untuk air?",
          options: ["CO2", "H2O", "O2", "N2"],
          correctAnswer: "H2O",
          timeLimit: 20,
          points: 100
        },
        {
          id: 3,
          question: "Unsur kimia apa yang dilambangkan dengan 'Fe'?",
          options: ["Ferrum (Besi)", "Fluorin", "Fosfor", "Fermium"],
          correctAnswer: "Ferrum (Besi)",
          timeLimit: 20,
          points: 100
        },
        {
          id: 4,
          question: "Apa unit terkecil dari kehidupan?",
          options: ["Atom", "Molekul", "Sel", "Jaringan"],
          correctAnswer: "Sel",
          timeLimit: 20,
          points: 100
        },
        {
          id: 5,
          question: "Berapa jumlah tulang dalam tubuh manusia dewasa?",
          options: ["206", "215", "180", "250"],
          correctAnswer: "206",
          timeLimit: 20,
          points: 100
        }
      ],
      // Level 2
      "2": [
        {
          id: 1,
          question: "Proses fotosintesis mengubah apa menjadi apa?",
          options: [
            "Air dan karbon dioksida menjadi oksigen dan glukosa", 
            "Oksigen dan air menjadi karbon dioksida", 
            "Mineral menjadi protein", 
            "Nitrogen menjadi oksigen"
          ],
          correctAnswer: "Air dan karbon dioksida menjadi oksigen dan glukosa",
          timeLimit: 25,
          points: 150
        },
        // Additional questions...
      ]
    },
    
    // Kategori Sejarah (id: 2)
    "2": {
      // Level 1
      "1": [
        {
          id: 1,
          question: "Siapa presiden pertama Indonesia?",
          options: ["Soekarno", "Soeharto", "Habibie", "Megawati"],
          correctAnswer: "Soekarno",
          timeLimit: 20,
          points: 100
        },
        {
          id: 2,
          question: "Kapan Indonesia merdeka?",
          options: ["17 Agustus 1945", "17 Agustus 1946", "17 Agustus 1949", "17 Agustus 1950"],
          correctAnswer: "17 Agustus 1945",
          timeLimit: 20,
          points: 100
        },
        {
          id: 3,
          question: "Perang Dunia II berakhir pada tahun?",
          options: ["1943", "1945", "1947", "1950"],
          correctAnswer: "1945",
          timeLimit: 20,
          points: 100
        },
        {
          id: 4,
          question: "Siapa penemu benua Amerika?",
          options: ["Marco Polo", "Christopher Columbus", "Vasco da Gama", "Ferdinand Magellan"],
          correctAnswer: "Christopher Columbus",
          timeLimit: 20,
          points: 100
        },
        {
          id: 5,
          question: "Dimana tembok Berlin berada?",
          options: ["Perancis", "Inggris", "Jerman", "Italia"],
          correctAnswer: "Jerman",
          timeLimit: 20,
          points: 100
        }
      ]
    },
    
    // Kategori Geografi (id: 3)
    "3": {
      // Level 1
      "1": [
        {
          id: 1,
          question: "Negara terbesar di dunia berdasarkan luas wilayah adalah?",
          options: ["China", "Amerika Serikat", "Kanada", "Rusia"],
          correctAnswer: "Rusia",
          timeLimit: 20,
          points: 100
        },
        {
          id: 2,
          question: "Gunung tertinggi di dunia adalah?",
          options: ["K2", "Kilimanjaro", "Everest", "Elbrus"],
          correctAnswer: "Everest",
          timeLimit: 20,
          points: 100
        },
        {
          id: 3,
          question: "Sungai terpanjang di dunia adalah?",
          options: ["Sungai Amazon", "Sungai Nil", "Sungai Mississippi", "Sungai Yangtze"],
          correctAnswer: "Sungai Nil",
          timeLimit: 20,
          points: 100
        },
        {
          id: 4,
          question: "Benua terkecil di dunia adalah?",
          options: ["Eropa", "Australia", "Antartika", "Amerika Selatan"],
          correctAnswer: "Australia",
          timeLimit: 20,
          points: 100
        },
        {
          id: 5,
          question: "Berapa jumlah provinsi di Indonesia?",
          options: ["34", "33", "36", "38"],
          correctAnswer: "34",
          timeLimit: 20,
          points: 100
        }
      ]
    }
    // Tambahkan kategori lain di sini...
  };