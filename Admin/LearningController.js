const express = require('express');
const authenticateToken = require('../User/middleware/authenticateToken');

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
}

module.exports = (supabase) => {
  const router = express.Router();

  // GET: ดึงเนื้อหาการเรียนรู้ทั้งหมด
  router.get('/learning', authenticateToken, requireAdmin, async (req, res) => {
    const { data, error } = await supabase
      .from('learning_instrument')
      .select(`
        *,
        thai_instrument (
          thaiinstrument_name
        )
      `)
      .order('learning_id');

    if (error) {
      console.error('Error fetching learning content:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // GET: ดึงเนื้อหาการเรียนรู้ของเครื่องดนตรีเฉพาะ
  router.get('/instruments/:instrumentId/learning', authenticateToken, requireAdmin, async (req, res) => {
    const { instrumentId } = req.params;
    
    const { data, error } = await supabase
      .from('learning_instrument')
      .select(`
        *,
        thai_instrument (
          thaiinstrument_name
        )
      `)
      .eq('thaiinstrument_id', instrumentId)
      .order('learning_id');

    if (error) {
      console.error('Error fetching learning content:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // POST: เพิ่มเนื้อหาการเรียนรู้ใหม่
  router.post('/learning', authenticateToken, requireAdmin, async (req, res) => {
    const { learning_name, learning_text, thaiinstrument_id } = req.body;

    if (!learning_name || !thaiinstrument_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('learning_instrument')
      .insert([{
        learning_name,
        learning_text: learning_text || null,
        thaiinstrument_id: parseInt(thaiinstrument_id)
      }])
      .select(`
        *,
        thai_instrument (
          thaiinstrument_name
        )
      `);

    if (error) {
      console.error('Error inserting learning content:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data[0]);
  });

  // PUT: แก้ไขเนื้อหาการเรียนรู้
  router.put('/learning/:learningId', authenticateToken, requireAdmin, async (req, res) => {
    const { learningId } = req.params;
    const { learning_name, learning_text } = req.body;

    if (!learning_name) {
      return res.status(400).json({ error: 'Missing learning_name' });
    }

    const { data, error } = await supabase
      .from('learning_instrument')
      .update({
        learning_name,
        learning_text: learning_text || null
      })
      .eq('learning_id', learningId)
      .select(`
        *,
        thai_instrument (
          thaiinstrument_name
        )
      `);

    if (error) {
      console.error('Error updating learning content:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
  });

  // DELETE: ลบเนื้อหาการเรียนรู้
  router.delete('/learning/:learningId', authenticateToken, requireAdmin, async (req, res) => {
    const { learningId } = req.params;

    const { error } = await supabase
      .from('learning_instrument')
      .delete()
      .eq('learning_id', learningId);

    if (error) {
      console.error('Error deleting learning content:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Learning content deleted successfully' });
  });

  return router;
}; 