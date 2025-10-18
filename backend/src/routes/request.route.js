import express from "express";
import {
    sendRequest, getAllRequests, changeRequestStatus,getUsers
} from "../controllers/request.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";


const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get('/',getUsers)
router.get('/get', getAllRequests)
router.post('/send/:to', sendRequest)
router.post('/response/:requestId', changeRequestStatus)

export default router