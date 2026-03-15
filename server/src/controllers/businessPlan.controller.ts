import { Request, Response, NextFunction } from 'express';
import { BusinessPlanService } from '../services/businessPlan.service';
import { UUID } from '../types';
import { BusinessPlanQuery } from '../types/b2b.types';

const businessPlanService = new BusinessPlanService();

export const BusinessPlanController = {
  // CREATE BUSINESS PLAN
  async createBusinessPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const businessPlan = await businessPlanService.createBusinessPlan(req.body);

      return res.status(201).json({
        message: 'Business plan created successfully',
        data: businessPlan,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET BUSINESS PLAN BY ID
  async getBusinessPlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const businessPlan = await businessPlanService.getBusinessPlanById(
        id as UUID
      );

      return res.status(200).json({
        message: 'Business plan fetched successfully',
        data: businessPlan,
      });
    } catch (error) {
      next(error);
    }
  },

  // UPDATE BUSINESS PLAN
  async updateBusinessPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const businessPlan = await businessPlanService.updateBusinessPlan(
        id as UUID,
        req.body
      );

      return res.status(200).json({
        message: 'Business plan updated successfully',
        data: businessPlan,
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE BUSINESS PLAN
  async deleteBusinessPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await businessPlanService.deleteBusinessPlan(id as UUID);

      return res.status(200).json({
        message: 'Business plan deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // FETCH BUSINESS PLANS
  async fetchBusinessPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const businessPlans = await businessPlanService.fetchBusinessPlans(
        req.query as BusinessPlanQuery
      );

      return res.status(200).json({
        message: 'Business plans fetched successfully',
        data: businessPlans,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ACTIVE PLANS
  async getActivePlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await businessPlanService.getActivePlans();

      return res.status(200).json({
        message: 'Active business plans fetched successfully',
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ACTIVE PLANS WITH STATS (ADMIN)
  async getActivePlansWithStats(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await businessPlanService.getActivePlansWithStats();

      return res.status(200).json({
        message: 'Active business plans with stats fetched successfully',
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET AVAILABLE PLANS FOR BUSINESS USERS
  async getAvailablePlansForBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await businessPlanService.getAvailablePlansForBusiness();

      return res.status(200).json({
        message: 'Available business plans fetched successfully',
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET PUBLIC BUSINESS PLANS
  async getPublicBusinessPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await businessPlanService.getPublicBusinessPlans();

      return res.status(200).json({
        message: 'Public business plans fetched successfully',
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET ORGANIZATION COUNT FOR PLAN
  async getOrganizationCountForPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const count = await businessPlanService.getOrganizationCountForPlan(
        id as UUID
      );

      return res.status(200).json({
        message: 'Organization count fetched successfully',
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  },
};
