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

interface UserResult {
  user_id: number;
  quiz_id: number;
  score: number;
}

interface QuizListProps {
  isAdmin: boolean;
}

const MAX_ATTEMPTS = 1;

const QuizList: FC<QuizListProps> = ({ isAdmin }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchQuizzesAndResults = async (): Promise<void> => {
      try {
        setLoading(true);

        // Fetch quizzes
        const quizzesResponse = await axios.get<Quiz[]>('http://localhost:5000/api/quizzes/');
        setQuizzes(quizzesResponse.data);

        if (user?.id) {
          // Fetch user's quiz results
          const resultsResponse = await axios.get<UserResult[]>('http://localhost:5000/api/users/results');
          const userSpecificResults = resultsResponse.data.filter((result) => result.user_id === Number(user.id));
          setUserResults(userSpecificResults);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzesAndResults();
  }, [user?.id]);

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

  const getUserAttemptCount = (quizId: number): number => {
    return userResults.filter((result) => result.quiz_id === quizId).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 m-20">
      {quizzes.map((quiz) => {
        const isExpired = new Date(quiz.end_date) < now;
        const userAttempts = getUserAttemptCount(quiz.id);
        const canAttempt = userAttempts < MAX_ATTEMPTS;
  
        return (
          <div
            key={quiz.id}
            className="flex flex-col justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 h-[350px]"
          >
            <div>
              <h2 className="text-xl font-semibold text-gray-700 line-clamp-2">{quiz.title}</h2>
              <p className="text-gray-500 mt-2 text-sm line-clamp-3">{quiz.description}</p>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>{quiz.questions_count} Questions</span>
                <span>⏳ {quiz.time_limit} mins</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                By: <span className="font-medium text-gray-700">{quiz.created_by}</span>
              </div>
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
              <div className="mt-4">
                {isExpired ? (
                  <span className="block bg-red-100 text-red-600 py-2 text-center rounded-md font-medium">
                    Expired
                  </span>
                ) : canAttempt ? (
                  <Link
                    to={`/quiz/${quiz.id}`}
                    state={{ timer: quiz.time_limit }}
                    className="block bg-indigo-600 text-white py-2 text-center rounded-md hover:bg-indigo-700 transition duration-300"
                  >
                    Take Quiz
                  </Link>
                ) : (
                  <span className="block bg-gray-100 text-gray-600 py-2 text-center rounded-md font-medium">
                    Max Attempts Reached
                  </span>
                )}
                <p className="text-xs text-center mt-2 text-gray-500">
                  {canAttempt
                    ? `Attempts left: ${MAX_ATTEMPTS - userAttempts}`
                    : "You have used all attempts for this quiz."}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  
};

export default QuizList;
