require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

//App config

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//DB config

mongoose
  .connect("mongodb://127.0.0.1:27017/reminderAppDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const reminderSchema = new mongoose.Schema({
  reminderMsg: String,
  remindAt: String,
  isReminded: Boolean,
});

const Reminder = new mongoose.model("reminder", reminderSchema);

//Timing Functionlaity
async function checkReminders() {
  try {
    const reminderList = await Reminder.find({});
    if (reminderList) {
      reminderList.forEach(async (reminder) => {
        if (!reminder.isReminded) {
          const now = new Date();
          if (new Date(reminder.remindAt) - now < 0) {
            const remindObj = await Reminder.findByIdAndUpdate(reminder._id, {
              isReminded: true,
            });
            //Whatsapp Reminder Functinlaity

            const accountSid = process.env.ACCOUNT_SID
            const authToken = process.env.AUTH_TOKEN
            const client = require('twilio')(accountSid, authToken);

            client.messages
                .create({
                    body: reminder.reminderMsg,
                    from: 'whatsapp:+14155238886',
                    // to: 'whatsapp:+919717371868',
                    to: 'whatsapp:+916394474917'
                })
                .then(message => console.log(message.sid))
            
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
}

setInterval(checkReminders, 1000);

//App Routes
app.get("/getAllReminder", async (req, res) => {
  let allReminders = await Reminder.find({}).exec();
  res.send(allReminders);
});

app.post("/addReminder", async (req, res) => {
  const { reminderMsg, remindAt } = req.body;
  const reminder = new Reminder({
    reminderMsg,
    remindAt,
    isReminded: false,
  });
  let savedReminder = await reminder.save();

  res.send(savedReminder);
});

app.post("/deleteReminder", async (req, res) => {
  await Reminder.deleteOne({ _id: req.body.id });
  let allReminders = await Reminder.find({}).exec();
  res.send(allReminders);
});

app.get("/", (req, res) => {
  res.send("Hare Krshna Prabhu ji Dandwat Pranam This message is from BE");
});

app.listen(8080, () => console.log("Backend Started"));
