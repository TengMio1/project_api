const express = require('express');
const authenticateToken = require('../User/middleware/authenticateToken');

// Middleware ตรวจสอบ role admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
}

module.exports = (supabase) => {
  const router = express.Router();

  // GET: ดึงแบบทดสอบทั้งหมดของเครื่องดนตรี
  router.get('/instruments/:instrumentId/quizzes', authenticateToken, requireAdmin, async (req, res) => {
    const { instrumentId } = req.params;
    const { data, error } = await supabase
      .from('quizz_instrument')
      .select('*')
      .eq('instrument_id', instrumentId)
      .order('quizz_id');

    if (error) {
      console.error('Error fetching quizzes:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // POST: เพิ่มแบบทดสอบใหม่
  router.post('/quizzes', authenticateToken, requireAdmin, async (req, res) => {
    const { quizz_name, instrument_id } = req.body;

    if (!quizz_name || !instrument_id) {
      return res.status(400).json({ error: 'Missing quizz_name or instrument_id' });
    }

    const { data, error } = await supabase
      .from('quizz_instrument')
      .insert([{ 
        quizz_name, 
        instrument_id: parseInt(instrument_id)
      }])
      .select();
      
    if (error) {
      console.error('Error inserting quizz:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data[0]);
  });

  // PUT: แก้ไขแบบทดสอบ
  router.put('/quizzes/:quizzId', authenticateToken, requireAdmin, async (req, res) => {
    const { quizzId } = req.params;
    const { quizz_name } = req.body;

    if (!quizz_name) {
      return res.status(400).json({ error: 'Missing quizz_name' });
    }

    const { data, error } = await supabase
      .from('quizz_instrument')
      .update({ quizz_name })
      .eq('quizz_id', quizzId)
      .select();

    if (error) {
      console.error('Error updating quizz:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
  });

  // DELETE: ลบแบบทดสอบ
  router.delete('/quizzes/:quizzId', authenticateToken, requireAdmin, async (req, res) => {
    const { quizzId } = req.params;
    
    const { error } = await supabase
      .from('quizz_instrument')
      .delete()
      .eq('quizz_id', quizzId);
      
    if (error) {
      console.error('Error deleting quizz:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Quizz deleted successfully' });
  });

  return router;
}; 