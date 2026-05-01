import { toast } from "react-toastify";

export const showSuccess = (msg) => toast.success(msg);
export const showError   = (msg) => toast.error(msg);
export const showInfo    = (msg) => toast.info(msg);
export const showWarning = (msg) => toast.warning(msg);

// Custom confirm dialog using toast — returns a Promise<boolean>
export const confirmToast = (message) =>
  new Promise((resolve) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">{message}</p>
          <div className="flex gap-2">
            <button
              onClick={() => { resolve(true);  closeToast(); }}
              className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => { resolve(false); closeToast(); }}
              className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose:       false,
        closeOnClick:    false,
        draggable:       false,
        closeButton:     false,
        style:           { background: "#fff", color: "#111", borderRadius: "14px", padding: "16px", minWidth: "260px" },
        icon:            "🗑️",
      }
    );
  });
