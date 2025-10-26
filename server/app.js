const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes');
const { checkCurrentUser } = require('./middleware/authMiddleware');

const app = express();

//db connection

mongoose.connect(dbURI)
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));

//cookie parser
app.use(cookieParser());

//cors
//app.use(cors());
app.use(cors({
  origin: 'http://localhost:8080', 
  credentials: true
}));

app.use(express.json());

//routes
//app.get('*', checkCurrentUser);
app.use(authRoutes); 
app.use(settingsRoutes);
app.use('/attendance', attendanceRoutes);
app.use(userRoutes);
