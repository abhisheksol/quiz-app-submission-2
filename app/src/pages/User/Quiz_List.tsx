import React, { FC, useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions_count: number;
  time_limit: number;
  created_by: string;
  end_date: string;
}

interface QuizListProps {
  isAdmin: boolean;
}

const QuizList: FC<QuizListProps> = ({ isAdmin }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async (): Promise<void> => {
      try {
        const response = await axios.get<Quiz[]>('http://localhost:5000/api/quizzes/');
        setQuizzes(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (loading) {
    return <div className="text-center">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  const now = new Date();

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center">Available Quizzes</h1>

      {isAdmin && (
        <div className="text-center mb-10">
          <Link
            to="/admin/create"
            className="bg-indigo-600 text-white py-3 px-8 rounded-md shadow-md hover:bg-indigo-700 transition duration-300"
          >
            + Create New Quiz
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {quizzes.map((quiz: Quiz) => {
          const isExpired = new Date(quiz.end_date) < now;
          return (
            <div
              key={quiz.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold text-gray-700">{quiz.title}</h2>
              <p className="text-gray-500 mt-2 text-sm">{quiz.description}</p>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>{quiz.questions_count} Questions</span>
                <span>⏳ {quiz.time_limit} mins</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                By: <span className="font-medium text-gray-700">{quiz.created_by}</span>
              </div>

              {isAdmin ? (
                <div className="mt-4">
                  <Link
                    to={`/admin/quizzes/${quiz.id}`}
                    className="block bg-indigo-100 text-indigo-600 py-2 text-center rounded-md hover:bg-indigo-200 transition duration-300"
                  >
                    Manage Quiz
                  </Link>
                </div>
              ) : (
                <div className="mt-6">
                  {isExpired ? (
                    <span className="block bg-red-100 text-red-600 py-2 text-center rounded-md font-medium">
                      Expired
                    </span>
                  ) : (
                    <Link
                      to={`/quiz/${quiz.id}`}
                      state={{ timer: quiz.time_limit }}
                      className="block bg-indigo-600 text-white py-2 text-center rounded-md hover:bg-indigo-700 transition duration-300"
                    >
                      Take Quiz
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizList;
