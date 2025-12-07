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
            const baseUrl = import.meta.env.BASE_URL;
            // Use logical check to ensuring trailing slash if needed, though vite base usually provides it
            const path = baseUrl.endsWith('/') ? `${baseUrl}dictionary.txt` : `${baseUrl}/dictionary.txt`;
            const response = await fetch(path);
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
