import { useState, useEffect } from 'react';
import { ArrowLeft, X, Heart } from 'lucide-react';

const QuizPage = () => {
  // State untuk quiz
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Contoh data pertanyaan (dalam aplikasi nyata bisa berasal dari API atau file terpisah)
  const questions = [
    {
      id: 1,
      question: "Apa ibu kota Indonesia?",
      options: ["Jakarta", "Bandung", "Surabaya", "Yogyakarta"],
      correctAnswer: "Jakarta"
    },
    {
      id: 2,
      question: "Siapa penemu bola lampu?",
      options: ["Thomas Edison", "Nikola Tesla", "Albert Einstein", "Isaac Newton"],
      correctAnswer: "Thomas Edison"
    },
    {
      id: 3,
      question: "Berapa 8 x 9?",
      options: ["63", "72", "81", "64"],
      correctAnswer: "72"
    },
    {
      id: 4,
      question: "Planet terbesar di tata surya kita adalah?",
      options: ["Bumi", "Mars", "Jupiter", "Saturnus"],
      correctAnswer: "Jupiter"
    },
    {
      id: 5,
      question: "Siapa presiden pertama Indonesia?",
      options: ["Soekarno", "Soeharto", "Habibie", "Megawati"],
      correctAnswer: "Soekarno"
    }
  ];

  // Timer untuk pertanyaan
  useEffect(() => {
    if (!gameOver && timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleWrongAnswer();
    }
  }, [timeLeft, gameOver, selectedAnswer]);

  // Fungsi untuk menangani jawaban yang dipilih
  const handleAnswerClick = (answer) => {
    if (selectedAnswer !== null) return; // Mencegah pilihan ganda
    
    setSelectedAnswer(answer);
    
    if (answer === questions[currentQuestionIndex].correctAnswer) {
      setIsCorrect(true);
      setScore(score + 100);
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      setIsCorrect(false);
      handleWrongAnswer();
    }
  };

  // Fungsi untuk menangani jawaban salah
  const handleWrongAnswer = () => {
    setLives(lives - 1);
    
    if (lives - 1 <= 0) {
      setGameOver(true);
    } else {
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  // Fungsi untuk melanjutkan ke pertanyaan berikutnya
  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(20); // Reset timer
    } else {
      setGameOver(true); // Quiz selesai karena pertanyaan habis
    }
  };

  // Fungsi untuk kembali ke halaman level
  const handleQuit = () => {
    alert('Kembali ke halaman level');
  };

  // Fungsi untuk memulai ulang quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setLives(3);
    setTimeLeft(20);
    setGameOver(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-700">
      {/* Header Quiz */}
      <header className="bg-purple-800 bg-opacity-50 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={handleQuit}
            className="bg-white bg-opacity-20 p-2 rounded-full mr-4"
          >
            <X size={24} className="text-white" />
          </button>
          <div className="text-white font-bold">Quiz {currentQuestionIndex + 1}/{questions.length}</div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                size={20} 
                fill={i < lives ? "#ff3366" : "none"} 
                className={i < lives ? "text-red-500" : "text-gray-400"} 
              />
            ))}
          </div>
          <div className="bg-white rounded-full px-3 py-1">
            <span className="font-bold text-purple-800">{score}</span>
          </div>
        </div>
      </header>

      {/* Progress bar timer */}
      <div className="w-full bg-gray-200">
        <div 
          className="bg-green-500 h-2 transition-all duration-1000" 
          style={{ width: `${(timeLeft / 20) * 100}%` }}
        />
      </div>

      {!gameOver ? (
        <div className="p-4 flex flex-col items-center h-full">
          {/* Pertanyaan */}
          <div className="bg-white rounded-lg p-6 mb-6 w-full">
            <h2 className="text-lg font-bold text-center mb-2">
              {questions[currentQuestionIndex].question}
            </h2>
          </div>

          {/* Opsi Jawaban */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {questions[currentQuestionIndex].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                className={`p-4 rounded-lg text-white font-medium transition-colors ${
                  selectedAnswer === option 
                    ? option === questions[currentQuestionIndex].correctAnswer
                      ? 'bg-green-500' // Jawaban benar
                      : 'bg-red-500' // Jawaban salah
                    : selectedAnswer !== null && option === questions[currentQuestionIndex].correctAnswer
                      ? 'bg-green-500' // Menampilkan jawaban benar setelah memilih jawaban salah
                      : 'bg-purple-500 hover:bg-purple-600' // Opsi normal
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Tampilan Game Over
        <div className="flex flex-col items-center justify-center p-8 h-full">
          <div className="bg-white rounded-lg p-8 text-center shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {score >= 300 ? 'Selamat!' : 'Quiz Selesai'}
            </h2>
            
            <p className="text-xl mb-6">Skor Akhir: <span className="font-bold text-purple-800">{score}</span></p>
            
            <div className="flex justify-center mb-6">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-8 w-8 mx-1 rounded-full ${
                    score >= (i + 1) * 100 ? 'bg-yellow-400' : 'bg-gray-300'
                  }`} 
                />
              ))}
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleRestart}
                className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-bold"
              >
                Main Lagi
              </button>
              
              <button
                onClick={handleQuit}
                className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-bold"
              >
                Kembali ke Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;