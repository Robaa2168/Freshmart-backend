require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const { signInToken, tokenForVerify } = require("../config/auth");
const { sendEmail } = require("../lib/email-sender/sender");
const { customerRegisterBody } = require("../lib/email-sender/templates/register");
const { forgetPasswordEmailBody } = require("../lib/email-sender/templates/forget-password");

const verifyEmailAddress = async (req, res) => {
  try {
    const userExists = await Customer.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(403).send({ message: "This Email already Added!" });
    }

    const newUser = new Customer({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
      emailVerified: false,
    });

    await newUser.save();

    const token = tokenForVerify(req.body);
    const option = { name: req.body.name, email: req.body.email, token };

    const mailOptions = {
      to: req.body.email,
      subject: "Verify Your Email",
      html: customerRegisterBody(option),
    };

    await sendEmail(mailOptions);

    return res.send({ message: "Please check your email to verify your account!" });
  } catch (err) {
    return res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const registerCustomer = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) return res.status(400).send({ message: "Missing token!" });

    const decoded = jwt.decode(token);
    const email = decoded?.email;
    if (!email) return res.status(400).send({ message: "Invalid token!" });

    const user = await Customer.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found!" });
    }

    if (user.emailVerified) {
      const authToken = signInToken(user);
      return res.send({
        token: authToken,
        _id: user._id,
        name: user.name,
        email: user.email,
        message: "Email Already Verified!",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY, async (err) => {
      if (err) {
        return res.status(401).send({ message: "Token Expired, Please try again!" });
      }

      user.emailVerified = true;
      await user.save();

      const authToken = signInToken(user);
      return res.send({
        token: authToken,
        _id: user._id,
        name: user.name,
        email: user.email,
        message: "Email Verified, Please Login Now!",
      });
    });
  } catch (err) {
    return res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const addAllCustomers = async (req, res) => {
  try {
    await Customer.deleteMany();
    await Customer.insertMany(req.body);
    return res.send({ message: "Added all users successfully!" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.body.registerEmail });

    if (
      customer &&
      customer.password &&
      bcrypt.compareSync(req.body.password, customer.password)
    ) {
      const token = signInToken(customer);
      return res.send({
        token,
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        address: customer.address,
        phone: customer.phone,
        image: customer.image,
      });
    }

    return res.status(401).send({ message: "Invalid user or password!" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const isAdded = await Customer.findOne({ email: req.body.verifyEmail });
    if (!isAdded) {
      return res.status(404).send({ message: "User Not found with this email!" });
    }

    const token = tokenForVerify(isAdded);
    const option = { name: isAdded.name, email: isAdded.email, token };

    const mailOptions = {
      to: req.body.verifyEmail,
      subject: "Password Reset",
      html: forgetPasswordEmailBody(option),
    };

    await sendEmail(mailOptions);

    return res.send({ message: "Please check your email to reset password!" });
  } catch (err) {
    return res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) return res.status(400).send({ message: "Missing token!" });

    const decoded = jwt.decode(token);
    const email = decoded?.email;
    if (!email) return res.status(400).send({ message: "Invalid token!" });

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).send({ message: "User Not found!" });

    jwt.verify(token, process.env.JWT_SECRET_FOR_VERIFY, async (err) => {
      if (err) {
        return res.status(500).send({ message: "Token expired, please try again!" });
      }

      customer.password = bcrypt.hashSync(req.body.newPassword);
      await customer.save();

      return res.send({ message: "Your password change successful, you can login now!" });
    });
  } catch (err) {
    return res.status(500).send({ message: err?.message || "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.body.email });

    if (!customer) return res.status(404).send({ message: "User Not found!" });

    if (!customer.password) {
      return res.send({
        message: "For change password,You need to sign in with email & password!",
      });
    }

    if (bcrypt.compareSync(req.body.currentPassword, customer.password)) {
      customer.password = bcrypt.hashSync(req.body.newPassword);
      await customer.save();
      return res.send({ message: "Your password change successfully!" });
    }

    return res.status(401).send({ message: "Invalid email or current password!" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const signUpWithProvider = async (req, res) => {
  try {
    const user = jwt.decode(req.params.token);
    const isAdded = await Customer.findOne({ email: user.email });

    if (isAdded) {
      const token = signInToken(isAdded);
      return res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        address: isAdded.address,
        phone: isAdded.phone,
        image: isAdded.image,
      });
    }

    const newUser = new Customer({
      name: user.name,
      email: user.email,
      image: user.picture,
    });

    const signUpCustomer = await newUser.save();
    const token = signInToken(signUpCustomer);

    return res.send({
      token,
      _id: signUpCustomer._id,
      name: signUpCustomer.name,
      email: signUpCustomer.email,
      image: signUpCustomer.image,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getAllCustomers = async (req, res) => {
  try {
    const users = await Customer.find({}).sort({ _id: -1 });
    return res.send(users);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    return res.send(customer);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).send({ message: "Customer not found!" });

    customer.name = req.body.name;
    customer.email = req.body.email;
    customer.address = req.body.address;
    customer.phone = req.body.phone;
    customer.image = req.body.image;

    const updatedUser = await customer.save();
    const token = signInToken(updatedUser);

    return res.send({
      token,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
      image: updatedUser.image,
      message: "Customer Updated Successfully!",
    });
  } catch (err) {
    return res.status(404).send({ message: "Your email is not valid!" });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await Customer.deleteOne({ _id: req.params.id });
    return res.status(200).send({ message: "User Deleted Successfully!" });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports = {
  loginCustomer,
  registerCustomer,
  addAllCustomers,
  signUpWithProvider,
  verifyEmailAddress,
  forgetPassword,
  changePassword,
  resetPassword,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
