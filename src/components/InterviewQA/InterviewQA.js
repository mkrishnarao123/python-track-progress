import { useMemo, useState } from 'react';
import checklistData from '../Checklist/checklist.json';
import './InterviewQA.css';

const topicInterviewMap = {
  'Setup & Basics': {
    question: 'How do you set up Python development quickly?',
    answer:
      'Install Python, verify installation, create a virtual environment, and use VS Code with the Python extension. This gives isolated dependencies and cleaner project structure.',
    code: `# verify installation
import sys
print(sys.version)`
  },
  'Variables & Data Types': {
    question: 'What are core Python data types and when would you use them?',
    answer:
      'Use int/float for numbers, str for text, bool for flags, list for ordered mutable data, tuple for fixed ordered data, set for unique values, and dict for key-value structures.',
    code: `name = "Krishna"
age = 24
is_active = True
print(type(name), type(age), type(is_active))`
  },
  'Input/Output': {
    question: 'How do you safely read input and produce clean output?',
    answer:
      'Read with input(), convert with explicit casting, and wrap risky conversions in try/except. Format output using f-strings for readability.',
    code: `try:
    age = int(input("Age: "))
    print(f"Next year: {age + 1}")
except ValueError:
    print("Please enter a valid number")`
  },
  Operators: {
    question: 'Difference between == and is?',
    answer:
      '== compares values, while is compares object identity in memory. Use == for business logic comparisons.',
    code: `a = [1, 2]
b = [1, 2]
print(a == b)  # True
print(a is b)  # False`
  },
  'If Conditions': {
    question: 'How do if/elif/else branches execute?',
    answer:
      'Python evaluates branches top-to-bottom and executes the first true condition, then skips remaining branches.',
    code: `score = 81
if score >= 90:
    print("A")
elif score >= 75:
    print("B")
else:
    print("C")`
  },
  'For Loop': {
    question: 'When would you use for loop over while loop?',
    answer:
      'Use for when iterating over a known sequence or fixed range. Use while for unknown repetition controlled by condition.',
    code: `for i in range(1, 4):
    print(i)`
  },
  'While Loop': {
    question: 'How do break and continue affect loops?',
    answer:
      'break exits the loop completely; continue skips current iteration and proceeds to the next cycle.',
    code: `n = 0
while n < 5:
    n += 1
    if n == 3:
        continue
    print(n)`
  },
  Lists: {
    question: 'Why are lists so common in Python coding interviews?',
    answer:
      'Lists are flexible and support indexing, slicing, and powerful methods. Many interview problems revolve around list traversal and transformation.',
    code: `nums = [1, 2, 3]
nums.append(4)
print(nums[1:3])`
  },
  Dictionaries: {
    question: 'Why use dict over list for lookups?',
    answer:
      'Dictionary lookup is typically O(1), making it better for frequent key-based retrieval than scanning lists.',
    code: `user = {"id": 101, "name": "Anu"}
print(user.get("name"))`
  },
  Functions: {
    question: 'What makes a function interview-friendly?',
    answer:
      'Small, single-purpose functions with clear names, parameters, and return values are easier to test and discuss in interviews.',
    code: `def square(n):
    return n * n

print(square(6))`
  },
  'File Handling': {
    question: 'Why is with open(...) preferred?',
    answer:
      'Context managers ensure files close properly even if exceptions occur, preventing leaks and corrupted writes.',
    code: `with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Hello")`
  },
  'OOP Basics': {
    question: 'What are class and object in Python?',
    answer:
      'A class is a blueprint and an object is its instance with actual data. OOP helps model real-world behavior cleanly.',
    code: `class Car:
    def __init__(self, name):
        self.name = name

car = Car("Tesla")
print(car.name)`
  },
  Inheritance: {
    question: 'What is the benefit of inheritance?',
    answer:
      'Inheritance enables code reuse and hierarchy modeling by extending existing behavior in child classes.',
    code: `class Animal:
    def speak(self):
        return "sound"

class Dog(Animal):
    def speak(self):
        return "bark"`
  },
  'Exception Handling': {
    question: 'What is the purpose of exception handling?',
    answer:
      'It keeps your program stable by handling expected runtime failures gracefully and providing fallback behavior.',
    code: `try:
    result = 10 / 0
except ZeroDivisionError:
    print("Cannot divide by zero")`
  },
  Comprehensions: {
    question: 'Why are comprehensions considered idiomatic Python?',
    answer:
      'They produce lists, sets, and dictionaries in a compact form and are often clearer than manual loops for simple transforms.',
    code: `numbers = [1, 2, 3, 4]\nsquares = [n * n for n in numbers]\nunique = {ch for ch in "python"}`,
  },
  'Iterators & Generators': {
    question: 'What is the difference between an iterator and a generator?',
    answer:
      'An iterator is any object that yields values one at a time; a generator is a convenient way to create one with yield.',
    code: `def count_up_to(limit):\n    for n in range(limit):\n        yield n`,
  },
  'Testing Basics (pytest)': {
    question: 'How do tests improve Python code quality?',
    answer:
      'Tests give fast feedback, protect existing behavior, and make refactoring safer by catching regressions early.',
    code: `def add(a, b):\n    return a + b\n\ndef test_add():\n    assert add(2, 3) == 5`,
  },
  'HTTP APIs & JSON': {
    question: 'How should you return JSON from a Python API?',
    answer:
      'Return dictionaries or model objects with clear keys so the framework can serialize them into JSON cleanly.',
    code: `from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/health")\ndef health():\n    return {"status": "ok"}`,
  },
};

