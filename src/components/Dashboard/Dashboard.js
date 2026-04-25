import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dashboardData from '../JSONFiles/dashboard.json';
import { fetchChecklistDays, selectChecklistDays } from '../../store/pythonLearnSlice';
import './Dashboard.css';

function renderTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function Dashboard({ user }) {
  const dispatch = useDispatch();
  const days = useSelector(selectChecklistDays);

  useEffect(() => {
    dispatch(fetchChecklistDays());
  }, [dispatch]);

  const userName = user?.name || 'Learner';
  const totalDays = days.length;
  const totalTasks = useMemo(
    () => days.reduce((count, day) => count + day.tasks.length, 0),
    [days]
  );
  const bonusTopics = useMemo(
    () => days.flatMap((day) => day.extraTopics || []),
    [days]
  );
  const quickStats = [
    { label: 'Learning Streak', value: `${Math.min(12, totalDays)} Days`, tone: 'sky' },
    { label: 'Tasks In Curriculum', value: String(totalTasks), tone: 'green' },
    { label: 'Bonus Topics Added', value: String(bonusTopics.length), tone: 'amber' },
    {
      label: 'Project Days',
      value: String(days.filter((day) => day.title.toLowerCase().includes('project')).length),
      tone: 'violet',
    },
  ];
  const activity = days.slice(0, 4).map((day) => `Day ${day.day}: ${day.title}`);

  return (
    <section className="dashboard-root">
      <div className="dashboard-hero glass-panel-soft">
        <p className="dashboard-kicker">{dashboardData.hero.kicker}</p>
        <h2>{renderTemplate(dashboardData.hero.title, { userName })}</h2>
        <p>{dashboardData.hero.description}</p>
      </div>

      <div className="dashboard-stats">
        {quickStats.map((item) => (
          <article key={item.label} className={`dashboard-stat-card ${item.tone}`}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card glass-panel-soft">
          <h3>Today&apos;s Focus</h3>
          <ul>
            {dashboardData.todayFocus.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="dashboard-card glass-panel-soft">
          <h3>Recent Activity</h3>
          <ul>
            {activity.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;