export type Exam = { value: string; label: string };
export type Language = {
    value: string;
    label: string;
    flag: string;
    exams: Exam[];
};

export const LANGUAGES: Language[] = [
    {
        value: 'english',
        label: 'English',
        flag: 'flag:gb-4x3',
        exams: [{ value: 'ielts', label: 'IELTS' }],
    },
    {
        value: 'deutsch',
        label: 'Deutsch',
        flag: 'flag:de-4x3',
        exams: [{ value: 'testdaf', label: 'TestDaF' }],
    },
];

export const useExamStore = defineStore('exam', () => {
    const language = useCookie<string>('language', {
        default: () => 'english',
    });
    const exam = useCookie<string>('exam', { default: () => 'ielts' });

    const current = computed(
        () => LANGUAGES.find(l => l.value === language.value) ?? LANGUAGES[0]!,
    );
    const currentExam = computed(
        () =>
            current.value.exams.find(e => e.value === exam.value) ??
            current.value.exams[0]!,
    );

    function select(lang: string, ex: string) {
        language.value = lang;
        exam.value = ex;
    }

    return { language, exam, current, currentExam, select };
});
