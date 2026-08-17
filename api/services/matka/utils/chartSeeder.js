import Market from "../models/Market.js";
import DeclaredResultHistory from "../models/DeclaredResultHistory.js";

const DEFAULT_MARKETS = [
  { market_name: "MILAN MORNING", open_time: "10:15 AM", close_time: "11:15 AM", result_open: "125", result_close: "348", jodi_result: "85" },
  { market_name: "SRIDEVI", open_time: "11:35 AM", close_time: "12:35 PM", result_open: "234", result_close: "568", jodi_result: "99" },
  { market_name: "TIME BAZAR", open_time: "01:00 PM", close_time: "02:00 PM", result_open: "136", result_close: "247", jodi_result: "03" },
  { market_name: "MADHUR DAY", open_time: "01:30 PM", close_time: "02:30 PM", result_open: "240", result_close: "179", jodi_result: "67" },
  { market_name: "MILAN DAY", open_time: "03:00 PM", close_time: "05:00 PM", result_open: "357", result_close: "689", jodi_result: "53" },
  { market_name: "RAJDHANI DAY", open_time: "03:15 PM", close_time: "05:15 PM", result_open: "147", result_close: "258", jodi_result: "25" },
  { market_name: "SUPREME DAY", open_time: "03:35 PM", close_time: "05:35 PM", result_open: "480", result_close: "129", jodi_result: "22" },
  { market_name: "KALYAN", open_time: "04:10 PM", close_time: "06:10 PM", result_open: "800", result_close: "679", jodi_result: "82" },
  { market_name: "SRIDEVI NIGHT", open_time: "07:00 PM", close_time: "08:00 PM", result_open: "112", result_close: "344", jodi_result: "41" },
  { market_name: "MILAN NIGHT", open_time: "09:00 PM", close_time: "11:00 PM", result_open: "258", result_close: "670", jodi_result: "53" },
  { market_name: "KALYAN NIGHT", open_time: "09:25 PM", close_time: "11:35 PM", result_open: "344", result_close: "260", jodi_result: "18" },
  { market_name: "RAJDHANI NIGHT", open_time: "09:35 PM", close_time: "11:45 PM", result_open: "780", result_close: "247", jodi_result: "53" },
  { market_name: "MAIN BAZAR", open_time: "09:35 PM", close_time: "12:05 AM", result_open: "667", result_close: "126", jodi_result: "99" }
];

const HISTORICAL_SAMPLE_RECORDS = [
  { open: "800", jodi: "82", close: "679" },
  { open: "344", jodi: "18", close: "260" },
  { open: "780", jodi: "53", close: "247" },
  { open: "136", jodi: "06", close: "114" },
  { open: "280", jodi: "08", close: "170" },
  { open: "667", jodi: "99", close: "126" },
  { open: "357", jodi: "58", close: "134" },
  { open: "790", jodi: "68", close: "279" },
  { open: "228", jodi: "28", close: "800" },
  { open: "446", jodi: "42", close: "778" },
  { open: "990", jodi: "83", close: "238" },
  { open: "247", jodi: "30", close: "226" },
  { open: "156", jodi: "24", close: "590" },
  { open: "467", jodi: "71", close: "227" },
  { open: "138", jodi: "20", close: "136" },
  { open: "259", jodi: "61", close: "236" },
  { open: "246", jodi: "27", close: "368" },
  { open: "458", jodi: "73", close: "120" },
  { open: "379", jodi: "92", close: "156" },
  { open: "257", jodi: "49", close: "360" },
  { open: "379", jodi: "93", close: "139" },
  { open: "359", jodi: "70", close: "389" },
  { open: "359", jodi: "78", close: "369" },
  { open: "246", jodi: "23", close: "779" },
  { open: "269", jodi: "78", close: "279" },
  { open: "589", jodi: "20", close: "235" },
  { open: "400", jodi: "40", close: "120" },
  { open: "128", jodi: "12", close: "980" },
  { open: "369", jodi: "36", close: "150" },
  { open: "740", jodi: "74", close: "270" }
];

export const seedChartDataIfEmpty = async () => {
  try {
    for (const dm of DEFAULT_MARKETS) {
      const exists = await Market.findOne({ market_name: new RegExp(`^${dm.market_name}$`, 'i') });
      if (!exists) {
        await Market.create(dm);
      }
    }

    const allMarkets = await Market.find().lean();
    const now = new Date();

    for (const m of allMarkets) {
      const mName = m.market_name.toUpperCase();
      const existingHistoryCount = await DeclaredResultHistory.countDocuments({ market_name: mName });
      
      if (existingHistoryCount === 0) {
        console.log(`🌱 Seeding 35 chart history records for ${mName}...`);
        const historyDocs = [];
        for (let i = 0; i < 35; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

          const sampleIdx = (mName.charCodeAt(0) + i * 3) % HISTORICAL_SAMPLE_RECORDS.length;
          const rec = HISTORICAL_SAMPLE_RECORDS[sampleIdx];

          historyDocs.push({
            market_name: mName,
            date: dateStr,
            open_pana: rec.open,
            close_pana: rec.close,
            jodi_result: rec.jodi
          });
        }
        await DeclaredResultHistory.insertMany(historyDocs);
      }
    }
    console.log("✅ Matka Market & Chart History seeding complete!");
  } catch (err) {
    console.error("Error seeding chart data:", err);
  }
};
