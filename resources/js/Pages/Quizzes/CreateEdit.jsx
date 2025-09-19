import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const subjects = ["Math", "Science", "History"]; // Example subjects
const groups = ["Group A", "Group B", "Group C"]; // Example student groups
const QUESTION_TYPES = ["Multiple Choice", "True/False", "Fill in the Blank"];

export default function QuizzesCreateEdit() {
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [status, setStatus] = useState("Draft");
    const [questions, setQuestions] = useState([]);

    // Handle multi-select groups
    const handleGroupChange = (e) => {
        const options = Array.from(e.target.options);
        setSelectedGroups(options.filter((o) => o.selected).map((o) => o.value));
    };

    // Add a new question
    const handleAddQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                id: Date.now(),
                type: "Multiple Choice",
                text: "",
                options: [{ text: "", correct: false }],
            },
        ]);
    };

    // Update question text/type
    const handleQuestionChange = (id, field, value) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
        );
    };

    // Add option to multiple choice
    const handleAddOption = (id) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === id
                    ? { ...q, options: [...q.options, { text: "", correct: false }] }
                    : q
            )
        );
    };

    // Update option text/correct
    const handleOptionChange = (qid, idx, field, value) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === qid
                    ? {
                          ...q,
                          options: q.options.map((o, i) =>
                              i === idx ? { ...o, [field]: value } : o
                          ),
                      }
                    : q
            )
        );
    };

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        const quizData = {
            title,
            subject,
            description,
            groups: selectedGroups,
            status,
            questions,
        };
        console.log("Submitting Quiz:", quizData);
        // 🚀 send to Laravel controller using Inertia.post('/admin/quizzes', quizData)
    };

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <h2 className="text-2xl font-bold">Create / Edit Quiz</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quiz Information */}
                    <div>
                        <label className="block font-medium">Title</label>
                        <input
                            type="text"
                            className="border p-2 w-full rounded"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Subject / Category</label>
                        <select
                            className="border p-2 w-full rounded"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((subj) => (
                                <option key={subj} value={subj}>
                                    {subj}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">Description</label>
                        <ReactQuill
                            theme="snow"
                            value={description}
                            onChange={setDescription}
                        />
                    </div>

                    <div>
                        <label className="block font-medium">Assign to Student Group(s)</label>
                        <select
                            multiple
                            className="border p-2 w-full rounded"
                            value={selectedGroups}
                            onChange={handleGroupChange}
                        >
                            {groups.map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium">Status</label>
                        <select
                            className="border p-2 w-full rounded"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                        </select>
                    </div>

                    {/* Question Builder */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Question Builder</h3>

                        {questions.map((q, idx) => (
                            <div key={q.id} className="border rounded p-4 space-y-3">
                                <div>
                                    <label className="block font-medium">
                                        Question {idx + 1}
                                    </label>
                                    <input
                                        type="text"
                                        className="border p-2 w-full rounded"
                                        placeholder="Enter question..."
                                        value={q.text}
                                        onChange={(e) =>
                                            handleQuestionChange(q.id, "text", e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block font-medium">Type</label>
                                    <select
                                        className="border p-2 w-full rounded"
                                        value={q.type}
                                        onChange={(e) =>
                                            handleQuestionChange(q.id, "type", e.target.value)
                                        }
                                    >
                                        {QUESTION_TYPES.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {q.type === "Multiple Choice" && (
                                    <div className="space-y-2">
                                        {q.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    className="border p-2 flex-1 rounded"
                                                    placeholder={`Option ${i + 1}`}
                                                    value={opt.text}
                                                    onChange={(e) =>
                                                        handleOptionChange(
                                                            q.id,
                                                            i,
                                                            "text",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <input
                                                    type="checkbox"
                                                    checked={opt.correct}
                                                    onChange={(e) =>
                                                        handleOptionChange(
                                                            q.id,
                                                            i,
                                                            "correct",
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                                <span className="text-sm">Correct</span>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="px-3 py-1 border rounded bg-gray-100"
                                            onClick={() => handleAddOption(q.id)}
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="button"
                            className="px-3 py-2 border rounded bg-blue-100"
                            onClick={handleAddQuestion}
                        >
                            + Add New Question
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            className="px-4 py-2 border rounded bg-gray-200"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border rounded bg-blue-500 text-white"
                        >
                            Publish Quiz
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
