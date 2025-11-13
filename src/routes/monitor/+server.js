import { json } from '@sveltejs/kit';
import mysteryArtists from '$lib/mysteryArtists.json';

export async function GET() {
  try {
    // Extract and return only the dates from mysteryArtists data
    const dates = mysteryArtists.map(artist => artist.date);
    
    return json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      dates: dates
    });
  } catch (error) {
    console.error('Monitor endpoint error:', error);
    return json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Failed to read mysteryArtists data' 
      },
      { status: 500 }
    );
  }
}
