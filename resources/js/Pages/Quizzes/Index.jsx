import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";

export default function QuizList() {
    // Fake data (replace with API later)
    const [quizzes] = useState([
        {
            id: 1,
            title: "Math Basics Quiz",
            subject: "Math",
            status: "Published",
            groups: ["Group A", "Group B"],
        },
        {
            id: 2,
            title: "Science Fundamentals",
            subject: "Science",
            status: "Draft",
            groups: ["Group C"],
        },
        {
            id: 3,
            title: "History of Cambodia",
            subject: "History",
            status: "Published",
            groups: ["Group A"],
        },
    ]);

    return (
        <AdminLayout>
            <div className="content-wrapper p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="mb-0"><strong>Quiz List</strong></h2>
                    <Link
                        href={route("quizzes.create")}
                        className="btn btn-primary"
                    >
                        + Create Quiz
                    </Link>
                </div>

                <div className="card">
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover text-nowrap">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                    <th>Groups</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizzes.map((quiz) => (
                                    <tr key={quiz.id}>
                                        <td>{quiz.id}</td>
                                        <td>{quiz.title}</td>
                                        <td>{quiz.subject}</td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    quiz.status === "Published"
                                                        ? "badge-success"
                                                        : "badge-secondary"
                                                }`}
                                            >
                                                {quiz.status}
                                            </span>
                                        </td>
                                        <td>{quiz.groups.join(", ")}</td>
                                        <td>
                                            <Link
                                                href={route("quizzes.create", { id: quiz.id })}
                                                className="btn btn-sm btn-info mr-2"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => alert("Delete not implemented")}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
