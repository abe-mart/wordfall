export class Dictionary {
    private words: Set<string>;
    private loaded: boolean = false;

    constructor() {
        this.words = new Set();
    }

    async load() {
        if (this.loaded) return;
        try {
            console.log("Loading dictionary...");
            const response = await fetch('/dictionary.txt');
            if (!response.ok) {
                console.error("Dictionary fetch failed:", response.status, response.statusText);
                return;
            }
            const text = await response.text();
            this.words = new Set(
                text.split(/\r?\n/)
                    .map(w => w.toUpperCase().trim())
                    .filter(w => w.length >= 3 && w.length <= 6)
            );
            this.loaded = true;
            console.log(`Dictionary loaded: ${this.words.size} words. Check: DOG=${this.words.has('DOG')}`);
        } catch (e) {
            console.error("Failed to load dictionary", e);
        }
    }

    isValid(word: string): boolean {
        const valid = this.words.has(word.toUpperCase());
        // console.log(`Checking word: ${word} -> ${valid}`); // Verbose
        return valid;
    }
}

export const dictionary = new Dictionary();
