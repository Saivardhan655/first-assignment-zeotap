import express from 'express';
import {
    createRuleHandler,
    getParentASTHandler,
    getLatestRuleHandler,
    combineASTsHandler,
    evaluateRuleHandler
} from '../controllers/ruleController.js';

const router = express.Router();

router.post('/create_rule', createRuleHandler);
router.get('/parent_ast', getParentASTHandler);
router.get('/latest_rule', getLatestRuleHandler);
router.post('/combine_ast', combineASTsHandler);
router.post('/evaluate_rule',evaluateRuleHandler);

export default router;
