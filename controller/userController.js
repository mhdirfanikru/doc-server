import User from "../model/user.js";
import Session from "../model/session.js";
import Doctor from "../model/doctor.js";
import Appointment from "../model/appointment.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import moment from "moment";
import mongoose from 'mongoose'; // Import mongoose if not already imported
const secret = "QuickDoc"

export const registerUser = async (req, res) => {
  try {
    console.log(req.body)
    const { email, password, userName, number, date } = req.body;

    if (!email || !password || !number || !userName || !date) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const userDetails = await User.findOne({ email });

    if (userDetails) {
      res
        .status(200)
        .json({ success: false, message: "User already Registered" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        userName,
        email,
        password: hashedPassword,
        number,
        date,
      });
      console.log(newUser)
      res.status(200).json({
        success: true,
        message: "success new user created",
        user: newUser,
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "all fields are required" });
    }

    const userDetails = await User.findOne({ email });

    if (userDetails) {
      if (userDetails.isBlocked) {
        return res
          .status(200)
          .json({ success: false, message: "User is blocked" });
      }

      const passMatch = await bcrypt.compare(password, userDetails.password);

      if (!passMatch) {
        return res
          .status(200)
          .json({ success: false, message: "User Password is Invalid" });
      }

      const token = jwt.sign(
        {
          id: userDetails._id,
          name: userDetails.userName,
          email: userDetails.email,
          number: userDetails.number,
        },
        secret,
        { expiresIn: "30d" }
      );
      res.status(200).json({ success: true, token, userDetails });
    } else {
      res.status(200).json({ success: false, message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const otpLogin = async (req, res) => {
  try {
    const userDetails = await User.findOne({ number: req.params.id });

    if (userDetails) {
      const token = jwt.sign(
        { id: userDetails._id, name: userDetails.userName },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      return res.status(202).json({ message: "user exist", token });
    }
    res.status(203).json({ message: "mobile no. mismatch" });
  } catch (error) {
    res.status(500).json({ message: `Error -> ${error}` });
  }
};

export const userDetails = async (req, res) => {
  try {
    const userDetails = await User.findOne({ _id: req.params.id });
    res
      .status(200)
      .json(userDetails);
      console.log(userDetails)
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err });
  }
};

export const updateDetails = async (req, res) => {
  try {
    const userDetails = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        userName: req.body.userName,
        email: req.body.email,
        number: req.body.number,
      }
    );
    if (!userDetails) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "user data updated successfully", userDetails });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const password = req.body.newPassword;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          password: hashedPassword,
        }
      );

      return res
        .status(200)
        .json({ message: "user password is updated successfully" });
    }
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result)

    const user = await User.findByIdAndUpdate(req.params.id, {
      $set: {
        profilePic: result.secure_url,
      },
    });
    const pic = user.profilePic;
    console.log(pic)
    return res
      .status(200)
      .json({ message: "user image updated successfully", pic });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const allDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true });
    if (doctors) {
      return res
        .status(200)
        .json(doctors);
    }

    res.status(400).json({ message: "their is no doctor" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id });
    console.log(doctor)
    res.status(200).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const bookSession = async (req, res) => {
  try {
    console.log(req.body)
    let timeSlot = req.body.time;
    let sessionDate = req.body.date;
    const isoDate = moment(
      `${sessionDate} ${timeSlot}`,
      "YYYY-MM-DD h:mm A"
    ).toISOString();
    const twoHoursLater = moment(isoDate).add(2, "hours").toISOString();
    const currentISODate = moment().toISOString();
    const formattedDate = moment(currentISODate).format(
      "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
    );

    const today = moment().format("YYYY-MM-DD");
    const userDetails = req.body.userData;
    const doctorDetails = req.body.doctorDetails;
    const user = await User.findById(userDetails.id);

    const newSession = await Session.create({
      userId: user.id,
      userName: userDetails.name,
      doctorId: doctorDetails._id,
      doctorName: doctorDetails.fullName,
      timeSlot: req.body.time,
      plan: req.body.plan,
      sessionDate: req.body.date,
      bookedDate: today,
      startTime: isoDate,
      endTime: twoHoursLater,
      link:null
    });

    res
      .status(200)
      .json({ message: "Session booked successfully", newSession });
  } catch (err) {
    console.log(err)
    res.status(400).json(err);
  }
};

