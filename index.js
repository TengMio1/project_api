require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey || !JWT_SECRET) {
  console.error("Missing environment variables: SUPABASE_URL, SUPABASE_KEY, or JWT_SECRET");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseStorage = require('@supabase/supabase-js').createClient(supabaseUrl, supabaseKey);

const authenticateToken = require('./User/middleware/authenticateToken.js')

const imageRoutes = require('./User/Instrument/Imageinstrument')(supabase);
const audioRoutes = require('./User/Instrument/Audioinstrument')(supabase);
const componentMediaRoutes = require('./User/Instrument/ComponentMedia')(supabase);
const loginRoutes = require('./User/Home/Login')(supabase);
const registerRoutes = require('./User/Home/Register')(supabase);
const getUserRoutes = require('./User/Profile/UserProfile')(supabase);
const updateProfileRoutes = require('./User/Profile/UpdateProfile')(supabase);
const checkEmailRoutes = require('./User/Resetpassword/CheckEmail')(supabase);
const resetPasswordRoutes = require('./User/Resetpassword/ResetPassword')(supabase);
const sendotpRoutes = require('./User/Otp/SendOtp')(supabase);
const verifyRoutes = require('./User/Otp/VerifyOtp')(supabase);
const submitAnswerRoutes = require('./User/Pretest/SubmitTest')(supabase, authenticateToken);
const resetAllSequencesRoutes = require('./ResetAllID')(supabase);
const userHistoryRoute = require('./User/TestHistory/Userhistory')(supabase);
const answerTextRoutes = require('./User/Pretest/AnswerText.js')(supabase); 
const bulkSubmitRouter = require('./User/Pretest/BulkSubmitTest')(supabase, authenticateToken);
const LearningRoutes = require('./User/Learning/InstrumentLearning')(supabase);
const pretestCheckCompletionRoutes = require('./User/Pretest/CheckCompletion')(supabase, authenticateToken);
const posttestCheckCompletionRoutes = require('./User/Posttest/CheckCompletion.js')(supabase, authenticateToken);
const userControllerRoutes = require('./Admin/UserController')(supabase);
const instrumentControllerRoutes = require('./Admin/InstrumentController')(supabase, supabaseStorage);
const componentMediaControllerRoutes = require('./Admin/ComponentMediaController')(supabase, supabaseStorage);
const quizzControllerRoutes = require('./Admin/QuizzController')(supabase);
const audioControllerRoutes = require('./Admin/AudioController')(supabase, supabaseStorage);
const questionTextControllerRoutes = require('./Admin/QuestionTextController')(supabase);
const answerControllerRoutes = require('./Admin/AnswerController')(supabase);
const learningControllerRoutes = require('./Admin/LearningController')(supabase);
const learningMediaControllerRoutes = require('./Admin/LearningMediaController')(supabase, supabaseStorage);
const questionMediaControllerRoutes = require('./Admin/QuestionMediaController')(supabase, supabaseStorage);
const AnswerController = require('./Admin/AnswerController.js'); // จะเปลี่ยนชื่อไฟล์หลังสร้างจริง  
const userAnswerControllerRoutes = require('./Admin/UserAnswerController')(supabase);


// --- Use Routes ---
app.use('/instruments', imageRoutes);
app.use('/audio', audioRoutes);
app.use('/auth', componentMediaRoutes);
app.use('/auth', loginRoutes);
app.use('/auth', registerRoutes);
app.use('/auth', getUserRoutes);
app.use('/auth', updateProfileRoutes);
app.use('/auth', resetPasswordRoutes);
app.use('/auth', sendotpRoutes);
app.use('/auth', verifyRoutes);
app.use('/auth', checkEmailRoutes);
app.use('/api', userHistoryRoute);
app.use('/api', answerTextRoutes); 
app.use('/api', submitAnswerRoutes);
app.use('/api', bulkSubmitRouter);
app.use('/api', LearningRoutes);
app.use('/api', pretestCheckCompletionRoutes);
app.use('/api', posttestCheckCompletionRoutes);
app.use('/admin', userControllerRoutes);
app.use('/admin', instrumentControllerRoutes);
app.use('/admin', componentMediaControllerRoutes);
app.use('/admin', quizzControllerRoutes);
app.use('/admin', audioControllerRoutes);
app.use('/admin', questionTextControllerRoutes);
app.use('/admin', answerControllerRoutes);
app.use('/admin', learningControllerRoutes);
app.use('/admin', learningMediaControllerRoutes);
app.use('/admin', questionMediaControllerRoutes);
app.use('/admin', userAnswerControllerRoutes);

app.use('/admin', resetAllSequencesRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});