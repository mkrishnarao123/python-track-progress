
import { useMemo, useState } from 'react';
import checklistData from '../Checklist/checklist.json';
import './PracticeCode.css';

const topicLibrary = {
    'Setup & Basics': {
        details:
            'Set up Python and VS Code, verify your environment, and run a first script to confirm everything works correctly.',
        code: `print("Hello, World!")
print("Python is ready")`,
        commands: ['python --version', 'code .', 'python hello.py'],
    },
    'Variables & Data Types': {
        details:
            'Understand how Python stores different types of values and how to inspect value types at runtime.',
        code: `name = "Krishna"
age = 22
height = 5.8
is_active = True

print(type(name), type(age), type(height), type(is_active))`,
        commands: ['python variables.py'],
    },
    'Input/Output': {
        details:
            'Take user input with input(), convert values with casting, and display clean output with print formatting.',
        code: `name = input("Enter your name: ")
age = int(input("Enter your age: "))
print(f"Hi {name}, next year you will be {age + 1}")`,
        commands: ['python io_example.py'],
    },
    Operators: {
        details:
            'Use arithmetic, comparison, and logical operators to build expressions and program decisions.',
        code: `a, b = 10, 3
print(a + b, a - b, a * b, a / b)
print(a > b, a == b)
print(a > 5 and b < 5)`,
        commands: ['python operators.py'],
    },
    'If Conditions': {
        details: 'Control flow with if/elif/else and execute blocks based on evaluated conditions.',
        code: `score = 76

if score >= 90:
        print("Grade A")
elif score >= 75:
        print("Grade B")
else:
        print("Keep practicing")`,
        commands: ['python conditions.py'],
    },
    'Nested Conditions': {
        details: 'Write nested if statements for multi-level decision-making when one condition depends on another.',
        code: `age = 20
has_id = True

if age >= 18:
        if has_id:
                print("Access granted")
        else:
                print("Need valid ID")
else:
        print("Underage")`,
        commands: ['python nested_conditions.py'],
    },
    'For Loop': {
        details: 'Use for loops with range() for counted repetition and for traversing iterable objects.',
        code: `for i in range(1, 6):
        print(f"Step {i}")`,
        commands: ['python for_loop.py'],
    },
    'While Loop': {
        details: 'Use while for condition-based loops and control execution with break and continue.',
        code: `count = 1

while count <= 5:
        if count == 3:
                count += 1
                continue
        print(count)
        count += 1`,
        commands: ['python while_loop.py'],
    },
    Lists: {
        details: 'Store ordered collections, update values, and use list methods for common operations.',
        code: `skills = ["Python", "SQL", "Git"]
skills.append("React")
skills[1] = "PostgreSQL"
print(skills)`,
        commands: ['python lists.py'],
    },
    'Tuples & Sets': {
        details: 'Use tuples for fixed values and sets for unique collections with fast membership checks.',
        code: `coords = (10, 20)
tags = {"python", "api", "python"}
print(coords)
print(tags)`,
        commands: ['python tuple_set.py'],
    },
    Dictionaries: {
        details: 'Represent structured data with key-value pairs and safely fetch values using get().',
        code: `student = {"name": "Anu", "score": 91}
student["course"] = "Python"
print(student.get("score"))`,
        commands: ['python dictionary.py'],
    },
    Functions: {
        details: 'Use functions to organize code, reuse logic, and return values from computation blocks.',
        code: `def add(a, b):
        return a + b

print(add(3, 7))`,
        commands: ['python functions.py'],
    },
    'Function Arguments': {
        details: 'Use positional, default, and keyword arguments to make functions flexible and readable.',
        code: `def greet(name, city="Chennai"):
        print(f"Hi {name} from {city}")

greet("Krishna")
greet(name="Anu", city="Bengaluru")`,
        commands: ['python function_args.py'],
    },
    'File Handling': {
        details: 'Read and write text files using context managers so resources close safely.',
        code: `with open("notes.txt", "w", encoding="utf-8") as file:
        file.write("Python practice notes")

with open("notes.txt", "r", encoding="utf-8") as file:
        print(file.read())`,
        commands: ['python file_handling.py'],
    },
    'File Practice': {
        details: 'Practice appending, reading lines, and parsing structured text from files.',
        code: `with open("tasks.txt", "a", encoding="utf-8") as file:
        file.write("\nFinish checklist")

with open("tasks.txt", "r", encoding="utf-8") as file:
        for line in file:
                print(line.strip())`,
        commands: ['python file_practice.py'],
    },
    'OOP Basics': {
        details: 'Create classes and objects to model real entities with data and behavior.',
        code: `class Student:
        def __init__(self, name):
                self.name = name

        def intro(self):
                return f"I am {self.name}"

s = Student("Krishna")
print(s.intro())`,
        commands: ['python oop_basics.py'],
    },
    Inheritance: {
        details: 'Reuse existing class behavior with inheritance and customize child methods when needed.',
        code: `class Animal:
        def speak(self):
                return "sound"

class Dog(Animal):
        def speak(self):
                return "bark"

print(Dog().speak())`,
        commands: ['python inheritance.py'],
    },
    'Exception Handling': {
        details: 'Protect your program from crashes by catching and handling runtime errors gracefully.',
        code: `try:
        value = int(input("Enter number: "))
        print(10 / value)
except ValueError:
        print("Please enter a valid integer")
except ZeroDivisionError:
        print("Cannot divide by zero")`,
        commands: ['python exception_handling.py'],
    },
    'Advanced Python': {
        details: 'Explore lambda expressions and decorators for concise functions and reusable wrappers.',
        code: `def logger(func):
        def wrapper(*args, **kwargs):
                print("Running", func.__name__)
                return func(*args, **kwargs)
        return wrapper

@logger
def square(x):
        return x * x

print(square(5))`,
        commands: ['python advanced_python.py'],
    },
    Comprehensions: {
        details: 'Use list, set, and dictionary comprehensions to create transformed collections in a compact way.',
        code: `numbers = [1, 2, 3, 4, 5]
even_squares = [n * n for n in numbers if n % 2 == 0]
unique_letters = {ch for ch in "python"}
length_map = {word: len(word) for word in ["code", "learn"]}

print(even_squares)
print(unique_letters)
print(length_map)`,
        commands: ['python comprehensions.py'],
    },
    'Iterators & Generators': {
        details: 'Use iterators for one-pass traversal and generators when you want values produced lazily.',
        code: `def even_numbers(limit):
        for n in range(limit):
                if n % 2 == 0:
                        yield n

print(list(even_numbers(6)))`,
        commands: ['python generators.py'],
    },
    'Testing Basics (pytest)': {
        details: 'Write simple tests to verify behavior and catch regressions as code changes.',
        code: `def add(a, b):
        return a + b

def test_add():
        assert add(2, 3) == 5`,
        commands: ['pip install pytest', 'pytest -q'],
    },
    'HTTP APIs & JSON': {
        details: 'Learn how to return, consume, and parse JSON when building API-driven Python apps.',
        code: `from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
        return {"status": "ok"}`,
        commands: ['uvicorn main:app --reload'],
    },
};

