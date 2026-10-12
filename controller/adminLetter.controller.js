const mongoose = require('mongoose');
const AdminLetter = require('../models/AdminLetter');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');
const Resignation = require('../models/Resignation');

// Helper to resolve employee
const resolveEmployee = async (identifier) => {
  if (!identifier) return null;
  const isObjId = mongoose.Types.ObjectId.isValid(identifier);
  return await Employee.findOne({
    $or: [
      ...(isObjId ? [{ _id: identifier }] : []),
      { employeeId: identifier },
      { email: identifier }
    ]
  });
};

// Helper to build search query for letters
const buildLetterQuery = async (identifier) => {
  const isObjId = mongoose.Types.ObjectId.isValid(identifier);
  const employee = await resolveEmployee(identifier);

  const orConditions = [
    { employeeId: identifier },
    ...(isObjId ? [{ employeeObjectId: identifier }] : [])
  ];

  if (employee) {
    if (employee.employeeId) {
      orConditions.push({ employeeId: employee.employeeId });
    }
    if (employee._id) {
      orConditions.push({ employeeObjectId: employee._id });
    }
  }

  return { query: { $or: orConditions }, employee };
};

// ✅ Helper — safely parse content (FormData sends string)
const parseContent = (content) => {
  if (!content) return {};
  if (typeof content === 'string') {
    try { return JSON.parse(content); } catch { return {}; }
  }
  return content;
};

// ✅ Helper — build PDF URL from multer file
const buildPdfUrl = (file) => {
  if (!file) return null;
  return `/uploads/letters/${file.filename}`;
};

// 1. Save Letter Draft
exports.saveLetterDraft = async (req, res) => {
  try {
    const { employeeId, employeeName, letterType } = req.body;
    const content = parseContent(req.body.content);

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee identifier is required' });
    }

    const { query, employee } = await buildLetterQuery(employeeId);
    const resolvedEmployeeId = employee?.employeeId || employeeId;
    const resolvedObjectId = employee?._id || (mongoose.Types.ObjectId.isValid(employeeId) ? employeeId : undefined);
    const resolvedName = employeeName || employee?.name || content?.employeeName || '';
    const letterPdfUrl = buildPdfUrl(req.file); // ✅ PDF URL

    // Check if an existing draft exists for this letterType
    let letter = await AdminLetter.findOne({ ...query, letterType, status: 'draft' });

    if (letter) {
      letter.content = content || {};
      letter.employeeName = resolvedName;
      if (resolvedObjectId) letter.employeeObjectId = resolvedObjectId;
      if (resolvedEmployeeId) letter.employeeId = resolvedEmployeeId;
      if (letterPdfUrl) letter.letterPdfUrl = letterPdfUrl; // ✅
      await letter.save();
    } else {
      letter = await AdminLetter.create({
        employeeId: resolvedEmployeeId,
        employeeObjectId: resolvedObjectId,
        employeeName: resolvedName,
        letterType: letterType || 'experience',
        content: content || {},
        status: 'draft',
        letterPdfUrl: letterPdfUrl || null, // ✅
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Letter draft saved successfully',
      data: letter
    });
  } catch (error) {
    console.error('Error saving letter draft:', error);
    return res.status(500).json({ success: false, message: 'Failed to save letter draft', error: error.message });
  }
};

