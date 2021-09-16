import express from 'express';

// controllers
import {
  signup,
  login,
  isLoggedIn,
  onlyAuthorized,
  activateAccount,
  sendResetPasswordToken,
  resetPassword,
  updatePassword,
  updateUser,
} from '../controllers/authController';

const router = express.Router();

// auth routeres
router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', login);
router.post('/islogedin', isLoggedIn);

// activate account
router.post('/activationToken/:token', activateAccount);

// reset password
router.post('/user/resetPassword', sendResetPasswordToken);
router.patch('/user/resetPassword/:token', resetPassword);

// update password
router.patch('/user/updatePassword', onlyAuthorized, updatePassword);

// user update
router.patch('/user/me', onlyAuthorized, updateUser);

// user delete TODO
router.delete('/user/me', (req, res) => {
  res.send('under construction');
});

export default router;
