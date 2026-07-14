const router=require('express').Router(), c=require('../controllers/authController'), {authenticate}=require('../middleware/auth');
router.post('/register',c.register); router.post('/login',c.login); router.post('/logout',c.logout); router.get('/profile',authenticate,c.profile); router.put('/profile',authenticate,c.updateProfile); module.exports=router;
