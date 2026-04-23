import checklistData from '../Checklist/checklist.json';
import './Dashboard.css';

function Dashboard({ user }) {
  const userName = user?.name || 'Learner';
  const totalDays = checklistData.days.length;
  const totalTasks = checklistData.days.reduce((count, day) => count + day.tasks.length, 0);
  const bonusTopics = checklistData.supplementalTopics || [];
  const quickStats = [
    { label: 'Learning Streak', value: `${Math.min(12, totalDays)} Days`, tone: 'sky' },
    { label: 'Tasks In Curriculum', value: String(totalTasks), tone: 'green' },
    { label: 'Bonus Topics Added', value: String(bonusTopics.length), tone: 'amber' },
    {
      label: 'Project Days',
      value: String(checklistData.days.filter((day) => day.title.toLowerCase().includes('project')).length),
      tone: 'violet',
    },
  ];
  const activity = checklistData.days.slice(0, 4).map((day) => `Day ${day.day}: ${day.title}`);

  return (
    <section className="dashboard-root">
      <div className="dashboard-hero glass-panel-soft">
        <p className="dashboard-kicker">Welcome back</p>
        <h2>{userName}, your learning path is on track</h2>
        <p>
          Keep momentum strong by finishing today&apos;s checklist and reviewing one concept from
          yesterday.
        </p>
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
            <li>Complete one coding practice session</li>
            <li>Update your checklist progress</li>
            <li>Prepare tomorrow&apos;s study plan</li>
            <li>Review one bonus topic from the curriculum</li>
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