# Complete Authentication and Authorization System Curated for Node.js

### Features:

- [x] Signup using email and password
- [x] On signup, send customized email for email confirmation
- [x] On email confirmation, send customized email of email verified notification
- [x] Signin to get accesstoken and refreshtoken
- [x] Update/Change password
- [x] Forgot password (send email to registered email)
- [x] Support for multiple sessions and single-session
- [x] Revoke accesstoken and refreshtoken (Log me out from all devices)

### Developer Features:

- [x] Has Middlewares to check if user is logged in, verified
- [x] Has Middleware, courtesy of [Thunder80](https://github.com/Thunder80), to check if user has a specific OAuth Scope

### Bucket List:

- [ ] Proper docs for usability
- [ ] Phone number and 2FA

### Take Care, Router

1. `/verify/:token` - For email verification
2. `/forgot-password/:token` - For forgot password
