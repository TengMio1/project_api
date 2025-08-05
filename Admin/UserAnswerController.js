const express = require('express');

module.exports = (supabase) => {
  const router = express.Router();

  // GET: ดึง user_answer ทั้งหมด
  router.get('/user-answers', async (req, res) => {
    const { data, error } = await supabase
      .from('user_answer')
      .select('*, user:user_id(username)');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    // map username ขึ้นมาเป็น field หลัก
    const result = (data || []).map(row => ({
      ...row,
      username: row.user?.username || null
    }));
    res.json(result);
  });

  return router;
}; 