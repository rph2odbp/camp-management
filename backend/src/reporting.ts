// backend/src/reporting.ts
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase-admin"; // Import from our new centralized file

export const generateReport = async (request: any) => {
  if (request.auth?.token.role !== "admin") {
    throw new HttpsError("permission-denied", "You must be an admin to generate reports.");
  }

  const campersSnapshot = await db.collection("campers").get();
  const sessionsSnapshot = await db.collection("sessions").get();

  const campers = campersSnapshot.docs.map((doc) => doc.data());
  const sessions = sessionsSnapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    ...doc.data(),
  }));

  const totalCampers = campers.length;

  const sessionEnrollment = sessions.map((session) => {
    const count = campers.filter((camper) =>
      camper.sessionRegistrations?.some((r: { sessionId: any; status: string; }) =>
        r.sessionId === session.id && r.status === "enrolled"
      )
    ).length;
    return { sessionName: session.name, enrolledCount: count };
  });

  const genderDistribution = campers.reduce((acc, camper) => {
    const gender = camper.gender || "Not Specified";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allergyDistribution = campers
    .flatMap((c) => c.allergies?.split(",").map((a: string) => a.trim().toLowerCase()) || [])
    .filter((a) => a)
    .reduce((acc, allergy) => {
      acc[allergy] = (acc[allergy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const hospitalVisitsSnapshot = await db.collectionGroup("chart")
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