// 2. Send Letter
exports.sendLetter = async (req, res) => {
  try {
    const { employeeId, employeeName, letterType } = req.body;
    const content = parseContent(req.body.content);

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee identifier is required' });
    }

    const { query, employee } = await buildLetterQuery(employeeId);
    const resolvedEmployeeId = employee?.employeeId || employeeId;
    const resolvedObjectId = employee?._id || (mongoose.Types.ObjectId.isValid(employeeId) ? employeeId : undefined);
    const resolvedName = employeeName || employee?.name || content?.employeeName || '';
    const letterPdfUrl = buildPdfUrl(req.file); // ✅ PDF URL

    // Check if an existing draft or letter exists
    let letter = await AdminLetter.findOne({ ...query, letterType, status: 'draft' });

    if (letter) {
      letter.content = content || {};
      letter.employeeName = resolvedName;
      letter.status = 'sent';
      letter.sentAt = new Date();
      if (resolvedObjectId) letter.employeeObjectId = resolvedObjectId;
      if (resolvedEmployeeId) letter.employeeId = resolvedEmployeeId;
      if (letterPdfUrl) letter.letterPdfUrl = letterPdfUrl; // ✅
      await letter.save();
    } else {
      letter = await AdminLetter.create({
        employeeId: resolvedEmployeeId,
        employeeObjectId: resolvedObjectId,
        employeeName: resolvedName,
        letterType: letterType || 'experience',
        content: content || {},
        status: 'sent',
        sentAt: new Date(),
        letterPdfUrl: letterPdfUrl || null, // ✅
      });
    }

    // Send notification to employee
    try {
      const notifyUserId = employee?.employeeId || employee?._id?.toString() || resolvedEmployeeId;
      const typeLabel = (letterType || 'letter').charAt(0).toUpperCase() + (letterType || 'letter').slice(1);
      await Notification.create({
        userId: notifyUserId,
        role: 'employee',
        title: `${typeLabel} Letter Issued`,
        message: `Your ${letterType} letter has been generated and sent to your account.`,
        type: 'general'
      });
    } catch (notifErr) {
      console.warn('Could not create notification for letter:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Letter sent successfully',
      data: letter
    });
  } catch (error) {
    console.error('Error sending letter:', error);
    return res.status(500).json({ success: false, message: 'Failed to send letter', error: error.message });
  }
};

// 3. Get Employee Letters
exports.getEmployeeLetters = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { letterType } = req.query;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee identifier is required' });
    }

    const { query } = await buildLetterQuery(employeeId);

    if (letterType) {
      const letter = await AdminLetter.findOne({ ...query, letterType }).sort({ updatedAt: -1 });
      return res.status(200).json({
        success: true,
        data: letter || null
      });
    }

    const letters = await AdminLetter.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: letters || []
    });
  } catch (error) {
    console.error('Error getting employee letters:', error);
    return res.status(500).json({ success: false, message: 'Failed to get letters', error: error.message });
  }
};

// 4. Get Letter by ID
exports.getLetterById = async (req, res) => {
  try {
    const { letterId } = req.params;
    if (!letterId || !mongoose.Types.ObjectId.isValid(letterId)) {
      return res.status(400).json({ success: false, message: 'Valid letter ID is required' });
    }

    const letter = await AdminLetter.findById(letterId);
    if (!letter) {
      return res.status(404).json({ success: false, message: 'Letter not found' });
    }

    return res.status(200).json({
      success: true,
      data: letter
    });
  } catch (error) {
    console.error('Error getting letter by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to get letter details', error: error.message });
  }
};

// Get Letters by Employee ID (with resignation data)
exports.getLettersByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId || employeeId.trim() === '') {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const cleanEmployeeId = employeeId.trim();

    // ✅ Fetch letters for this employee
    const letters = await AdminLetter.find({ employeeId: cleanEmployeeId });

    // ✅ Fetch resignation for this employee (if any)
    let resignation = null;
    try {
      resignation = await Resignation.findOne({ employeeId: cleanEmployeeId }).sort({ createdAt: -1 });
    } catch (rErr) {
      console.warn('Resignation fetch failed (non-blocking):', rErr.message);
    }

    // If no letters AND no resignation — return empty (200 with empty data instead of 404)
    if ((!letters || letters.length === 0) && !resignation) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No letters or resignation found for this employee',
        data: [],
        resignation: null,
      });
    }

    return res.status(200).json({
      success: true,
      count: letters ? letters.length : 0,
      data: letters || [],
      resignation: resignation || null,   // ✅ Resignation bhi bhej do
    });
  } catch (error) {
    console.error('Error getting letters by employee id:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get letters',
      error: error.message,
    });
  }
};


