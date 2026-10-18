import { WorkItemService } from '../services/workItemService.js';
import { getActivitiesForWorkItem } from '../services/activityService.js';
export const getWorkItems = async (req, res, next) => {
    try {
        const result = await WorkItemService.getWorkItems(req.user, req.query);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
export const getWorkItemById = async (req, res, next) => {
    try {
        const item = await WorkItemService.getWorkItemById(req.user, req.params.id);
        res.json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const createWorkItem = async (req, res, next) => {
    try {
        const item = await WorkItemService.createWorkItem(req.user, req.body);
        res.status(201).json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const updateWorkItem = async (req, res, next) => {
    try {
        const item = await WorkItemService.updateWorkItem(req.user, req.params.id, req.body);
        res.json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const claimWorkItem = async (req, res, next) => {
    try {
        const version = req.body.version !== undefined ? Number(req.body.version) : undefined;
        const item = await WorkItemService.claimWorkItem(req.user, req.params.id, version);
        res.json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const assignWorkItem = async (req, res, next) => {
    try {
        const item = await WorkItemService.assignWorkItem(req.user, req.params.id, req.body);
        res.json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const transitionWorkItem = async (req, res, next) => {
    try {
        const item = await WorkItemService.transitionWorkItem(req.user, req.params.id, req.body);
        res.json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
};
export const getActivities = async (req, res, next) => {
    try {
        // Check access first
        await WorkItemService.getWorkItemById(req.user, req.params.id);
        const activities = await getActivitiesForWorkItem(req.params.id);
        res.json({ success: true, data: activities });
    }
    catch (error) {
        next(error);
    }
};
export const addComment = async (req, res, next) => {
    try {
        const comment = await WorkItemService.addComment(req.user, req.params.id, req.body.body);
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        next(error);
    }
};
export const getComments = async (req, res, next) => {
    try {
        const comments = await WorkItemService.getComments(req.user, req.params.id);
        res.json({ success: true, data: comments });
    }
    catch (error) {
        next(error);
    }
};
