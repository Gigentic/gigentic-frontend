'use client';

import { clusterApiUrl, Connection } from '@solana/web3.js';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { createContext, ReactNode, useContext } from 'react';
import toast from 'react-hot-toast';

export interface Cluster {
  name: string;
  endpoint: string;
  network?: ClusterNetwork;
  active?: boolean;
}

export enum ClusterNetwork {
  Local = 'local',
  Devnet = 'devnet',
  Testnet = 'testnet',
  Mainnet = 'mainnet-beta',
  Custom = 'custom',
}

// By default, we don't configure the mainnet-beta cluster
// The endpoint provided by clusterApiUrl('mainnet-beta') does not allow access from the browser due to CORS restrictions
// To use the mainnet-beta cluster, provide a custom endpoint
export const defaultClusters: Cluster[] = [
  {
    name: 'local',
    endpoint: 'http://localhost:8899',
    network: ClusterNetwork.Local,
  },
  {
    name: 'devnet',
    endpoint: clusterApiUrl('devnet'),
    network: ClusterNetwork.Devnet,
  },
  {
    name: 'soon-testnet',
    endpoint: 'https://rpc.testnet.soo.network/rpc',
    network: ClusterNetwork.Testnet,
  },
  // {
  //   name: 'soon-mainnet',
  //   endpoint: 'https://rpc.mainnet.soo.network/rpc',
  //   network: ClusterNetwork.Mainnet,
  // },
  {
    name: 'sonic-testnet',
    endpoint: 'https://api.testnet.sonic.game',
    network: ClusterNetwork.Testnet,
  },
];

const clusterAtom = atomWithStorage<Cluster>(
  'solana-cluster',
  defaultClusters[0],
);
const clustersAtom = atomWithStorage<Cluster[]>(
  'solana-clusters',
  defaultClusters,
);

const activeClustersAtom = atom<Cluster[]>((get) => {
  const clusters = get(clustersAtom);
  const cluster = get(clusterAtom);
  return clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));
});

const activeClusterAtom = atom<Cluster>((get) => {
  const clusters = get(activeClustersAtom);

  return clusters.find((item) => item.active) || clusters[0];
});

export interface ClusterProviderContext {
  cluster: Cluster;
  clusters: Cluster[];
  setCluster: (cluster: Cluster) => void;
  getExplorerUrl(path: string): string;
}

const Context = createContext<ClusterProviderContext>(
  {} as ClusterProviderContext,
);

export function ClusterProvider({ children }: { children: ReactNode }) {
  const cluster = useAtomValue(activeClusterAtom);
  const clusters = useAtomValue(activeClustersAtom);
  const setCluster = useSetAtom(clusterAtom);
  const setClusters = useSetAtom(clustersAtom);

  const value: ClusterProviderContext = {
    cluster,
    clusters: defaultClusters,
    setCluster: (cluster: Cluster) => setCluster(cluster),
    getExplorerUrl: (path: string) => {
      // Use Soon explorer for Soon networks
      const isSoonNetwork = cluster.name.startsWith('soon-');
      // Check if it's a Sonic network
      const isSonicNetwork = cluster.name.startsWith('sonic-');

      let baseUrl = 'https://explorer.solana.com';
      if (isSoonNetwork) {
        baseUrl = 'https://explorer.soo.network';
      } else if (isSonicNetwork) {
        baseUrl = 'https://explorer.sonic.game';
        // For Sonic networks, return with special cluster parameter format
        return `${baseUrl}/${path}?cluster=testnet.v1`;
      }

      return `${baseUrl}/${path}${getClusterUrlParam(cluster)}`;
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCluster() {
  return useContext(Context);
}

function getClusterUrlParam(cluster: Cluster): string {
  let suffix = '';
  switch (cluster.network) {
    case ClusterNetwork.Devnet:
      suffix = 'devnet';
      break;
    case ClusterNetwork.Mainnet:
      suffix = '';
      break;
    case ClusterNetwork.Testnet:
      suffix = 'testnet';
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : '';
}