export const appointment = async (req, res) => {
  try {
    const doctorId = req.body.doctorDetails._id;
    const date = req.body.date;
    const time = req.body.time;

    Doctor.findByIdAndUpdate(
      doctorId,
      {
        $push: {
          appointments: {
            date: date,
            times: [time],
          },
        },
      },
      { new: true } // set new: true to return the updated document
    )
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json({ message: "appointment scheduled successfully" });
  } catch (err) {
    res.status(400).json(err);
  }
};

export const availability = async (req, res) => {
  try {
    const doctorId = req.body.doctorId;
    const date = req.body.date;
    const time = req.body.time;
    const userId = req.body.userId;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return false;
    }

    const session = await Session.findOne({
      userId: userId,
      sessionDate: date,
      timeSlot: time,
    });

    const appointment = doctor.appointments.find((appointment) => {
      return (
        appointment.date.toISOString().substr(0, 10) === date &&
        appointment.times.includes(time)
      );
    });

    if (session) {
      return res
        .status(204)
        .json({ message: `Appointment already exists for ${date} at ${time}` });
    }

    if (appointment) {
      return res
        .status(202)
        .json({ message: `Appointment already exists for ${date} at ${time}` });
    }

    return res
      .status(200)
      .json({ message: 'available' });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const session = async (req, res) => {
  try {
    const id = req.params.id;
    const session = await Session.find({ userId: id })
    res.json(session);
  } catch (err) {
    res.status(400).json(err);
  }
};



export const activeSession = async (req, res) => {
  const currentISODate = new Date();
//  currentISODate.setHours(currentISODate.getHours())+1;
 currentISODate.setHours(currentISODate.getHours());

  try {
    const session = await Session.findOne({
      userId: req.params.id,
      startTime: { $lte: currentISODate },
      endTime: { $gte: currentISODate },
    });
    if(session){
      const doctor = await Doctor.findById(session.doctorId)
    const data = {
      fullName : doctor.fullName,
      profilePic : doctor.profilePic,
      id:doctor._id
      }
      res.status(200).json(data)
    }else{
      res.json("no session")
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// export const getTime = async (req, res) => {
//   try {
//     console.log(req.body)
//     const doctorId =     new mongoose.Types.ObjectId(req.body.id);
//     const Inputdate = req.body.date;
//     const findTime = await Appointment.findOne({
//       'doctor': doctorId,
//       'timeAndDate.date': Inputdate
//     })
//     res.status(200).json(findTime.timeAndDate.timings);
//   } catch (error) {
//     console.log(error);
//     res.status(200).json(error);
//   }
// };

export const getTime = async (req, res) => {
  try {
    const doctorId = new mongoose.Types.ObjectId(req.body.id);
    const Inputdate = req.body.date;
    const findTime = await Appointment.findOne({
      doctor: doctorId,
      "timeAndDate.date": Inputdate,
    });
    const date = new Date(Inputdate);
    date.setUTCHours(0, 0, 0, 0); // set hours, minutes, seconds, and milliseconds to zero
    // const isoString = date.toISOString().slice(0, 23) + 'Z'; // format as ISO string
    

    const doctor = await Doctor.findById(doctorId);
    console.log(doctor)
    const matchingAppointments = doctor.appointments.filter(appointment => {
    const appointmentDateOnly = new Date(appointment.date).setUTCHours(0, 0, 0, 0);
    const inputDateOnly = new Date(Inputdate).setUTCHours(0, 0, 0, 0);
    return appointmentDateOnly === inputDateOnly;
  });
  const timings = matchingAppointments.flatMap(appointment => appointment.times);

    let appTimings = findTime?.timeAndDate?.timings;
    if (appTimings === undefined) {
      appTimings = [];
    }

    const commonTimings = appTimings.filter((time) => {
      return !timings.includes(time);
    });
    res.status(200).json(commonTimings);
    console.log(commonTimings)
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err });
  }
};