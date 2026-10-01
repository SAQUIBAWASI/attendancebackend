const mongoose = require('mongoose');
const AdminLetter = require('../models/AdminLetter');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

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

// Get Letters by Employee ID
exports.getLettersByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId || employeeId.trim() === '') {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const letters = await AdminLetter.find({ employeeId: employeeId.trim() });
    if (!letters || letters.length === 0) {
      return res.status(404).json({ success: false, message: 'No letters found for this employee' });
    }

    return res.status(200).json({
      success: true,
      count: letters.length,
      data: letters
    });
  } catch (error) {
    console.error('Error getting letters by employee id:', error);
    return res.status(500).json({ success: false, message: 'Failed to get letters', error: error.message });
  }
};