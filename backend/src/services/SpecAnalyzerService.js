import crypto from 'crypto';

/**
 * Spec Analyzer Service
 * Analyzes hardware specifications and determines gaming performance tiers.
 * Generates normalized spec hashes for caching.
 */

// Performance tier thresholds
const TIER_THRESHOLDS = {
  Ultra: {
    minRam: 32,      // GB
    minCpu: 3.8,     // GHz (high-end)
    minGpu: 10,      // GB VRAM (RTX 3080+)
    minStorage: 500, // GB SSD
  },
  High: {
    minRam: 16,      // GB
    minCpu: 3.2,     // GHz
    minGpu: 6,       // GB VRAM (RTX 2060+)
    minStorage: 256, // GB
  },
  Medium: {
    minRam: 8,       // GB
    minCpu: 2.5,     // GHz
    minGpu: 2,       // GB VRAM (GTX 1050+)
    minStorage: 100, // GB
  },
  Low: {
    minRam: 4,       // GB
    minCpu: 1.5,     // GHz
    minGpu: 0.5,     // GB VRAM (integrated/basic)
    minStorage: 50,  // GB
  },
};

/**
 * Determines the gaming performance tier based on hardware specs
 * @param {Object} specs - User hardware specifications
 * @param {number} specs.ram - RAM in GB
 * @param {number} specs.cpu - CPU speed in GHz
 * @param {number} specs.gpu - GPU VRAM in GB
 * @param {number} specs.storage - Storage in GB
 * @returns {string} Performance tier: 'Low', 'Medium', 'High', or 'Ultra'
 */
const determinePerformanceTier = (specs) => {
  const { ram, cpu, gpu, storage } = specs;

  // Check from highest tier to lowest
  if (
    ram >= TIER_THRESHOLDS.Ultra.minRam &&
    cpu >= TIER_THRESHOLDS.Ultra.minCpu &&
    gpu >= TIER_THRESHOLDS.Ultra.minGpu &&
    storage >= TIER_THRESHOLDS.Ultra.minStorage
  ) {
    return 'Ultra';
  }

  if (
    ram >= TIER_THRESHOLDS.High.minRam &&
    cpu >= TIER_THRESHOLDS.High.minCpu &&
    gpu >= TIER_THRESHOLDS.High.minGpu &&
    storage >= TIER_THRESHOLDS.High.minStorage
  ) {
    return 'High';
  }

  if (
    ram >= TIER_THRESHOLDS.Medium.minRam &&
    cpu >= TIER_THRESHOLDS.Medium.minCpu &&
    gpu >= TIER_THRESHOLDS.Medium.minGpu &&
    storage >= TIER_THRESHOLDS.Medium.minStorage
  ) {
    return 'Medium';
  }

  // Default to Low tier if specs meet minimum requirements
  if (
    ram >= TIER_THRESHOLDS.Low.minRam &&
    cpu >= TIER_THRESHOLDS.Low.minCpu &&
    gpu >= TIER_THRESHOLDS.Low.minGpu &&
    storage >= TIER_THRESHOLDS.Low.minStorage
  ) {
    return 'Low';
  }

  // Below minimum gaming specs
  return 'Low';
};

/**
 * Generates a normalized spec hash for caching
 * Example: "8gb-gtx1650-i5" or "16gb-rtx2060-i7"
 * @param {Object} specs - User hardware specifications
 * @returns {Object} Object containing hash, readableHash, and raw spec string
 */
const generateSpecHash = (specs) => {
  const { ram, cpu, gpu, storage } = specs;

  // Validate all specs are valid numbers
  if (!ram || !cpu || !gpu || !storage) {
    throw new Error('All specs (ram, cpu, gpu, storage) must be provided and be valid numbers');
  }

  // Ensure they are numbers
  const ramNum = Number(ram);
  const cpuNum = Number(cpu);
  const gpuNum = Number(gpu);
  const storageNum = Number(storage);

  if (isNaN(ramNum) || isNaN(cpuNum) || isNaN(gpuNum) || isNaN(storageNum)) {
    throw new Error('All specs must be valid numbers');
  }

  // Create a base string from specs
  const specString = `${ramNum.toFixed(1)}gb-${gpuNum.toFixed(1)}gb-${cpuNum.toFixed(1)}ghz-${storageNum.toFixed(0)}gb`;

  // Generate SHA256 hash for consistent caching
  const hash = crypto.createHash('sha256').update(specString).digest('hex').substring(0, 16);

  // Also create a human-readable version
  const readableHash = `${Math.round(ramNum)}gb-${Math.round(gpuNum)}gb-${Math.round(cpuNum * 10) / 10}`;

  return {
    hash: `spec_${hash}`,
    readableHash: readableHash.toLowerCase(),
    raw: specString,
  };
};

/**
 * Extracts GPU model name from VRAM and common patterns
 * This is a simplified version - in production, you'd want a more sophisticated mapping
 * @param {number} gpuVram - GPU VRAM in GB
 * @param {string} gpuName - Optional GPU name from user input
 * @returns {string} Estimated GPU model category
 */