function getSubtopicContent(taskText, day, title) {
  return {
    question: `How would you explain or implement: ${taskText}?`,
    explanation:
      `${taskText} is part of Day ${day} (${title}). In interviews, explain purpose first, then show a short implementation and edge-case handling.`,
    code: `# Day ${day} - ${taskText}
print("Practice: ${taskText}")`,
    commands: ['python practice.py'],
  };
}

function getTopicContent(topic) {
  const base = topicInterviewMap[topic.title] || {
    question: `What should you know for ${topic.title}?`,
    answer:
      `${topic.title} should be explained using definition, where it is used, complexity/behavior, and one clean code example.`,
    code: `# ${topic.title}
print("Explain concept and solve one example")`,
  };

  const subtopics = topic.tasks.map((task) => ({
    task: task.text,
    ...getSubtopicContent(task.text, topic.day, topic.title),
  }));

  return {
    ...topic,
    ...base,
    subtopics,
  };
}

const starterCommands = [
  {
    label: 'Create Project Folder',
    command: 'mkdir fastapi-project && cd fastapi-project',
  },
  {
    label: 'Create Virtual Environment',
    command: 'python -m venv .venv',
  },
  {
    label: 'Activate Venv (Windows)',
    command: '.venv\\Scripts\\activate',
  },
  {
    label: 'Install FastAPI + Uvicorn',
    command: 'pip install fastapi uvicorn',
  },
  {
    label: 'Start Server',
    command: 'uvicorn main:app --reload',
  },
];

export default function InterviewQA({ user }) {
  const [activeDay, setActiveDay] = useState(1);
  const learnerName = user?.name || 'Learner';

  const topics = useMemo(() => checklistData.days.map((topic) => getTopicContent(topic)), []);
  const activeTopic = topics.find((topic) => topic.day === activeDay) || topics[0];

  return (
    <section className="interview-root">
      <header className="interview-hero glass-panel-soft">
        <p className="interview-kicker">Interview Questions & Answers</p>
        <h2>{learnerName}&apos;s Python Interview Prep Board</h2>
        <p>
          Covers all checklist topics and subtopics with interview-focused explanation, examples,
          and practical commands.
        </p>
      </header>

      <section className="command-strip glass-panel-soft">
        <h3>Quick Start Commands</h3>
        <div className="command-grid">
          {starterCommands.map((item) => (
            <article key={item.label} className="command-card">
              <span>{item.label}</span>
              <code>{item.command}</code>
            </article>
          ))}
        </div>
      </section>

      <div className="interview-layout">
        <aside className="day-list glass-panel-soft">
          {topics.map((topic) => (
            <button
              key={topic.day}
              type="button"
              className={`day-item ${activeDay === topic.day ? 'active' : ''}`}
              onClick={() => setActiveDay(topic.day)}
            >
              <span>Day {topic.day}</span>
              <strong>{topic.title}</strong>
            </button>
          ))}
        </aside>

        <article className="qa-content glass-panel-soft">
          <h3>
            Day {activeTopic.day}: {activeTopic.title}
          </h3>

          <div className="qa-block">
            <h4>Main Interview Question</h4>
            <p className="question">{activeTopic.question}</p>
            <p>{activeTopic.answer}</p>
            <pre>
              <code>{activeTopic.code}</code>
            </pre>
          </div>

          <div className="qa-block">
            <h4>Subtopic Questions & Answers</h4>
            <div className="subtopic-grid">
              {activeTopic.subtopics.map((item) => (
                <article key={item.task} className="subtopic-card">
                  <h5>{item.task}</h5>
                  <p className="question">{item.question}</p>
                  <p>{item.explanation}</p>
                  <pre>
                    <code>{item.code}</code>
                  </pre>
                  <div className="mini-command-list">
                    {item.commands.map((cmd) => (
                      <code key={cmd}>{cmd}</code>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </article>
      </div>

    </section>
  );
}
