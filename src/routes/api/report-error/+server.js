// src/routes/api/report-error/+server.js
import { json } from '@sveltejs/kit';
import axios from 'axios';
import { DISCORD_WEBHOOK_URL } from '$env/static/private';


export async function POST({ request }) {

  try {
    const errorData = await request.json();

    if (!errorData.message) {
      return new Response('Invalid error report', { status: 400 });
    }

    // Construct the Discord message
    const discordMessage = {
      embeds: [
        {
          title: 'Client-Side Error Report',
          color: 15158332,
          fields: [
            { name: 'Message', value: errorData.message },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Client-Side Error Logger'
          }
        }
      ]
    };

    await axios.post(DISCORD_WEBHOOK_URL, discordMessage);

    return json({ status: 201 });
  } catch (error) {
    console.error('Failed to report error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
