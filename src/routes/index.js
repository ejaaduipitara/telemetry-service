const express = require('express'),
  router = express.Router(),
  telemetryService = require('../service/telemetry-service');

router.post('/v1/telemetry', (req, res) => telemetryService.dispatch(req, res));

router.post('/v1/metrics', (req, res) => telemetryService.getMetricsData(req, res));

router.post('/v1/dashboard/token', (req, res) => telemetryService.fetchDashboardToken(req, res));

router.get('/health', (req, res) => telemetryService.health(req, res));


module.exports = router;
