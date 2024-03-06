import express from "express";
import cors from "cors";
import users from "./config/users.js";
import { compareSync, hashSync } from "bcrypt";
import jws from "jsonwebtoken";
import passport from "passport";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(passport.initialize());

import "./config/passport.js";

app.get("/", (req, res) => {
  res.send(users);
});

app.post("/login", (req, res) => {
  const foundUser = users.find((user) => user.username === req.body.username);

  //not found user
  if (!foundUser) {
    return res.status(401).send({
      success: false,
      message: "Could not find the user",
    });
  }

  //not correct password
  if (!compareSync(req.body.password, foundUser.password)) {
    return res.status(401).send({
      success: false,
      message: "Incorrect Password",
    });
  }

  const payload = {
    id: foundUser.id,
    username: foundUser.username,
  };

  const token = jws.sign(payload, "Random string", { expiresIn: "1d" });

  return res.status(200).send({
    success: true,
    message: "Logged in successfully",
    token: "Bearer " + token,
  });
});

app.post("/register", (req, res) => {
  try {
    const newUser = {
      id: users.length + 1,
      username: req.body.username,
      password: hashSync(req.body.password, 10),
    };

    users.push(newUser);
    console.log(users);

    const payload = {
      id: newUser.id,
      username: newUser.username,
    };

    const token = jws.sign(payload, "Random string", { expiresIn: "1d" });

    return res.status(200).send({
      success: true,
      message: "Logged in successfully",
      token: "Bearer " + token,
    });
  } catch (err) {
    res.send({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});

app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    return res.status(200).send({
      success: true,
      user: { id: req.user.id, username: req.user.username },
    });
  }
);

app.listen(5000, () => console.log("Listen on port 5000"));
