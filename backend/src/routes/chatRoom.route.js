import express from "express";
import {
    addMembers,
    createRoom,
    getAllRooms,
    leavingTheGroup,
    removeRoom,
    updateGroupRooms
} from "../controllers/chatRoom.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";


const router = express.Router();

router.use(arcjetProtection, protectRoute);


router.get('/all', getAllRooms)


router.post('/create', createRoom)

router.put('/update/:roomId', updateGroupRooms)
router.put('/addmember/:roomId', addMembers)
router.put('/leave/:roomId', leavingTheGroup)


router.delete('/remove/:roomId', removeRoom)



export default router