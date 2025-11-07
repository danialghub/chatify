import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { getUsers } from '../controllers/user.controller.js';

const router = express.Router()

router.use(arcjetProtection, protectRoute);


router.get('/all',getUsers)



export default router