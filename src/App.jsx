import React from "react";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-2xl text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6">
          Boulder Buddy
        </h1>
        <p className="text-gray-700 mb-6">Your climbing buddy!</p>
        <button className="mt-4 px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition duration-300 transform hover:scale-105">
          Start Climbing
        </button>
      </div>
    </div>
  );
};

export default App;
