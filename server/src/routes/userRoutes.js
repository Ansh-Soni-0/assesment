import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { requireGlobalRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema } from '../schemas/userSchemas.js';
const router = Router();
// All user routes require authentication
router.use(authenticate);
// List users (accessible to members for assignment/collaboration, admin gets full view)
router.get('/', getUsers);
router.get('/:id', getUserById);
// Admin only actions
router.post('/', requireGlobalRole(['ADMIN']), validateBody(createUserSchema), createUser);
router.patch('/:id', requireGlobalRole(['ADMIN']), validateBody(updateUserSchema), updateUser);
export default router;
