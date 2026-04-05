const words = ['ЖАТВА', 'ХАЙП', 'ИЗИ РЕП', 'П***О'];

export default defineEventHandler(() => {
    const word = words[Math.floor(Math.random() * words.length)];
    return { message: word };
});
