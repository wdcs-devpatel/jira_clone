import { api } from "./authService";

/* GET VIEWER ROLE DEFINITION */
export async function getViewerRole() {
  try {
    const res = await api.get("/viewer");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch viewer role");
    return null;
  }
}

/* CHECK IF USER IS VIEWER */
export async function checkViewer(userId: number) {
  try {
    const res = await api.get(`/viewer/check/${userId}`);
    return res.data.isViewer;
  } catch (err) {
    console.error("Failed to check viewer role");
    return false;
  }
}