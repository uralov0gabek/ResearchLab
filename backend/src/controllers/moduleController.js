const { supabase } = require('../config/supabase');

const getModules = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('survey_modules')
      .select('*, questions(count)')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("GET /api/modules Error:", error);
      return res.status(400).json({ error: error.message || "Failed to load modules" });
    }
    return res.json(data);
  } catch (error) {
    console.error("GET /api/modules Error:", error);
    return res.status(400).json({ error: error.message || "Failed to load modules" });
  }
};

const createModule = async (req, res) => {
  try {
    const { title, status } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing title' });
    }
    const { data, error } = await supabase
      .from('survey_modules')
      .insert([{ title, status: status || 'draft' }])
      .select()
      .single();
      
    if (error) {
      console.error("POST /api/modules Error:", error);
      return res.status(400).json({ error: error.message || "Failed to load modules" });
    }
    return res.json(data);
  } catch (error) {
    console.error("POST /api/modules Error:", error);
    return res.status(400).json({ error: error.message || "Failed to load modules" });
  }
};

const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { target_role } = req.body;
    
    const { data, error } = await supabase
      .from('survey_modules')
      .update({ target_role })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("PATCH /api/modules Error:", error);
      return res.status(400).json({ error: error.message || "Failed to update module" });
    }
    return res.json(data);
  } catch (error) {
    console.error("PATCH /api/modules Error:", error);
    return res.status(400).json({ error: error.message || "Failed to update module" });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('survey_modules').delete().eq('id', id);
    if (error) {
      console.error("DELETE /api/modules Error:", error);
      return res.status(400).json({ error: error.message || "Failed to delete module" });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/modules Error:", error);
    return res.status(400).json({ error: error.message || "Failed to delete module" });
  }
};

module.exports = {
  getModules,
  createModule,
  updateModule,
  deleteModule
};
