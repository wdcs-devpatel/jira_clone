import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api"}/viewer`;

/* GET VIEWER ROLE DEFINITION */
export async function getViewerRole() {
  try {
    const res = await axios.get(API);
    return res.data;
  } catch (err) {
    console.error("Failed to fetch viewer role");
    return null;
  }
}

/* CHECK IF USER IS VIEWER */
export async function checkViewer(userId: number) {
  try {
    const res = await axios.get(`${API}/check/${userId}`);
    return res.data.isViewer;
  } catch (err) {
    console.error("Failed to check viewer role");
    return false;
  }
}