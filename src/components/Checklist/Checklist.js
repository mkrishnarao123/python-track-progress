import React, { useEffect, useMemo, useState } from 'react';
import data from './checklist.json';
import './Checklist.css';

export default function Checklist({ user }) {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('checklist');
    if (saved) {
      const savedDays = JSON.parse(saved);
      const mergedDays = data.days.map((day) => {
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
    } else {
      setDays(data.days);
    }
  }, []);

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

  const updateTask = (dayIndex, taskIndex) => {
    const updated = [...days];
    updated[dayIndex].tasks[taskIndex].done =
      !updated[dayIndex].tasks[taskIndex].done;

    setDays(updated);
    localStorage.setItem('checklist', JSON.stringify(updated));
  };

  const userName = user?.name || 'Learner';

  return (
    <section className="checklist-root">
      <div className="checklist-header glass-panel-soft">
        <h2>{userName}&apos;s {data.days.length} Day Learning Checklist</h2>
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
        <DayItem key={i} day={day} dayIndex={i} updateTask={updateTask} />
      ))}

    </section>
  );
}

function DayItem({ day, dayIndex, updateTask }) {
  const doneCount = day.tasks.filter((task) => task.done).length;
  const dayProgress = Math.round((doneCount / day.tasks.length) * 100);

  return (
    <article className="day-card glass-panel-soft">
      <div className="day-header">
        <h3>
          Day {day.day}: {day.title}
        </h3>
        <span>{dayProgress}% done</span>
      </div>

      <div className="progress-wrap small" aria-label={`Progress for day ${day.day}`}>
        <div className="progress-bar" style={{ width: `${dayProgress}%` }} />
      </div>

      <div className="task-list">
        {day.tasks.map((task, i) => (
          <label
            className={`task-item ${task.done ? 'done' : ''}`}
            key={`${day.day}-${i}`}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => updateTask(dayIndex, i)}
            />
            <span>{task.text}</span>
          </label>
        ))}
      </div>

    </article>
  );
}