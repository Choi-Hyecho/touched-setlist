export default async () => {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    return new Response('CRON_SECRET or site URL not configured', { status: 500 });
  }

  await fetch(`${base}/api/admin/tweet/run-due`, {
    method: 'POST',
    headers: { 'x-cron-secret': secret },
  });

  return new Response('ok');
};

export const config = { schedule: '*/5 * * * *' };
