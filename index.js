
import koa from 'koa';
import Router from 'koa-router';

const app = new koa();
const router = new Router();

// This route is intentionally going to return 500s in some cases, in order to demonstrate how to
// debug a server error right from Waldo Sessions using TravelSpot
router.get('/validateEmail', (ctx) => {
   const { email } = ctx.query;
   if (email.includes('waldo')) {
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
      ctx.body = err.message;
   }
});

app.use(router.routes());

// We're deploying on Heroku for convenience. Let's use the port they assign to us
const port = parseInt(process.env.PORT || '3000', 10);

app.listen(port, function(){
   console.log(`Server running on port ${port}`);
});
