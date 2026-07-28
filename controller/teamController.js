const Team = require("../models/Team");
const Employee = require("../models/Employee");

// Create a new team
exports.createTeam = async (req, res) => {
  try {
    const { teamName, description, teamLead, members, department, createdBy, createdByType } = req.body;

    // Validate required fields
    if (!teamName) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    // Create team
    const team = await Team.create({
      teamName,
      description: description || "",
      teamLead: teamLead || null,
      members: members || [],
      department: department || null,
      createdBy: createdBy || null,
      createdByType: createdByType || "admin",
    });

    // Populate team details
    const populatedTeam = await Team.findById(team._id)
      .populate("teamLead", "name email employeeId")
      .populate("members", "name email employeeId")
      .populate("department", "name")
      .populate("createdBy", "name");

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: populatedTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message,
    });
  }
};

// Get all teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("teamLead", "name email employeeId")
      .populate("members", "name email employeeId")
      .populate("department", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching teams",
      error: error.message,
    });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id)
      .populate("teamLead", "name email employeeId")
      .populate("members", "name email employeeId")
      .populate("department", "name")
      .populate("createdBy", "name");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team",
      error: error.message,
    });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { teamName, description, teamLead, members, department, status } = req.body;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Update fields
    if (teamName !== undefined) team.teamName = teamName;
    if (description !== undefined) team.description = description;
    if (teamLead !== undefined) team.teamLead = teamLead;
    if (members !== undefined) team.members = members;
    if (department !== undefined) team.department = department;
    if (status !== undefined) team.status = status;

    await team.save();

    // Populate updated team
    const updatedTeam = await Team.findById(team._id)
      .populate("teamLead", "name email employeeId")
      .populate("members", "name email employeeId")
      .populate("department", "name")
      .populate("createdBy", "name");

    res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({
      success: false,
      message: "Error updating team",
      error: error.message,
    });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    await Team.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting team",
      error: error.message,
    });
  }
};

// Get all employees for dropdown
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ status: "active" })
      .select("name email employeeId department role")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching employees",
      error: error.message,
    });
  }
};