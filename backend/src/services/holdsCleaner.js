// server/services/holdsCleaner.js
import Showtime from '../models/Showtime.js';

const INTERVAL_MS = parseInt(process.env.HOLD_CLEAN_INTERVAL_MS || String(60 * 1000), 10); // default: 60s

export function startHoldCleaner() {
  console.log(`[holdsCleaner] starting (interval ${INTERVAL_MS}ms)`);

  async function cleanup() {
    try {
      const now = new Date();
      // Find showtimes with seats held and holdUntil < now
      // We'll use a query to find showtimes containing such seats and update them.
      const showtimes = await Showtime.find({ 'seats.status': 'held', 'seats.holdUntil': { $lte: now } });

      if (!showtimes.length) return;

      for (const st of showtimes) {
        let changed = false;
        for (const s of st.seats) {
          if (s.status === 'held' && s.holdUntil && s.holdUntil <= now) {
            s.status = 'available';
            s.holdUntil = null;
            changed = true;
          }
        }
        if (changed) {
          await st.save();
          console.log(`[holdsCleaner] released holds for showtime ${st._id}`);
        }
      }
    } catch (err) {
      console.error('[holdsCleaner] error during cleanup', err);
    }
  }

  // run immediately then on interval
  cleanup().catch(err => console.error(err));
  const id = setInterval(cleanup, INTERVAL_MS);

  // return function to stop cleaner if needed
  return () => clearInterval(id);
}