function getTopicDetails(title, day) {
    const fromLibrary = topicLibrary[title];
    if (fromLibrary) {
        return fromLibrary;
    }

    const isProject = title.toLowerCase().includes('project');
    if (isProject) {
        return {
            details: 'Build this project by splitting it into small tasks: define inputs, implement logic, test edge cases, then polish output.',
            code: `def main():
        print("Start ${title} for Day ${day}")
        # 1. Plan
        # 2. Build
        # 3. Test

if __name__ == "__main__":
        main()`,
            commands: ['python project.py'],
        };
    }

    return {
        details: 'Use this topic to practice core syntax and problem-solving. Focus on writing clear logic and testing with sample inputs.',
        code: `# Day ${day}: ${title}
print("Practice this topic with at least 3 examples")`,
        commands: ['python practice.py'],
    };
}

export default function PracticeCode({ user }) {
    const [activeTopic, setActiveTopic] = useState(1);
    const learnerName = user?.name || 'Learner';

    const topicCards = useMemo(() => {
        return checklistData.days.map((entry) => ({
            ...entry,
            ...getTopicDetails(entry.title, entry.day),
        }));
    }, []);

    const active = topicCards.find((item) => item.day === activeTopic) || topicCards[0];

    return (
        <section className="practice-root">
            <header className="practice-hero glass-panel-soft">
                <div>
                    <p className="practice-kicker">Practice Workspace</p>
                    <h2>{learnerName}&apos;s Python Topic Guide</h2>
                    <p className="practice-subtitle">
                        Every topic from your checklist includes concept notes, runnable sample code, and useful commands.
                    </p>
                </div>
            </header>

            <div className="practice-layout">
                <aside className="practice-topic-list glass-panel-soft">
                    {topicCards.map((topic) => (
                        <button
                            key={topic.day}
                            type="button"
                            className={`topic-pill ${activeTopic === topic.day ? 'active' : ''}`}
                            onClick={() => setActiveTopic(topic.day)}
                        >
                            <span>Day {topic.day}</span>
                            <strong>{topic.title}</strong>
                        </button>
                    ))}
                </aside>

                <article className="practice-content glass-panel-soft">
                    <div className="content-header">
                        <h3>
                            Day {active.day}: {active.title}
                        </h3>
                        <div className="content-badge">{active.tasks.length} task(s)</div>
                    </div>

                    <p className="topic-details">{active.details}</p>

                    <div className="topic-section">
                        <h4>Checklist Tasks</h4>
                        <ul>
                            {active.tasks.map((task) => (
                                <li key={task.text}>{task.text}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="topic-section">
                        <h4>Example Code</h4>
                        <pre>
                            <code>{active.code}</code>
                        </pre>
                    </div>

                    <div className="topic-section">
                        <h4>Commands</h4>
                        <div className="command-list">
                            {active.commands.map((command) => (
                                <span key={command}>{command}</span>
                            ))}
                        </div>
                    </div>

                </article>
            </div>
        </section>
    );
}