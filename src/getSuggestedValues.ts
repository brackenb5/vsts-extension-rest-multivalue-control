import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { AxiosResponse } from "axios";
import { LoadDataFromService } from "./rest-call";
import get from "lodash/get";

export async function getSuggestedValues(): Promise<string[]> {
  const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;
  const valuesString: string = inputs.Values;
  const address = inputs.RestServiceAddress;
  const keyFieldName = VSS.getConfiguration().witInputs.RestServiceKeyField;
  const arrayPath = VSS.getConfiguration().witInputs.PathToArray;

  if (valuesString) {
    return valuesString
      .split(";")
      .filter((v) => !!v)
      .map((s) => s.trim());
  }

  // if the values input were not specified as an input, get the suggested values from API.
  if (address) {
    var resp: AxiosResponse<any> | undefined;
    try {
      resp = await LoadDataFromService();
    } catch (error) {
      return Promise.resolve([]);
    }

    if (resp !== undefined && resp.data !== undefined) {
      var arrayData = get(resp.data, arrayPath, resp.data);

      if (arrayData) {
        if (arrayData.constructor !== Array) {
          console.dir(arrayData);
          console.error("response is not an array ^");
          return Promise.resolve([]);
        }
        //this.data = arrayData; //TODO
        var fieldSet = arrayData.map((a: any) => a[keyFieldName]);
        return [...new Set<string>(fieldSet.sort())];
      }
    }
  }

  // if the values input were not specified as an input, get the suggested values for the field.
  const service = await WorkItemFormService.getService();
  return (await service.getAllowedFieldValues(
    VSS.getConfiguration().witInputs.FieldName
  )) as string[];
}
