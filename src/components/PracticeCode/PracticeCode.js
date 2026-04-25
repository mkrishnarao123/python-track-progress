
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchChecklistDays,
    fetchPracticeTopicsData,
    selectChecklistDays,
    selectPracticeTopicsData,
} from '../../store/pythonLearnSlice';
import './PracticeCode.css';

function getTopicDetails(title, day, topicLibrary) {
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
    const dispatch = useDispatch();
    const checklistDays = useSelector(selectChecklistDays);
    const topicLibrary = useSelector(selectPracticeTopicsData);
    const [activeTopic, setActiveTopic] = useState(1);
    const learnerName = user?.name || 'Learner';

    useEffect(() => {
        dispatch(fetchChecklistDays());
        dispatch(fetchPracticeTopicsData());
    }, [dispatch]);

    useEffect(() => {
        if (checklistDays.length > 0 && !checklistDays.some((item) => item.day === activeTopic)) {
            setActiveTopic(checklistDays[0].day);
        }
    }, [checklistDays, activeTopic]);

    const topicCards = useMemo(() => {
        return checklistDays.map((entry) => ({
            ...entry,
            ...getTopicDetails(entry.title, entry.day, topicLibrary),
        }));
    }, [checklistDays, topicLibrary]);

    const active = topicCards.find((item) => item.day === activeTopic) || topicCards[0];

    if (!active) {
        return (
            <section className="practice-root">
                <header className="practice-hero glass-panel-soft">
                    <div>
                        <p className="practice-kicker">Practice Workspace</p>
                        <h2>{learnerName}&apos;s Python Topic Guide</h2>
                        <p className="practice-subtitle">No checklist data available from API.</p>
                    </div>
                </header>
            </section>
        );
    }

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