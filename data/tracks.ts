export interface Track {
    artist: string;
    title: string;
    videoId: string;
    introSkip?: number;
    outroSkip?: number; // Seconds to skip at the end (Fallback if AI is off)
}

export const tracks: Track[] = [
    {
        "artist": "Blondie",
        "title": "Call Me",
        "videoId": "StKVS0eI85I"
    },
    {
        "artist": "Madonna",
        "title": "Into the Groove",
        "videoId": "52iW3lcpK5M"
    },
    {
        "artist": "Prince and the Revolution",
        "title": "Kiss",
        "videoId": "H9tEvfIsDyo"
    },
    {
        "artist": "Depeche Mode",
        "title": "World in My Eyes",
        "videoId": "nhZdL4JlnxI",

    },
    {
        "artist": "Charly García & Pedro Aznar",
        "title": "Hablando a Tu Corazón",
        "videoId": "Z7AERldCALc"
    }
];
