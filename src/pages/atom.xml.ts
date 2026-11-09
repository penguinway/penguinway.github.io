import { getPosts } from '../lib/content';
import { atom } from '../lib/feeds';
export async function GET() {
  return new Response(atom(await getPosts()), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
