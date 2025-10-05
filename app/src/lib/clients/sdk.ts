import { contract } from "../../../../sdk/contract";
import { initClient } from "@ts-rest/core";
import { PUBLIC_API_URL  } from "$env/static/public";


export const client = initClient(contract, {
  baseUrl: PUBLIC_API_URL,
});