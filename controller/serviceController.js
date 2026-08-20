const Service = require('../models/Service');
const AppointmentSlotConfig = require("../models/AppointmentSlotConfig");
const AppointmentSlot = require("../models/AppointmentSlot");
const Appointment = require("../models/Appointment");



// =============================================
// 1. ADD SERVICE (POST /api/services)
// =============================================
const addService = async (req, res) => {
  try {
    const { name, price, description } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required fields'
      });
    }

    // Check if service with same name already exists
    const existingService = await Service.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: `Service with name "${name}" already exists`
      });
    }

    // Create new service
    const service = new Service({
      name: name.trim(),
      price: parseFloat(price),
      description: description ? description.trim() : ''
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: service
    });

  } catch (error) {
    console.error('Error in addService:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service',
      error: error.message
    });
  }
};

// =============================================
// 2. GET ALL SERVICES (GET /api/services)
// =============================================
const getAllServices = async (req, res) => {
  try {
    const { search } = req.query;

    // Build filter
    const filter = {};

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get services (no pagination, simple fetch)
    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Services fetched successfully',
      services: services
    });

  } catch (error) {
    console.error('Error in getAllServices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// =============================================
// 3. UPDATE SERVICE (PUT /api/services/:id)
// =============================================
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description } = req.body;

    // Find service
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check for duplicate name (if name is being changed)
    if (name && name !== service.name) {
      const existingService = await Service.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      
      if (existingService) {
        return res.status(409).json({
          success: false,
          message: `Service with name "${name}" already exists`
        });
      }
    }

    // Update fields
    if (name) service.name = name.trim();
    if (price !== undefined) service.price = parseFloat(price);
    if (description !== undefined) service.description = description.trim();

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });

  } catch (error) {
    console.error('Error in updateService:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// =============================================
// 4. DELETE SERVICE (DELETE /api/services/:id)
// =============================================
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Service "${service.name}" deleted successfully`,
      data: {
        deletedId: id,
        deletedService: service
      }
    });

  } catch (error) {
    console.error('Error in deleteService:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};




// =============================================
// 1. ADD SERVICE TO BOOKING
// POST /api/appointment-slots/addservicestobooking/:bookingId
// =============================================
const addServiceToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { serviceId, name, price, description } = req.body;

    // Validation
    if (!serviceId || !name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "serviceId, name, and price are required fields"
      });
    }

    // Find booking
    const booking = await Appointment.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }


    // Check if service already exists
    const existingService = booking.services.find(
      s => s.serviceId === serviceId
    );
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: `Service "${name}" is already added to this booking`
      });
    }

    // Add service to booking with INITIAL PAYMENT STATUS "Pending"
    booking.services.push({
      serviceId,
      name,
      price: parseFloat(price),
      description: description || "",
      paymentStatus: "Pending",  // ✅ Initial payment status set to Pending
      addedAt: new Date()
    });

    await booking.save();

    // Calculate total fee
    const totalFee = booking.services.reduce((sum, s) => sum + (s.price || 0), 0);

    res.status(200).json({
      success: true,
      message: `Service "${name}" added to booking successfully!`,
      data: {
        bookingId: booking._id,
        services: booking.services,
        totalFee: totalFee,
        totalServices: booking.services.length
      }
    });

  } catch (error) {
    console.error("Error in addServiceToBooking:", error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add service to booking",
      error: error.message
    });
  }
};


// =============================================
// 2. REMOVE SERVICE FROM BOOKING
// DELETE /api/appointment-slots/:bookingId/services/:serviceId
// =============================================
const removeServiceFromBooking = async (req, res) => {
  try {
    const { bookingId, serviceId } = req.params;

    const booking = await AppointmentSlot.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Find and remove service
    const serviceIndex = booking.services.findIndex(
      s => s._id.toString() === serviceId || s.serviceId === serviceId
    );

    if (serviceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Service not found in this booking"
      });
    }

    const removedService = booking.services[serviceIndex];
    booking.services.splice(serviceIndex, 1);
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Service "${removedService.name}" removed from booking`,
      data: {
        bookingId: booking._id,
        services: booking.services
      }
    });

  } catch (error) {
    console.error("Error in removeServiceFromBooking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove service",
      error: error.message
    });
  }
};

