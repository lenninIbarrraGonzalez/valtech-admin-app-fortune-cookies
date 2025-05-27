import * as React from 'react'
import { useEffect } from 'react'

const API_KEY = "vtexappkey-valtech-NFMZFZ";
const API_TOKEN =
  "LQRXPQPTDBKGKWRVCANKXTPOLKBETQHSZQQQDLHZYQIEAAPAXXOOBBTHDAIVDFHMOJEKONISITNIVXQNAANCBSUMLUWDKTFJLMSFGKVVFRQYYHIISKVRPKSNWSVJQSNR";

const authHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Vtex-Use-Https": "true",
  "X-VTEX-API-AppKey": API_KEY,
  "X-VTEX-API-AppToken": API_TOKEN,
};


const AdminPanel: React.FC = () => {

  const timestamp = new Date().getTime();

  const fetchData = async () => {
    const response = await fetch(
      `/api/dataentities/CF/search?_fields=id,CookieFortune&_sort=createdIn DESC&_t=${timestamp}`,
      {
        method: "GET",
        headers: { ...authHeaders, "REST-Range": "resources=0-400" },
      }
    );
    // You can handle the response here if needed
    const data = await response.json();

    console.log(data);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <h1>admin panel</h1>
    </>
  );
}

export default AdminPanel
