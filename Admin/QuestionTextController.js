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

  // GET: ดึงคำถามทั้งหมดของแบบทดสอบ
  router.get('/quizzes/:quizzId/questions', authenticateToken, requireAdmin, async (req, res) => {
    const { quizzId } = req.params;
    
    const { data, error } = await supabase
      .from('questiontext_instrument')
      .select(`
        *,
        questiontype_instrument (
          questiontype_name
        )
      `)
      .eq('quizz_id', quizzId)
      .order('questiontext_id');

    if (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // GET: ดึงประเภทคำถามทั้งหมด
  router.get('/question-types', authenticateToken, requireAdmin, async (req, res) => {
    const { data, error } = await supabase
      .from('questiontype_instrument')
      .select('*')
      .order('questiontype_id');

    if (error) {
      console.error('Error fetching question types:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // POST: เพิ่มคำถามใหม่
  router.post('/questions', authenticateToken, requireAdmin, async (req, res) => {
    const { question_text, questiontype_id, quizz_id } = req.body;

    if (!question_text || !questiontype_id || !quizz_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('questiontext_instrument')
      .insert([{
        question_text,
        questiontype_id: parseInt(questiontype_id),
        quizz_id: parseInt(quizz_id)
      }])
      .select(`
        *,
        questiontype_instrument (
          questiontype_name
        )
      `);

    if (error) {
      console.error('Error inserting question:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data[0]);
  });

  // PUT: แก้ไขคำถาม
  router.put('/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
    const { questionId } = req.params;
    const { question_text, questiontype_id } = req.body;

    if (!question_text || !questiontype_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('questiontext_instrument')
      .update({
        question_text,
        questiontype_id: parseInt(questiontype_id)
      })
      .eq('questiontext_id', questionId)
      .select(`
        *,
        questiontype_instrument (
          questiontype_name
        )
      `);

    if (error) {
      console.error('Error updating question:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
  });

  // DELETE: ลบคำถาม
  router.delete('/questions/:questionId', authenticateToken, requireAdmin, async (req, res) => {
    const { questionId } = req.params;

    const { error } = await supabase
      .from('questiontext_instrument')
      .delete()
      .eq('questiontext_id', questionId);

    if (error) {
      console.error('Error deleting question:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ message: 'Question deleted successfully' });
  });

  return router;
}; 