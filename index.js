const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const connectionString = "mongodb+srv://sarandatabase:saran%40143@mycluster.zm3yrdt.mongodb.net/demo?retryWrites=true&w=majority&appName=MyCluster";
const app = express();


// const allowedOrigins = ['https://c-suite-alpha.vercel.app', 'https://csuite.academy/'];
// const corsOptions = {
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
// };

// Configure CORS
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options('*', cors());
// Enable CORS
// app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
// Routers

const contactRouter = require('./routes/Contact.router')

const courseDetailsRouter = require('./routes/CourseDetails.router')
const userRouter = require('./routes/User.router')
const paymentRouter = require('./routes/Payment.router')
const calenderRouter = require('./routes/Calender.router')
const testRouter = require('./routes/Test.router');
const router = require('./routes/Question.router')
const UploadDriveRouter = require('./routes/UploadToDrive.router')
const UploadVimeoRouter = require('./routes/UploadToVimeo.router')
const CompleteVideo = require('./routes/CompletedVideo.router')
const instructorRoutes = require('./routes/Instructor.router');
const eventRouter = require('./routes/Event.router');
const adminEventRouter = require('./routes/AdminEvent.router');
const ReviewRouter = require('./routes/Review.router');
const NotificationRouter = require('./routes/Notification.router');
const appointmentRoutes = require("./routes/Appointment.router");
// app.use(bodyParser.json)

app.use('/api/contact', contactRouter)

app.use('/api/courseDetail', courseDetailsRouter)
app.use('/api/user', userRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/calender', calenderRouter)
app.use('/api/tests', testRouter);
app.use('/api/question', router);
app.use('/api/uploadtodrive', UploadDriveRouter);
app.use('/api/uploadtovimeo', UploadVimeoRouter);
app.use('/api/completevideo', CompleteVideo);
app.use('/api/instructor',instructorRoutes );
app.use('/api/event',eventRouter);
app.use('/api/admin-event',adminEventRouter);
app.use('/api/review',ReviewRouter);
app.use('/api/notification',NotificationRouter);
app.use("/api/appointments", appointmentRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});


// Db connection
 mongoose.connect(connectionString, {})
  .then(() => {
    app.listen(5000, () => {
    console.log("Db connected - Listening port 5000");
    });
  })
  .catch((e) => {
    console.log(e);
  });

