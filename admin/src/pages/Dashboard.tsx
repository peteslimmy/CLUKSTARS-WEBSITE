import { Users, FileText, Mail, Activity } from 'lucide-react';

const stats = [
  { label: 'Total Users', value: '—', icon: Users, color: 'bg-blue-500' },
  { label: 'Published Pages', value: '—', icon: FileText, color: 'bg-teal-500' },
  { label: 'Form Submissions', value: '—', icon: Mail, color: 'bg-purple-500' },
  { label: 'Active Services', value: '—', icon: Activity, color: 'bg-amber-500' },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the CLUKSTARS CMS admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/organization" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Update Organization Info
            </a>
            <a href="/brand" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Configure Brand Settings
            </a>
            <a href="/users" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Manage Users
            </a>
            <a href="/social-links" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              Edit Social Links
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">API Status</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Redis</span>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Storage (MinIO)</span>
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
