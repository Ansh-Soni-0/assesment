import { DashboardService } from '../services/dashboardService.js';
export const getDashboardSummary = async (req, res, next) => {
    try {
        const summary = await DashboardService.getDashboardMetrics(req.user);
        res.json({ success: true, data: summary });
    }
    catch (error) {
        next(error);
    }
};
