import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "../model/admin.js";
import User from "../model/user.js";
import Doctors from "../model/doctor.js";
import Session from "../model/session.js";
import { token } from "../validation/tokenValidate.js";
const secret ="Admin"


export const adminLogin = async (req, res) => {
  try {
    console.log(req.body)
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(200)
        .json({ success: false, message: "All fields are required" });
    }

    const adminDetails = await Admin.findOne({ email });
    console.log(adminDetails)
    if (adminDetails) {
      const matchPassword = await bcrypt.compare(
        password,
        adminDetails.password
      );
      if (!matchPassword)
        return res
          .status(200)
          .json({ success: false, message: "Admin Password is not matched" });

      const adminToken = jwt.sign(
        { id: adminDetails._id },
        secret
      );
      token(adminToken);
      res.status(200).json({
        success: true,
        message: "Login success",
        adminToken,
        adminDetails,
      });
    } else {
      res
        .status(200)
        .json({ success: false, message: "admin email is not matched" });
    }
  } catch (err) {
    res.status(400).json({ error: err, message: "server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    console.log("first")
    const users = await User.find();
    if (!users) {
      return res.status(200).json({ message: "no users found" });
    }
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctors.find({ isVerified: true });
    if (!doctors) {
      return res.status(200).json({ message: "no doctors found" });
    }
    res.status(200).json(doctors);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const doctorsRequest = async (req, res) => {
  try {
    const adminAuthHeader = req.header("Authorization");
    const doctors = await Doctors.find({ isVerified: false });
    if (!doctors) {
      return res.status(200).json({ message: "no doctors found" });
    }
    res.status(200).json(doctors);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const blockUser = async (req, res) => {
  try {
    const users = await User.findOneAndUpdate({ _id: req.params.id }, [{ $set: { isBlocked: { $eq: [false, "$isBlocked"] } } }]);
    res.status(200).json({ message: "user is blocked successfully", users });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const unBlockUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        isBlocked: false,
      }
    );
    res.status(200).json({ message: "user is unblocked successfully", user });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const verifyDoctor = async (req, res) => {
  try {
    console.log(req.body.doctorId)
    const doctor = await Doctors.findOneAndUpdate(
      { _id: req.body.doctorId },
      {
        isVerified: true,
      }
    );
    res
      .status(200)
      .json({success: true, message: "doctor is verified successfully", doctor });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const removeDoctor = async (req, res) => {
  try {
    const doctor = await Doctors.findOneAndRemove({ _id: req.params.id });
    res.status(200).json({ message: "doctor removed successfully", doctor });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const doctor = await Doctors.findOne({ _id: req.params.id });
    res.status(200).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const appointments = async (req, res) => {
  try {
    const appointments = await Session.find();
    res.status(200).json(appointments);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

export const dashboard = async (req, res) => {
  try {
   const users = await User.countDocuments()
   const doctors = await Doctors.countDocuments()
   const appointments = await Session.countDocuments()
   const total = await Session.aggregate([
    {
      $project: {
        planInt: { $toInt: "$plan" }
      }
    },
    {
      $group: {
        _id: null,
        totalRate: { $sum: "$planInt" }
      }
    }
  ]);
  const revenue = await Session.aggregate([
    {
      $addFields: {
        bookingDate: {
          $toDate: "$bookedDate"
        },
        planInt: {
          $toInt: "$plan"
        }
      }
    },
    {
      $group: {
        _id: {
          $month: "$bookingDate"
        },
        revenue: {
          $sum: "$planInt"
        }
      }
    },
    {
      $project: {
        month: "$_id",
        revenue: 1,
        _id: 0
      }
    },
    {
      $sort: {
        month: 1
      }
    }
  ])
   res.json({users,doctors,total,appointments,revenue})
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
