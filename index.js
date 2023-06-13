import koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import axios from "axios";

const app = new koa();
app.use(bodyParser());
const router = new Router();

const CWD = process.cwd();

function randomString(strLength, charSet) {
  var result = [];
  strLength = strLength || 5;
  charSet =
    charSet || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (strLength--) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join("");
}

// This route is meant to demonstrate the API interaction in the TravelSpot demo
router.post("/seedAccount", async (ctx) => {
  const body = ctx.request.body;

  const email =
    body && body.email
      ? body.email
      : ["test-", randomString(8), "@waldo.com"].join("");
  const password = body.password ? body.password : randomString(8);
  try {
    const response = await axios.post(
      "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=" +
        process.env.FIREBASE_API_KEY,
      {
        email: email,
        password: password,
        returnSecureToken: true,
      }
    );
    ctx.status = response.status;
    ctx.body = { ...response.data, password };
  } catch (e) {
    ctx.status =
      e.response && e.response.error && e.response.error.code
        ? e.response.error.code
        : 500;
    ctx.body =
      e.response && e.response.error && e.response.error.message
        ? e.response.error.message
        : "An error occured";
  }
});

// This route is intentionally going to return 500s in some cases, in order to demonstrate how to
// debug a server error right from Waldo Sessions using TravelSpot
router.get("/validateEmail", (ctx) => {
  const { email } = ctx.query;
  if (!email) {
    ctx.status = 400;
    ctx.body = { success: false, reason: "email is required in the query" };
  } else if (email.includes("waldo")) {
    // We let any waldo email go through
    ctx.body = { success: true };
  } else {
    const match = /([^@]+)@([^.]+)\.[^.]+$/.exec(email);
    const domain = match[2];
    if (domain === "gmail" || domain === "yahoo") {
      ctx.body = { success: true };
    } else {
      ctx.status = 400;
      ctx.body = {
        success: false,
        reason: `Domain ${domain} is not supported`,
      };
    }
  }
});

// This is a basic error handler, it is intentionally returning the message of 500 errors instead
// of obfuscating as we would usually do, to demonstrate how to debug a server error from Waldo
// Sessions
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    const { stack } = err;
    let message = stack;

    // A bit of over-engineering here, let's parse where the error comes from and link directly
    // into the GitHub line that corresponds to it
    const stackLines = stack.split("\n");
    const match = /([^:(\s]+):(\d+):(\d+)(\)*)$/.exec(stackLines[1]);
    if (match && match[1].includes(CWD)) {
      const [, filePath] = match[1].split(CWD);
      message += `\n\nSee more at https://github.com/waldoapp/TravelBack/blob/main${filePath}#L${match[2]}`;
    }

    ctx.body = message;
  }
});

app.use(router.routes());

// We're deploying on Heroku for convenience. Let's use the port they assign to us
const port = parseInt(process.env.PORT || "3000", 10);

app.listen(port, function () {
  console.log(`Server running on port ${port}`);
});
