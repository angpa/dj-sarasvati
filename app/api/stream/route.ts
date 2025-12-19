import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const dynamic = 'force-dynamic'; // Prevent caching of the route itself, though we might want to cache RESULTS

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
        return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
    }

    try {
        if (!ytdl.validateID(videoId)) {
            return NextResponse.json({ error: 'Invalid videoId' }, { status: 400 });
        }

        const info = await ytdl.getInfo(videoId);

        // Filter for audio only, prefer highest audio quality
        const format = ytdl.chooseFormat(info.formats, {
            quality: 'highestaudio',
            filter: 'audioonly'
        });

        if (!format || !format.url) {
            return NextResponse.json({ error: 'No suitable audio format found' }, { status: 404 });
        }

        // Return the direct URL and some metadata
        return NextResponse.json({
            url: format.url,
            mimeType: format.mimeType,
            approxDurationMs: format.approxDurationMs,
            title: info.videoDetails.title
        });

    } catch (error: any) {
        console.error("Stream extraction failed:", error);
        return NextResponse.json({
            error: 'Failed to extract stream',
            details: error.message
        }, { status: 500 });
    }
}