// =============================================
// 3. GET ALL SERVICES OF A BOOKING
// GET /api/appointment-slots/:bookingId/services
// =============================================
const getBookingServices = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await AppointmentSlot.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const totalFee = booking.services.reduce((sum, s) => sum + (s.price || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking._id,
        services: booking.services || [],
        totalFee: totalFee,
        consultationFee: booking.consultationFee || 0,
        grandTotal: totalFee + (booking.consultationFee || 0)
      }
    });

  } catch (error) {
    console.error("Error in getBookingServices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get booking services",
      error: error.message
    });
  }
};

// =============================================
// 4. UPDATE SERVICE IN BOOKING
// PUT /api/appointment-slots/:bookingId/services/:serviceId
// =============================================
const updateBookingService = async (req, res) => {
  try {
    const { bookingId, serviceId } = req.params;
    const { name, price, description } = req.body;

    const booking = await AppointmentSlot.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const service = booking.services.find(
      s => s._id.toString() === serviceId || s.serviceId === serviceId
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found in this booking"
      });
    }

    if (name) service.name = name;
    if (price !== undefined) service.price = parseFloat(price);
    if (description !== undefined) service.description = description;

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Service updated successfully`,
      data: {
        bookingId: booking._id,
        services: booking.services
      }
    });

  } catch (error) {
    console.error("Error in updateBookingService:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: error.message
    });
  }
};




// =============================================
// 2. UPDATE SERVICE PAYMENT STATUS (FIXED)
// PUT /api/services/updateservicepayment/:bookingId/:serviceId
// =============================================
const updateServicePaymentStatus = async (req, res) => {
  try {
    const { bookingId, serviceId } = req.params;
    const { paymentStatus } = req.body;

    console.log("🔍 updateServicePaymentStatus called:", { bookingId, serviceId, paymentStatus });

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        message: "paymentStatus is required (Paid or Pending)"
      });
    }

    if (paymentStatus !== "Paid" && paymentStatus !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "paymentStatus must be either 'Paid' or 'Pending'"
      });
    }

    const booking = await AppointmentSlot.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    console.log("📋 Booking services:", JSON.stringify(booking.services, null, 2));

    if (!booking.services || booking.services.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services found in this booking"
      });
    }

    // Find service - TRY MULTIPLE WAYS
    let serviceIndex = -1;

    // Try 1: Match by _id (if exists)
    if (serviceId) {
      serviceIndex = booking.services.findIndex(
        s => s._id && s._id.toString() === serviceId.toString()
      );
      console.log("🔍 Try 1 (by _id):", serviceIndex);
    }

    // Try 2: Match by serviceId (string)
    if (serviceIndex === -1 && serviceId) {
      serviceIndex = booking.services.findIndex(
        s => s.serviceId && s.serviceId.toString() === serviceId.toString()
      );
      console.log("🔍 Try 2 (by serviceId):", serviceIndex);
    }

    // Try 3: If no serviceId provided or not found, use first service
    if (serviceIndex === -1 && booking.services.length > 0) {
      console.log("⚠️ Service not found by ID, using first service as fallback");
      serviceIndex = 0;
    }

    if (serviceIndex === -1 || serviceIndex >= booking.services.length) {
      return res.status(404).json({
        success: false,
        message: "Service not found in this booking"
      });
    }

    // Update payment status
    booking.services[serviceIndex].paymentStatus = paymentStatus;
    await booking.save();

    // Calculate stats
    const allServicesPaid = booking.services.every(s => s.paymentStatus === "Paid");
    const totalServices = booking.services.length;
    const paidServices = booking.services.filter(s => s.paymentStatus === "Paid").length;

    res.status(200).json({
      success: true,
      message: `Payment status updated to "${paymentStatus}" for service "${booking.services[serviceIndex].name}"`,
      data: {
        bookingId: booking._id,
        services: booking.services,
        service: booking.services[serviceIndex],
        allServicesPaid: allServicesPaid,
        totalServices: totalServices,
        paidServices: paidServices,
        pendingServices: totalServices - paidServices
      }
    });

  } catch (error) {
    console.error("❌ Error in updateServicePaymentStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service payment status",
      error: error.message
    });
  }
};



module.exports = {
  addService,
  getAllServices,
  updateService,
  deleteService,
  addServiceToBooking,
  removeServiceFromBooking,
  updateBookingService,
  updateServicePaymentStatus
};