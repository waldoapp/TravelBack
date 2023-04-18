
import koa from 'koa';
import Router from 'koa-router';

const app = new koa();
const router = new Router();

const GITHUB_REPO = 'waldoapp/TravelBack';

// This route is intentionally going to return 500s in some cases, in order to demonstrate how to
// debug a server error right from Waldo Sessions using TravelSpot
router.get('/validateEmail', (ctx) => {
   const { email } = ctx.query;
   if (!email) {
      ctx.status = 400;
      ctx.body = { success: false, reason: 'email is required in the query' };
   } else if (email.includes('waldo')) {
      // We let any waldo email go through
      ctx.body = { success: true };
   } else {
      const match = /([^@]+)@([^.]+)\.[^.]+$/.exec(email);
      const domain = match[2];
      if (domain === 'gmail' || domain === 'yahoo') {
         ctx.body = { success: true };
      } else {
         ctx.status = 400;
         ctx.body = { success: false, reason: `Domain ${domain} is not supported` };
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
      const stackLines = stack.split('\n');
      const match = /([^:(\s]+):(\d+):(\d+)(\)*)$/.exec(stackLines[1]);
      if (match && match[1].includes(GITHUB_REPO)) {
         const [,filePath] = match[1].split(GITHUB_REPO);
         message += `\n\nSee more at https://github.com/${GITHUB_REPO}/blob/main${filePath}#L${match[2]}`;
      }

      ctx.body = message;
   }
});

app.use(router.routes());

// We're deploying on Heroku for convenience. Let's use the port they assign to us
const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, function(){
   console.log(`Server running on port ${port}`);
});
