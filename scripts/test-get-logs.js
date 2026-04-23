const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function main() {
  const address = '0x998b493CabF9FC269bD475b0528b9B19719f1531';
  // Let's get the specific log
  const regNum = "123"; // Adjust to a known register number if we know one, I'll test basic
  try {
    const logs = await client.getLogs({
      address,
      event: {
        type: 'event',
        name: 'CertificateAdded',
        inputs: [
          { type: 'string', name: 'registerNumber', indexed: true },
          { type: 'string', name: 'jsonHash', indexed: false },
        ],
      },
      fromBlock: 5500000n, // Known deployed block
      toBlock: 5501000n
    });
    console.log(`Found ${logs.length} logs in total.`);
    if (logs.length > 0) {
      console.log('First log:', logs[0]);
    }
  } catch(e) {
    console.error(e);
  }
}
main();
