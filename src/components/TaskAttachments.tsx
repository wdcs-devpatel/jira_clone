import { Upload, FileText, Trash2 } from "lucide-react";

/**
 * ✅ Exported for use in TaskDetails.tsx to maintain 
 * strict typing across the component boundary.
 */
export interface Attachment {
  _id: string;
  filename: string;
  fileUrl: string;
}

interface Props {
  attachments: Attachment[];
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  handleFileUpload: () => void;
  handleDeleteAttachment: (id: string) => void;
  setPreviewImage: (url: string | null) => void;
  isCreateMode: boolean;
}

export default function TaskAttachments({
  attachments,
  selectedFile,
  setSelectedFile,
  handleFileUpload,
  handleDeleteAttachment,
  setPreviewImage,
  isCreateMode
}: Props) {

  return (
    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">

      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-6">
        Attachments
      </h3>

      {/* Upload Area */}
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
        
        <Upload size={22} className="text-slate-400 group-hover:text-indigo-500 mb-2 transition-all" />

        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Click or drag file to upload
        </p>

        <input
          type="file"
          className="hidden"
          onChange={(e) =>
            setSelectedFile(e.target.files ? e.target.files[0] : null)
          }
        />

      </label>


      {/* Selected File Feedback */}
      {selectedFile && (
        <div className="mt-4 flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4 rounded-2xl animate-in slide-in-from-top-1 duration-200">

          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-indigo-500 text-white p-2 rounded-lg shrink-0">
               <FileText size={14} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
              {selectedFile.name}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleFileUpload}
              disabled={isCreateMode}
              className={`bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${
                isCreateMode ? "opacity-50 cursor-not-allowed" : "active:scale-95"
              }`}
            >
              Upload
            </button>
          </div>

        </div>
      )}

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-8">

          {attachments.map((file) => {
            const baseUrl = import.meta.env.VITE_API_BASE_URL 
              ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
              : "http://localhost:5002";
            const fileUrl = `${baseUrl}${file.fileUrl}`;
            const isImage = file.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);

            return (
              <div
                key={file._id}
                className="relative group h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm transition-all hover:ring-2 ring-indigo-500/30"
              >

                {isImage ? (
                  <img
                    src={fileUrl}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                    onClick={() => setPreviewImage(fileUrl)}
                    alt="attachment"
                  />
                ) : (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full h-full flex flex-col items-center justify-center gap-1 text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileText size={24} />
                    <span className="text-[8px] font-black uppercase">
                      Open
                    </span>
                  </a>
                )}

                <button
                  onClick={() => handleDeleteAttachment(file._id)}
                  className="absolute top-1.5 right-1.5 bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md active:scale-90"
                >
                  <Trash2 size={12} />
                </button>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}   