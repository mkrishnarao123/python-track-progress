import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchChecklistDays,
  fetchInterviewQAData,
  selectChecklistDays,
  selectInterviewQAData,
} from '../../store/pythonLearnSlice';
import './InterviewQA.css';

const EMPTY_INTERVIEW_DATA = {
  topicMap: {},
  starterCommands: [],
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

function getTopicContent(topic, topicInterviewMap) {
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

export default function InterviewQA({ user }) {
  const dispatch = useDispatch();
  const checklistDays = useSelector(selectChecklistDays);
  const interviewData = useSelector(selectInterviewQAData) || EMPTY_INTERVIEW_DATA;
  const [activeDay, setActiveDay] = useState(1);
  const learnerName = user?.name || 'Learner';

  useEffect(() => {
    dispatch(fetchChecklistDays());
    dispatch(fetchInterviewQAData());
  }, [dispatch]);

  useEffect(() => {
    if (checklistDays.length > 0 && !checklistDays.some((item) => item.day === activeDay)) {
      setActiveDay(checklistDays[0].day);
    }
  }, [checklistDays, activeDay]);

  const topics = useMemo(() => {
    const topicMap = interviewData?.topicMap || {};
    return checklistDays.map((topic) => getTopicContent(topic, topicMap));
  }, [checklistDays, interviewData]);

  const starterCommands = interviewData?.starterCommands || [];
  const activeTopic = topics.find((topic) => topic.day === activeDay) || topics[0];

  if (!activeTopic) {
    return (
      <section className="interview-root">
        <header className="interview-hero glass-panel-soft">
          <p className="interview-kicker">Interview Questions & Answers</p>
          <h2>{learnerName}&apos;s Python Interview Prep Board</h2>
          <p>No checklist data available from API.</p>
        </header>
      </section>
    );
  }

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
