import React, { useState, useEffect, FC } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Quiz {
  id: number;
  title: string;
  description: string;
  questions_count: number;
  created_by: string;
}

const ManageQuizzes: FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async (): Promise<void> => {
      try {
        const response = await fetch("http://localhost:5000/api/quizzes");
        const data: Quiz[] = await response.json();
        if (user) {
          const filteredQuizzes = data.filter((quiz) => quiz.created_by === user.name);
          setQuizzes(filteredQuizzes);
        } else {
          console.error("User is not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    if (isAuthenticated) {
      fetchQuizzes();
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleDelete = async (id: number): Promise<void> => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            const updatedQuizzes = quizzes.filter((quiz) => quiz.id !== id);
            setQuizzes(updatedQuizzes);
            Swal.fire({
              title: "Deleted!",
              text: "Your quiz has been deleted.",
              icon: "success",
            });
          } else {
            console.error("Failed to delete the quiz");
          }
        } catch (error) {
          console.error("Error deleting quiz:", error);
          Swal.fire({
            title: "Error!",
            text: "There was an issue deleting the quiz.",
            icon: "error",
          });
        }
      }
    });
  };

  const handleEdit = (id: number): void => {
    navigate(`/admin/edit/${id}`);
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Manage Quizzes</h1>
      <div className="bg-white shadow rounded-lg p-2">
        {quizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border p-3">ID</th>
                  <th className="border p-3">Title</th>
                  <th className="border p-3">Description</th>
                  <th className="border p-3">Questions</th>
                  <th className="border p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz, index) => (
                  <tr
                    key={quiz.id}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    }`}
                  >
                    <td className="border p-3 text-center">{quiz.id}</td>
                    <td className="border p-3">{quiz.title}</td>
                    <td className="border p-3">{quiz.description}</td>
                    <td className="border p-3 text-center">{quiz.questions_count}</td>
                    <td className="border p-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded shadow"
                          onClick={() => handleEdit(quiz.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded shadow"
                          onClick={() => handleDelete(quiz.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-6">
            <p className="text-xl font-semibold text-gray-500">No quizzes available.</p>
            <p className="text-gray-400 mt-2">
              Add some quizzes to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuizzes;
