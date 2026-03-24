import { api } from "./authService";

/**
 * UPLOAD ATTACHMENT
 * Sends a file to the MongoDB microservice for a specific task.
 */
export async function uploadAttachment(taskId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);      

  const res = await api.post(
    `/attachments/${taskId}`,
    formData,
    {
      headers: {
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
  const res = await api.get(`/attachments/${taskId}`);
  return res.data;
}

/**
 * ✅ NEW: DELETE ATTACHMENT
 * Removes the attachment from MongoDB and deletes the physical file from the server.
 */
export async function deleteAttachment(id: string) {
  const res = await api.delete(`/attachments/${id}`);
  return res.data;
}