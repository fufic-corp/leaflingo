// Движок квиза: состояние прохождения + проверка/навигация/подсветка.
// Поддерживает choice (single/multiple) и fill_blank (ввод по пропускам).
// Страница грузит данные и отдаёт сырые задания через start() — стор сам
// разбирает content в нормализованный вид.

export type QuizOption = { text: string | null; correct: boolean };
export type QuizBlank = { accept: string[] };
export type QuizMaterial = {
    id: number;
    kind: string;
    title: string;
    body: string | null;
    file_url: string | null;
};

// content как лежит в tasks.content
type RawContent = {
    options?: QuizOption[];
    text?: string;
    blanks?: QuizBlank[];
} | null;
export type QuizRawTask = {
    id: number;
    task_text: string | null;
    type: string;
    content: RawContent;
};
export type QuizRawItem = { task: QuizRawTask; material: QuizMaterial | null };

// нормализованный вопрос, с которым работает движок
export type QuizItem = {
    task: { id: number; task_text: string | null; type: string };
    material: QuizMaterial | null;
    options: QuizOption[];
    fill: { text: string; blanks: QuizBlank[] } | null;
};

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

export const useQuizStore = defineStore('quiz', () => {
    const items = ref<QuizItem[]>([]);
    const index = ref(0);
    const selected = ref<number[]>([]); // choice: индексы выбранных вариантов
    const inputs = ref<string[]>([]); // fill_blank: текст по каждому пропуску
    const checked = ref(false);
    const finished = ref(false);
    const correctCount = ref(0);

    const current = computed<QuizItem | null>(
        () => items.value[index.value] ?? null,
    );
    const isLast = computed(() => index.value >= items.value.length - 1);
    const isFill = computed(() => current.value?.task.type === 'fill_blank');

    // "...{1}...{2}..." -> части для рендера (blank: -1 = обычный текст).
    // blank = порядковый номер пропуска (rank), а не само число в {} —
    // поэтому любая нумерация ({1},{3}) совпадает с компактным blanks[].
    const currentParts = computed(() => {
        const text = current.value?.fill?.text ?? '';
        const order = [
            ...new Set([...text.matchAll(/\{(\d+)\}/g)].map(m => Number(m[1]))),
        ].sort((a, b) => a - b);
        return text
            .split(/(\{\d+\})/)
            .filter(s => s !== '')
            .map(seg => {
                const m = seg.match(/^\{(\d+)\}$/);
                return m
                    ? {
                          value: null as string | null,
                          blank: order.indexOf(Number(m[1])),
                      }
                    : { value: seg as string | null, blank: -1 };
            });
    });

    function isBlankCorrect(i: number): boolean {
        const blank = current.value?.fill?.blanks[i];
        if (!blank) return false;
        const val = norm(inputs.value[i] ?? '');
        return val !== '' && blank.accept.some(a => norm(a) === val);
    }

    const isAnswerCorrect = computed(() => {
        if (!current.value) return false;
        if (isFill.value) {
            const blanks = current.value.fill?.blanks ?? [];
            return blanks.length > 0 && blanks.every((_, i) => isBlankCorrect(i));
        }
        const correct = current.value.options
            .map((o, i) => (o.correct ? i : -1))
            .filter(i => i !== -1)
            .sort((a, b) => a - b);
        const sel = [...selected.value].sort((a, b) => a - b);
        return (
            correct.length > 0 &&
            correct.length === sel.length &&
            correct.every((v, i) => v === sel[i])
        );
    });

    const canAct = computed(() => {
        if (checked.value) return true;
        if (isFill.value) {
            const blanks = current.value?.fill?.blanks ?? [];
            return (
                blanks.length > 0 &&
                blanks.every((_, i) => (inputs.value[i] ?? '').trim() !== '')
            );
        }
        return selected.value.length > 0;
    });

    function normalizeItem(raw: QuizRawItem): QuizItem {
        const c = raw.task.content;
        return {
            task: {
                id: raw.task.id,
                task_text: raw.task.task_text,
                type: raw.task.type,
            },
            material: raw.material,
            options: c?.options ?? [],
            fill:
                raw.task.type === 'fill_blank'
                    ? { text: c?.text ?? '', blanks: c?.blanks ?? [] }
                    : null,
        };
    }

    function resetAnswer() {
        selected.value = [];
        const blanks = current.value?.fill?.blanks.length ?? 0;
        inputs.value = Array.from({ length: blanks }, () => '');
    }

    // Загрузить новый набор вопросов и сбросить прохождение.
    function start(raw: QuizRawItem[]) {
        items.value = raw.map(normalizeItem);
        index.value = 0;
        checked.value = false;
        finished.value = false;
        correctCount.value = 0;
        resetAnswer();
    }

    function toggle(i: number) {
        if (checked.value || isFill.value) return;
        if (current.value?.task.type === 'multiple_choice') {
            const at = selected.value.indexOf(i);
            if (at === -1) selected.value.push(i);
            else selected.value.splice(at, 1);
        } else {
            selected.value = [i];
        }
    }

    // Check -> Next -> Finish одной кнопкой.
    function primaryAction() {
        if (!current.value) return;
        if (!checked.value) {
            checked.value = true;
            if (isAnswerCorrect.value) correctCount.value++;
            return;
        }
        if (isLast.value) {
            finished.value = true;
            return;
        }
        index.value++;
        checked.value = false;
        resetAnswer();
    }

    function optionClass(opt: QuizOption, i: number) {
        if (!checked.value) {
            return selected.value.includes(i)
                ? 'border-emerald-400 bg-emerald-50 text-neutral-800'
                : 'border-emerald-100 hover:border-emerald-300 text-neutral-700';
        }
        if (opt.correct)
            return 'border-emerald-500 bg-emerald-50 text-emerald-700';
        if (selected.value.includes(i))
            return 'border-red-400 bg-red-50 text-red-600';
        return 'border-emerald-100 text-neutral-400 opacity-70';
    }

    function blankClass(i: number) {
        if (!checked.value)
            return 'border-emerald-200 focus:border-emerald-400 text-neutral-800';
        return isBlankCorrect(i)
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
            : 'border-red-400 bg-red-50 text-red-600';
    }

    return {
        items,
        index,
        selected,
        inputs,
        checked,
        finished,
        correctCount,
        current,
        isLast,
        isFill,
        isAnswerCorrect,
        canAct,
        currentParts,
        start,
        toggle,
        primaryAction,
        optionClass,
        blankClass,
        isBlankCorrect,
    };
});
