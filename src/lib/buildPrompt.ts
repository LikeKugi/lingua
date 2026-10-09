import type {ChatMessage, ExplanationInput, PromptTemplate} from '../types';
import {languageLabel} from '../constants/languages';

export function buildMessages(
  input: ExplanationInput,
  systemPrompt: string,
  promptSuffix: string,
  prompts: PromptTemplate[],
): ChatMessage[] {
  const promptParts = [
    systemPrompt.trim(),
    ...prompts.filter(item => item.enabled).map(item => `${item.title}: ${item.body}`),
    promptSuffix.trim(),
    `Ответ дай структурировано и на языке: ${languageLabel(input.language)}.`,
  ].filter(Boolean);

  const taskDescription =
    input.taskType === 'words'
      ? `Задание: составить предложение из слов: [${(input.task as string[])
          .filter(word => word.trim().length > 0)
          .join(', ')}]`
      : `Задание: исходное предложение — «${String(input.task).trim()}»`;

  const userPrompt = [
    taskDescription,
    `Мой вариант: «${input.userAnswer.trim()}»`,
    `Правильный вариант: «${input.correctAnswer.trim()}»`,
    '',
    'Объясни, в чём именно я ошибся: разбери грамматику, синтаксис и лексику.',
    `Ответ дай структурировано и на языке: ${languageLabel(input.language)}.`,
  ].join('\n');

  return [
    {role: 'system', content: promptParts.join('\n\n')},
    {role: 'user', content: userPrompt},
  ];
}