const estimateGpuCategory = (gpuVram, gpuName = '') => {
  const gpuLower = gpuName.toLowerCase();

  // Check for specific GPU models in the name
  if (gpuLower.includes('rtx 4090') || gpuLower.includes('rtx4090')) return 'RTX 4090';
  if (gpuLower.includes('rtx 4080') || gpuLower.includes('rtx4080')) return 'RTX 4080';
  if (gpuLower.includes('rtx 4070') || gpuLower.includes('rtx4070')) return 'RTX 4070';
  if (gpuLower.includes('rtx 3080') || gpuLower.includes('rtx3080')) return 'RTX 3080';
  if (gpuLower.includes('rtx 3070') || gpuLower.includes('rtx3070')) return 'RTX 3070';
  if (gpuLower.includes('rtx 3060') || gpuLower.includes('rtx3060')) return 'RTX 3060';
  if (gpuLower.includes('rtx 2080') || gpuLower.includes('rtx2080')) return 'RTX 2080';
  if (gpuLower.includes('rtx 2070') || gpuLower.includes('rtx2070')) return 'RTX 2070';
  if (gpuLower.includes('rtx 2060') || gpuLower.includes('rtx2060')) return 'RTX 2060';
  if (gpuLower.includes('gtx 1660') || gpuLower.includes('gtx1660')) return 'GTX 1660';
  if (gpuLower.includes('gtx 1650') || gpuLower.includes('gtx1650')) return 'GTX 1650';
  if (gpuLower.includes('gtx 1080') || gpuLower.includes('gtx1080')) return 'GTX 1080';
  if (gpuLower.includes('gtx 1070') || gpuLower.includes('gtx1070')) return 'GTX 1070';
  if (gpuLower.includes('gtx 1060') || gpuLower.includes('gtx1060')) return 'GTX 1060';
  if (gpuLower.includes('gtx 1050') || gpuLower.includes('gtx1050')) return 'GTX 1050';

  // Fallback to VRAM-based estimation
  if (gpuVram >= 12) return 'High-End (12GB+)';
  if (gpuVram >= 8) return 'Mid-High (8GB)';
  if (gpuVram >= 6) return 'Mid-Range (6GB)';
  if (gpuVram >= 4) return 'Budget (4GB)';
  if (gpuVram >= 2) return 'Entry (2GB)';
  return 'Integrated/Basic';
};

/**
 * Extracts CPU class from CPU speed
 * @param {number} cpuSpeed - CPU speed in GHz
 * @param {string} cpuName - Optional CPU name from user input
 * @returns {string} CPU class estimation
 */
const estimateCpuClass = (cpuSpeed, cpuName = '') => {
  const cpuLower = cpuName.toLowerCase();

  // Check for specific CPU models
  if (cpuLower.includes('i9') || cpuLower.includes('ryzen 9')) return 'i9/Ryzen 9';
  if (cpuLower.includes('i7') || cpuLower.includes('ryzen 7')) return 'i7/Ryzen 7';
  if (cpuLower.includes('i5') || cpuLower.includes('ryzen 5')) return 'i5/Ryzen 5';
  if (cpuLower.includes('i3') || cpuLower.includes('ryzen 3')) return 'i3/Ryzen 3';

  // Fallback to speed-based estimation
  if (cpuSpeed >= 4.0) return 'High-End (4.0GHz+)';
  if (cpuSpeed >= 3.5) return 'Mid-High (3.5GHz)';
  if (cpuSpeed >= 3.0) return 'Mid-Range (3.0GHz)';
  if (cpuSpeed >= 2.5) return 'Budget (2.5GHz)';
  return 'Entry-Level (<2.5GHz)';
};

/**
 * Analyzes specs and returns detailed analysis
 * @param {Object} specs - User hardware specifications
 * @returns {Object} Analysis result with tier, hash, and details
 */
const analyzeSpecs = (specs) => {
  const { ram, cpu, gpu, storage } = specs;

  // Validate required specs exist
  if (!ram || !cpu || !gpu || !storage) {
    const error = new Error('Invalid specs: ram, cpu, gpu, and storage are all required');
    throw error;
  }

  // Convert to numbers to ensure they're valid
  const ramNum = Number(ram);
  const cpuNum = Number(cpu);
  const gpuNum = Number(gpu);
  const storageNum = Number(storage);

  if (isNaN(ramNum) || isNaN(cpuNum) || isNaN(gpuNum) || isNaN(storageNum)) {
    throw new Error('Invalid specs: all values must be valid numbers');
  }

  // Create normalized specs object
  const normalizedSpecs = {
    ram: ramNum,
    cpu: cpuNum,
    gpu: gpuNum,
    storage: storageNum,
    gpuName: specs.gpuName,
    cpuName: specs.cpuName,
  };

  try {
    const performanceTier = determinePerformanceTier(normalizedSpecs);

    const specHashes = generateSpecHash(normalizedSpecs);

    const gpuCategory = estimateGpuCategory(gpuNum, specs.gpuName);
    const cpuClass = estimateCpuClass(cpuNum, specs.cpuName);

    return {
      performanceTier,
      specHash: specHashes.hash,
      readableHash: specHashes.readableHash,
      gpuCategory,
      cpuClass,
      tierThresholds: TIER_THRESHOLDS[performanceTier],
      meetsMinimumGaming:
        ramNum >= TIER_THRESHOLDS.Low.minRam &&
        cpuNum >= TIER_THRESHOLDS.Low.minCpu &&
        gpuNum >= TIER_THRESHOLDS.Low.minGpu &&
        storageNum >= TIER_THRESHOLDS.Low.minStorage,
    };
  } catch (error) {
    throw error;
  }
};

export default {
  analyzeSpecs,
  determinePerformanceTier,
  generateSpecHash,
  estimateGpuCategory,
  estimateCpuClass,
  TIER_THRESHOLDS,
};
