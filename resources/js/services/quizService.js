// resources/js/Pages/Quiz/services/quizService.js

export const fetchQuizzes = async () => {
  // Mock data with 4 quizzes and multiple questions
  return [
    {
      id: 1,
      title: "General Knowledge Quiz",
      description: "Test your knowledge about general topics.",
      questions: [
        {
          id: 1,
          question: "What is the capital of France?",
          options: ["Paris", "London", "Berlin", "Rome"],
          answer: "Paris",
        },
        {
          id: 2,
          question: "Who wrote Hamlet?",
          options: ["Shakespeare", "Tolstoy", "Hemingway", "Poe"],
          answer: "Shakespeare",
        },
        {
          id: 3,
          question: "Which planet is known as the Red Planet?",
          options: ["Mars", "Venus", "Jupiter", "Saturn"],
          answer: "Mars",
        },
      ],
    },
    {
      id: 2,
      title: "Math Quiz",
      description: "Simple math questions.",
      questions: [
        {
          id: 1,
          question: "2 + 2 = ?",
          options: ["3", "4", "5", "6"],
          answer: "4",
        },
        {
          id: 2,
          question: "5 × 6 = ?",
          options: ["11", "30", "35", "25"],
          answer: "30",
        },
        {
          id: 3,
          question: "12 ÷ 3 = ?",
          options: ["4", "3", "6", "5"],
          answer: "4",
        },
      ],
    },
    {
      id: 3,
      title: "Science Quiz",
      description: "Questions about basic science.",
      questions: [
        {
          id: 1,
          question: "Water boils at what temperature?",
          options: ["90°C", "100°C", "120°C", "80°C"],
          answer: "100°C",
        },
        {
          id: 2,
          question: "What gas do plants produce?",
          options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"],
          answer: "Oxygen",
        },
        {
          id: 3,
          question: "The human body has how many bones?",
          options: ["206", "201", "210", "215"],
          answer: "206",
        },
      ],
    },
    {
      id: 4,
      title: "History Quiz",
      description: "Test your knowledge of historical events.",
      questions: [
        {
          id: 1,
          question: "Who was the first President of the United States?",
          options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "John Adams"],
          answer: "George Washington",
        },
        {
          id: 2,
          question: "In which year did World War II end?",
          options: ["1945", "1939", "1918", "1965"],
          answer: "1945",
        },
        {
          id: 3,
          question: "The Great Wall is located in which country?",
          options: ["China", "India", "Japan", "Mongolia"],
          answer: "China",
        },
      ],
    },
  ];
};
