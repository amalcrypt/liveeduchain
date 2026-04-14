import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    const studentName = formData.get('studentName');
    const degree = formData.get('degree');
    const university = formData.get('university');
    const issueDate = formData.get('issueDate');
    const cgpa = formData.get('cgpa');
    const registerNumber = formData.get('registerNumber');
    const file = formData.get('certificate');

    if (!file) {
      return NextResponse.json({ success: false, message: 'Certificate file is required.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Upload the certificate file to IPFS
    const stream = Readable.from(buffer);
    const fileResult = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: {
        name: file.name,
      },
    });

    const fileHash = fileResult.IpfsHash;

    // 2. Create JSON metadata
    const jsonBody = {
      name: `${studentName} - ${degree}`,
      description: `Certificate for ${degree} issued to ${studentName} by ${university} on ${issueDate}.`,
      image: `https://gateway.pinata.cloud/ipfs/${fileHash}`,
      attributes: [
        { "trait_type": "Student Name", "value": studentName },
        { "trait_type": "Degree", "value": degree },
        { "trait_type": "University", "value": university },
        { "trait_type": "Issue Date", "value": issueDate },
        { "trait_type": "CGPA", "value": cgpa },
        { "trait_type": "Register Number", "value": registerNumber },
        { "trait_type": "Certificate File IPFS Hash", "value": fileHash }
      ]
    };

    // 3. Upload the JSON metadata to IPFS
    const jsonResult = await pinata.pinJSONToIPFS(jsonBody, {
      pinataMetadata: {
        name: `${studentName} - Certificate Metadata`
      }
    });

    return NextResponse.json({
      success: true,
      jsonHash: jsonResult.IpfsHash,
      fileHash: fileHash
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
