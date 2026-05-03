import { Controller, Get, Param, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { EventsService } from '../events/events.service';
import { ConfigService } from '@nestjs/config';

@Controller('share')
export class ShareController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly configService: ConfigService,
  ) {}

  // List of common social media crawler user-agents
  private botUserAgents = [
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'slackbot',
    'discordbot',
    'googlebot',
    'bingbot',
  ];

  @Get('e/:eventId')
  async handleEventShare(
    @Param('eventId') eventId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isBot = this.botUserAgents.some((bot) => userAgent.includes(bot));
    
    const protocol = req.protocol;
    const host = req.get('host');
    const apiBase = `${protocol}://${host}${this.configService.get('VITE_APP_API_URL') || ''}`;
    
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const frontendBaseUrl = isProduction 
      ? 'https://app.harpazotech.com' 
      : `${protocol}://${host.split(':')[0]}:5173`; // Fallback for local testing
    
    const frontendUrl = `${frontendBaseUrl}/e/${eventId}`;

    // 1. IF IT IS A HUMAN: Redirect them immediately to the React app
    if (!isBot) {
      return res.redirect(302, frontendUrl);
    }

    // 2. IF IT IS A BOT: Fetch data and build the HTML shell
    try {
      // Fetch the event from your database
      const event = await this.eventsService.findPublic(eventId);
      
      if (!event) {
        return res.status(404).send('Event not found');
      }

      const title = `${event.eventName} — Registration`;
      const description = event.description || `Register for ${event.eventName} at ${event.churchName}`;
      const imageUrl = event.coverImageUrl 
        ? (event.coverImageUrl.startsWith('http') ? event.coverImageUrl : `${apiBase}${event.coverImageUrl}`)
        : (event.churchLogo || '');

      // Generate the raw HTML with Open Graph tags
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:url" content="${frontendUrl}">
            <meta property="og:type" content="website">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
            <meta name="twitter:image" content="${imageUrl}">
        </head>
        <body>
            <p>Redirecting to <a href="${frontendUrl}">${event.eventName}</a>...</p>
            <script>window.location.href = "${frontendUrl}";</script>
        </body>
        </html>
      `;

      return res.status(200).send(html);
    } catch (error) {
      console.error('Error in handleEventShare:', error);
      return res.redirect(302, frontendUrl); // Fallback to React app on error
    }
  }
}
