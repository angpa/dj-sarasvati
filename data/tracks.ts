export interface Track {
    artist: string;
    title: string;
    videoId: string;
    introSkip: number;
    outroSkip?: number; // Seconds to skip at the end for tighter mixing
}

export const tracks: Track[] = [
    {
        "artist": "Blondie",
        "title": "Call Me",
        "videoId": "StKVS0eI85I",
        "introSkip": 0,
        "outroSkip": 10
    },
    {
        "artist": "Madonna",
        "title": "Into the Groove",
        "videoId": "52iW3lcpK5M",
        "introSkip": 0,
        "outroSkip": 15
    },
    {
        "artist": "Prince and the Revolution",
        "title": "Kiss",
        "videoId": "H9tEvfIsDyo",
        "introSkip": 0,
        "outroSkip": 5
    },
    {
        "artist": "Depeche Mode",
        "title": "World in My Eyes",
        "videoId": "nhZdL4JlnxI",
        "introSkip": 53,
        "outroSkip": 10
    },
    {
        "artist": "Charly García & Pedro Aznar",
        "title": "Hablando a Tu Corazón",
        "videoId": "Z7AERldCALc",
        "introSkip": 0,
        "outroSkip": 8
    }
];
