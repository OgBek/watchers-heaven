import { z } from 'zod';

export const createPartySchema = z.object({
  movieId: z.string().min(1),
  movieTitle: z.string().min(1),
  mediaType: z.enum(['movie', 'tv']),
  season: z.number().optional().nullable(),
  episode: z.number().optional().nullable(),
  provider: z.string().min(1),
});

export const updatePlaybackSchema = z.object({
  playing: z.boolean(),
  currentTime: z.number().min(0),
});

export const roomCodeSchema = z.string().length(8).regex(/^[A-Z0-9]+$/);
