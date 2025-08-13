"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = void 0;
// backend/src/reporting.ts
const https_1 = require("firebase-functions/v2/https");
const firebase_admin_1 = require("./firebase-admin"); // Import from our new centralized file
const generateReport = async (request) => {
    var _a;
    if (((_a = request.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== "admin") {
        throw new https_1.HttpsError("permission-denied", "You must be an admin to generate reports.");
    }
    const campersSnapshot = await firebase_admin_1.db.collection("campers").get();
    const sessionsSnapshot = await firebase_admin_1.db.collection("sessions").get();
    const campers = campersSnapshot.docs.map((doc) => doc.data());
    const sessions = sessionsSnapshot.docs.map((doc) => (Object.assign({ id: doc.id, name: doc.data().name }, doc.data())));
    const totalCampers = campers.length;
    const sessionEnrollment = sessions.map((session) => {
        const count = campers.filter((camper) => {
            var _a;
            return (_a = camper.sessionRegistrations) === null || _a === void 0 ? void 0 : _a.some((r) => r.sessionId === session.id && r.status === "enrolled");
        }).length;
        return { sessionName: session.name, enrolledCount: count };
    });
    const genderDistribution = campers.reduce((acc, camper) => {
        const gender = camper.gender || "Not Specified";
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
    }, {});
    const allergyDistribution = campers
        .flatMap((c) => { var _a; return ((_a = c.allergies) === null || _a === void 0 ? void 0 : _a.split(",").map((a) => a.trim().toLowerCase())) || []; })
        .filter((a) => a)
        .reduce((acc, allergy) => {
        acc[allergy] = (acc[allergy] || 0) + 1;
        return acc;
    }, {});
    const hospitalVisitsSnapshot = await firebase_admin_1.db.collectionGroup("chart")
        .where("type", "==", "hospital_visit").get();
    const hospitalVisitLog = hospitalVisitsSnapshot.docs.map((doc) => doc.data());
    return {
        totalCampers,
        sessionEnrollment,
        genderDistribution,
        allergyDistribution,
        hospitalVisitLog,
        generatedAt: new Date().toISOString(),
    };
};
exports.generateReport = generateReport;
//# sourceMappingURL=reporting.js.map