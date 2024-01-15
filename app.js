require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;

//setup view engine
app.set("view engine", "ejs");

// Set up session middleware
app.use(
  session({
    secret: "your-secret-key",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
    },
    resave: true,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up the Facebook authentication strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: "http://localhost:3333/auth/facebook/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // You can customize what to do with the Facebook profile data
      return done(null, profile);
    }
  )
);

// Serialize user into the session
passport.serializeUser(function (user, done) {
  done(null, user);
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}
// Deserialize user from the session
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.user });
  console.log(req.user);
});

app.get("/error", isLoggedIn, (req, res) => {
  res.render("error");
});

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  })
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/error",
  })
);

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
