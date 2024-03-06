import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import users from "./users.js";

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "Random string";
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    const user = users.find((user) => user.id === jwt_payload.id);

    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
);
