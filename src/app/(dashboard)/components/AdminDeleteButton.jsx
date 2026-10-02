"use client";

export default function AdminDeleteButton({ action, id, label = "Delete", confirmMessage = "Are you sure?" }) {
    return (
        <form
            action={action}
            onSubmit={(e) => {
                if (!confirm(confirmMessage)) {
                    e.preventDefault();
                }
            }}
        >
            <input type="hidden" name="id" value={id} />
            <button
                type="submit"
                className="btn btn-secondary"
                style={{
                    padding: "0.4rem 0.8rem",
                    fontSize: "0.85rem",
                    color: "#ef4444",
                    borderColor: "rgba(239, 68, 68, 0.3)"
                }}
            >
                {label}
            </button>
        </form>
    );
}
