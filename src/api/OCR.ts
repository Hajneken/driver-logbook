import * as FileSystem from "expo-file-system";
import { subscriptionKey } from "./keys";
const EndpointURL =
  "https://hynekz20.cognitiveservices.azure.com/computervision/imageanalysis:analyze?features=Read&model-version=latest&language=en&api-version=2022-10-12-preview";

/**
 * Uses FileSystem API to upload image to the Azure OCR endpoint
 * It Recieves the
 * @param {string} imageUri
 */
export async function getOCRText(imageUri: string): Promise<Array<string>> {
  console.log('getOCRtext triggered :>> ');
  // possible error Accept gets reformatted to no string
  const result = await FileSystem.uploadAsync(EndpointURL, imageUri, {
    httpMethod: "POST",
    headers: {
      Accept: "application/json",
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "image/jpeg",
    },
  })
    .then((response) => {
      console.log("Response from Azure OCR", response);
      return response;
    })
    .catch((error) => {
      console.log("ERROR during Request to the Azure OCR", error);
    });

  return ProcessResponse(result);
}

/**
 * Checks if the response is valid JSON then processes the response from the Azure OCR endpoint and returns array of possible values for user confirmation
    // granular content => parsedResponse.readResult.pages[0].words[0].content
    // all content => parsedResponse.readResult.content
 * @param response
 */
function ProcessResponse(
  response: FileSystem.FileSystemUploadResult
): Array<string> {
  if (isJson(response.body)) {
    const parsedResponse = JSON.parse(response.body);
    // remove spaces but not linebreaks
    const recognizedString = parsedResponse.readResult.content.replace(
      /[ \t]+/g,
      ""
    );
    // matches all numbers with 0-6 digits before comma or dot and 0-1 digit after comma or dot
    const regex = /0*\d{1,6}(\.|,)*\d{0,1}/g;
    const recognizedValuesArray: Array<string> = recognizedString.match(regex);
    console.log("values recognized successfully:", recognizedValuesArray);
    return recognizedValuesArray;
  }
  throw new Error("Response is not valid JSON");
}

function isJson(str: string): boolean {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
