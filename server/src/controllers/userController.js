import { UserService } from '../services/userService.js';
export const getUsers = async (req, res, next) => {
    try {
        const result = await UserService.getUsers(req.query);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
export const getUserById = async (req, res, next) => {
    try {
        const user = await UserService.getUserById(req.params.id);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
export const createUser = async (req, res, next) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const user = await UserService.updateUser(req.params.id, req.body);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
};
