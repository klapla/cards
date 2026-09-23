import webpush from 'web-push';
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Проверка, что вызов от Vercel Cron
  const ua = req.headers['user-agent'] || '';
  if (!ua.includes('vercel-cron')) return res.status(401).json({ error: 'Unauthorized' });

  // Настройка VAPID
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  // Определяем, отправлять ли сейчас
  const now = new Date();
  const hours = now.getUTCHours(); // UTC! Проверь свой часовой пояс
  const dayOfWeek = now.getUTCDay(); // 0 = воскресенье, 6 = суббота
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Твоё расписание: будни 10-20, выходные после 14 (время UTC)
  // Если ты в Москве (UTC+3): вычти 3 часа → 10-20 МСК = 7-17 UTC, 14 МСК = 11 UTC
  const isWeekdayWindow = !isWeekend && hours >= 7 && hours < 17;
  const isWeekendWindow = isWeekend && hours >= 11 && hours < 18;
  if (!isWeekdayWindow && !isWeekendWindow) return res.json({ skipped: true, reason: 'outside window' });

  // Достаём все подписки
  const keys = await kv.keys('sub:*');
  let sent = 0, failed = 0;
  const payload = JSON.stringify({
    title: 'Cards',
    body: 'Пора повторить карточки! 🎴',
    url: '/'
  });

  for (const key of keys) {
    try {
      const raw = await kv.get(key);
      const sub = typeof raw === 'string' ? JSON.parse(raw) : raw;
      await webpush.sendNotification(sub, payload, { TTL: 86400 });
      sent++;
    } catch (err) {
      failed++;
      // Удаляем мёртвые подписки
      if (err.statusCode === 410 || err.statusCode === 404) await kv.del(key);
    }
  }

  res.json({ sent, failed, total: keys.length });
}