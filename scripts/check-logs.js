const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function main() {
  const address = '0x998b493CabF9FC269bD475b0528b9B19719f1531';
  const startBlock = 5500000n;
  try {
    const latestBlock = await client.getBlockNumber();
    console.log(`Searching from ${startBlock} to ${latestBlock}...`);
    let currentFrom = startBlock;
    let allLogs = [];
    
    while(currentFrom <= latestBlock) {
      let currentTo = currentFrom + 999n;
      if (currentTo > latestBlock) currentTo = latestBlock;
      console.log(`Checking blocks ${currentFrom} to ${currentTo}...`);
      
      const logs = await client.getLogs({
        address,
        event: parseAbiItem('event CertificateAdded(string indexed registerNumber, string jsonHash)'),
        fromBlock: currentFrom,
        toBlock: currentTo
      });
      allLogs.push(...logs);
      currentFrom = currentTo + 1n;
    }
    
    console.log(`Found ${allLogs.length} logs in total.`);
    if(allLogs.length > 0) {
      console.log('First log:', allLogs[0]);
    }
  } catch(e) {
    console.error(e);
  }
}
main();
