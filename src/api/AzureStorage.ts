/* 
IMPORTANT: Key a.k.a. shared access signatures (SAS) is only valid for one year (i.e. until 12/06/2022 )
*/
import { v5 as uuidv5 } from "uuid";
import { blobSASUrl, SAStoken } from "./keys";
import * as FileSystem from "expo-file-system";
export const BlobStorageURL =
  "https://odometers.blob.core.windows.net/odometer-images";

/**
 * Generates UUID (v5) for given Image and uploads it to Azure Blob Storage and returns the image UUID
 * @param image
 */
export async function uploadImagesToAzureBlobStorage(
  imageUri: string,
  imageName: string
): Promise<string> {
  const UUID_NAMESPACE = "fd480c81-2f91-4d1f-a951-9ec34ce168cd";
  let imageID = uuidv5(imageName, UUID_NAMESPACE);
  let EndpointURL = `${blobSASUrl}/odometer-images/${imageID}.jpg${SAStoken}`;

  //PUT method because it's idempotent
  await FileSystem.uploadAsync(EndpointURL, imageUri, {
    httpMethod: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": "image/jpeg",
    },
  })
    .then((response) => {
      console.log("blob saved successfully!", response);
    })
    .catch((error) => {
      console.log("ERROR during upload to Azure Blob Storage", error);
      return error;
    });
  return imageID;
}
