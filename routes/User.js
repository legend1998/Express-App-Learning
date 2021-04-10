import express from "express";
const router = express.Router();

import transmodel from "../model/transactions.js";
import activitymodel from "../model/Activity.js";
import UserModel from "../model/UserModel.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import calculateLevelIncome from "../utils/routine.js";

router.route("/getall").get((req, res) => {
  UserModel.find()
    .then((doc) => {
      res.status(200).json({ success: true, data: doc });
    })
    .catch((e) => {
      res.status(400).json({ success: false, error: e });
    });
});

//create user or sign up
router.route("/create").post((req, res) => {
  let refcode = crypto.randomBytes(16).toString("base64");

  let user = new UserModel({
    name: req.body.name,
    refCode: refcode,
    aadhar: req.body.aadhar,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
  });

  user.save(function (error, document) {
    if (error) {
      res.status(200).json({ success: false, error: error });
    } else {
      res.status(200).json({ success: true, data: document });
    }
  });
});

router.route("/signin").post((req, res) => {
  var user = req.body.email;
  if (user.endsWith("@gmail.com")) {
    UserModel.findOne({ email: req.body.email })
      .then((user) => {
        if (user == null) {
          res.status(200).send({ message: "user not registered" });
        } else if (bcrypt.compareSync(req.body.password, user.password)) {
          res.status(200).json(user);
        } else {
          res
            .status(200)
            .send({ message: "username or password is incorrect!" });
        }
      })
      .catch((err) => {
        res.status(200).send({ message: err });
      });
  } else {
    UserModel.findOne({ phone: req.body.email })
      .then((user) => {
        if (user == null) {
          res.status(200).send({ message: "user not registered" });
        } else if (bcrypt.compareSync(req.body.password, user.password)) {
          res.status(200).json(user);
        } else {
          res
            .status(200)
            .send({ message: "username or password is incorrect!" });
        }
      })
      .catch((err) => {
        res.status(200).send({ message: "" });
      });
  }
});

router.route("/resetpass").post((req, res) => {
  UserModel.findByIdAndUpdate(
    { _id: req.body.id },
    {
      password: bcrypt.hashSync(req.body.pass, 10),
    }
  )
    .then(() => {
      res.status(200).send({ success: true });
    })
    .catch((e) => {
      res.status(200).send({ success: false, error: e });
    });
});
//sent email for password change link by email

router.route("/forgotPasswordLink").post((req, res) => {
  UserModel.findOne({ phone: req.body.mobile })
    .then((user) => {
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: " ",
          pass: " ",
        },
      });

      var mailOptions = {
        from: " ",
        to: user.email,
        subject: "click this below link to change your password",
        text: "this is link",
        html: `    <div>
          <h1>Quality Bazar</h1>
          <p>
            this is a private link for you to change the password so use this one
            time only.
          </p>
          <h3>click here</h3>
          <a href="link/quality-bazar/alsfkapwoehsfalkjs/changepassword/:id/${user._id};">change password</a>
          
          
        </div>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(400).send("something went wrong on server side.");
        } else {
          console.log("Email sent: " + info.response);
          res.status(200).send({ success: true, info: info.response });
        }
      });
    })
    .catch((e) => {
      console.log(e);
      res.status(200).send({ success: false });
    });
});

//delete user
router.route("/deleteuser/:id").delete((req, res) => {
  UserModel.findOneAndRemove({ _id: req.params.id })
    .then(() => {
      res.status(200).send({ message: "success" });
    })
    .catch((err) => {
      res.status(400).send({ message: err });
    });
});

router.route("/addrefcode").post(async (req, res) => {
  let exist = await UserModel.exists({ refCode: req.body.refcode });
  if (!exist) return res.status(200).send({ message: "invalid referal code" });
  let user = await UserModel.findOne({ _id: req.body.uid });

  if (user.refBy != "" && req.body.refcode !== user.refCode)
    return res.status(200).send({
      message: `already referred by ${user.refBy} or its your own refcode`,
    });

  UserModel.findOneAndUpdate({ _id: req.body.uid }, { refBy: req.body.refcode })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((e) => {
      res
        .status(402)
        .send({ message: "something went wrong try again after some time" });
    });
});

router.route("/invest").post((req, res) => {
  let amount = req.body.amount;
  UserModel.findOneAndUpdate(
    { _id: req.body.uid },
    { $inc: { "principle.balance": amount } },
    { new: true }
  )
    .then((doc) => {
      // transmodel
      //   .create({
      //     txn: req.body.txn,
      //     amount: req.body.amount,
      //     type: req.body.type,
      //     user_id: req.body.uid,
      //   })
      //   .then((tdoc) => {
      //     res.status(200).json({ success: true, data: doc });
      //   })
      //   .catch((e) => {
      //     res.status(200).json({
      //       success: false,
      //       e: "amount successfully added but transaction can't be record.",
      //     });
      //   });
      res.status(200).json({ success: true, data: doc });
    })
    .catch((e) => {
      res.status(400).json({ success: false, error: e });
    });
});

router.route("/withdraw").post(async (req, res) => {
  //to be implemented

  const w = req.body.wallet;
  const p = req.body.principle;

  UserModel.findOneAndUpdate(
    { _id: req.body.uid },
    {
      $inc: { "wallet.balance": -w, "principle.balance": -p },
      withdrawToday: true,
    },
    { new: true },
    (error, doc) => {
      if (error) {
        res.status(400).send({ success: false, error: e });
      } else {
        calculateLevelIncome(doc.refBy, w + p);
        res.status(200).json({ success: true, data: doc });
      }
    }
  );
});

export default router;
