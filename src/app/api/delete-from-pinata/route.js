import { NextResponse } from 'next/server';
import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

export async function POST(request) {
  try {
    const { jsonHash, fileHash } = await request.json();

    if (!jsonHash || !fileHash) {
      return NextResponse.json({ 
        success: false, 
        message: 'jsonHash and fileHash are required' 
      }, { status: 400 });
    }

    const errors = [];

    // Delete the JSON metadata from Pinata
    try {
      await pinata.unpin(jsonHash);
    } catch (err) {
      errors.push(`Failed to delete JSON: ${err.message}`);
    }

    // Delete the certificate file from Pinata
    try {
      await pinata.unpin(fileHash);
    } catch (err) {
      errors.push(`Failed to delete file: ${err.message}`);
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'One or more files failed to be deleted from Pinata.',
        errors
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Files deleted from Pinata successfully'
    });

  } catch (error) {
    console.error('Error deleting from Pinata:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
