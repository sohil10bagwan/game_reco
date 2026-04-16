/**
 * Compares user hardware specs against a game's minimum requirements.
 * Returns a match score (0-100) and whether the game is compatible.
 */
const compareHardware = (userSpecs, game) => {
  const { ram, cpu, gpu, storage } = userSpecs;

  // Validate game requirements exist and are positive numbers
  const gameMinRam = game.minRam || 4; // Default to 4GB if missing
  const gameMinCpu = game.minCpu || 2.0; // Default to 2.0GHz if missing
  const gameMinGpu = game.minGpu || 2; // Default to 2GB if missing
  const gameMinStorage = game.storage || 30; // Default to 30GB if missing

  const ramMeets = ram >= gameMinRam;
  const cpuMeets = cpu >= gameMinCpu;
  const gpuMeets = gpu >= gameMinGpu;
  const storageMeets = storage >= gameMinStorage;

  const isCompatible = ramMeets && cpuMeets && gpuMeets && storageMeets;

  // Calculate how much overhead the user has (higher = better match)
  // Add safety checks to prevent division by zero
  const ramScore = ramMeets ? Math.min((ram / gameMinRam) * 25, 25) : 0;
  const cpuScore = cpuMeets ? Math.min((cpu / gameMinCpu) * 25, 25) : 0;
  const gpuScore = gpuMeets ? Math.min((gpu / gameMinGpu) * 25, 25) : 0;
  const storageScore = storageMeets ? Math.min((storage / gameMinStorage) * 25, 25) : 0;

  const matchScore = Math.round(ramScore + cpuScore + gpuScore + storageScore);

  return {
    isCompatible,
    matchScore,
    details: {
      ram: { required: gameMinRam, user: ram, meets: ramMeets },
      cpu: { required: gameMinCpu, user: cpu, meets: cpuMeets },
      gpu: { required: gameMinGpu, user: gpu, meets: gpuMeets },
      storage: { required: gameMinStorage, user: storage, meets: storageMeets },
    },
  };
};

export default compareHardware;