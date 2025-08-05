const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  router.post('/reset-all-sequences', async (req, res) => {
    try {
      // รายการ sequence ที่ต้อง reset
      const sequences = [
        'answermatch_instrument_answermatch_id_seq',
        'answertext_instrument_answertext_id_seq',
        'audio_instrument_audio_id_seq',
        'componentmedia_instrument_componentmedia_id_seq',
        'image_instrument_image_id_seq',
        'learning_instrument_learning_id_seq',
        'learningmedia_instrument_learningmedia_id_seq',
        'questionmedia_instrument_questionmedia_id_seq',
        'questiontext_instrument_questiontext_id_seq',
        'questiontype_instrument_questiontype_id_seq',
        'quizz_instrument_quizz_id_seq',
        'thai_instrument_thaiinstrument_id_seq',
        'user_user_id_seq'
      ];
      for (const seq of sequences) {
        // หา max id ของแต่ละตารางที่ใช้ sequence นี้
        const table = seq.replace(/_.*_seq$/, '');
        const idCol = seq.replace(/_seq$/, '');
        // ตัวอย่าง: answermatch_instrument_answermatch_id_seq -> answermatch_instrument, answermatch_id
        const idColName = idCol.split('_').slice(-2).join('_');
        // ดึง max id
        const { data: maxData, error: maxError } = await supabase.rpc('get_max_id', { table_name: table, id_col: idColName });
        if (maxError) {
          console.error('Error getting max id for', table, maxError);
          continue;
        }
        const maxId = maxData && maxData.length > 0 ? maxData[0].max : 0;
        // setval
        await supabase.rpc('setval', { sequence_name: seq, new_value: maxId });
      }
      return res.status(200).json({ status: 'success', message: 'Reset Sequences สำเร็จแล้ว 🎉' });
    } catch (err) {
      console.error('Unexpected error:', err);
      return res.status(500).json({ status: 'error', message: 'Unexpected error', detail: err.message });
    }
  });

  return router;
};
