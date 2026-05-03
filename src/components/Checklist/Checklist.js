import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchChecklistDays,
  fetchQuizBankData,
  selectChecklistDays,
  selectQuizBankData,
} from '../../store/pythonLearnSlice';
import './Checklist.css';
import { checkAnswers } from '../../services/python_learn_api';

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
  return previousDay?.tasks?.every((task) => task.done_default) ?? false;
}

export default function Checklist({ user }) {
  const dispatch = useDispatch();
  const checklistDays = useSelector(selectChecklistDays);
  const quizBankData = useSelector(selectQuizBankData);
  const days = checklistDays;
  const [quizState, setQuizState] = useState({
    open: false,
    dayIndex: -1,
    taskIndex: -1,
    taskId: '',
    taskText: '',
    topicId: '',
    topicTitle: '',
    subtopicId: '',
    subtopicTitle: '',
    questions: [],
    answers: ['', '', ''],
    revealedAnswers: {},
    error: '',
    isSubmitting: false,
  });
  const [taskToggleLoading, setTaskToggleLoading] = useState({});

  useEffect(() => {
    dispatch(fetchChecklistDays());
    dispatch(fetchQuizBankData());
  }, [dispatch]);

  useEffect(() => {
    const handleFocus = () => dispatch(fetchChecklistDays({ force: true }));
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  const summary = useMemo(() => {
    const totalTasks = checklistDays.reduce((count, day) => count + day.tasks.length, 0);
    const doneTasks = checklistDays.reduce(
      (count, day) => count + day.tasks.filter((task) => task.done_default).length,
      0
    );

    return {
      totalTasks,
      doneTasks,
      pendingTasks: totalTasks - doneTasks,
      progress: totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }, [checklistDays]);

  const closeQuizModal = () => {
    setQuizState({
      open: false,
      dayIndex: -1,
      taskIndex: -1,
      taskId: '',
      taskText: '',
      topicId: '',
      topicTitle: '',
      subtopicId: '',
      subtopicTitle: '',
      questions: [],
      answers: ['', '', ''],
      revealedAnswers: {},
      error: '',
      isSubmitting: false,
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

  const handleQuizSubmit = async (event) => {
    event.preventDefault();

    setQuizState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: '',
    }));

    try {
      const answersPayload = quizState.questions.map((question, index) => ({
        id: question.id,
        answer: quizState.answers[index],
        topicId: quizState.topicId,
        subtopicId: quizState.subtopicId,
      }));

      const response = await checkAnswers(answersPayload);

      if (response?.data?.success || response?.data?.correct) {
        dispatch(fetchChecklistDays({ force: true }));
        closeQuizModal();
      } else {
        setQuizState((prev) => ({
          ...prev,
          error: response?.data?.message || 'Some answers are incorrect. Please try again.',
          isSubmitting: false,
        }));
      }
    } catch (error) {
      setQuizState((prev) => ({
        ...prev,
        error: error.message || 'Unable to verify answers. Please try again.',
        isSubmitting: false,
      }));
    }
  };

  const handleTaskToggle = async (dayIndex, taskIndex,  topicId, subtopicId) => {
    console.log(topicId, subtopicId)
    if (!isDayUnlocked(days, dayIndex)) {
      return;
    }

    const task = days[dayIndex].tasks[taskIndex];
    if (!task?.id) {
      return;
    }

    setTaskToggleLoading((prev) => ({ ...prev, [task.id]: true }));

    try {
      const response = await checkAnswers([
        {
          id: task.id,
          answer: '',
          topicId: topicId,
          subtopicId: subtopicId,
        },
      ]);

      if (response?.data?.success || response?.data?.correct || response?.status === 200) {
        dispatch(fetchChecklistDays({ force: true }));
      } else {
        throw new Error(response?.data?.message || 'Unable to update task status.');
      }
    } catch (error) {
      setQuizState((prev) => ({
        ...prev,
        error: error.message || 'Unable to update task status. Please try again.',
      }));
    } finally {
      setTaskToggleLoading((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }
  };

  const updateTask = (dayIndex, taskIndex, topicId, subtopicId) => {
    if (!isDayUnlocked(days, dayIndex)) {
      return;
    }

    const task = checklistDays[dayIndex].tasks[taskIndex];

    if (task.done_default) {
      handleTaskToggle(dayIndex, taskIndex, topicId, subtopicId);
      return;
    }

    const questions = buildTaskQuiz(task, days[dayIndex], quizBankData);

    setQuizState({
      open: true,
      dayIndex,
      taskIndex,
      taskId: task.id || '',
      taskText: task.text,
      topicId: task.topicId || questions[0]?.topicId || '',
      topicTitle: questions[0]?.topicTitle || '',
      subtopicId: task.subtopicId || questions[0]?.subtopicId || '',
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
        <h2>{userName}&apos;s {checklistDays.length} Day Learning Checklist</h2>
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

      {checklistDays.map((day, i) => (
        <DayItem
          key={i}
          day={day}
          dayIndex={i}
          updateTask={updateTask}
          taskToggleLoading={taskToggleLoading}
          isLocked={!isDayUnlocked(checklistDays, i)}
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
          isSubmitting={quizState.isSubmitting}
          onAnswerChange={handleQuizAnswerChange}
          onToggleAnswer={toggleQuizAnswer}
          onClose={closeQuizModal}
          onSubmit={handleQuizSubmit}
        />
      )}

    </section>
  );
}

function DayItem({ day, dayIndex, updateTask, taskToggleLoading, isLocked }) {
  const doneCount = day.tasks.filter((task) => task.done_default).length;
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
            className={`task-item ${task.done_default ? 'done' : ''}`}
            key={`${day.day}-${i}`}
          >
            <label className="task-main">
              <input
                type="checkbox"
                checked={task.done_default}
                onChange={() => updateTask(dayIndex, i, day.id, task.id )}
                disabled={isLocked || Boolean(taskToggleLoading[task.id])}
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
  isSubmitting,
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
            <button type="button" className="quiz-btn secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="quiz-btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify & Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}