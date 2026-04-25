import { apiClient } from './api';

function normalizeTask(task) {
	return {
		text: task?.text || task?.task_text || '',
		done: Boolean(task?.done ?? task?.done_default ?? false),
	};
}

function normalizeExtraTopic(topic) {
	return {
		title: topic?.title || '',
		details: topic?.details || '',
		question: topic?.question || '',
		answer: topic?.answer || '',
		code: topic?.code || '',
		command: topic?.command || '',
	};
}

function normalizeChecklistDay(day) {
	const tasks = day?.tasks || day?.checklist_tasks || [];
	const extraTopics = day?.extraTopics || day?.extra_topics || [];

	return {
		day: Number(day?.day ?? day?.day_number ?? 0),
		title: day?.title || '',
		tasks: Array.isArray(tasks) ? tasks.map(normalizeTask) : [],
		extraTopics: Array.isArray(extraTopics) ? extraTopics.map(normalizeExtraTopic) : [],
	};
}

function normalizeChecklistPayload(payload) {
	const candidates =
		payload?.days ||
		payload?.results ||
		payload?.data ||
		payload;

	const list = Array.isArray(candidates) ? candidates : [];
	return list
		.map(normalizeChecklistDay)
		.filter((day) => day.day > 0 && day.title && day.tasks.length > 0)
		.sort((a, b) => a.day - b.day);
}

export async function getChecklistDays() {
	const response = await apiClient.get('/pythonlearn/ChecklistDay');
	return normalizeChecklistPayload(response.data);
}

function normalizeMenuItem(item) {
	return {
		label: item?.label || item?.menu_name || item?.name || '',
		path: item?.path || item?.menu_path || item?.url || '',
		iconKey: item?.iconKey || item?.icon_key || item?.icon || 'LayoutDashboard',
	};
}

function normalizeMenuPayload(payload) {
	const menuCandidates = payload?.menuItems || payload?.menus || payload?.results || payload?.data || payload;
	const menuItems = Array.isArray(menuCandidates)
		? menuCandidates.map(normalizeMenuItem).filter((item) => item.label && item.path)
		: [];

	return {
		brand: payload?.brand || payload?.title || payload?.app_name || 'Learning Hub',
		footer: payload?.footer || payload?.footer_text || 'Track your progress daily',
		menuItems,
	};
}

export async function getSidebarMenuList() {
	const response = await apiClient.get('/pythonlearn/menu-list');
	return normalizeMenuPayload(response.data);
}

function normalizeInterviewTopicEntry(entry) {
	return {
		question: entry?.question || '',
		answer: entry?.answer || entry?.explanation || '',
		code: entry?.code || '',
	};
}

function normalizeInterviewCommand(command) {
	return {
		label: command?.label || command?.name || '',
		command: command?.command || command?.value || '',
	};
}

function normalizeInterviewQAPayload(payload) {
	const topicMapSource = payload?.topicMap || payload?.topic_map || payload?.topics || {};
	const starterCommandsSource = payload?.starterCommands || payload?.starter_commands || payload?.commands || [];
	const topicMap = Object.entries(topicMapSource).reduce((acc, [topicName, topicValue]) => {
		if (!topicName) {
			return acc;
		}

		acc[topicName] = normalizeInterviewTopicEntry(topicValue);
		return acc;
	}, {});

	const starterCommands = Array.isArray(starterCommandsSource)
		? starterCommandsSource.map(normalizeInterviewCommand).filter((item) => item.label && item.command)
		: [];

	return {
		topicMap,
		starterCommands,
	};
}

export async function getInterviewQAData() {
	const response = await apiClient.get('/pythonlearn/interview-qa');
	return normalizeInterviewQAPayload(response.data);
}

function normalizePracticeTopicEntry(entry) {
	const commandsSource = entry?.commands || entry?.command_list || entry?.command || [];
	const commands = Array.isArray(commandsSource)
		? commandsSource
		: typeof commandsSource === 'string' && commandsSource
			? [commandsSource]
			: [];

	return {
		details: entry?.details || entry?.description || '',
		code: entry?.code || entry?.sample_code || '',
		commands: commands.filter(Boolean),
	};
}

function normalizePracticeTopicsPayload(payload) {
	const topicsSource = payload?.topics || payload?.topic_map || payload?.results || payload?.data || {};

	if (Array.isArray(topicsSource)) {
		return topicsSource.reduce((acc, item) => {
			const key = item?.title || item?.name || '';
			if (!key) {
				return acc;
			}

			acc[key] = normalizePracticeTopicEntry(item);
			return acc;
		}, {});
	}

	if (topicsSource && typeof topicsSource === 'object') {
		return Object.entries(topicsSource).reduce((acc, [key, value]) => {
			if (!key) {
				return acc;
			}

			acc[key] = normalizePracticeTopicEntry(value);
			return acc;
		}, {});
	}

	return {};
}

export async function getPracticeTopicsData() {
	const response = await apiClient.get('/pythonlearn/practice-topics');
	return normalizePracticeTopicsPayload(response.data);
}

function normalizeQuizQuestion(question) {
	const acceptedPhrasesSource = question?.acceptedPhrases || question?.accepted_phrases || [];

	return {
		id: question?.id || '',
		prompt: question?.prompt || question?.question || '',
		answer: question?.answer || question?.explanation || '',
		acceptedPhrases: Array.isArray(acceptedPhrasesSource) ? acceptedPhrasesSource.filter(Boolean) : [],
	};
}

function normalizeQuizSubtopic(subtopic) {
	const matchersSource = subtopic?.matchers || subtopic?.keywords || [];
	const questionsSource = subtopic?.questions || subtopic?.quiz_questions || [];

	return {
		id: subtopic?.id || '',
		title: subtopic?.title || subtopic?.name || '',
		matchers: Array.isArray(matchersSource) ? matchersSource.filter(Boolean) : [],
		googleQuery: subtopic?.googleQuery || subtopic?.google_query || '',
		questions: Array.isArray(questionsSource) ? questionsSource.map(normalizeQuizQuestion) : [],
	};
}

function normalizeQuizTopic(topic) {
	const keywordsSource = topic?.keywords || topic?.tags || [];
	const subtopicsSource = topic?.subtopics || topic?.children || [];

	return {
		id: topic?.id || '',
		title: topic?.title || topic?.name || '',
		keywords: Array.isArray(keywordsSource) ? keywordsSource.filter(Boolean) : [],
		subtopics: Array.isArray(subtopicsSource) ? subtopicsSource.map(normalizeQuizSubtopic) : [],
	};
}

function normalizeQuizBankPayload(payload) {
	const topicCandidates = payload?.topics || payload?.results || payload?.data || payload;
	const topics = Array.isArray(topicCandidates) ? topicCandidates.map(normalizeQuizTopic) : [];

	return {
		topics: topics.filter((topic) => topic.id || topic.title),
	};
}

export async function getQuizBankData() {
	const response = await apiClient.get('/pythonlearn/quiz-bank');
	return normalizeQuizBankPayload(response.data);
}

