export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md">
      <h1 className="text-2xl font-bold text-slate-800">Admin</h1>
      <p className="mt-2 text-sm text-slate-500">
        This page is only accessible to administrators.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Question Bank Management
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Edit and manage the PeerPrep question bank.
          </p>
          <p className="mt-3 text-xs text-slate-400">Coming soon</p>
        </div>

        <div className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-800">
            Promote Users to Admin
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage admin privileges for other users.
          </p>
          <p className="mt-3 text-xs text-slate-400">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
