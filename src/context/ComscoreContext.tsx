import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { ComscoreConfiguration } from '../api/types/ComscoreConfiguration';
import type { ComscoreMetadata } from '../api/types/ComscoreMetadata';
import { ComscoreConnector } from '../api/ComscoreConnector';

type ComscoreContextType = {
  createConnector: (
    instanceId: number,
    metadata: ComscoreMetadata,
    config: ComscoreConfiguration
  ) => ComscoreConnector;
};

const ComscoreContext = createContext<ComscoreContextType | null>(null);

type ComscoreProviderProps = {
  children: ReactNode;
};

export const ComscoreProvider: React.FC<ComscoreProviderProps> = ({
  children,
}) => {
  const createConnector = (
    instanceId: number,
    metadata: ComscoreMetadata,
    config: ComscoreConfiguration
  ): ComscoreConnector => {
    return new ComscoreConnector(instanceId, metadata, config);
  };

  return (
    <ComscoreContext.Provider value={{ createConnector }}>
      {children}
    </ComscoreContext.Provider>
  );
};

export const useComscore = (): ComscoreContextType => {
  const context = useContext(ComscoreContext);
  if (!context) {
    throw new Error('useComscore must be used within a ComscoreProvider');
  }
  return context;
};
