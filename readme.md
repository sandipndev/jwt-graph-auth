# Complete Authentication System Curated for Node.js

Work In Progress.

### Features:

- [x] Signup using email and password
- [x] On signup, send customized email for email confirmation
- [x] On email confirmation, send customized email of email verified notification
- [x] Signin to get accesstoken and refreshtoken
- [x] Update/Change password
- [x] Forgot password (send email to registered email)
- [x] Support for multiple sessions and single-session
- [ ] Revoke accesstoken and refreshtoken (Log me out from all devices)

### Bucket List:

- [ ] Proper docs for usability
- [ ] Phone number and 2FA
- [ ] Nice UI of pages

### Take Care, Router

1. `/verify/:id/:token` - For email verification
2. `/forgot-password/:token` - For forgot password
