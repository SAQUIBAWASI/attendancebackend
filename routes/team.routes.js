const express = require('express');
const router = express.Router();
const {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  getAllEmployees
} = require('../controller/teamController');

// ✅ CREATE
router.post('/create', createTeam);

// ✅ READ
router.get('/all', getAllTeams);
router.get('/employees/list', getAllEmployees);
router.get('/:id', getTeamById);

// ✅ UPDATE
router.put('/update/:id', updateTeam);

// ✅ DELETE
router.delete('/delete/:id', deleteTeam);

module.exports = router;