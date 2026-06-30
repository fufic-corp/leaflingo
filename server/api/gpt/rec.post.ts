// POST /api/gpt/rec
// Sends the student's essay to the GPT API and returns the correction object
// consumed by app/pages/tasks/writing.vue.

type Mistake = {
    mistake: string; // the erroneous fragment
    explanation: string; // why it is wrong
    proposition: string; // how it should be corrected
};
type Review = {
    text_with_ankors: string; // the text with {n} anchors at each mistake
    mistakes: Mistake[];
};

// Configurable via env, with a sensible default.
const MODEL = process.env.GPT_MODEL ?? 'gpt-4o';

const SYSTEM_PROMPT = `You are a strict language exam examiner.
You receive a student's essay and find every language mistake (grammar,
vocabulary, spelling, word order, punctuation).

Reply with ONLY a JSON object of exactly this shape:
{
  "text_with_ankors": string,
  "mistakes": [
    { "mistake": string, "explanation": string, "proposition": string }
  ]
}

Rules:
- "text_with_ankors" is the original essay text with an anchor "{n}" inserted
  immediately after each mistake, numbered sequentially starting from 1.
- The number in every "{n}" anchor must match the 1-based position of the
  corresponding item in the "mistakes" array.
- "mistake" is the erroneous fragment, "explanation" says why it is wrong,
  "proposition" is the corrected version.
- If there are no mistakes, return the original text and an empty array.
- Do not add any commentary outside the JSON.`;

type ChatCompletion = {
    choices: { message: { content: string } }[];
};

export default defineEventHandler(async (event): Promise<Review> => {
    const apiKey = process.env.GPT_API_SECRETE_KEY;
    if (!apiKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'GPT API key is not configured',
        });
    }

    const body = await readBody<{
        text?: string;
        topic?: string;
        exam?: string;
    }>(event);
    const text = body?.text?.trim();
    if (!text) {
        throw createError({ statusCode: 400, statusMessage: 'text is required' });
    }

    const userPrompt = [
        body.exam ? `Exam: ${body.exam}` : null,
        body.topic ? `Essay topic: ${body.topic}` : null,
        '',
        'Student essay:',
        text,
    ]
        .filter(line => line !== null)
        .join('\n');

    let completion: ChatCompletion;
    try {
        completion = await $fetch<ChatCompletion>(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: {
                    model: MODEL,
                    temperature: 0.2,
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                },
            },
        );
    } catch (err) {
        throw createError({
            statusCode: 502,
            statusMessage: 'GPT request failed',
            data: err,
        });
    }

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
        throw createError({
            statusCode: 502,
            statusMessage: 'Empty GPT response',
        });
    }

    let parsed: Partial<Review>;
    try {
        parsed = JSON.parse(content);
    } catch {
        throw createError({
            statusCode: 502,
            statusMessage: 'GPT returned invalid JSON',
        });
    }

    // Normalize to the contract shape so the client always gets valid data.
    return {
        text_with_ankors: String(parsed.text_with_ankors ?? ''),
        mistakes: Array.isArray(parsed.mistakes)
            ? parsed.mistakes.map(m => ({
                  mistake: String(m.mistake ?? ''),
                  explanation: String(m.explanation ?? ''),
                  proposition: String(m.proposition ?? ''),
              }))
            : [],
    };
});