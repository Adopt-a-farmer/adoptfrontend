import api from './api';

export interface BlockchainStatus {
  success: boolean;
  connected: boolean;
  network: string;
  chainId: number;
  blockNumber: number;
  contracts: {
    farmRegistry: string;
    traceability: string;
  };
}

export interface BlockchainTransaction {
  _id: string;
  userId: string;
  transactionHash: string;
  blockNumber: number;
  contractAddress: string;
  eventType: string;
  productId?: number;
  harvestBatchId?: number;
  packageId?: number;
  dataHash?: string;
  metadata?: Record<string, unknown>;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasCost?: string;
  explorerUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductHistory {
  productId: number;
  farmer: string;
  plantingHash: string;
  germinationHash?: string;
  maturityHash?: string;
  harvestHash?: string;
  isHarvested: boolean;
  harvestQuantity?: string;
}

export interface FarmerVerificationStatus {
  success: boolean;
  verified: boolean;
  blockchainAddress: string | null;
  registrationTx?: string;
  verificationTx?: string;
  message?: string;
}

class BlockchainService {
  // Get blockchain connection status
  async getStatus(): Promise<BlockchainStatus> {
    const response = await api.get('/blockchain/status');
    return response.data;
  }

  // Generate blockchain wallet for current user
  async generateWallet(): Promise<{
    success: boolean;
    address: string;
    privateKey: string;
    mnemonic: string;
    warning: string;
  }> {
    const response = await api.post('/blockchain/generate-wallet');
    return response.data;
  }

  // Register farmer on blockchain (Admin only)
  async registerFarmer(farmerId: string): Promise<{
    success: boolean;
    message: string;
    farmer: {
      id: string;
      name: string;
      blockchainAddress: string;
    };
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/register-farmer', { farmerId });
    return response.data;
  }

  // Verify farmer on blockchain (Admin only)
  async verifyFarmer(farmerId: string, verified: boolean = true): Promise<{
    success: boolean;
    message: string;
    farmer: {
      id: string;
      name: string;
      blockchainAddress: string;
      blockchainVerified: boolean;
    };
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/verify-farmer', { 
      farmerId, 
      verified 
    });
    return response.data;
  }

  // Check farmer verification status
  async getFarmerVerificationStatus(farmerId: string): Promise<FarmerVerificationStatus> {
    const response = await api.get(`/blockchain/farmer/${farmerId}/verification`);
    return response.data;
  }

  // Register planting on blockchain (Farmer)
  async registerPlanting(plantingData: {
    cropType: string;
    areaSize: string;
    plantingDate: string;
    farmId: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }): Promise<{
    success: boolean;
    message: string;
    productId: number;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/register-planting', plantingData);
    return response.data;
  }

  // Get product history (Public)
  async getProductHistory(productId: number): Promise<{
    success: boolean;
    product: ProductHistory;
    transactions: BlockchainTransaction[];
  }> {
    const response = await api.get(`/blockchain/product/${productId}`);
    return response.data;
  }

  // Get user's blockchain transactions
  async getUserTransactions(limit: number = 50, page: number = 1): Promise<{
    success: boolean;
    transactions: BlockchainTransaction[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  }> {
    const response = await api.get(`/blockchain/transactions?limit=${limit}&page=${page}`);
    return response.data;
  }

  // Record germination observation
  async recordGermination(data: {
    productId: number;
    germinationPercent: number;
    notes?: string;
    photos?: string[];
  }): Promise<{
    success: boolean;
    message: string;
    productId: number;
    germinationPercent: number;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/record-germination', data);
    return response.data;
  }

  // Declare crop maturity
  async declareMaturity(data: {
    productId: number;
    maturityNotes?: string;
    qualityGrade?: string;
    estimatedYield?: string;
  }): Promise<{
    success: boolean;
    message: string;
    productId: number;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/declare-maturity', data);
    return response.data;
  }

  // Record harvest
  async recordHarvest(data: {
    productId: number;
    quantityKg: number;
    qualityGrade?: string;
    harvestNotes?: string;
    photos?: string[];
  }): Promise<{
    success: boolean;
    message: string;
    productId: number;
    harvestBatchId: number;
    quantity: number;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/record-harvest', data);
    return response.data;
  }

  // Record packaging
  async recordPackaging(data: {
    harvestBatchId: number;
    packageQuantity: number;
    packageType?: string;
    batchNumber?: string;
    expiryDate?: string;
  }): Promise<{
    success: boolean;
    message: string;
    packageId: number;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/record-packaging', data);
    return response.data;
  }

  // Add quality assurance
  async addQualityAssurance(data: {
    packageId: number;
    passed: boolean;
    certificationHash?: string;
    labName?: string;
    testResults?: Record<string, unknown>;
    notes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    packageId: number;
    passed: boolean;
    transaction: {
      hash: string;
      blockNumber: number;
      gasUsed: string;
      explorerUrl: string;
    };
  }> {
    const response = await api.post('/blockchain/add-quality-assurance', data);
    return response.data;
  }

  // Get crop lifecycle status
  async getCropLifecycleStatus(): Promise<{
    success: boolean;
    products: Array<{
      productId: number;
      cropType: string;
      plantingDate: string;
      stages: {
        planted: boolean;
        germinated: boolean;
        mature: boolean;
        harvested: boolean;
        packaged: boolean;
        qaCompleted: boolean;
      };
      completionPercentage: number;
      currentStage: string;
      nextAction: string;
      events: Array<{
        type: string;
        date: string;
        txHash: string;
      }>;
    }>;
    summary: {
      totalProducts: number;
      inProgress: number;
      completed: number;
    };
  }> {
    const response = await api.get('/blockchain/crop-lifecycle');
    return response.data;
  }
}

export default new BlockchainService();
