import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchChecklistDays,
  fetchQuizBankData,
  selectChecklistDays,
  selectQuizBankData,
} from '../../store/pythonLearnSlice';
import './Checklist.css';

function getTaskLearningLink(task) {
  if (task.link) {
    return task.link;
  }

  const query = encodeURIComponent(`python ${task.text} tutorial`);
  return `https://www.youtube.com/results?search_query=${query}`;
}

function getTaskReadLink(task) {
  const query = encodeURIComponent(`python ${task.text}`);
  return `https://www.google.com/search?q=${query}`;
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function getGoogleSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function getBestQuizMatch(task, day, quizBankData) {
  const context = normalizeText(`${task.text} ${day.title}`);
  const topics = quizBankData?.topics || [];

  let bestTopic = null;
  let bestSubtopic = null;
  let maxScore = -1;

  topics.forEach((topic) => {
    (topic.subtopics || []).forEach((subtopic) => {
      const matchers = [subtopic.title, ...(subtopic.matchers || []), ...(topic.keywords || [])]
        .filter(Boolean)
        .map((item) => normalizeText(item));

      let score = 0;

      matchers.forEach((matcher) => {
        if (context.includes(matcher)) {
          score += matcher === normalizeText(subtopic.title) ? 3 : 1;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestTopic = topic;
        bestSubtopic = subtopic;
      }
    });
  });

  if (bestTopic && bestSubtopic && maxScore > 0) {
    return { topic: bestTopic, subtopic: bestSubtopic };
  }

  const fallbackTopic = topics.find((topic) => topic.id === 'general') || topics[0];
  const fallbackSubtopic = fallbackTopic?.subtopics?.[0] || null;

  return {
    topic: fallbackTopic,
    subtopic: fallbackSubtopic,
  };
}

function doesPhraseMatch(userAnswer, phrase) {
  const normalizedAnswer = normalizeText(userAnswer);
  const normalizedPhrase = normalizeText(phrase);

  if (!normalizedAnswer || !normalizedPhrase) {
    return false;
  }

  if (
    normalizedAnswer.includes(normalizedPhrase) ||
    normalizedPhrase.includes(normalizedAnswer)
  ) {
    return true;
  }

  const answerTokens = tokenize(normalizedAnswer);
  const phraseTokens = tokenize(normalizedPhrase);

  if (!answerTokens.length || !phraseTokens.length) {
    return false;
  }

  const overlap = phraseTokens.filter((token) => answerTokens.includes(token)).length;
  const coverage = overlap / phraseTokens.length;

  return coverage >= 0.45 || overlap >= 2;
}

function isAnswerCorrect(question, userAnswer) {
  const accepted = [
    ...(question.acceptedPhrases || []),
    question.answer,
  ].filter(Boolean);

  return accepted.some((phrase) => doesPhraseMatch(userAnswer, phrase));
}

function buildTaskQuiz(task, day, quizBankData) {
  const match = getBestQuizMatch(task, day, quizBankData);
  const topic = match.topic;
  const subtopic = match.subtopic;
  const sourceUrl = getGoogleSearchUrl(subtopic?.googleQuery || topic?.googleQuery || `python ${task.text}`);

  return (subtopic?.questions || topic?.questions || []).slice(0, 3).map((question) => ({
    ...question,
    sourceUrl,
    topicId: topic?.id,
    topicTitle: topic?.title || topic?.id || 'Topic',
    subtopicId: subtopic?.id,
    subtopicTitle: subtopic?.title || subtopic?.id || topic?.title || 'Subtopic',
  }));
}

function isDayUnlocked(days, dayIndex) {
  if (dayIndex === 0) {
    return true;
  }

  const previousDay = days[dayIndex - 1];
  return previousDay?.tasks?.every((task) => task.done) ?? false;
}

export default function Checklist({ user }) {
  const dispatch = useDispatch();
  const checklistDays = useSelector(selectChecklistDays);
  const quizBankData = useSelector(selectQuizBankData);
  const [days, setDays] = useState([]);
  const [quizState, setQuizState] = useState({
    open: false,
    dayIndex: -1,
    taskIndex: -1,
    taskText: '',
    topicId: '',
    topicTitle: '',
    subtopicId: '',
    subtopicTitle: '',
    questions: [],
    answers: ['', '', ''],
    revealedAnswers: {},
    error: '',
  });

  useEffect(() => {
    dispatch(fetchChecklistDays());
    dispatch(fetchQuizBankData());
  }, [dispatch]);

  useEffect(() => {
      const sourceDays = checklistDays;
      const saved = localStorage.getItem('checklist');
      if (!saved) {
        setDays(sourceDays);
        return;
      }

      let savedDays = [];
      try {
        savedDays = JSON.parse(saved);
      } catch {
        savedDays = [];
      }

      const mergedDays = sourceDays.map((day) => {
        const savedDay = savedDays.find((item) => item.day === day.day);

        if (!savedDay) {
          return day;
        }

        return {
          ...day,
          tasks: day.tasks.map((task, taskIndex) => ({
            ...task,
            done: Boolean(savedDay.tasks?.[taskIndex]?.done),
          })),
        };
      });

      setDays(mergedDays);
  }, [checklistDays]);

  const summary = useMemo(() => {
    const totalTasks = days.reduce((count, day) => count + day.tasks.length, 0);
    const doneTasks = days.reduce(
      (count, day) => count + day.tasks.filter((task) => task.done).length,
      0
    );

    return {
      totalTasks,
      doneTasks,
      pendingTasks: totalTasks - doneTasks,
      progress: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }, [days]);

  const setTaskStatus = (dayIndex, taskIndex, done) => {
    setDays((prevDays) => {
      const updated = [...prevDays];
      const targetDay = updated[dayIndex];

      updated[dayIndex] = {
        ...targetDay,
        tasks: targetDay.tasks.map((task, index) =>
          index === taskIndex ? { ...task, done } : task
        ),
      };

      localStorage.setItem('checklist', JSON.stringify(updated));
      return updated;
    });
  };

  const closeQuizModal = () => {
    setQuizState({
      open: false,
      dayIndex: -1,
      taskIndex: -1,
      taskText: '',
      topicId: '',
      topicTitle: '',
      subtopicId: '',
      subtopicTitle: '',
      questions: [],
      answers: ['', '', ''],
      revealedAnswers: {},
      error: '',
    });
  };

  const handleQuizAnswerChange = (index, value) => {
    setQuizState((prev) => {
      const answers = [...prev.answers];
      answers[index] = value;
      return {
        ...prev,
        answers,
        error: '',
      };
    });
  };

  const toggleQuizAnswer = (questionId) => {
    setQuizState((prev) => ({
      ...prev,
      revealedAnswers: {
        ...prev.revealedAnswers,
        [questionId]: !prev.revealedAnswers[questionId],
      },
    }));
  };

  const handleQuizSubmit = (event) => {
    event.preventDefault();

    const allCorrect = quizState.questions.every((question, index) => {
      const answer = quizState.answers[index];
      return isAnswerCorrect(question, answer);
    });

    if (!allCorrect) {
      setQuizState((prev) => ({
        ...prev,
        error: 'Some answers are incorrect. Please try again.',
      }));
      return;
    }

    setTaskStatus(quizState.dayIndex, quizState.taskIndex, true);
    closeQuizModal();
  };

  const updateTask = (dayIndex, taskIndex) => {
    if (!isDayUnlocked(days, dayIndex)) {
      return;
    }

    const task = days[dayIndex].tasks[taskIndex];

    if (task.done) {
      setTaskStatus(dayIndex, taskIndex, false);
      return;
    }

    const questions = buildTaskQuiz(task, days[dayIndex], quizBankData);

    setQuizState({
      open: true,
      dayIndex,
      taskIndex,
      taskText: task.text,
      topicId: questions[0]?.topicId || '',
      topicTitle: questions[0]?.topicTitle || '',
      subtopicId: questions[0]?.subtopicId || '',
      subtopicTitle: questions[0]?.subtopicTitle || '',
      questions,
      answers: ['', '', ''],
      revealedAnswers: {},
      error: '',
    });
  };

  const userName = user?.name || 'Learner';

  return (
    <section className="checklist-root">
      <div className="checklist-header glass-panel-soft">
        <h2>{userName}&apos;s {days.length} Day Learning Checklist</h2>
        <p>Mark your completed tasks and keep your streak going.</p>
      </div>

      <div className="checklist-summary">
        <article className="summary-card glass-panel-soft">
          <span>Total Tasks</span>
          <strong>{summary.totalTasks}</strong>
        </article>
        <article className="summary-card glass-panel-soft">
          <span>Completed</span>
          <strong>{summary.doneTasks}</strong>
        </article>
        <article className="summary-card glass-panel-soft">
          <span>Pending</span>
          <strong>{summary.pendingTasks}</strong>
        </article>
        <article className="summary-card glass-panel-soft">
          <span>Progress</span>
          <strong>{summary.progress}%</strong>
        </article>
      </div>

      <div className="progress-wrap" aria-label="Overall progress">
        <div className="progress-bar" style={{ width: `${summary.progress}%` }} />
      </div>

      {days.map((day, i) => (
        <DayItem
          key={i}
          day={day}
          dayIndex={i}
          updateTask={updateTask}
          isLocked={!isDayUnlocked(days, i)}
        />
      ))}

      {quizState.open && (
        <QuizModal
          taskText={quizState.taskText}
          topicId={quizState.topicId}
          topicTitle={quizState.topicTitle}
          subtopicId={quizState.subtopicId}
          subtopicTitle={quizState.subtopicTitle}
          questions={quizState.questions}
          answers={quizState.answers}
          revealedAnswers={quizState.revealedAnswers}
          error={quizState.error}
          onAnswerChange={handleQuizAnswerChange}
          onToggleAnswer={toggleQuizAnswer}
          onClose={closeQuizModal}
          onSubmit={handleQuizSubmit}
        />
      )}

    </section>
  );
}

function DayItem({ day, dayIndex, updateTask, isLocked }) {
  const doneCount = day.tasks.filter((task) => task.done).length;
  const dayProgress = Math.round((doneCount / day.tasks.length) * 100);

  return (
    <article className={`day-card glass-panel-soft ${isLocked ? 'locked' : ''}`}>
      <div className="day-header">
        <h3>
          Day {day.day}: {day.title}
        </h3>
        <span>{dayProgress}% done</span>
      </div>

      {isLocked && (
        <p className="day-lock-note">Complete all tasks from the previous day to unlock this day.</p>
      )}

      <div className="progress-wrap small" aria-label={`Progress for day ${day.day}`}>
        <div className="progress-bar" style={{ width: `${dayProgress}%` }} />
      </div>

      <div className="task-list">
        {day.tasks.map((task, i) => (
          <div
            className={`task-item ${task.done ? 'done' : ''}`}
            key={`${day.day}-${i}`}
          >
            <label className="task-main">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => updateTask(dayIndex, i)}
                disabled={isLocked}
              />
              <span>{task.text}</span>
            </label>
            <div className="task-links">
              <a
                className="task-link"
                href={getTaskLearningLink(task)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn
              </a>
              <a
                className="task-link read"
                href={getTaskReadLink(task)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read
              </a>
            </div>
          </div>
        ))}
      </div>

    </article>
  );
}

function QuizModal({
  taskText,
  topicId,
  topicTitle,
  subtopicId,
  subtopicTitle,
  questions,
  answers,
  revealedAnswers,
  error,
  onAnswerChange,
  onToggleAnswer,
  onClose,
  onSubmit,
}) {
  return (
    <div className="quiz-backdrop" role="dialog" aria-modal="true" aria-label="Task quiz">
      <div className="quiz-modal glass-panel-soft">
        <h3>Before marking this completed</h3>
        <p className="quiz-task">Task: {taskText}</p>
        {(subtopicTitle || topicTitle || topicId || subtopicId) && (
          <p className="quiz-topic">
            Quiz for: {subtopicTitle || subtopicId || topicTitle || topicId}
          </p>
        )}

        <form onSubmit={onSubmit} className="quiz-form">
          {questions.map((question, index) => (
            <div className="quiz-field" key={question.id}>
              <label>
                <span>{index + 1}. {question.prompt}</span>
                <input
                  type="text"
                  value={answers[index]}
                  onChange={(event) => onAnswerChange(index, event.target.value)}
                  placeholder="Type your answer"
                />
              </label>
              <button
                type="button"
                className="quiz-answer-toggle"
                onClick={() => onToggleAnswer(question.id)}
              >
                {revealedAnswers[question.id] ? 'Hide Answer' : 'Show Answer'}
              </button>

              {revealedAnswers[question.id] && (
                <div className="quiz-answer-box">
                  <p>{question.answer}</p>
                  <a href={question.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Read from Google
                  </a>
                </div>
              )}
            </div>
          ))}

          {error && <p className="quiz-error">{error}</p>}

          <div className="quiz-actions">
            <button type="button" className="quiz-btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="quiz-btn primary">
              Verify & Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}