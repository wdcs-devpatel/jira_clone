import axios from "axios";

const MONGO_API = import.meta.env.VITE_MONGO_API || "http://localhost:5002/api";

/**
 * UPLOAD ATTACHMENT
 * Sends a file to the MongoDB microservice for a specific task.
 */
export async function uploadAttachment(taskId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);      

  const res = await axios.post(
    `${MONGO_API}/attachments/${taskId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}
  
/**
 * GET ATTACHMENTS
 * Fetches all attachment metadata associated with a specific taskId.
 */
export async function getAttachments(taskId: string) {
  const res = await axios.get(
    `${MONGO_API}/attachments/${taskId}`,
  );

  return res.data;
}

/**
 * ✅ NEW: DELETE ATTACHMENT
 * Removes the attachment from MongoDB and deletes the physical file from the server.
 */
export async function deleteAttachment(id: string) {
  const res = await axios.delete(
    `${MONGO_API}/attachments/${id}`,
   
  );

  return res.data;
}