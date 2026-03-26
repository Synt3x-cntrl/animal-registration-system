const Appointment = require("../models/Appointment");
const DoctorSchedule = require("../models/DoctorSchedule");

/**
 * Automatically deletes expired appointments and doctor schedule slots.
 * This is called during fetch operations to keep the database clean.
 */
const cleanupExpiredData = async () => {
    try {
        const now = new Date().toISOString();
        
        // 1. Delete expired appointments
        const deletedAppts = await Appointment.deleteMany({
            date: { $lt: now }
        });
        
        // 2. Delete expired doctor slots
        const deletedSlots = await DoctorSchedule.deleteMany({
            date: { $lt: now }
        });
        
        if (deletedAppts.deletedCount > 0 || deletedSlots.deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${deletedAppts.deletedCount} expired appointments and ${deletedSlots.deletedCount} expired doctor slots.`);
        }
    } catch (err) {
        console.error("[Cleanup Error]", err.message);
    }
};

module.exports = { cleanupExpiredData };
