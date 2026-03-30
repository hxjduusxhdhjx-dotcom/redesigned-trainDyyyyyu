const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// الاتصال بـ Supabase (سيقرأ المفاتيح من خزنة GitHub لاحقاً)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function startScraping() {
    console.log("🐉 دراغون واتش: جاري فحص الحلقات الجديدة...");
    try {
        // مصدر جلب الحلقات (GogoAnime كمثال)
        const response = await axios.get('https://api.consumet.org/anime/gogoanime/recent-episodes');
        const episodes = response.data.results;

        for (const ep of episodes) {
            // إضافة الحلقة لجدول episodes (يتجاهل المكرر تلقائياً)
            const { error } = await supabase
                .from('episodes')
                .upsert({
                    tmdb_id: ep.id, 
                    episode_number: ep.episodeNumber,
                    video_url: `https://vidsrc.me/embed/anime?id=${ep.id}&ep=${ep.episodeNumber}`,
                    season_number: 1
                }, { onConflict: 'tmdb_id, episode_number' });

            if (!error) console.log(`✅ تم تحديث: ${ep.title} - حلقة ${ep.episodeNumber}`);
        }
    } catch (err) {
        console.error("❌ فشل الروبوت:", err.message);
    }
}
startScraping();