import React, { useState, useEffect } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Breadcrumb from "@/Components/Breadcrumb";
import { Trash2 } from "lucide-react";

export default function QuizzesCreateEdit() {
    const { datas } = usePage().props;
    const isEdit = datas && datas.id;
    const title = isEdit ? "Edit Quiz" : "New Quiz";

    // Quiz Info State
    const [quiz, setQuiz] = useState({
        title: datas?.title || "",
        subject: datas?.subject || "",
        groups: datas?.groups || [],
        status: datas?.status || "Draft",
        description: datas?.description || "", 
    });

    // Questions State
    const [questions, setQuestions] = useState([]);

    // Normalize backend data for questions
    useEffect(() => {
        if (datas?.questions) {
            setQuestions(
                datas.questions.map((q) => {
                    if (q.type === "Matching") {
                        let options = [];
                        try {
                            if (Array.isArray(q.options)) {
                                options = q.options.map(opt =>
                                    typeof opt === "object" && opt.left !== undefined && opt.right !== undefined
                                        ? opt
                                        : { left: opt.left || "", right: opt.right || "" }
                                );
                            } else if (q.options) {
                                options = JSON.parse(q.options);
                            }
                        } catch {
                            options = [{ left: "", right: "" }];
                        }
                        if (!options || options.length === 0) options = [{ left: "", right: "" }];
                        let correct_answer = [];
                        try {
                            if (Array.isArray(q.correct_answer)) {
                                correct_answer = q.correct_answer.map(pair =>
                                    typeof pair === "object" && pair.left !== undefined && pair.right !== undefined
                                        ? pair
                                        : { left: pair.left || "", right: pair.right || "" }
                                );
                            } else if (q.correct_answer) {
                                correct_answer = JSON.parse(q.correct_answer);
                            }
                        } catch {
                            correct_answer = [];
                        }
                        if (!correct_answer) correct_answer = [];
                        return {
                            ...q,
                            options,
                            correct_answer,
                        };
                    }
                    return {
                        ...q,
                        options: Array.isArray(q.options)
                            ? q.options
                            : q.options
                                ? JSON.parse(q.options)
                                : ["", "", "", ""],
                        correct_answer:
                            q.type === "Checkboxes"
                                ? Array.isArray(q.correct_answer)
                                    ? q.correct_answer
                                    : q.correct_answer
                                        ? JSON.parse(q.correct_answer)
                                        : []
                                : q.type === "True/False"
                                    ? (q.correct_answer === true || q.correct_answer === "true" || q.correct_answer === "True"
                                        ? "True"
                                        : "False")
                                    : q.correct_answer || "",
                    };
                })
            );
        } else {
            setQuestions([
                {
                    type: "Multiple Choice",
                    text: "",
                    options: ["", "", "", ""],
                    correct_answer: "",
                },
            ]);
        }
    }, [datas]);

    // Add new question
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                type: "Multiple Choice",
                text: "",
                options: ["", "", "", ""],
                correct_answer: "",
            },
        ]);
    };

    // Remove question
    const removeQuestion = (idx) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    // Reorder questions
    const moveQuestion = (from, to) => {
        if (to < 0 || to >= questions.length) return;
        const updated = [...questions];
        const [moved] = updated.splice(from, 1);
        updated.splice(to, 0, moved);
        setQuestions(updated);
    };

    // Update a question field
    const updateQuestion = (idx, field, value) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== idx) return q;
                // If changing type, reset options/correct_answer for Matching
                if (field === "type" && value === "Matching") {
                    return {
                        ...q,
                        type: value,
                        options: [{ left: "", right: "" }],
                        correct_answer: [],
                    };
                }
                // If changing type, reset for other types
                if (field === "type" && value === "Multiple Choice") {
                    return {
                        ...q,
                        type: value,
                        options: ["", "", "", ""],
                        correct_answer: "",
                    };
                }
                if (field === "type" && value === "Checkboxes") {
                    return {
                        ...q,
                        type: value,
                        options: ["", "", "", ""],
                        correct_answer: [],
                    };
                }
                if (field === "type" && value === "True/False") {
                    return {
                        ...q,
                        type: value,
                        options: [],
                        correct_answer: "",
                    };
                }
                if (field === "type" && value === "Fill-in-the-blank") {
                    return {
                        ...q,
                        type: value,
                        options: [],
                        correct_answer: "",
                    };
                }
                // Otherwise, regular update
                return { ...q, [field]: value };
            })
        );
    };

    // Update an option
    const updateOption = (qIdx, optIdx, value) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                if (q.type === "Matching") {
                    // For Matching, value should be {left, right}
                    const newOptions = [...q.options];
                    newOptions[optIdx] = value;
                    return { ...q, options: newOptions };
                }
                // For other types (array of strings)
                return {
                    ...q,
                    options: q.options.map((opt, oi) =>
                        oi === optIdx ? value : opt
                    ),
                };
            })
        );
    };

    // Set correct answer
    const setCorrectAnswer = (qIdx, value) => {
        setQuestions(
            questions.map((q, i) => {
                if (i !== qIdx) return q;
                if (q.type === "Checkboxes") {
                    // Toggle value in array
                    let arr = Array.isArray(q.correct_answer) ? q.correct_answer : [];
                    if (arr.includes(value)) {
                        arr = arr.filter(v => v !== value);
                    } else {
                        arr = [...arr, value];
                    }
                    return { ...q, correct_answer: arr };
                } else if (q.type === "True/False") {
                    return { ...q, correct_answer: value };
                } else {
                    return { ...q, correct_answer: value };
                }
            })
        );
    };

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...quiz,
            questions: questions.map((q) => {
                // Matching question: ensure options/correct_answer are arrays of objects
                if (q.type === "Matching") {
                    return {
                        type: q.type,
                        text: q.text,
                        options: Array.isArray(q.options)
                            ? q.options.map(pair => ({
                                left: pair.left || "",
                                right: pair.right || "",
                            }))
                            : [{ left: "", right: "" }],
                        correct_answer: Array.isArray(q.correct_answer)
                            ? q.correct_answer.map(pair => ({
                                left: pair.left || "",
                                right: pair.right || "",
                            }))
                            : [],
                    };
                }
                return {
                    type: q.type,
                    text: q.text,
                    description: q.description, // <-- Added
                    options: q.options,
                    correct_answer:
                        q.type === "Checkboxes"
                            ? q.correct_answer
                            : q.type === "True/False"
                                ? q.correct_answer
                                : q.correct_answer,
                };
            }),
        };

        if (isEdit) {
            router.patch(route("quizzes.update", datas.id), payload);
        } else {
            router.post(route("quizzes.store"), payload);
        }
    };

    // Breadcrumb
    const breadcrumbLinks = [
        { title: "Home", url: "/" },
        { title: "Quiz", url: route("quizzes.index") },
        { title, url: "" },
    ];

    return (
        <AdminLayout breadcrumb={<Breadcrumb header={title} links={breadcrumbLinks} />}>
            <Head title={title} />
            <form
                className="min-h-screen w-full mx-auto space-y-4 mb-12"
                onSubmit={handleSubmit}
            >
                {/* Top Section */}
                <div className="bg-white rounded-2xl shadow-sm px-8 py-6 relative">
                    <div className="flex items-center justify-between gap-6">
                        {/* Quiz Name */}
                        <div className="w-1/3">
                            <label className="block text-gray-700 mb-2 font-medium">
                                Quiz Name
                            </label>
                            <input
                                type="text"
                                value={quiz.title}
                                onChange={(e) =>
                                    setQuiz({ ...quiz, title: e.target.value })
                                }
                                placeholder="Enter name"
                                className="w-full py-2 px-3 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="w-1/4">
                            <label className="block text-gray-700 mb-2 font-medium">
                                Status
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Published"
                                        checked={quiz.status === "Published"}
                                        onChange={() =>
                                            setQuiz({
                                                ...quiz,
                                                status: "Published",
                                            })
                                        }
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 accent-blue-600"
                                    />
                                    <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                                        Publish
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Draft"
                                        checked={quiz.status === "Draft"}
                                        onChange={() =>
                                            setQuiz({
                                                ...quiz,
                                                status: "Draft",
                                            })
                                        }
                                        className="h-4 w-4 text-red-500 border-gray-300 focus:ring-red-400 accent-red-500"
                                    />
                                    <span className="text-sm font-medium text-red-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                        Draft
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Create / Update Button */}
                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="px-6 w-36 py-2 text-white bg-blue-700 rounded-2xl hover:bg-blue-800 transition"
                            >
                                {isEdit ? "Update" : "Create"}
                            </button>
                        </div>
                    </div>

                    {/* Description (Plain Textarea) */}
                    <div className="mt-6">
                        <label className="block text-gray-700 mb-2 font-medium">
                            Description
                        </label>
                        <textarea
                            value={quiz.description}
                            onChange={(e) =>
                                setQuiz({ ...quiz, description: e.target.value })
                            }
                            placeholder="Enter quiz description"
                            className="w-full px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                            rows="3"
                        />
                    </div>
                </div>


                {/* Question Builder Section */}
                <div className="space-y-8">
                    {questions.map((q, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl shadow-md px-8 py-6 mb-4"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Question {idx + 1}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center w-10 h-10 text-red-500 border-2 border-red-400 rounded-xl hover:bg-red-100 transition"
                                        aria-label="Delete"
                                        onClick={() => removeQuestion(idx)}
                                        disabled={questions.length === 1}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className="text-gray-400 px-2"
                                        onClick={() =>
                                            moveQuestion(idx, idx - 1)
                                        }
                                        disabled={idx === 0}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        className="text-gray-400 px-2"
                                        onClick={() =>
                                            moveQuestion(idx, idx + 1)
                                        }
                                        disabled={idx === questions.length - 1}
                                    >
                                        ↓
                                    </button>
                                </div>
                            </div>

                            {/* Question Type */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Question Type
                                </label>
                                <select
                                    value={q.type}
                                    onChange={(e) =>
                                        updateQuestion(
                                            idx,
                                            "type",
                                            e.target.value
                                        )
                                    }
                                    className="w-1/3 py-2 px-3 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                >
                                    <option value="Multiple Choice">
                                        Multiple Choice
                                    </option>
                                    <option value="Checkboxes">Checkboxes</option>
                                    <option value="True/False">True/False</option>
                                    <option value="Fill-in-the-blank">
                                        Fill-in-the-blank
                                    </option>
                                    <option value="Matching">Matching</option>
                                </select>
                            </div>

                            {/* Question Text */}
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    value={q.text}
                                    onChange={(e) =>
                                        updateQuestion(
                                            idx,
                                            "text",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your question"
                                    className="w-full px-3 py-2 rounded-[10px] bg-gray-50 border border-gray-200 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                />
                            </div>
                            {/* Options (MCQ/Checkboxes) */}
                            {(q.type === "Multiple Choice" ||
                                q.type === "Checkboxes") && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                                            Options
                                        </h3>
                                        {q.options.map((option, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className="flex items-center gap-2 mb-3"
                                            >
                                                <input
                                                    type={q.type === "Multiple Choice" ? "radio" : "checkbox"}
                                                    name={`correctOption-${idx}`}
                                                    checked={
                                                        q.type === "Checkboxes"
                                                            ? Array.isArray(q.correct_answer) && q.correct_answer.includes(option)
                                                            : q.correct_answer === option
                                                    }
                                                    onChange={() =>
                                                        setCorrectAnswer(idx, option)
                                                    }
                                                    className="text-blue-500 focus:ring-blue-400 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    placeholder={`Option ${optIdx + 1}`}
                                                    onChange={(e) =>
                                                        updateOption(
                                                            idx,
                                                            optIdx,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="flex-1 px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuestion(
                                                            idx,
                                                            "options",
                                                            q.options.filter(
                                                                (_, i) => i !== optIdx
                                                            )
                                                        )
                                                    }
                                                    className="text-red-400 hover:text-red-500 transition"
                                                    disabled={q.options.length <= 2}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateQuestion(idx, "options", [
                                                    ...q.options,
                                                    "",
                                                ])
                                            }
                                            className="mt-3 text-blue-600 hover:underline"
                                        >
                                            + Add Option
                                        </button>
                                        {/* Show selected correct answer(s) */}
                                        <div className="mt-2 text-sm text-green-600">
                                            {q.type === "Checkboxes" && Array.isArray(q.correct_answer) && q.correct_answer.length > 0 && (
                                                <>Correct Answers: <strong>{q.correct_answer.join(", ")}</strong></>
                                            )}
                                            {q.type === "Multiple Choice" && q.correct_answer && (
                                                <>Correct Answer: <strong>{q.correct_answer}</strong></>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* True/False */}
                            {q.type === "True/False" && (
                                <div className="flex gap-6 mt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`correctOption-${idx}`}
                                            value="True"
                                            checked={q.correct_answer === "True"}
                                            onChange={(e) => setCorrectAnswer(idx, e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        True
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`correctOption-${idx}`}
                                            value="False"
                                            checked={q.correct_answer === "False"}
                                            onChange={(e) => setCorrectAnswer(idx, e.target.value)}
                                            className="cursor-pointer"
                                        />
                                        False
                                    </label>
                                    {/* Show selected correct answer */}
                                    <div className="ml-4 text-sm text-green-600">
                                        {q.correct_answer && (
                                            <>Correct Answer: <strong>{q.correct_answer}</strong></>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Matching Questions */}
                            {q.type === "Matching" && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                                        Matching Pairs
                                    </h3>

                                    {(q.options && q.options.length > 0 ? q.options : [{ left: "", right: "" }]).map((pair, pIdx) => (
                                        <div key={pIdx} className="flex gap-3 items-center mb-3">
                                            {/* Left Side */}
                                            <input
                                                type="text"
                                                value={pair.left || ""}
                                                onChange={(e) => {
                                                    const newPairs = [...(q.options || [])];
                                                    newPairs[pIdx] = { ...newPairs[pIdx], left: e.target.value };
                                                    updateQuestion(idx, "options", newPairs);
                                                }}
                                                placeholder={`Left item ${pIdx + 1}`}
                                                className="w-1/3 px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                            />

                                            <span className="text-gray-600 font-medium">=</span>

                                            {/* Right Side */}
                                            <input
                                                type="text"
                                                value={pair.right || ""}
                                                onChange={(e) => {
                                                    const newPairs = [...(q.options || [])];
                                                    newPairs[pIdx] = { ...newPairs[pIdx], right: e.target.value };
                                                    updateQuestion(idx, "options", newPairs);
                                                }}
                                                placeholder={`Right item ${pIdx + 1}`}
                                                className="w-1/3 px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                            />

                                            {/* Remove Pair */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Remove pair from options and correct_answer by index
                                                    const newOptions = q.options.filter((_, i) => i !== pIdx);
                                                    const newCorrect = Array.isArray(q.correct_answer)
                                                        ? q.correct_answer.filter((_, i) => i !== pIdx)
                                                        : [];
                                                    updateQuestion(idx, "options", newOptions);
                                                    updateQuestion(idx, "correct_answer", newCorrect);
                                                }}
                                                className="text-red-400 hover:text-red-500 transition"
                                                disabled={(q.options || []).length <= 1}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add Pair Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newPairs = [...(q.options || []), { left: "", right: "" }];
                                            updateQuestion(idx, "options", newPairs);
                                        }}
                                        className="mt-3 text-blue-600 hover:underline"
                                    >
                                        + Add Pair
                                    </button>

                                    {/* Correct Matches Selector */}
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium text-gray-700 mb-2">
                                            Select Correct Matches
                                        </h4>
                                        {(q.options || []).map((pair, i) => (
                                            <div key={i} className="flex gap-3 items-center mb-2">
                                                <span className="w-1/3">{pair.left}</span>
                                                <select
                                                    value={q.correct_answer && q.correct_answer[i] ? q.correct_answer[i].right : ""}
                                                    onChange={(e) => {
                                                        const newCorrect = [...(q.correct_answer || [])];
                                                        newCorrect[i] = { left: pair.left, right: e.target.value };
                                                        // Fill missing pairs with empty objects
                                                        for (let j = 0; j < q.options.length; j++) {
                                                            if (!newCorrect[j]) newCorrect[j] = { left: q.options[j].left, right: "" };
                                                        }
                                                        updateQuestion(idx, "correct_answer", newCorrect);
                                                    }}
                                                    className="w-1/3 px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                                >
                                                    <option value="">Select match</option>
                                                    {(q.options || []).map((opt) => (
                                                        <option key={opt.right} value={opt.right}>
                                                            {opt.right}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Preview Correct Matches */}
                                    <div className="mt-3 text-sm text-green-600">
                                        {q.correct_answer && q.correct_answer.length > 0 && (
                                            <>
                                                Correct Pairs:{" "}
                                                <strong>
                                                    {q.correct_answer.map((p) => `${p.left} = ${p.right}`).join(", ")}
                                                </strong>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            {/* Fill-in-the-blank */}
                            {q.type === "Fill-in-the-blank" && (
                                <div className="mt-4">
                                    <label className="block text-gray-700 mb-2 font-medium">
                                        Correct Answer
                                    </label>
                                    <input
                                        type="text"
                                        value={q.correct_answer}
                                        onChange={(e) =>
                                            setCorrectAnswer(
                                                idx,
                                                e.target.value
                                            )
                                        }
                                        className="w-1/2 px-3 py-2 rounded-[10px] border border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                                    />
                                    {/* Show selected correct answer */}
                                    <div className="mt-2 text-sm text-green-600">
                                        {q.correct_answer && (
                                            <>Correct Answer: <strong>{q.correct_answer}</strong></>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add Question Button */}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="px-6 py-2 text-blue-700 border-2 border-blue-500 rounded-2xl hover:bg-blue-100 transition"
                    >
                        + Add Question
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
