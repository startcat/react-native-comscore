import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { ComscoreConfiguration, ComscoreMetadata } from '../types';
import { ComscoreConnector } from '../api/ComscoreConnector';

type ComscoreContextType = {
  createConnector: (
    config: ComscoreConfiguration,
    metadata: ComscoreMetadata
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
    config: ComscoreConfiguration,
    metadata: ComscoreMetadata
  ): ComscoreConnector => {
    return new ComscoreConnector(config, metadata);
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
