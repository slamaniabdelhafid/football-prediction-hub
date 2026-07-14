import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <p className="text-[11px] font-mono text-turf uppercase tracking-widest mb-1">
        Restricted area
      </p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight mb-8">
        Admin Dashboard
      </h1>
      <AdminDashboard />
    </div>
  );
}
