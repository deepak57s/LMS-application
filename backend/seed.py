
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

# ponytail: inline seed data. No separate JSON files for 20 questions.
SEED_DATA = {
    "domains": [
        {
            "name": "Web Development",
            "description": "Frontend and backend web technologies",
        },
        {
            "name": "Data Science & AI",
            "description": "Machine learning, data analysis, and artificial intelligence",
        },
    ],
    "topics": {
        # Domain-keys
        "Web Development": [
            {"name": "HTML & CSS Fundamentals", "description": "Core building blocks of the web"},
            {"name": "JavaScript Essentials", "description": "The language of the browser"},
            {"name": "React Basics", "description": "Component-based UI library"},
        ],
        "Data Science & AI": [
            {"name": "Python Fundamentals", "description": "Python programming basics"},
            {"name": "Machine Learning Intro", "description": "Core ML concepts and algorithms"},
        ],
    },
    "questions": {
        "HTML & CSS Fundamentals": [
            {
                "question_text": "What does HTML stand for?",
                "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"],
                "correct_option_index": 0,
            },
            {
                "question_text": "Which CSS property is used to change the text color?",
                "options": ["font-color", "text-color", "color", "foreground-color"],
                "correct_option_index": 2,
            },
            {
                "question_text": "Which HTML tag is used for the largest heading?",
                "options": ["<heading>", "<h6>", "<h1>", "<head>"],
                "correct_option_index": 2,
            },
            {
                "question_text": "What does CSS stand for?",
                "options": ["Cascading Style Sheets", "Creative Style System", "Computer Style Sheets", "Colorful Style Sheets"],
                "correct_option_index": 0,
            },
            {
                "question_text": "Which property is used to change the background color?",
                "options": ["bgcolor", "background-color", "color-background", "bg-color"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which HTML attribute specifies an alternate text for an image?",
                "options": ["title", "alt", "src", "longdesc"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which CSS property controls the text size?",
                "options": ["text-size", "font-style", "font-size", "text-style"],
                "correct_option_index": 2,
            },
            {
                "question_text": "How do you select an element with id 'header' in CSS?",
                "options": [".header", "#header", "header", "*header"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which HTML element is used to define an unordered list?",
                "options": ["<ol>", "<list>", "<ul>", "<dl>"],
                "correct_option_index": 2,
            },
            {
                "question_text": "What is the correct CSS syntax for making all <p> bold?",
                "options": ["p {font-weight: bold;}", "p {text-style: bold;}", "<p style='bold'>", "p.bold {}"],
                "correct_option_index": 0,
            },
        ],
        "JavaScript Essentials": [
            {
                "question_text": "Which keyword declares a block-scoped variable in JavaScript?",
                "options": ["var", "let", "define", "dim"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is the output of typeof null?",
                "options": ["'null'", "'undefined'", "'object'", "'boolean'"],
                "correct_option_index": 2,
            },
            {
                "question_text": "Which method adds an element to the end of an array?",
                "options": ["append()", "push()", "add()", "insert()"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What does === check in JavaScript?",
                "options": ["Value only", "Type only", "Value and type", "Reference only"],
                "correct_option_index": 2,
            },
            {
                "question_text": "Which function is used to parse a JSON string?",
                "options": ["JSON.parse()", "JSON.stringify()", "JSON.decode()", "JSON.convert()"],
                "correct_option_index": 0,
            },
            {
                "question_text": "What is a closure in JavaScript?",
                "options": ["A syntax error handler", "A function with access to its outer scope", "A way to close the browser", "A loop terminator"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which event fires when the DOM is fully loaded?",
                "options": ["onload", "DOMContentLoaded", "onready", "DOMReady"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What does the spread operator (...) do?",
                "options": ["Multiplies values", "Expands an iterable into individual elements", "Creates a new scope", "Declares rest parameters only"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which method removes the last element of an array?",
                "options": ["pop()", "shift()", "delete()", "remove()"],
                "correct_option_index": 0,
            },
            {
                "question_text": "What is the purpose of 'use strict'?",
                "options": ["Enables CSS strict mode", "Enforces stricter JS parsing and error handling", "Restricts DOM access", "Enables TypeScript mode"],
                "correct_option_index": 1,
            },
        ],
        "React Basics": [
            {
                "question_text": "What is JSX?",
                "options": ["A JavaScript database", "A syntax extension that looks like HTML in JavaScript", "A CSS framework", "A testing library"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which hook is used to manage state in a functional component?",
                "options": ["useEffect", "useState", "useContext", "useReducer"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is the virtual DOM?",
                "options": ["A direct copy of the real DOM", "A lightweight JavaScript representation of the DOM", "A server-side rendering engine", "A browser extension"],
                "correct_option_index": 1,
            },
            {
                "question_text": "How do you pass data from parent to child component?",
                "options": ["Using state", "Using props", "Using context only", "Using localStorage"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What does useEffect do?",
                "options": ["Manages component state", "Performs side effects after render", "Creates new components", "Handles routing"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which method is used to render a React component to the DOM?",
                "options": ["React.render()", "ReactDOM.render() or createRoot().render()", "document.render()", "Component.mount()"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is the purpose of keys in React lists?",
                "options": ["Styling list items", "Helping React identify which items changed", "Encrypting data", "Sorting the list"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is a controlled component?",
                "options": ["A component controlled by the browser", "A form element whose value is controlled by React state", "A component with no state", "A server-rendered component"],
                "correct_option_index": 1,
            },
            {
                "question_text": "How do you conditionally render in React?",
                "options": ["Using if/else only", "Using ternary operators or && in JSX", "Using CSS display property", "Using switch statements only"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is the default port for a Create React App dev server?",
                "options": ["8080", "5000", "3000", "4200"],
                "correct_option_index": 2,
            },
        ],
        "Python Fundamentals": [
            {
                "question_text": "What is the output of print(type([]))?",
                "options": ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "<class 'dict'>"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which keyword is used to define a function in Python?",
                "options": ["function", "func", "def", "define"],
                "correct_option_index": 2,
            },
            {
                "question_text": "What does len() do?",
                "options": ["Returns the type", "Returns the length/count", "Returns the last element", "Returns a copy"],
                "correct_option_index": 1,
            },
            {
                "question_text": "How do you start a comment in Python?",
                "options": ["//", "/*", "#", "--"],
                "correct_option_index": 2,
            },
            {
                "question_text": "What is a dictionary in Python?",
                "options": ["An ordered list", "A key-value pair collection", "A set of unique values", "A fixed-size array"],
                "correct_option_index": 1,
            },
            {
                "question_text": "Which method adds an element to the end of a list?",
                "options": ["add()", "push()", "append()", "insert()"],
                "correct_option_index": 2,
            },
            {
                "question_text": "What does 'pip' stand for in Python?",
                "options": ["Python Install Packages", "Pip Installs Packages", "Package Installer for Python", "Python Index of Packages"],
                "correct_option_index": 2,
            },
            {
                "question_text": "How do you create a virtual environment?",
                "options": ["python -m venv myenv", "pip create env", "python --env create", "virtualenv is the only way"],
                "correct_option_index": 0,
            },
            {
                "question_text": "What is a list comprehension?",
                "options": ["A way to understand lists", "A concise way to create lists using a single line", "A method to sort lists", "A list debugging tool"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is the difference between '==' and 'is'?",
                "options": ["No difference", "'==' checks value, 'is' checks identity", "'is' checks value, '==' checks identity", "'is' is deprecated"],
                "correct_option_index": 1,
            },
        ],
        "Machine Learning Intro": [
            {
                "question_text": "What is supervised learning?",
                "options": ["Learning without any data", "Learning from labeled data with known outputs", "Learning from unlabeled data", "Learning by reinforcement only"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is overfitting?",
                "options": ["Model is too simple", "Model memorizes training data and fails on new data", "Model has too few features", "Model trains too slowly"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What does a classification model predict?",
                "options": ["Continuous values", "Categories or classes", "Clusters only", "Time series data"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is a training/test split?",
                "options": ["Splitting code into modules", "Dividing data into portions for training and evaluation", "Splitting the model into layers", "A debugging technique"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is a feature in ML?",
                "options": ["The model's prediction", "An input variable used for prediction", "The training algorithm", "A type of neural network"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is the purpose of a loss function?",
                "options": ["To increase model size", "To measure how wrong the model's predictions are", "To visualize data", "To split datasets"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What library is most commonly used for ML in Python?",
                "options": ["NumPy", "Pandas", "scikit-learn", "Flask"],
                "correct_option_index": 2,
            },
            {
                "question_text": "What is a neural network inspired by?",
                "options": ["Computer circuits", "The human brain's neurons", "Database structures", "Internet protocols"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What does 'accuracy' measure in classification?",
                "options": ["Speed of prediction", "Proportion of correct predictions", "Size of the dataset", "Number of features used"],
                "correct_option_index": 1,
            },
            {
                "question_text": "What is unsupervised learning?",
                "options": ["Learning from labeled data", "Learning patterns from unlabeled data", "Reinforcement learning", "Transfer learning"],
                "correct_option_index": 1,
            },
        ],
    },
}


async def seed():
    """Seed"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client["lms_db"]

    # Cleanup
    await db["domains"].drop()
    await db["topics"].drop()
    await db["questions"].drop()
    print("[INFO] Cleared existing domains, topics, and questions.")

    # Domains
    domain_id_map = {}
    for domain in SEED_DATA["domains"]:
        result = await db["domains"].insert_one(domain.copy())
        domain_id_map[domain["name"]] = result.inserted_id
    print(f"[SUCCESS] Inserted {len(SEED_DATA['domains'])} domains")

    # Topics
    topic_id_map = {}
    total_topics = 0
    for domain_name, topics in SEED_DATA["topics"].items():
        domain_id = domain_id_map[domain_name]
        for topic in topics:
            topic_doc = {**topic, "domain_id": domain_id}
            result = await db["topics"].insert_one(topic_doc)
            topic_id_map[topic["name"]] = result.inserted_id
            total_topics += 1
    print(f"[SUCCESS] Inserted {total_topics} topics")

    # Questions
    total_questions = 0
    for topic_name, questions in SEED_DATA["questions"].items():
        topic_id = topic_id_map[topic_name]
        question_docs = [{**q, "topic_id": topic_id} for q in questions]
        await db["questions"].insert_many(question_docs)
        total_questions += len(questions)
    print(f"[SUCCESS] Inserted {total_questions} questions")

    print("\n[COMPLETE] Seed complete! Your database is ready.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
