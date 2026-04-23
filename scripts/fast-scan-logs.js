const { createPublicClient, http, parseAbiItem } = require('viem');
const { sepolia } = require('viem/chains');

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

async function main() {
  const address = '0x998b493CabF9FC269bD475b0528b9B19719f1531';
  let startBlock = 5500000n;
  const latestBlock = await client.getBlockNumber();
  
  console.log(`Scanning up to ${latestBlock}...`);
  while(startBlock <= latestBlock) {
    const promises = [];
    for(let i=0; i<50; i++) {
        let from = startBlock + BigInt(i*1000);
        let to = from + 999n;
        if(to > latestBlock) to = latestBlock;
        if(from <= latestBlock) {
            promises.push(
                client.getLogs({
                address,
                event: parseAbiItem('event CertificateAdded(string indexed registerNumber, string jsonHash)'),
                fromBlock: from,
                toBlock: to
                }).catch(e => { return []; }) // ignore rate limits for a moment
            );
        }
    }
    const results = await Promise.all(promises);
    for(const l of results) {
        if(l && l.length > 0) {
            console.log("FOUND LOG:", l[0]);
            return;
        }
    }
    startBlock += 50000n;
    console.log(`Scanned up to ${startBlock}`);
  }
  console.log("Finished scanning.");
}
main();