// GET ALL RESIGNATIONS
exports.getAllResignations = async (req, res) => {
  try {
    const resignations = await Resignation.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All resignations fetched successfully",
      count: resignations.length,
      data: resignations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




// ═══════════════════════════════════════════════════════════
// UPDATE RESIGNATION — Controller
// ═══════════════════════════════════════════════════════════
exports.updateResignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, rejectedReason, adminRemark } = req.body;

    // ── Validate status ──
    const allowedStatuses = ['pending', 'approved', 'rejected', 'withdrawn'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    // ── Find resignation ──
    const resignation = await Resignation.findById(id);
    if (!resignation) {
      return res.status(404).json({
        success: false,
        message: 'Resignation not found',
      });
    }

    // ── Build update payload ──
    const updatePayload = {
      status,
      adminRemark: adminRemark || '',
    };

    // If approved → set approvedBy & approvedAt
    if (status === 'approved') {
      updatePayload.approvedBy = approvedBy || 'Admin';
      updatePayload.approvedAt = new Date();
      updatePayload.rejectedReason = '';
    }

    // If rejected → require reason
    if (status === 'rejected') {
      if (!rejectedReason || !rejectedReason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }
      updatePayload.rejectedReason = rejectedReason.trim();
      updatePayload.approvedBy = approvedBy || 'Admin';
      updatePayload.approvedAt = new Date();
    }

    // If withdrawn → no approval fields
    if (status === 'withdrawn') {
      updatePayload.rejectedReason = '';
    }

    // ── Update ──
    const updatedResignation = await Resignation.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `Resignation ${status} successfully`,
      data: updatedResignation,
    });
  } catch (error) {
    console.error('Error updating resignation:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};




exports.submitResignation = async (req, res) => {
  try {
    const {
      employeeId,
      resignationDate,
      lastWorkingDate,
      noticePeriodDays,
      reasonCategory,
      reason,
      comments,
    } = req.body;

    // ── Validation ──
    if (!employeeId || employeeId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    if (!lastWorkingDate) {
      return res.status(400).json({
        success: false,
        message: "Last working date is required",
      });
    }

    // ── Find employee ──
    const employee = await Employee.findOne({ employeeId: employeeId.trim() });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found with this ID",
      });
    }

    // ── Check if already has pending resignation ──
    const existingPending = await Resignation.findOne({
      employeeId: employeeId.trim(),
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending resignation request",
      });
    }

    // ── Calculate short notice (if LWD < resignation date + notice period) ──
    const resignDate = resignationDate ? new Date(resignationDate) : new Date();
    const lwdDate = new Date(lastWorkingDate);
    const expectedLWD = new Date(resignDate);
    expectedLWD.setDate(expectedLWD.getDate() + (Number(noticePeriodDays) || 30));

    let isShortNotice = false;
    let shortNoticeDays = 0;

    if (lwdDate < expectedLWD) {
      const diffMs = expectedLWD - lwdDate;
      shortNoticeDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      isShortNotice = true;
    }

    // ── Create resignation record ──
    const resignation = await Resignation.create({
      employeeId: employeeId.trim(),
      employeeObjectId: employee._id,
      employeeName: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      designation: employee.role || employee.designation || "",
      joiningDate: employee.joinDate || null,
      resignationDate: resignDate,
      lastWorkingDate: lwdDate,
      noticePeriodDays: Number(noticePeriodDays) || 30,
      reasonCategory: reasonCategory || "Other",
      reason: reason.trim(),
      comments: comments || "",
      status: "pending",
      isShortNotice,
      shortNoticeDays,
    });

    return res.status(201).json({
      success: true,
      message: "Resignation request submitted successfully",
      data: resignation,
    });
  } catch (error) {
    console.error("Error submitting resignation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit resignation",
      error: error.message,
    });
  }
};
