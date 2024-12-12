import React, { FC, useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

interface Quiz {
  user_name: string;
  score: number;
}

const AdminDashboard: FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const [quizData, setQuizData] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizResults = async (): Promise<void> => {
      try {
        const response = await axios.get<Quiz[]>("http://localhost:5000/api/users/results");
        setQuizData(response.data);
      } catch (err) {
        setError("Failed to fetch quiz data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const totalQuizzes: number = quizData.length;
  const uniqueUsers: number = new Set(quizData.map((quiz) => quiz.user_name)).size;
  const averageScore: string =
    quizData.length > 0
      ? (quizData.reduce((acc, quiz) => acc + quiz.score, 0) / quizData.length).toFixed(2)
      : "0";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Total Quizzes</h2>
          <p className="text-3xl font-semibold">{totalQuizzes}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Total Users</h2>
          <p className="text-3xl font-semibold">{uniqueUsers}</p>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Average Score</h2>
          <p className="text-3xl font-semibold">{averageScore}%</p>
        </div>
      </div>

      <div className="space-y-4">
        <Link
          to="/admin/quizzes"
          className="block bg-blue-600 text-white text-center p-4 rounded-lg hover:bg-blue-500 transition"
        >
          Manage Quizzes
        </Link>
        <Link
          to="/admin/create"
          className="block bg-green-600 text-white text-center p-4 rounded-lg hover:bg-green-500 transition"
        >
          Create New Quiz
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;