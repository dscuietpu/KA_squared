import { SOSCluster, Priority } from '@/lib/types';

const priorityBadge: Record<Priority, string> = {
  CRITICAL: 'bg-red-900 text-red-300',
  HIGH: 'bg-orange-900 text-orange-300',
  MEDIUM: 'bg-yellow-900 text-yellow-300',
  LOW: 'bg-green-900 text-green-300',
};

type Props = {
  clusters: SOSCluster[];
  selected: SOSCluster | null;
  onSelect: (c: SOSCluster) => void;
};

export default function SOSList({ clusters, selected, onSelect }: Props) {
  return (
    <div className="border-b border-gray-800">
      <div className="px-3 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-widest">SOS Clusters</span>
        <span className="text-xs text-gray-600">DBSCAN · 5min</span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            onClick={() => onSelect(cluster)}
            className={`px-3 py-2.5 border-b border-gray-800 cursor-pointer transition-colors ${
              selected?.id === cluster.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">
                Cluster {cluster.id} — {cluster.location}
              </span>
              <span className="text-xs text-gray-500">{cluster.timestamp}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded ${priorityBadge[cluster.priority]}`}>
                {cluster.priority}
              </span>
              <span className="text-xs text-gray-400">{cluster.count} signals</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">"{cluster.message}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}